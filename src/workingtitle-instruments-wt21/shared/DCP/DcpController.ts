import { EventBus, HEvent, MathUtils, NavEvents, NavSourceType } from '@microsoft/msfs-sdk';

import { InstrumentConfig } from '../Config';
import { MapUserSettings } from '../Map/MapUserSettings';
import { DcpEvent } from './DcpEvent';
import { DcpEvents } from './DcpEventPublisher';
import { WT21_H_EVENT_GENERIC_UPR_REGEX } from './DcpHEvents';

/** Display Control Panel Controller. */
export class DcpController {
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.bus, this.instrumentConfig.instrumentType, this.instrumentConfig.instrumentIndex);
  private readonly masterMapSettingsManager = MapUserSettings.getMasterManager(this.bus);

  /** @inheritdoc */
  constructor(
    private readonly bus: EventBus,
    private readonly instrumentConfig: InstrumentConfig,
  ) {
    const dcpEvents = this.bus.getSubscriber<DcpEvents>();
    const hEvents = this.bus.getSubscriber<HEvent>();

    dcpEvents.on('dcpEvent')
      .handle(this.handlePfdDcpEvent);

    hEvents.on('hEvent').handle((evt: string) => {
      const hEventWithoutPrefix = WT21_H_EVENT_GENERIC_UPR_REGEX[Symbol.match](evt);

      const btnName = hEventWithoutPrefix?.[2];
      const eventInstrIndex = Number(hEventWithoutPrefix?.[1] ?? 1);
      if (eventInstrIndex === this.instrumentConfig.instrumentIndex) {
        if (btnName === 'RANGE_INC') {
          this.handleRangeChange(1);
        } else if (btnName === 'RANGE_DEC') {
          this.handleRangeChange(-1);
        }
      }
    });

    const hsiFormatPFDSetting = this.mapSettingsManager.getSetting('hsiFormat');

    this.bus.getSubscriber<NavEvents>().on('cdi_select').handle(source => {
      // If active nav source changes to something other than FMS, and HSI is in PPOS, it should change to ARC
      if (source.type !== NavSourceType.Gps && hsiFormatPFDSetting.value === 'PPOS') {
        hsiFormatPFDSetting.value = 'ARC';
      }
    });

    // TODO Handle when WX/TERR is enabled.
    // TODO If WX/TERR is enabled, and mapRange is 600, change it to 300.
  }

  private readonly handlePfdDcpEvent = (event: DcpEvent): void => {
    if (event === DcpEvent.DCP_FRMT) { this.handleDcpFrmtEvent(); }
    if (event === DcpEvent.DCP_RANGE_INC) { this.handleRangeChange(1); }
    if (event === DcpEvent.DCP_RANGE_DEC) { this.handleRangeChange(-1); }
    if (event === DcpEvent.DCP_TFC) { this.handleTfcButtonPress(); }
    if (event === DcpEvent.DCP_TERR_WX) { this.handleTerrWxButtonPress(); }
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleDcpFrmtEvent(): void {
    const hsiFormatPFDSetting = this.mapSettingsManager.getSetting('hsiFormat');
    const currentFormat = hsiFormatPFDSetting.value;
    const currentIndex = MapUserSettings.hsiFormatsPFD.indexOf(currentFormat);
    const newIndex = (currentIndex + 1) % MapUserSettings.hsiFormatsPFD.length;
    const newFormat = MapUserSettings.hsiFormatsPFD[newIndex];

    hsiFormatPFDSetting.value = newFormat;
  }

  /**
   * Handles a range change event
   * @param direction The direction in which the range is being incremented
   */
  private handleRangeChange(direction: -1 | 1): void {
    const mapRangeSetting = this.masterMapSettingsManager.getSetting(`mapRange_${this.instrumentConfig.instrumentIndex as 1 | 2}`);
    const currentRangeIndex = MapUserSettings.mapRanges.indexOf(mapRangeSetting.value);
    const newRangeIndex = MathUtils.clamp(currentRangeIndex + direction, 0, MapUserSettings.mapRanges.length - 1);
    const newRange = MapUserSettings.mapRanges[newRangeIndex];

    const terrWxSetting = this.mapSettingsManager.getSetting('terrWxState');
    if (terrWxSetting.get() !== 'OFF' && newRange === 600) {
      return;
    }

    mapRangeSetting.set(newRange);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleTfcButtonPress(): void {
    const tfcEnabledPFD = this.mapSettingsManager.getSetting('tfcEnabled');
    tfcEnabledPFD.value = !tfcEnabledPFD.value;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleTerrWxButtonPress(): void {
    const terrWxPFDSetting = this.mapSettingsManager.getSetting('terrWxState');
    const currentState = terrWxPFDSetting.value;
    const currentIndex = MapUserSettings.terrWxStates.indexOf(currentState);
    const newIndex = (currentIndex + 1) % MapUserSettings.terrWxStates.length;
    const newFormat = MapUserSettings.terrWxStates[newIndex];

    terrWxPFDSetting.value = newFormat;
  }
}
