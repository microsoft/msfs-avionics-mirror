import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { MinimumsDataProvider } from '@microsoft/msfs-garminsdk';
import { GtcMinimumsControl } from '../../Components/Minimums/GtcMinimumsControl';
import { ValueTouchButton } from '../../Components/TouchButton/ValueTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import './GtcApproachMinimumsPopup.css';

/**
 * Component props for GtcApproachMinimumsPopup.
 */
export interface GtcApproachMinimumsPopupProps extends GtcViewProps {
  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;
}

/**
 * A GTC approach page minimums popup.
 */
export class GtcApproachMinimumsPopup extends GtcView<GtcApproachMinimumsPopupProps> {
  private readonly controlRef = FSComponent.createRef<GtcMinimumsControl>();
  private readonly previewButtonRef = FSComponent.createRef<ValueTouchButton<any>>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Minimums');

    this._activeComponent.set(this.controlRef.instance);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.controlRef.instance.onResume();
  }

  /** @inheritdoc */
  public onOpen(): void {
    this.controlRef.instance.onOpen();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.controlRef.instance.onClose();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='approach-minimums-popup'>
        <GtcMinimumsControl
          ref={this.controlRef}
          gtcService={this.props.gtcService}
          minimumsDataProvider={this.props.minimumsDataProvider}
          sidebarState={this._sidebarState}
        />
        <ValueTouchButton
          ref={this.previewButtonRef}
          label='Preview'
          state={Subject.create('Off')}
          isEnabled={false}
          class='approach-minimums-popup-preview'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.controlRef.getOrDefault()?.destroy();
    this.previewButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}