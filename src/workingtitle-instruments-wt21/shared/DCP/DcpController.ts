import { EventBus, HEvent, NavEvents, NavSourceType } from '@microsoft/msfs-sdk';

import { MapUserSettings } from '../Map/MapUserSettings';
import { DcpEvent } from './DcpEvent';
import { DcpEvents } from './DcpEventPublisher';
import { WT21_H_EVENT_GENERIC_UPR_REGEX } from './DcpHEvents';

/** Display Control Panel Controller. */
export class DcpController {
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    private readonly mapSettingsManager = MapUserSettings.getAliasedManager(bus, 'PFD'),
    private readonly masterMapSettingsManager = MapUserSettings.getMasterManager(bus)
  ) {
    const dcpEvents = this.bus.getSubscriber<DcpEvents>();
    const hEvents = this.bus.getSubscriber<HEvent>();

    dcpEvents.on('dcpEvent')
      .handle(this.handlePfdDcpEvent);

    hEvents.on('hEvent').handle((evt: string) => {
      const hEventWithoutPrefix = WT21_H_EVENT_GENERIC_UPR_REGEX[Symbol.match](evt);

      const btnName = hEventWithoutPrefix?.[2];
      const evtIndex = hEventWithoutPrefix?.[1] as '1' | '2';
      if (btnName === 'RANGE_INC') {
        this.handleDcpRangeIncrease(evtIndex);
      } else if (btnName === 'RANGE_DEC') {
        this.handleDcpRangeDecrease(evtIndex);
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
    if (event === DcpEvent.DCP_RANGE_INC) { this.handleDcpRangeIncrease('1'); }
    if (event === DcpEvent.DCP_RANGE_DEC) { this.handleDcpRangeDecrease('1'); }
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

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleDcpRangeIncrease(index: '1' | '2'): void {
    // TODO Handle when WX/TERR is enabled.
    // TODO The 600 NM range is not available when the WX overlay or TERR overlay is active.
    const mapRangeSetting = this.masterMapSettingsManager.getSetting(`mapRange_${index}`);
    // const mapRangeSetting = this.mapSettingsManager.getSetting('mapRange');
    const currentRange = mapRangeSetting.value;
    const currentIndex = MapUserSettings.mapRanges.indexOf(currentRange);
    const newIndex = Math.min(currentIndex + 1, MapUserSettings.mapRanges.length - 1);
    const newFormat = MapUserSettings.mapRanges[newIndex];

    // limit to 300nm when in wx or terr
    const terrWxPFDSetting = this.mapSettingsManager.getSetting('terrWxState');
    if (terrWxPFDSetting.get() !== 'OFF' && newFormat === 600) {
      return;
    }

    mapRangeSetting.value = newFormat;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleDcpRangeDecrease(index: '1' | '2'): void {
    const mapRangeSetting = this.masterMapSettingsManager.getSetting(`mapRange_${index}`);
    // const mapRangeSetting = this.mapSettingsManager.getSetting('mapRange');
    const currentRange = mapRangeSetting.value;
    const currentIndex = MapUserSettings.mapRanges.indexOf(currentRange);
    const newIndex = Math.max(currentIndex - 1, 0);
    const newFormat = MapUserSettings.mapRanges[newIndex];

    // limit to 300nm when in wx or terr
    const terrWxPFDSetting = this.mapSettingsManager.getSetting('terrWxState');
    if (terrWxPFDSetting.get() !== 'OFF' && newFormat === 600) {
      return;
    }

    mapRangeSetting.value = newFormat;
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
