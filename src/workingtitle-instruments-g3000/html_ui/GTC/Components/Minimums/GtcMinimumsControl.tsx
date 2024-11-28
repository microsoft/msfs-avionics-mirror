import {
  ComponentProps, DisplayComponent, FSComponent, MathUtils, MinimumsControlEvents, MinimumsMode, NodeReference, NumberFormatter, SetSubject, Subject,
  Subscribable, SubscribableUtils, Subscription, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { MinimumsDataProvider, UnitsAltitudeSettingMode, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { GtcMessageDialog } from '../../Dialog/GtcMessageDialog';
import { GtcMinimumsSourceDialog } from '../../Dialog/GtcMinimumsSourceDialog';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { DigitInputSlot } from '../NumberInput/DigitInputSlot';
import { NumberInput } from '../NumberInput/NumberInput';
import { NumberPad } from '../NumberPad/NumberPad';
import { ImgTouchButton } from '../TouchButton/ImgTouchButton';
import { ValueTouchButton } from '../TouchButton/ValueTouchButton';

import '../../Components/TouchButton/NumPadTouchButton.css';
import './GtcMinimumsControl.css';

/**
 * Component props for GtcMinimumsControl.
 */
export interface GtcMinimumsControlProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;
}

/**
 * A GTC minimums control component. Provides a number pad and cursor input allowing the user to select a minimums
 * value, and a button which opens a dialog to allow the user to select a minimums mode.
 */
export class GtcMinimumsControl extends DisplayComponent<GtcMinimumsControlProps> implements GtcInteractionHandler {
  private static readonly BARO_FEET_MAX = 16000;
  private static readonly BARO_METERS_MAX = 4880;
  private static readonly RADAR_FEET_MAX = 2500;
  private static readonly RADAR_METERS_MAX = 760;

  private static readonly FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly baroFeetInputRef = FSComponent.createRef<NumberInput>();
  private readonly baroMetersInputRef = FSComponent.createRef<NumberInput>();
  private readonly radarFeetInputRef = FSComponent.createRef<NumberInput>();
  private readonly radarMetersInputRef = FSComponent.createRef<NumberInput>();
  private readonly numpadRef = FSComponent.createRef<NumberPad>();
  private readonly backspaceRef = FSComponent.createRef<ImgTouchButton>();
  private readonly modeRef = FSComponent.createRef<ValueTouchButton<any>>();

  private readonly baroFeetInputCssClass = SetSubject.create(['minimums-control-input', 'minimums-control-input-baro-feet']);
  private readonly baroMetersInputCssClass = SetSubject.create(['minimums-control-input', 'minimums-control-input-baro-meters']);
  private readonly radarFeetInputCssClass = SetSubject.create(['minimums-control-input', 'minimums-control-input-radar-feet']);
  private readonly radarMetersInputCssClass = SetSubject.create(['minimums-control-input', 'minimums-control-input-radar-meters']);

  private readonly publisher = this.props.gtcService.bus.getPublisher<MinimumsControlEvents>();

  private readonly inputMode = Subject.create(MinimumsMode.BARO);
  private readonly altitudeUnitsSetting = UnitsUserSettings.getManager(this.props.gtcService.bus).getSetting('unitsAltitude');

  private readonly baroFeetValue = Subject.create(0);
  private readonly baroMetersValue = Subject.create(0);
  private readonly radarFeetValue = Subject.create(0);
  private readonly radarMetersValue = Subject.create(0);

  private activeInput: NodeReference<NumberInput> | null = null;
  private activeUnit: Unit<UnitFamily.Distance> = UnitType.FOOT;
  private activeValue: Subject<number> | null = null;

  private showCancel = false;

  private readonly sidebarState = SubscribableUtils.toSubscribable(this.props.sidebarState ?? null, true) as Subscribable<SidebarState | null>;

  private modeSub?: Subscription;
  private unitsSub?: Subscription;
  private sidebarStateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.modeSub = this.props.minimumsDataProvider.mode.pipe(this.inputMode);

    this.inputMode.sub(() => { this.resetActiveInput(false); });
    this.unitsSub = this.altitudeUnitsSetting.sub(() => { this.resetActiveInput(true); });

    this.resetActiveInput(true);

    const editHandler = (isActive: boolean): void => {
      if (isActive) {
        this.sidebarState.get()?.slot1.set('cancel');
        this.showCancel = true;
      }
    };

    this.baroFeetInputRef.instance.isEditingActive.sub(editHandler);
    this.baroMetersInputRef.instance.isEditingActive.sub(editHandler);
    this.radarFeetInputRef.instance.isEditingActive.sub(editHandler);
    this.radarMetersInputRef.instance.isEditingActive.sub(editHandler);

    this.sidebarStateSub = this.sidebarState.sub(sidebarState => {
      if (sidebarState !== null) {
        sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnter');
        sidebarState.slot5.set('enterEnabled');
        sidebarState.slot1.set(this.showCancel ? 'cancel' : null);
      }
    }, true);
  }

  /**
   * Resets the active input based on the currently active minimums mode and display units setting.
   * @param resetValue Whether to reset the input value to the active minimums value.
   */
  private resetActiveInput(resetValue: boolean): void {
    const inputMode = this.inputMode.get();
    let minimumsValueFeet = null;

    switch (inputMode) {
      case MinimumsMode.BARO:
        minimumsValueFeet = this.props.minimumsDataProvider.baroMinimums.get();
        break;
      case MinimumsMode.RA:
        minimumsValueFeet = this.props.minimumsDataProvider.radarMinimums.get();
        break;
    }

    this.activeInput?.instance.deactivateEditing();

    if (minimumsValueFeet === null) {
      this.sidebarState.get()?.slot1.set(null);
      this.showCancel = false;

      this.activeInput = null;
      this.activeValue = null;
      this.baroFeetInputCssClass.add('hidden');
      this.baroMetersInputCssClass.add('hidden');
      this.radarFeetInputCssClass.add('hidden');
      this.radarMetersInputCssClass.add('hidden');
      return;
    }

    if (resetValue) {
      this.sidebarState.get()?.slot1.set(null);
      this.showCancel = false;
    }

    const altitudeMode = this.altitudeUnitsSetting.get();

    let activeInput: NodeReference<NumberInput>;
    let activeValue: Subject<number>;
    let activeUnit: Unit<UnitFamily.Distance>;
    let max: number;

    if (altitudeMode === UnitsAltitudeSettingMode.Meters) {
      activeUnit = UnitType.METER;

      if (inputMode == MinimumsMode.RA) {
        activeInput = this.radarMetersInputRef;
        activeValue = this.radarMetersValue;
        max = GtcMinimumsControl.RADAR_METERS_MAX;

        this.baroMetersInputCssClass.add('hidden');
        this.radarMetersInputCssClass.delete('hidden');
      } else {
        activeInput = this.baroMetersInputRef;
        activeValue = this.baroMetersValue;
        max = GtcMinimumsControl.BARO_METERS_MAX;

        this.radarMetersInputCssClass.add('hidden');
        this.baroMetersInputCssClass.delete('hidden');
      }

      this.baroFeetInputCssClass.add('hidden');
      this.radarFeetInputCssClass.add('hidden');
    } else {
      activeUnit = UnitType.FOOT;

      if (inputMode == MinimumsMode.RA) {
        activeInput = this.radarFeetInputRef;
        activeValue = this.radarFeetValue;
        max = GtcMinimumsControl.RADAR_FEET_MAX;

        this.baroFeetInputCssClass.add('hidden');
        this.radarFeetInputCssClass.delete('hidden');
      } else {
        activeInput = this.baroFeetInputRef;
        activeValue = this.baroFeetValue;
        max = GtcMinimumsControl.BARO_FEET_MAX;

        this.radarFeetInputCssClass.add('hidden');
        this.baroFeetInputCssClass.delete('hidden');
      }

      this.baroMetersInputCssClass.add('hidden');
      this.radarMetersInputCssClass.add('hidden');
    }

    const oldValue = this.activeValue?.get() ?? 0;
    const oldUnit = this.activeUnit;

    this.activeInput = activeInput;
    this.activeValue = activeValue;
    this.activeUnit = activeUnit;

    if (resetValue) {
      activeInput.instance.setValue(MathUtils.clamp(Math.round(UnitType.FOOT.convertTo(minimumsValueFeet, activeUnit)), 0, max));
    } else {
      activeInput.instance.setValue(MathUtils.clamp(Math.round(oldUnit.convertTo(oldValue, activeUnit)), 0, max));
    }

    activeInput.instance.refresh();
  }

  /**
   * A callback which is called when this control's parent view is resumed.
   */
  public onResume(): void {
    this.activeInput?.instance.refresh();
  }

  /**
   * A callback which is called when this control's parent view is opened.
   */
  public onOpen(): void {
    if (this.inputMode.get() === MinimumsMode.OFF) {
      this.modeSub?.pause();
      this.inputMode.set(MinimumsMode.BARO);
      this.modeSub?.resume();
    }

    this.resetActiveInput(true);
  }

  /**
   * A callback which is called when this control's parent view is closed.
   */
  public onClose(): void {
    this.activeInput?.instance.deactivateEditing();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.InnerKnobInc:
        this.activeInput?.instance.changeSlotValue(1);
        return true;
      case GtcInteractionEvent.InnerKnobDec:
        this.activeInput?.instance.changeSlotValue(-1);
        return true;
      case GtcInteractionEvent.OuterKnobInc:
        this.activeInput?.instance.moveCursor(1, true);
        return true;
      case GtcInteractionEvent.OuterKnobDec:
        this.activeInput?.instance.moveCursor(-1, true);
        return true;
      case GtcInteractionEvent.InnerKnobPush:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.InnerKnobPushLong:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.validateValueAndClose();
        return true;
      default:
        return false;
    }
  }

  /**
   * Validates the currently selected value; if valid sets the active minimums value to the selected value and
   * closes this dialog, and if invalid opens the invalid value message dialog.
   */
  private async validateValueAndClose(): Promise<void> {
    const inputMode = this.inputMode.get();

    this.publisher.pub('set_minimums_mode', inputMode, true, false);

    switch (inputMode) {
      case MinimumsMode.BARO:
      case MinimumsMode.RA:
        break;
      default:
        this.props.gtcService.goBack();
        return;
    }

    let value: number;
    let unit: Unit<UnitFamily.Distance>;
    let max: number;

    if (this.altitudeUnitsSetting.get() === UnitsAltitudeSettingMode.Meters) {
      unit = UnitType.METER;

      if (inputMode == MinimumsMode.RA) {
        value = this.radarMetersValue.get();
        max = GtcMinimumsControl.RADAR_METERS_MAX;
      } else {
        value = this.baroMetersValue.get();
        max = GtcMinimumsControl.BARO_METERS_MAX;
      }
    } else {
      unit = UnitType.FOOT;

      if (inputMode == MinimumsMode.RA) {
        value = this.radarFeetValue.get();
        max = GtcMinimumsControl.RADAR_FEET_MAX;
      } else {
        value = this.baroFeetValue.get();
        max = GtcMinimumsControl.BARO_FEET_MAX;
      }
    }

    const isValid = value >= 0 && value <= max;

    if (isValid) {
      let topic: 'set_decision_altitude_feet' | 'set_decision_height_feet' | undefined;

      switch (inputMode) {
        case MinimumsMode.BARO:
          topic = 'set_decision_altitude_feet';
          break;
        case MinimumsMode.RA:
          topic = 'set_decision_height_feet';
          break;
      }

      if (topic !== undefined) {
        this.publisher.pub(topic, unit.convertTo(value, UnitType.FOOT), true, false);
      }

      this.props.gtcService.goBack();
    } else {
      const result = await this.props.gtcService
        .openPopup<GtcMessageDialog>(GtcViewKeys.MessageDialog1)
        .ref.request({
          message: `Invalid Entry\nValue must be between\n0 and ${max}`,
          showRejectButton: false,
        });

      if (!result.wasCancelled && result.payload) {
        this.activeInput?.instance.deactivateEditing();
      }
    }
  }

  /**
   * Responds to when one of this page's number pad buttons is pressed.
   * @param value The value of the button that was pressed.
   */
  private onNumberPressed(value: number): void {
    this.activeInput?.instance.setSlotCharacterValue(`${value}`);
  }

  /**
   * Responds to when this page's backspace button is pressed.
   */
  private onBackspacePressed(): void {
    this.activeInput?.instance.backspace();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='minimums-control'>
        <div class='minimums-control-input-empty' />
        {this.renderBaroFeetInput()}
        {this.renderBaroMetersInput()}
        {this.renderRadarFeetInput()}
        {this.renderRadarMetersInput()}
        <NumberPad
          ref={this.numpadRef}
          onNumberPressed={this.onNumberPressed.bind(this)}
          class='minimums-control-numpad'
          orientation={this.props.gtcService.orientation}
        />
        <ImgTouchButton
          ref={this.backspaceRef}
          label='BKSP'
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_backspace_long.png`}
          onPressed={this.onBackspacePressed.bind(this)}
          class='minimums-control-backspace'
        />
        <ValueTouchButton
          ref={this.modeRef}
          state={this.inputMode}
          label='Minimums'
          renderValue={value => {
            switch (value) {
              case MinimumsMode.OFF:
                return 'Off';
              case MinimumsMode.BARO:
                return 'Baro';
              case MinimumsMode.TEMP_COMP_BARO:
                return 'Temp Comp';
              case MinimumsMode.RA:
                return 'Radio Alt';
              default:
                return '';
            }
          }}
          onPressed={async () => {
            const result = await this.props.gtcService.openPopup<GtcMinimumsSourceDialog>(GtcViewKeys.MinimumsSourceDialog)
              .ref.request(this.inputMode.get());

            if (!result.wasCancelled) {
              this.inputMode.set(result.payload);
            }
          }}
          class='minimums-control-mode'
        />
      </div>
    );
  }

  /**
   * Renders this page's baro minimums feet value input.
   * @returns This page's baro minimums feet value input, as a VNode.
   */
  private renderBaroFeetInput(): VNode {
    return (
      <NumberInput
        ref={this.baroFeetInputRef}
        value={this.baroFeetValue}
        digitizeValue={(value, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 99999);

          setDigitValues[0](Math.trunc(clamped / 1e4), true);
          setDigitValues[1](Math.trunc((clamped % 1e4) / 1e3), true);
          setDigitValues[2](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[3](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[4](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <NumberUnitDisplay
              value={UnitType.FOOT.createNumber(MathUtils.clamp(Math.round(value), 0, 99999))}
              displayUnit={null}
              formatter={GtcMinimumsControl.FORMATTER}
              class='minimums-control-input-inactive-value minimums-control-input-baro-feet-inactive-value'
            />
          );
        }}
        allowBackFill={true}
        class={this.baroFeetInputCssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e4}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e3}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>FT</div>
      </NumberInput>
    );
  }

  /**
   * Renders this page's baro minimums meters value input.
   * @returns This page's baro minimums meters value input, as a VNode.
   */
  private renderBaroMetersInput(): VNode {
    return (
      <NumberInput
        ref={this.baroMetersInputRef}
        value={this.baroMetersValue}
        digitizeValue={(value, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 9999);

          setDigitValues[0](Math.trunc(clamped / 1e3), true);
          setDigitValues[1](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[2](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[3](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <NumberUnitDisplay
              value={UnitType.METER.createNumber(MathUtils.clamp(Math.round(value), 0, 9999))}
              displayUnit={null}
              formatter={GtcMinimumsControl.FORMATTER}
              class='minimums-control-input-inactive-value minimums-control-input-baro-meters-inactive-value'
            />
          );
        }}
        allowBackFill={true}
        class={this.baroMetersInputCssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e3}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>M</div>
      </NumberInput>
    );
  }

  /**
   * Renders this page's radar minimums feet value input.
   * @returns This page's radar minimums feet value input, as a VNode.
   */
  private renderRadarFeetInput(): VNode {
    return (
      <NumberInput
        ref={this.radarFeetInputRef}
        value={this.radarFeetValue}
        digitizeValue={(value, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 9999);

          setDigitValues[0](Math.trunc(clamped / 1e3), true);
          setDigitValues[1](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[2](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[3](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <NumberUnitDisplay
              value={UnitType.FOOT.createNumber(MathUtils.clamp(Math.round(value), 0, 9999))}
              displayUnit={null}
              formatter={GtcMinimumsControl.FORMATTER}
              class='minimums-control-input-inactive-value minimums-control-input-radar-feet-inactive-value'
            />
          );
        }}
        allowBackFill={true}
        class={this.radarFeetInputCssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e3}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>FT</div>
      </NumberInput>
    );
  }

  /**
   * Renders this page's radar minimums meters value input.
   * @returns This page's radar minimums meters value input, as a VNode.
   */
  private renderRadarMetersInput(): VNode {
    return (
      <NumberInput
        ref={this.radarMetersInputRef}
        value={this.radarMetersValue}
        digitizeValue={(value, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 9999);

          setDigitValues[0](Math.trunc(clamped / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <NumberUnitDisplay
              value={UnitType.METER.createNumber(MathUtils.clamp(Math.round(value), 0, 9999))}
              displayUnit={null}
              formatter={GtcMinimumsControl.FORMATTER}
              class='minimums-control-input-inactive-value minimums-control-input-radar-meters-inactive-value'
            />
          );
        }}
        allowBackFill={true}
        class={this.radarMetersInputCssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
        <div class='numberunit-unit-small'>M</div>
      </NumberInput>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.baroFeetInputRef.getOrDefault()?.destroy();
    this.baroMetersInputRef.getOrDefault()?.destroy();
    this.radarFeetInputRef.getOrDefault()?.destroy();
    this.radarMetersInputRef.getOrDefault()?.destroy();
    this.numpadRef.getOrDefault()?.destroy();
    this.backspaceRef.getOrDefault()?.destroy();
    this.modeRef.getOrDefault()?.destroy();

    this.modeSub?.destroy();
    this.unitsSub?.destroy();
    this.sidebarStateSub?.destroy();

    super.destroy();
  }
}
