import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { MapFormatSupportMatrix } from '../../Map/MapFormatSupportMatrix';

import { MapUserSettings, PfdOrMfd, TerrWxState } from '../../Map/MapUserSettings';

import './TerrWxInfo.css';

/** @inheritdoc */
interface TerrWxInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  // eslint-disable-next-line jsdoc/require-jsdoc
  pfdOrMfd: PfdOrMfd;
}

/** The TerrWxInfo component. */
export class TerrWxInfo extends DisplayComponent<TerrWxInfoProps> {
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.props.bus, this.props.pfdOrMfd);
  private readonly mapFormatSupport = new MapFormatSupportMatrix();
  private readonly terrWxInfoRef = FSComponent.createRef<HTMLDivElement>();
  private readonly line3 = Subject.create('');
  private readonly line4 = Subject.create('');
  private readonly line5 = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.mapSettingsManager.whenSettingChanged('terrWxState').handle(this.handleTerrWxState);
    this.mapSettingsManager.whenSettingChanged('hsiFormat').handle(this.handleSupported);
  }

  private readonly handleTerrWxState = (terrWxState: TerrWxState): void => {
    this.terrWxInfoRef.instance.classList.toggle('TERR', terrWxState === 'TERR');
    this.terrWxInfoRef.instance.classList.toggle('WX', terrWxState === 'WX');
    if (terrWxState === 'OFF') {
      this.line3.set('');
      this.line4.set('');
      this.line5.set('');
    } else if (terrWxState === 'TERR') {
      this.line3.set('');
      this.line4.set('TERRAIN');
      this.line5.set('');
    } else if (terrWxState === 'WX') {
      this.line3.set('WX');
      this.line4.set('T-1.2A');
      this.line5.set('');
    }
    this.handleSupported();
  };

  private readonly handleSupported = (): void => {
    const format = this.mapSettingsManager.getSetting('hsiFormat').get();
    const terrWxState = this.mapSettingsManager.getSetting('terrWxState').get();
    let isSupported = true;
    if (terrWxState !== 'OFF') {
      isSupported = this.mapFormatSupport.isSupported(format, terrWxState === 'WX' ? 2 : 1);
    }
    this.terrWxInfoRef.instance.classList.toggle('format-supported', isSupported);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="terr-wx-info" ref={this.terrWxInfoRef}>
        <div class="terr-label">TERR</div>
        <div class="wx-label">WX</div>
        {/* The `&nbsp;` keeps the line from collapsing when empty */}
        <div class="line-3">&nbsp;{this.line3}</div>
        <div class="line-4">&nbsp;{this.line4}</div>
        <div class="line-4">{this.line5}</div>
      </div>
    );
  }
}