import {
  AirportFacility, Facility, FacilitySearchType, FacilityType, FSComponent, ICAO, Metar, MetarCloudLayer, MetarCloudLayerCoverage, MetarCloudLayerType,
  MetarPhenomenon, MetarPhenomenonIntensity, MetarPhenomenonType, MetarVisibilityUnits, MetarWindSpeedUnits, Subject, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { Epic2Fms, Epic2List, TabContent, TabContentProps } from '@microsoft/msfs-epic2-shared';

/** Props for GroundTab. */
interface WeatherTabProps extends TabContentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The subject being displayed */
  readonly facility: Subject<Facility | undefined>
}

const METAR_WIND_UNITS = {
  [MetarWindSpeedUnits.Knot]: 'knots',
  [MetarWindSpeedUnits.KilometerPerHour]: 'kph',
  [MetarWindSpeedUnits.MeterPerSecond]: 'm/s'
};

const METAR_VISIBILITY_UNITS = {
  [MetarVisibilityUnits.Meter]: 'meters',
  [MetarVisibilityUnits.StatuteMile]: 'SM'
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** The GroundTab component. */
export class WeatherTab extends TabContent<WeatherTabProps> {
  // The number of items that are guaranteed to always be displayed;
  // needed because the epic item list doesn't consider paragraphs on multiple lines as multiple items
  static readonly STATIC_ITEM_COUNT = 12;
  static readonly CHARS_PER_LINE = 35;

  private readonly metar = Subject.create<Metar | undefined>(undefined);
  private readonly metarAltimeter = Subject.create<string>('');
  private readonly metarAvailable = Subject.create<boolean>(false);
  private readonly metarWeather = Subject.create<string>('');
  private readonly metarSkyCondition = Subject.create<string>('');
  private readonly metarRemarks = Subject.create<string>('');
  private readonly metarRaw = Subject.create<string>('');
  private readonly metarWind = Subject.create<string>('');
  private readonly itemCount = Subject.create<number>(WeatherTab.STATIC_ITEM_COUNT);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.facility.sub(async (fac) => {
      if (fac) {
        let airportFacility: AirportFacility;
        if (ICAO.getFacilityType(fac.icao) === FacilityType.RWY) {
          const airportIcao = (await this.props.fms.facLoader.searchByIdent(FacilitySearchType.Airport, ICAO.getAssociatedAirportIdent(fac.icao)))[0];
          airportFacility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, airportIcao);
        } else {
          airportFacility = fac as AirportFacility;
        }

        const metar = await this.props.fms.facLoader.getMetar(ICAO.getIdent(airportFacility.icao));
        const metarWeather = (!metar || metar?.cavok || metar?.phenomena.length === 0) ? 'No significant weather' : metar?.phenomena.map((phenomena) => this.metarPhenomenaToString(phenomena)).join('\r\n');
        const metarSkyCondition = metar ? this.getCloudFromMetar(metar) : '';
        const metarRemarks = !metar?.rmk ? 'No remarks' : metar?.metarString.split(' RMK ')[1];
        const metarWind = metar ? this.determineMetarWind(metar) : '';
        const rawMetar = metar?.metarString ?? 'No METAR available';
        this.metarAvailable.set(metar !== undefined);
        this.metar.set(metar);
        this.metarWeather.set(metarWeather);
        this.metarSkyCondition.set(metarSkyCondition);
        this.metarRemarks.set(metarRemarks);
        this.metarRaw.set(rawMetar);
        this.metarWind.set(metarWind);
        metar && this.metarAltimeter.set(this.determineMetarAltimeter(metar));

        const wxLines = metarSkyCondition.split('\r\n').length;
        const skyLines = metarSkyCondition.split('\r\n').length;
        const remarkLines = Math.ceil(metarRemarks.length / WeatherTab.CHARS_PER_LINE);
        const windLines = Math.ceil(metarWind.length / WeatherTab.CHARS_PER_LINE);
        const rawLines = Math.ceil(rawMetar.length / WeatherTab.CHARS_PER_LINE);
        this.itemCount.set(WeatherTab.STATIC_ITEM_COUNT + wxLines + skyLines + remarkLines + rawLines + windLines);
      }
    }, true);
  }

  /**
   * Gets a human readable string describing the cloud layer
   * @param metar The metar object
   * @returns A human readable string
   */
  private getCloudFromMetar(metar: Metar): string {
    if (metar.cavok) {
      return 'Cloud and visibility OK';
    }

    let cloudLayerString = metar?.layers.map((layer) => this.metarCloudLayerToString(layer)).join('\r\n');
    if (metar.vis && metar.visUnits !== MetarVisibilityUnits.Undefined) {
      cloudLayerString = `Visibility to ${metar.visLt ? 'less than ' : ''}${metar.vis} ${METAR_VISIBILITY_UNITS[metar.visUnits]}\r\n${cloudLayerString}`;
    }
    if (metar.vertVis) {
      cloudLayerString = `Vertical visibility to ${metar.vertVis}ft AGL\r\n${cloudLayerString}`;
    } else if (metar.metarString.includes('VV///')) {
      cloudLayerString = `Vertical visibility unmeasurable (///)\r\n${cloudLayerString}`;
    }

    if (cloudLayerString.length === 0) {
      return 'No significant cloud';
    }

    return cloudLayerString;
  }


  /**
   * Converts a metar phenomenon to a human readable string
   * @param phenomena The metar phenomena
   * @returns A human readable string
   */
  private metarPhenomenaToString(phenomena: MetarPhenomenon): string {
    const intensity = phenomena.intensity !== MetarPhenomenonIntensity.Normal ? MetarPhenomenonIntensity[phenomena.intensity] : '';
    const phenomenon = MetarPhenomenonType[phenomena.phenom].replace(/([a-z])([A-Z])/g, '$1 $2');

    return `${phenomena.tempo ? 'Temporary' : ''} ${intensity} ${phenomena.shallow ? 'Shallow' : ''} ${phenomena.partial ? 'Partial' : ''} ${phenomena.patches ? 'Patches' : ''} ${phenomena.blowing ? 'Blowing' : ''} ${phenomena.drifting ? 'Drifting' : ''} ${phenomena.freezing ? 'Freezing' : ''} ${phenomena.ts ? 'Thunderstorm' : ''} ${phenomenon} ${phenomena.vicinity ? 'in the vicinity' : ''}`;
  }

  /**
   * Converts a metar cloud layer to a human readable string
   * @param layer The metar cloud layer
   * @returns A human readable string
   */
  private metarCloudLayerToString(layer: MetarCloudLayer): string {
    if (layer.cover === MetarCloudLayerCoverage.NoSignificant || layer.cover === MetarCloudLayerCoverage.SkyClear || layer.cover === MetarCloudLayerCoverage.Clear) {
      return 'No significant cloud';
    }

    const cloudType = MetarCloudLayerType[layer.type].replace(/([a-z])([A-Z])/g, '$1 $2');
    return `${MetarCloudLayerCoverage[layer.cover]}${layer.type !== MetarCloudLayerType.Unspecified ? ` ${cloudType}` : ''} ${layer.alt * 100}ft AGL`;
  }

  /**
   * Determines the metar altimeter string to use based on the presented QNH and INHG
   * @param metar The metar object
   * @returns A human readable string
   */
  private determineMetarAltimeter(metar: Metar): string {
    const qnh = metar.altimeterQ;
    const inhg = metar.altimeterA;

    if (qnh) {
      return `${qnh.toFixed(0)} HPa(${inhg ? inhg : UnitType.IN_HG.convertFrom(qnh, UnitType.HPA).toFixed(2)} inHg)`;
    } else if (inhg) {
      return `${inhg.toFixed(2)} inHg(${qnh ? qnh : UnitType.IN_HG.convertTo(inhg, UnitType.HPA).toFixed(0)} HPa)`;
    } else {
      return 'No altimeter data';
    }
  }

  /**
   * Formats the wind metar into a human readable string
   * @param metar The metar object
   * @returns a human readable string
   */
  private determineMetarWind(metar: Metar): string {
    if (metar.windSpeed === undefined || metar.windSpeedUnits === MetarWindSpeedUnits.Undefined) {
      return '';
    }

    let windDirection;
    if (metar.windDir !== undefined && metar.minWindDir !== undefined && metar.maxWindDir !== undefined) {
      windDirection = `${metar?.windDir}° variable ${metar?.minWindDir}° to ${metar?.maxWindDir}°`;
    } else if (metar.minWindDir !== undefined && metar.maxWindDir !== undefined) {
      windDirection = `Variable ${metar?.minWindDir}° to ${metar?.maxWindDir}°`;
    } else if (metar.windDir !== undefined) {
      windDirection = `${metar?.windDir}°${metar?.vrb ? ' VRB' : ''}`;
    } else if (metar.vrb) {
      windDirection = 'Variable direction';
    }

    return `${windDirection} at ${metar?.windSpeed}${!isNaN(metar?.gust ?? NaN) ? `G${metar?.gust}` : ''} ${METAR_WIND_UNITS[metar?.windSpeedUnits ?? 0]}`;
  }

  /** @inheritdoc */
  public render(): VNode {
    const currentDate = new Date();

    return (
      <div>
        <p class='variable'>METAR</p>
        <br />
        <Epic2List<any>
          bus={this.props.bus}
          heightPx={255}
          listItemHeightPx={20}
          scrollbarStyle={'inside'}
          itemCount={this.itemCount}
        >
          <div class={{ 'hidden': this.metarAvailable.map(x => !x) }}>
            <p>Conditions at:</p>
            <p class='variable'>{this.metar.map((metar) => `${metar?.icao} observed ${metar?.hour.toString().padStart(2, '0')}:${metar?.min.toString().padStart(2, '0')} on ${metar?.day.toString().padStart(2, '0')} ${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`)}</p>
            <p>Winds:</p>
            <p class='variable'>{this.metarWind}</p>
            <p>Present Weather:</p>
            <p class='variable'>{this.metarWeather}</p>
            <p>Sky Condition:</p>
            <p class='variable'>{this.metarSkyCondition}</p>
            <p>Temperature/Dewpoint:</p>
            <p class='variable'>{this.metar.map((metar) => `${metar?.temp}°C(${UnitType.CELSIUS.convertTo(metar?.temp ?? 0, UnitType.FAHRENHEIT).toFixed(0)}°F) / ${metar?.dew}°C(${UnitType.CELSIUS.convertTo(metar?.dew ?? 0, UnitType.FAHRENHEIT).toFixed(0)}°F)`)}</p>
            <p>Altimeter:</p>
            <p class='variable'>{this.metarAltimeter}</p>
            <p>Remark:</p>
            <p class='variable'>{this.metarRemarks}</p>
            <p>Raw METAR:</p>
            <p class='variable'>{this.metarRaw}</p>
          </div>
          <div class={{ 'hidden': this.metarAvailable }}>
            <p>METAR Unavailable</p>
          </div>
        </Epic2List>

      </div >
    );
  }
}
