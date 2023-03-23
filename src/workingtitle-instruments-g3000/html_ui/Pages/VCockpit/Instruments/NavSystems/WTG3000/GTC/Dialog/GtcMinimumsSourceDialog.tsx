import { FSComponent, MinimumsMode, Subject, VNode } from '@microsoft/msfs-sdk';
import { TouchButton } from '../Components/TouchButton/TouchButton';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';

import './GtcMinimumsSourceDialog.css';

/**
 * Component props for GtcMinimumsSourceDialog.
 */
export interface GtcMinimumsSourceDialogProps extends GtcViewProps {
  /** Whether to support radar minimums. */
  supportRadarMins: boolean;
}

/**
 * A pop-up dialog which allows the user to select a minimums mode.
 */
export class GtcMinimumsSourceDialog extends GtcView<GtcMinimumsSourceDialogProps> implements GtcDialogView<MinimumsMode, MinimumsMode> {
  private readonly offRef = FSComponent.createRef<TouchButton>();
  private readonly baroRef = FSComponent.createRef<TouchButton>();
  private readonly tempCompRef = FSComponent.createRef<TouchButton>();
  private readonly radarRef = FSComponent.createRef<TouchButton>();

  private readonly isOffHighlighted = Subject.create(false);
  private readonly isBaroHighlighted = Subject.create(false);
  private readonly isTempCompHighlighted = Subject.create(false);
  private readonly isRadarHighlighted = Subject.create(false);

  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<MinimumsMode> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Minimums Source');
  }

  /** @inheritdoc */
  public request(initialMode: MinimumsMode): Promise<GtcDialogResult<MinimumsMode>> {
    if (!this.isAlive) {
      throw new Error('GtcMinimumsSourceDialog: cannot request from a dead dialog');
    }

    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.isOffHighlighted.set(initialMode === MinimumsMode.OFF);
      this.isBaroHighlighted.set(initialMode === MinimumsMode.BARO);
      this.isTempCompHighlighted.set(initialMode === MinimumsMode.TEMP_COMP_BARO);
      this.isRadarHighlighted.set(initialMode === MinimumsMode.RA);
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /**
   * Responds to when a minimums mode is selected.
   * @param mode The selected minimums mode.
   */
  private onSelected(mode: MinimumsMode): void {
    this.resultObject = {
      wasCancelled: false,
      payload: mode
    };

    this.props.gtcService.goBack();
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='minimums-source-dialog'>
        <TouchButton
          ref={this.offRef}
          label='Off'
          isHighlighted={this.isOffHighlighted}
          onPressed={() => { this.onSelected(MinimumsMode.OFF); }}
          class='minimums-source-dialog-button'
        />
        <TouchButton
          ref={this.baroRef}
          label='Baro'
          isHighlighted={this.isBaroHighlighted}
          onPressed={() => { this.onSelected(MinimumsMode.BARO); }}
          class='minimums-source-dialog-button'
        />
        <TouchButton
          ref={this.tempCompRef}
          label='Temp Comp'
          isEnabled={false}
          isHighlighted={this.isTempCompHighlighted}
          class='minimums-source-dialog-button'
        />
        {
          this.props.supportRadarMins && (
            <TouchButton
              ref={this.radarRef}
              label='Radio Alt'
              isHighlighted={this.isRadarHighlighted}
              onPressed={() => { this.onSelected(MinimumsMode.RA); }}
              class='minimums-source-dialog-button'
            />
          )
        }
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.offRef.getOrDefault()?.destroy();
    this.baroRef.getOrDefault()?.destroy();
    this.tempCompRef.getOrDefault()?.destroy();
    this.radarRef.getOrDefault()?.destroy();

    super.destroy();
  }
}