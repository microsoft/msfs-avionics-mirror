import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { MinimumsDataProvider } from '@microsoft/msfs-garminsdk';
import { GtcMinimumsControl } from '../../Components/Minimums/GtcMinimumsControl';
import { ImgTouchButton } from '../../Components/TouchButton/ImgTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import '../../Components/TouchButton/GtcDirectoryButton.css';
import './GtcUtilitiesMinimumsPopup.css';

/**
 * Component props for GtcUtilitiesMinimumsPopup.
 */
export interface GtcUtilitiesMinimumsPopupProps extends GtcViewProps {
  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;
}

/**
 * A GTC utilities page minimums popup.
 */
export class GtcUtilitiesMinimumsPopup extends GtcView<GtcUtilitiesMinimumsPopupProps> {
  private readonly controlRef = FSComponent.createRef<GtcMinimumsControl>();
  private readonly chartsButtonRef = FSComponent.createRef<ImgTouchButton>();

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
      <div class='utilities-minimums-popup'>
        <GtcMinimumsControl
          ref={this.controlRef}
          gtcService={this.props.gtcService}
          minimumsDataProvider={this.props.minimumsDataProvider}
          sidebarState={this._sidebarState}
        />
        <ImgTouchButton
          ref={this.chartsButtonRef}
          label='Charts'
          imgSrc='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_charts.png'
          isEnabled={false}
          class='gtc-directory-button utilities-minimums-popup-charts'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.controlRef.getOrDefault()?.destroy();
    this.chartsButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}