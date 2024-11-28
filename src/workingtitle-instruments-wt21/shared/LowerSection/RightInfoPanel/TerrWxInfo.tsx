import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { InstrumentConfig } from '../../Config';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';
import { MapFormatSupportMatrix } from '../../Map/MapFormatSupportMatrix';
import { MapSettingsMfdAliased, MapSettingsPfdAliased, TerrWxState } from '../../Map/MapUserSettings';

import './TerrWxInfo.css';

/** @inheritdoc */
interface TerrWxInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The instrument config object */
  instrumentConfig: InstrumentConfig,

  /** The map user settings */
  mapSettingsManager: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>
}

/** The TerrWxInfo component. */
export class TerrWxInfo extends DisplayComponent<TerrWxInfoProps> {
  private readonly mapFormatSupport = new MapFormatSupportMatrix();
  private readonly terrWxInfoRef = FSComponent.createRef<HTMLDivElement>();
  private readonly line3 = Subject.create('');
  private readonly line4 = Subject.create('');
  private readonly line5 = Subject.create('');
  private readonly isUsingSoftkeys = this.props.instrumentConfig.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.mapSettingsManager.whenSettingChanged('terrWxState').handle(this.handleTerrWxState);
    this.props.mapSettingsManager.whenSettingChanged('hsiFormat').handle(this.handleSupported);
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
    const format = this.props.mapSettingsManager.getSetting('hsiFormat').get();
    const terrWxState = this.props.mapSettingsManager.getSetting('terrWxState').get();
    let isSupported = true;
    if (terrWxState !== 'OFF') {
      isSupported = this.mapFormatSupport.isSupported(format, terrWxState === 'WX' ? 2 : 1);
    }
    this.terrWxInfoRef.instance.classList.toggle('format-supported', isSupported);
  };

  /** @inheritDoc */
  public render(): VNode | null {
    return this.isUsingSoftkeys ? this.renderSoftkeyLayout() : this.renderTraditionalLayout();
  }

  /**
   * Renders the softkey layout
   *
   * @returns a vnode
   */
  private renderSoftkeyLayout(): VNode {
    return (
      <div class="terr-wx-info terr-wx-info-side-buttons" ref={this.terrWxInfoRef}>
        <TerrWxSideButtonSwitch mapUserSettings={this.props.mapSettingsManager} />
      </div>
    );
  }

  /**
   * Renders the traditional layout
   *
   * @returns a vnode
   */
  private renderTraditionalLayout(): VNode {
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

/**
 * Props for {@link TerrWxSideButtonSwitch}
 */
interface TerrWxSideButtonSwitchProps {
  /** The map user settings */
  mapUserSettings: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>;
}

/**
 * Renders the TERR/RDR switch
 */
class TerrWxSideButtonSwitch extends DisplayComponent<TerrWxSideButtonSwitchProps> {
  private readonly terrWxrState = this.props.mapUserSettings.getSetting('terrWxState');

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class="right-info-terr-wxr-switch">
        <div class="right-info-terr-wxr-switch-arrow-wrapper">
          <svg class="right-info-terr-wxr-switch-arrow" viewBox="0 0 10 14">
            <path d="M 3, 2 l 4, 5 l -4, 5" stroke-width={1.5} stroke="white" />
          </svg>
        </div>

        <div class="right-info-terr-wxr-switch-info">
          <div class={{
            'right-info-terr-wxr-switch-line': true,
            'right-info-terr-wxr-switch-line-selected': this.terrWxrState.map((it) => it === 'TERR'),
          }}>TERR</div>
          <div class={{
            'right-info-terr-wxr-switch-line': true,
            'right-info-terr-wxr-switch-line-selected': this.terrWxrState.map((it) => it === 'WX'),
          }}>RDR</div>
        </div>

        <div class="right-info-terr-wxr-switch-wx">STBY</div>
        <div class="right-info-terr-wxr-switch-wx">T 0.0</div>
      </div>
    );
  }
}
