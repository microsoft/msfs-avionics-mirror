import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { MinimumsDataProvider } from '@microsoft/msfs-garminsdk';
import { GtcMinimumsControl } from '../../Components/Minimums/GtcMinimumsControl';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import './GtcMinimumsPage.css';

/**
 * Component props for GtcMinimumsPage.
 */
export interface GtcMinimumsPageProps extends GtcViewProps {
  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;
}

/**
 * A GTC minimums page.
 */
export class GtcMinimumsPage extends GtcView<GtcMinimumsPageProps> {
  private readonly controlRef = FSComponent.createRef<GtcMinimumsControl>();

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
      <div class='minimums-page'>
        <GtcMinimumsControl
          ref={this.controlRef}
          gtcService={this.props.gtcService}
          minimumsDataProvider={this.props.minimumsDataProvider}
          sidebarState={this._sidebarState}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.controlRef.getOrDefault()?.destroy();

    super.destroy();
  }
}