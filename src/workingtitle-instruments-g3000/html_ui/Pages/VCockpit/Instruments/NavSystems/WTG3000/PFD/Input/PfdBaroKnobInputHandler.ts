/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, HEvent, KeyEventManager, SimVarValueType, Subject, Subscription } from '@microsoft/msfs-sdk';
import { AltimeterDataProvider } from '@microsoft/msfs-garminsdk';
import { PfdIndex } from '@microsoft/msfs-wtg3000-common';

/**
 * Handles baro knob inputs for a PFD to change the baro setting for the PFD's altimeter.
 */
export class PfdBaroKnobInputHandler {
  private readonly hEventPrefix = `AS3000_PFD_${this.index}_BARO_`;
  private readonly tooltipBaroSettingVar = `L:WTG3000_PFD_Altimeter_Baro_TT:${this.index}`;

  private readonly tooltipBaroSetting = Subject.create(29.92);

  private keyEventManager?: KeyEventManager;

  private isAlive = true;
  private isInit = false;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private hEventSub?: Subscription;
  private baroStdSub?: Subscription;
  private baroSettingPipe?: Subscription;
  private baroPreselectPipe?: Subscription;

  /**
   * Constructor.
   * @param index The index of this handler's parent PFD.
   * @param bus The event bus.
   * @param altimeterIndex The index of the sim altimeter controlled by this handler.
   * @param dataProvider A provider of altimeter data for this handler's parent PFD.
   * @param supportBaroPreselect Whether to support baro setting pre-select in STD BARO mode.
   */
  public constructor(
    public readonly index: PfdIndex,
    private readonly bus: EventBus,
    private readonly altimeterIndex: number,
    private readonly dataProvider: AltimeterDataProvider,
    private readonly supportBaroPreselect: boolean
  ) {
    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this handler's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this handler's key event manager is ready, or rejected if this
   * handler is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /**
   * Initializes this handler. Once this handler is initialized, it will change the baro setting for this handler's
   * PFD's altimeter in response to baro knob input events.
   * @returns A Promise which will be fulfilled when this handler is fully initialized, or rejected if this handler is
   * destroyed before then.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('PfdBaroKnobInputHandler: cannot initialize a dead handler');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    // Publish baro setting to simvar so that the baro knob modelbehavior can set its tooltip.

    const baroSettingPipe = this.baroSettingPipe = this.dataProvider.baroSetting.pipe(this.tooltipBaroSetting, true);

    if (this.supportBaroPreselect) {
      const baroPreselectPipe = this.baroPreselectPipe = this.dataProvider.baroPreselect.pipe(this.tooltipBaroSetting, true);

      this.baroStdSub = this.dataProvider.baroIsStdActive.sub(isActive => {
        if (isActive) {
          baroSettingPipe.pause();
          baroPreselectPipe.resume(true);
        } else {
          baroPreselectPipe.pause();
          baroSettingPipe.resume(true);
        }
      }, true);
    } else {
      baroSettingPipe.resume(true);
    }

    this.tooltipBaroSetting.sub(baro => {
      SimVar.SetSimVarValue(this.tooltipBaroSettingVar, SimVarValueType.InHG, baro);
    }, true);

    this.hEventSub = this.bus.getSubscriber<HEvent>().on('hEvent').handle(hEvent => {
      if (hEvent.startsWith(this.hEventPrefix)) {
        this.handleBaroKnobInput(hEvent.substring(18));
      }
    });
  }

  /**
   * Handles a baro knob input.
   * @param input The key of the input to handle, with the prefix removed.
   */
  private handleBaroKnobInput(input: string): void {
    switch (input) {
      case 'INC':
        this.keyEventManager!.triggerKey('KOHLSMAN_INC', false, this.altimeterIndex);
        break;
      case 'DEC':
        this.keyEventManager!.triggerKey('KOHLSMAN_DEC', false, this.altimeterIndex);
        break;
      case 'PUSH':
        this.keyEventManager!.triggerKey('BAROMETRIC_STD_PRESSURE', false, this.altimeterIndex);
        break;
    }
  }

  /**
   * Destroys this handler.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('PfdBaroKnobInputHandler: handler was destroyed'); });

    this.hEventSub?.destroy();
    this.baroStdSub?.destroy();
    this.baroSettingPipe?.destroy();
    this.baroPreselectPipe?.destroy();
  }
}