import {
  ArraySubject, ClockEvents, ComSpacing, ConsumerSubject, DateTimeFormatter, Facility, FacilityFrequency, FacilityFrequencyType, FacilityLoader, FacilityType,
  FacilityUtils, FSComponent, MappedSubject, Metar, MetarCloudLayer, MetarCloudLayerCoverage, MetarCloudLayerType, MetarVisibilityUnits, MetarWindSpeedUnits,
  NavMath, NumberFormatter, RadioFrequencyFormatter, ReadonlyFloat64Array, Subject, Subscribable, SubscribableMapFunctions, Subscription, Unit, UnitFamily,
  UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  DateTimeFormatSettingMode, DateTimeUserSettingTypes, DynamicList, DynamicListData, TimeDisplayFormat, WaypointInfoStore
} from '@microsoft/msfs-garminsdk';

import { G3XTimeDisplay } from '../../../Shared/Components/Common/G3XTimeDisplay';
import { UiList } from '../../../Shared/Components/List/UiList';
import { AbstractTabbedContent } from '../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { TabbedContentProps } from '../../../Shared/Components/TabbedContainer/TabbedContent';
import { G3XUnitFormatter } from '../../../Shared/Graphics/Text/G3XUnitFormatter';
import { ComRadioSpacingDataProvider } from '../../../Shared/Radio/ComRadioSpacingDataProvider';
import { G3XUnitsUserSettingManager } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { UiService } from '../../../Shared/UiSystem/UiService';

import './AirportWeatherTab.css';

/**
 * Component props for {@link AirportWeatherTab}.
 */
export interface AirportWeatherTabProps extends TabbedContentProps {
  /** The UI service. */
  uiService: UiService;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** Information on the waypoint to display. */
  waypointInfo: WaypointInfoStore;

  /** The dimensions of the tab's content area, as `[width, height]` in pixels. */
  tabContentDimensions: Subscribable<ReadonlyFloat64Array>;

  /** A provider of COM radio spacing mode data. */
  comRadioSpacingDataProvider: ComRadioSpacingDataProvider;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** A manager for display unit user settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;
}

/**
 * An airport weather tab.
 */
export class AirportWeatherTab extends AbstractTabbedContent<AirportWeatherTabProps> {
  private static readonly METAR_AUTO_REGEXP = /\sAUTO\s/;
  private static readonly METAR_RMK_REGEXP = /RMK[\s]+(.*[^=])=?$/;

  private static readonly DATE_TIME_FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };

  private static readonly DISPLAY_TIME_MAP_FUNC = ([time, timeFormat, localOffset]: readonly [number, TimeDisplayFormat, number]): number => {
    if (timeFormat === TimeDisplayFormat.UTC) {
      return time;
    } else {
      return time + localOffset;
    }
  };

  private static readonly DATE_FORMATTER = DateTimeFormatter.create('{mon} {d}');

  private static readonly AGE_FORMATTER = (ageMinutes: number): string => {
    const ageMinutesRounded = Math.round(ageMinutes);
    const ageMinutesAbs = Math.abs(ageMinutesRounded);

    let durationText: string;

    if (ageMinutesAbs < 120) {
      durationText = `${ageMinutesAbs} minute${ageMinutesAbs === 1 ? '' : 's'}`;
    } else {
      const ageHoursAbs = Math.round(ageMinutesAbs / 60);
      if (ageHoursAbs < 48) {
        durationText = `${ageHoursAbs} hours`;
      } else {
        durationText = `${Math.round(ageHoursAbs / 24)} days`;
      }
    }

    return `${durationText} ${ageMinutesRounded >= 0 ? 'ago' : 'ahead'}`;
  };

  private static readonly FREQ_FORMATTERS: Record<ComSpacing, (freq: number) => string> = {
    [ComSpacing.Spacing25Khz]: RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz),
    [ComSpacing.Spacing833Khz]: RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz)
  };

  private static readonly MILE_FORMATTER = NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: false });

  private static readonly SPEED_UNIT_FORMATTER = G3XUnitFormatter.createBasic();

  private static readonly DISTANCE_UNIT_FORMATTER = (unit: Unit<UnitFamily.Distance>): string => {
    switch (unit.name) {
      case UnitType.MILE.name:
        return ' mi';
      case UnitType.KILOMETER.name:
        return ' km';
      case UnitType.METER.name:
        return ' m';
      default:
        return '';
    }
  };

  private static readonly TEMPERATURE_UNIT_FORMATTER = G3XUnitFormatter.createBasic();

  private static readonly BARO_PRESSURE_UNIT_FORMATTER = (unit: Unit<UnitFamily.Pressure>): string => {
    switch (unit.name) {
      case UnitType.IN_HG.name:
        return '"';
      case UnitType.HPA.name:
        return ' hPa';
      case UnitType.MB.name:
        return ' mb';
      default:
        return '';
    }
  };

  private static readonly CLOUD_COVER_TEXT = {
    [MetarCloudLayerCoverage.Clear]: 'Sky clear below 12000 ft',
    [MetarCloudLayerCoverage.SkyClear]: 'Sky clear',
    [MetarCloudLayerCoverage.NoSignificant]: 'No significant clouds',
    [MetarCloudLayerCoverage.Few]: 'Few',
    [MetarCloudLayerCoverage.Scattered]: 'Scattered',
    [MetarCloudLayerCoverage.Broken]: 'Broken',
    [MetarCloudLayerCoverage.Overcast]: 'Overcast'
  };

  private static readonly CLOUD_TYPE_TEXT = {
    [MetarCloudLayerType.Unspecified]: '',
    [MetarCloudLayerType.AltocumulusCastellanus]: 'altocumulus',
    [MetarCloudLayerType.Cumulonimbus]: 'cumulonimbus',
    [MetarCloudLayerType.ToweringCumulus]: 'towering cumulus',
  };

  private readonly listRef = FSComponent.createRef<UiList<any>>();
  private readonly listContentRef = FSComponent.createRef<HTMLDivElement>();
  private readonly metarCloudLayersContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly listHeight = Subject.create(1);
  private readonly listItemHeight = Subject.create(1);

  private readonly metar = Subject.create<Metar | undefined>(undefined);

  private readonly isWeatherDataAvailable = Subject.create(false);

  private readonly simTime = ConsumerSubject.create(null, 0).pause();

  private readonly dateTimeFormat = this.props.dateTimeSettingManager.getSetting('dateTimeFormat').map(settingMode => {
    return AirportWeatherTab.DATE_TIME_FORMAT_SETTING_MAP[settingMode] ?? TimeDisplayFormat.UTC;
  });

  private readonly airportFreqState = MappedSubject.create(
    this.props.waypointInfo.facility,
    this.props.comRadioSpacingDataProvider.combinedComSpacing
  );

  private readonly airportNameText = Subject.create('');
  private readonly airportCityText = Subject.create('');
  private readonly airportFreqText = Subject.create('');

  private readonly time = new Date();

  private readonly metarTime = Subject.create(0);
  private readonly metarAgeMinutes = MappedSubject.create(
    ([metarDate, simTime]) => Math.round((simTime - metarDate) / 60000),
    this.metarTime,
    this.simTime
  );

  private readonly metarDisplayTime = MappedSubject.create(
    AirportWeatherTab.DISPLAY_TIME_MAP_FUNC,
    this.metarTime,
    this.dateTimeFormat,
    this.props.dateTimeSettingManager.getSetting('dateTimeLocalOffset')
  ).pause();

  private readonly metarIdentText = Subject.create('');
  private readonly metarTypeText = Subject.create('');
  private readonly metarDateText = this.metarDisplayTime.map(AirportWeatherTab.DATE_FORMATTER);
  private readonly metarAgeText = this.metarAgeMinutes.map(AirportWeatherTab.AGE_FORMATTER);

  private readonly metarWindHidden = Subject.create(false);
  private readonly metarWindText = Subject.create('');

  private readonly metarVisHidden = Subject.create(false);
  private readonly metarVisText = Subject.create('');

  private readonly metarCloudLayers = ArraySubject.create<MetarCloudLayer & DynamicListData>();
  private metarCloudLayersList?: DynamicList<MetarCloudLayer & DynamicListData>;

  private readonly metarTempHidden = Subject.create(false);
  private readonly metarDewpointHidden = Subject.create(false);
  private readonly metarTemperatureText = Subject.create('');
  private readonly metarDewpointText = Subject.create('');

  private readonly metarBaroHidden = Subject.create(false);
  private readonly metarBaroText = Subject.create('');

  private readonly metarRemarksHidden = Subject.create(false);
  private readonly metarRemarksText = Subject.create('');

  private readonly subscriptions: Subscription[] = [
    this.simTime,
    this.dateTimeFormat,
    this.airportFreqState,
    this.metarDisplayTime,
  ];

  private readonly pauseable: Subscription[] = [
    this.simTime,
    this.metarDisplayTime
  ];

  private readonly displayUnitSubs: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.metarCloudLayersList = new DynamicList(this.metarCloudLayers, this.metarCloudLayersContainerRef.instance, this.renderMetarCloudLayer.bind(this));

    this.simTime.setConsumer(this.props.uiService.bus.getSubscriber<ClockEvents>().on('simTime').withPrecision(-3));

    const tabContentDimensionsSub = this.props.tabContentDimensions.sub(this.onTabContentDimensionsChanged.bind(this), false, true);
    const updateMetarSub = this.props.waypointInfo.facility.sub(this.updateMetar.bind(this), false, true);

    const nameSub = this.props.waypointInfo.name.sub(this.updateAirportNameText.bind(this), false, true);
    const citySub = this.props.waypointInfo.city.sub(this.updateAirportCityText.bind(this), false, true);

    const speedUnitSub = this.props.unitsSettingManager.speedUnits.sub(this.onSpeedUnitChanged.bind(this), false, true);
    const temperatureUnitSub = this.props.unitsSettingManager.temperatureUnits.sub(this.onTemperatureUnitChanged.bind(this), false, true);
    const baroUnitSub = this.props.unitsSettingManager.baroPressureUnits.sub(this.onBaroUnitChanged.bind(this), false, true);

    this.subscriptions.push(
      tabContentDimensionsSub,
      updateMetarSub,
      nameSub,
      citySub,
      speedUnitSub,
      temperatureUnitSub,
      baroUnitSub
    );

    this.pauseable.push(
      this.metar.sub(this.onMetarChanged.bind(this), false, true),
      tabContentDimensionsSub,
      updateMetarSub,
      nameSub,
      citySub,
      this.airportFreqState.sub(this.updateAirportFreqText.bind(this), false, true)
    );

    this.displayUnitSubs.push(
      speedUnitSub,
      temperatureUnitSub,
      baroUnitSub
    );
  }

  /** @inheritDoc */
  public onOpen(): void {
    for (const sub of this.pauseable) {
      sub.resume(true);
    }

    for (const sub of this.displayUnitSubs) {
      sub.resume();
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    for (const sub of this.pauseable) {
      sub.pause();
    }

    for (const sub of this.displayUnitSubs) {
      sub.pause();
    }
  }

  /**
   * Responds to changes in the dimensions of this tab's content area.
   * @param tabContentDimensions The new dimensions of this tab's content area, as `[width, height]` in pixels.
   */
  private onTabContentDimensionsChanged(tabContentDimensions: ReadonlyFloat64Array): void {
    // TODO: support GDU470 (portrait)

    // The list takes up the entire height of the content area minus 7px margins on each side.
    this.listHeight.set(tabContentDimensions[1] - 7 * 2);
  }

  /**
   * Updates this tab's displayed airport name.
   * @param name The name to display, or `undefined` if there is no name to display.
   */
  private updateAirportNameText(name: string | undefined): void {
    this.airportNameText.set(name ? name.toUpperCase() : '––––');

    this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
  }

  /**
   * Updates this tab's displayed airport city.
   * @param city The city to display, or `undefined` if there is no city to display.
   */
  private updateAirportCityText(city: string | undefined): void {
    this.airportCityText.set(city ? city.toUpperCase() : 'UNKNOWN');

    this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
  }

  /**
   * Updates this tab's airport weather reporting frequency display.
   * @param state The state of this tab's airport weather reporting frequency display, as
   * `[facility to display, com radio spacing mode]`.
   */
  private updateAirportFreqText(state: readonly [Facility | null, ComSpacing]): void {
    const [facility, comSpacing] = state;

    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      this.airportFreqText.set('');
      return;
    }

    // Search for ATIS, AWOS, or ASOS frequencies

    let bestFreq: FacilityFrequency | undefined = undefined;
    let bestFreqPriority = 0;

    for (let i = 0; i < facility.frequencies.length; i++) {
      const freq = facility.frequencies[i];
      let freqPriority: number;
      switch (freq.type) {
        case FacilityFrequencyType.ATIS:
          freqPriority = 3;
          break;
        case FacilityFrequencyType.AWOS:
          freqPriority = 2;
          break;
        case FacilityFrequencyType.ASOS:
          freqPriority = 1;
          break;
        default:
          freqPriority = 0;
      }

      if (freqPriority > bestFreqPriority) {
        bestFreq = freq;
        bestFreqPriority = freqPriority;
      }
    }

    if (bestFreq) {
      let typeText: string;

      switch (bestFreq.type) {
        case FacilityFrequencyType.ATIS:
          typeText = 'ATIS';
          break;
        case FacilityFrequencyType.AWOS:
          typeText = 'AWOS';
          break;
        case FacilityFrequencyType.ASOS:
          typeText = 'ASOS';
          break;
        default:
          typeText = '';
      }

      const freqText = AirportWeatherTab.FREQ_FORMATTERS[comSpacing](bestFreq.freqMHz * 1e6);

      this.airportFreqText.set(`${typeText} ${freqText} MHz`);
    } else {
      this.airportFreqText.set('');
    }

    this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
  }

  private updateMetarOpId = 0;

  /**
   * Updates METAR data for the displayed facility.
   * @param facility The displayed facility.
   */
  private async updateMetar(facility: Facility | null): Promise<void> {
    const opId = ++this.updateMetarOpId;

    this.metar.set(undefined);

    if (facility && FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      const metar = await this.props.facLoader.getMetar(facility);

      if (opId !== this.updateMetarOpId) {
        return;
      }

      this.metar.set(metar);
    }
  }

  /**
   * Responds to when this tab's loaded METAR changes.
   * @param metar The new METAR.
   */
  private onMetarChanged(metar: Metar | undefined): void {
    if (!metar) {
      this.isWeatherDataAvailable.set(false);
      return;
    }

    this.metarIdentText.set(metar.icao);

    this.metarTypeText.set(
      AirportWeatherTab.METAR_AUTO_REGEXP.test(metar.metarString)
        ? 'automated observation'
        : 'observation'
    );

    this.time.setTime(Date.now());
    if (metar.day > this.time.getUTCDate()) {
      // If the METAR day is greater than the current day, then we assume that the METAR was issued the previous month.
      this.time.setUTCMonth(this.time.getUTCMonth() - 1);
    }
    this.time.setUTCDate(metar.day);
    this.time.setUTCHours(metar.hour, metar.min, 0, 0);

    this.metarTime.set(this.time.getTime());

    this.updateMetarWind(metar);
    this.updateMetarVis(metar);
    this.updateMetarCloudLayers(metar);
    this.updateMetarTemperatureDewpoint(metar);
    this.updateMetarBaro(metar);
    this.updateMetarRemarks(metar);

    this.isWeatherDataAvailable.set(true);

    this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
  }

  /**
   * Updates this tab's displayed METAR wind text.
   * @param metar The METAR data to use for the update.
   */
  private updateMetarWind(metar: Metar): void {
    let speedUnit: Unit<UnitFamily.Speed> | undefined = undefined;

    if (metar.windSpeed === undefined) {
      this.metarWindHidden.set(true);
      return;
    }

    switch (metar.windSpeedUnits) {
      case MetarWindSpeedUnits.Knot:
        speedUnit = UnitType.KNOT;
        break;
      case MetarWindSpeedUnits.KilometerPerHour:
        speedUnit = UnitType.KPH;
        break;
      case MetarWindSpeedUnits.MeterPerSecond:
        speedUnit = UnitType.MPS;
        break;
    }

    if (!speedUnit) {
      this.metarWindHidden.set(true);
      return;
    }

    if (metar.windSpeed === 0 && metar.gust === undefined) {
      this.metarWindText.set('calm');
      this.metarWindHidden.set(false);
      return;
    }

    const windDirRounded = metar.windDir === undefined ? undefined : NavMath.normalizeHeading(Math.round(metar.windDir));
    const minWindDirRounded = metar.minWindDir === undefined ? undefined : NavMath.normalizeHeading(Math.round(metar.minWindDir));
    const maxWindDirRounded = metar.maxWindDir === undefined ? undefined : NavMath.normalizeHeading(Math.round(metar.maxWindDir));

    const windDir = windDirRounded === undefined ? undefined : windDirRounded === 0 ? 360 : windDirRounded;
    const minWindDir = minWindDirRounded === undefined ? undefined : minWindDirRounded === 0 ? 360 : minWindDirRounded;
    const maxWindDir = maxWindDirRounded === undefined ? undefined : maxWindDirRounded === 0 ? 360 : maxWindDirRounded;
    const isVariable = metar.vrb
      || (minWindDir !== undefined && maxWindDir !== undefined)
      || windDir === undefined;

    const displayUnit = this.props.unitsSettingManager.speedUnits.get();

    const windSpeed = Math.round(speedUnit.convertTo(metar.windSpeed, displayUnit));
    const gustSpeed = Math.round(speedUnit.convertTo(metar.gust ?? NaN, displayUnit));

    const directionText = isVariable
      ? `variable${minWindDir !== undefined && maxWindDir !== undefined ? ` from (${minWindDir.toString().padStart(3, '0')}° to ${maxWindDir.toString().padStart(3, '0')}°)` : ''}`
      : `from ${windDir.toString().padStart(3, '0')}°`;
    const displayUnitText = AirportWeatherTab.SPEED_UNIT_FORMATTER(displayUnit).toLowerCase();
    const speedText = `${windSpeed} ${displayUnitText}${isFinite(gustSpeed) ? ` gusting to ${gustSpeed} ${displayUnitText}` : ''}`;

    this.metarWindText.set(`${directionText} at ${speedText}`);
    this.metarWindHidden.set(false);
  }

  /**
   * Updates this tab's displayed METAR visibility text.
   * @param metar The METAR data to use for the update.
   */
  private updateMetarVis(metar: Metar): void {
    let unit: Unit<UnitFamily.Distance> | undefined = undefined;

    if (metar.vis === undefined) {
      this.metarVisHidden.set(true);
      return;
    }

    switch (metar.visUnits) {
      case MetarVisibilityUnits.StatuteMile:
        unit = UnitType.MILE;
        break;
      case MetarVisibilityUnits.Meter:
        unit = UnitType.METER;
        break;
    }

    if (!unit) {
      this.metarVisHidden.set(true);
      return;
    }

    let displayUnit = unit;

    if (unit.equals(UnitType.METER) && metar.vis >= 1000) {
      displayUnit = UnitType.KILOMETER;
    }

    const distance = unit.convertTo(metar.vis, displayUnit);

    const distanceText = displayUnit === UnitType.MILE
      ? `${AirportWeatherTab.MILE_FORMATTER(distance)}${AirportWeatherTab.DISTANCE_UNIT_FORMATTER(displayUnit)}`
      : `${Math.round(distance)}${AirportWeatherTab.DISTANCE_UNIT_FORMATTER(displayUnit)}`;

    this.metarVisText.set(`${metar.visLt ? 'less than ' : ''}${distanceText}`);
    this.metarVisHidden.set(false);
  }

  /**
   * Updates this tab's displayed METAR cloud layers text.
   * @param metar The METAR data to use for the update.
   */
  private updateMetarCloudLayers(metar: Metar): void {
    const clearCondition = metar.layers.reduce((condition, layer) => {
      switch (layer.cover) {
        case MetarCloudLayerCoverage.NoSignificant:
          if (condition === MetarCloudLayerCoverage.Clear) {
            return condition;
          }
        // fallthrough
        case MetarCloudLayerCoverage.Clear:
          if (condition === MetarCloudLayerCoverage.SkyClear) {
            return condition;
          }
        // fallthrough
        case MetarCloudLayerCoverage.SkyClear:
          return layer.cover;
        default:
          return condition;
      }
    }, undefined as MetarCloudLayerCoverage.SkyClear | MetarCloudLayerCoverage.Clear | MetarCloudLayerCoverage.NoSignificant | undefined);

    const layers = metar.layers.filter(layer => {
      return layer.cover !== MetarCloudLayerCoverage.SkyClear
        && layer.cover !== MetarCloudLayerCoverage.Clear
        && layer.cover !== MetarCloudLayerCoverage.NoSignificant;
    });

    if (layers.length === 0) {
      this.metarCloudLayers.clear();
      this.metarCloudLayers.insert({
        alt: 0,
        cover: clearCondition ?? MetarCloudLayerCoverage.SkyClear,
        type: MetarCloudLayerType.Unspecified
      });
    } else {
      this.metarCloudLayers.set(layers);
    }
  }

  /**
   * Renders a METAR cloud layer item.
   * @param layer The METAR cloud layer to render.
   * @param index The index of the layer.
   * @returns A rendered item for the specified METAR cloud layer, as a VNode.
   */
  private renderMetarCloudLayer(layer: MetarCloudLayer, index: number): VNode {
    switch (layer.cover) {
      case MetarCloudLayerCoverage.SkyClear:
      case MetarCloudLayerCoverage.Clear:
      case MetarCloudLayerCoverage.NoSignificant:
        return (
          <span class='airport-weather-tab-metar-cloud-layer'>{AirportWeatherTab.CLOUD_COVER_TEXT[layer.cover]}</span>
        );
      default: {
        const coverText = AirportWeatherTab.CLOUD_COVER_TEXT[layer.cover];
        const typeText = AirportWeatherTab.CLOUD_TYPE_TEXT[layer.type];

        return (
          <span class='airport-weather-tab-metar-cloud-layer'>
            {index > 0 ? <span class='airport-weather-tab-metar-cloud-layer-sep'>, </span> : null}
            {coverText}{typeText.length > 0 ? ` ${typeText}` : ''} at {(layer.alt * 100).toFixed(0)} ft
          </span>
        );
      }
    }
  }

  /**
   * Updates this tab's displayed METAR temperature and dewpoint text.
   * @param metar The METAR data to use for the update.
   */
  private updateMetarTemperatureDewpoint(metar: Metar): void {
    if (metar.temp === undefined) {
      this.metarTempHidden.set(true);
      return;
    }

    const displayUnit = this.props.unitsSettingManager.temperatureUnits.get();
    const unitText = AirportWeatherTab.TEMPERATURE_UNIT_FORMATTER(displayUnit);

    const temperature = Math.round(UnitType.CELSIUS.convertTo(metar.temp, displayUnit));

    this.metarTemperatureText.set(`${temperature}${unitText}`);

    if (metar.dew !== undefined) {
      const dewpoint = Math.round(UnitType.CELSIUS.convertTo(metar.dew, displayUnit));
      this.metarDewpointText.set(`${dewpoint}${unitText}`);
      this.metarDewpointHidden.set(false);
    } else {
      this.metarDewpointHidden.set(true);
    }

    this.metarTempHidden.set(false);
  }

  /**
   * Updates this tab's displayed METAR altimeter barometric setting text.
   * @param metar The METAR data to use for the update.
   */
  private updateMetarBaro(metar: Metar): void {
    const displayUnit = this.props.unitsSettingManager.baroPressureUnits.get();

    let baro: number | undefined;
    if (metar.altimeterA !== undefined) {
      baro = UnitType.IN_HG.convertTo(metar.altimeterA, displayUnit);
    } else if (metar.altimeterQ !== undefined) {
      baro = UnitType.HPA.convertTo(metar.altimeterQ, displayUnit);
    }

    if (baro === undefined) {
      this.metarBaroHidden.set(true);
      return;
    }

    const unitText = AirportWeatherTab.BARO_PRESSURE_UNIT_FORMATTER(displayUnit);

    this.metarBaroText.set(`${displayUnit.equals(UnitType.IN_HG) ? baro.toFixed(2) : baro.toFixed(0)}${unitText}`);
  }

  /**
   * Updates this tab's displayed METAR remarks text.
   * @param metar The METAR data to use for the update.
   */
  private updateMetarRemarks(metar: Metar): void {
    const remarks = metar.rmk && metar.metarString.match(AirportWeatherTab.METAR_RMK_REGEXP)?.[1].trim();
    if (remarks) {
      this.metarRemarksText.set(remarks);
      this.metarRemarksHidden.set(false);
    } else {
      this.metarRemarksHidden.set(true);
    }
  }

  /**
   * Responds to when the speed display unit type changes.
   */
  private onSpeedUnitChanged(): void {
    const metar = this.metar.get();
    if (metar) {
      this.updateMetarWind(metar);
      this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
    }
  }

  /**
   * Responds to when the temperature display unit type changes.
   */
  private onTemperatureUnitChanged(): void {
    const metar = this.metar.get();
    if (metar) {
      this.updateMetarTemperatureDewpoint(metar);
      this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
    }
  }

  /**
   * Responds to when the barometric pressure display unit type changes.
   */
  private onBaroUnitChanged(): void {
    const metar = this.metar.get();
    if (metar) {
      this.updateMetarBaro(metar);
      this.listItemHeight.set(this.listContentRef.instance.offsetHeight);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='airport-weather-tab'>
        <UiList
          ref={this.listRef}
          bus={this.props.uiService.bus}
          listItemLengthPx={this.listItemHeight}
          lengthPx={this.listHeight}
          autoDisableOverscroll
          class={{ 'airport-weather-tab-list': true, 'hidden': this.isWeatherDataAvailable.map(SubscribableMapFunctions.not()) }}
        >
          <div ref={this.listContentRef} class='airport-weather-tab-list-content'>
            <div class='airport-weather-tab-airport-name'>{this.airportNameText}</div>
            <div class='airport-weather-tab-airport-name-sub'>
              <span class='airport-weather-tab-airport-city'>{this.airportCityText}</span>
              <span class='airport-weather-tab-airport-name-sub-sep'> </span>
              <span class='airport-weather-tab-airport-freq'>{this.airportFreqText}</span>
            </div>
            <div class='airport-weather-tab-section airport-weather-tab-metar'>
              <div class='airport-weather-tab-section-title'>
                <span>{this.metarIdentText} {this.metarTypeText} {this.metarDateText} </span>
                <G3XTimeDisplay
                  time={this.metarDisplayTime}
                  format={this.dateTimeFormat}
                  localOffset={0}
                  class='airport-weather-tab-metar-time'
                />
                <span> ({this.metarAgeText})</span>
              </div>
              <div
                class={{
                  'airport-weather-tab-metar-line': true,
                  'airport-weather-tab-metar-wind': true,
                  'hidden': this.metarWindHidden
                }}
              >
                <span class='airport-weather-tab-metar-line-title'>Wind </span>
                <span>{this.metarWindText}</span>
              </div>
              <div
                class={{
                  'airport-weather-tab-metar-line': true,
                  'airport-weather-tab-metar-vis': true,
                  'hidden': this.metarVisHidden
                }}
              >
                <span class='airport-weather-tab-metar-line-title'>Visibility </span>
                <span>{this.metarVisText}</span>
              </div>
              <div ref={this.metarCloudLayersContainerRef} class='airport-weather-tab-metar-line airport-weather-tab-metar-clouds' />
              <div
                class={{
                  'airport-weather-tab-metar-line': true,
                  'airport-weather-tab-metar-temp': true,
                  'hidden': this.metarTempHidden
                }}
              >
                <span class='airport-weather-tab-metar-line-title'>Temperature </span>
                <span>{this.metarTemperatureText}</span>
                <span class={{ 'hidden': this.metarDewpointHidden }}>
                  <span> / </span>
                  <span class='airport-weather-tab-metar-line-title'>Dewpoint </span>
                  <span>{this.metarDewpointText}</span>
                </span>
              </div>
              <div
                class={{
                  'airport-weather-tab-metar-line': true,
                  'airport-weather-tab-metar-baro': true,
                  'hidden': this.metarBaroHidden
                }}
              >
                <span class='airport-weather-tab-metar-line-title'>Altimeter </span>
                <span>{this.metarBaroText}</span>
              </div>
              <div
                class={{
                  'airport-weather-tab-metar-line': true,
                  'airport-weather-tab-metar-remarks': true,
                  'hidden': this.metarRemarksHidden
                }}
              >
                <span class='airport-weather-tab-metar-line-title'>Remarks </span>
                <span>{this.metarRemarksText}</span>
              </div>
            </div>
          </div>
        </UiList>
        <div class={{ 'airport-weather-tab-no-data': true, 'hidden': this.isWeatherDataAvailable }}>No Weather Data</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.metarCloudLayersList?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
