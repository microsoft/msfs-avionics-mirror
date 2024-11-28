import {
  AbstractMapTextLabel, ComponentProps, ConsumerValue, DateTimeFormatter, DisplayComponent, FacilityType, FSComponent,
  GNSSEvents, GPSSatComputer, GPSSatelliteState, GPSSystemState, HoldUtils, ICAO, MappedSubject, MapProjection,
  MathUtils, NumberFormatter, Subject, SubscribableArray, SubscribableMapFunctions, Subscription, Vec2Math,
  Vec2Subject, VNode, Waypoint
} from '@microsoft/msfs-sdk';

import {
  DateTimeFormatSettingMode, DynamicList, DynamicListData, GarminFacilityWaypointCache, LatLonDisplay,
  LatLonDisplayFormat, TimeDisplayFormat, WaypointInfoStore
} from '@microsoft/msfs-garminsdk';

import { GduDefsConfig } from '../../../../Shared/AvionicsConfig/GduDefsConfig';
import { GpsReceiverDefinition } from '../../../../Shared/AvionicsConfig/SensorsConfig';
import { G3XBearingDisplay } from '../../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { G3XTimeDisplay } from '../../../../Shared/Components/Common/G3XTimeDisplay';
import { GenericTabbedContent } from '../../../../Shared/Components/TabbedContainer/GenericTabbedContent';
import { TabbedContainer } from '../../../../Shared/Components/TabbedContainer/TabbedContainer';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiWaypointIcon } from '../../../../Shared/Components/Waypoint/UiWaypointIcon';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../../Shared/Graphics/Text/G3XSpecialChar';
import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { G3XDateTimeUserSettings } from '../../../../Shared/Settings/G3XDateTimeUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { AbstractMfdPage } from '../../../PageNavigation/AbstractMfdPage';
import { MfdPageProps } from '../../../PageNavigation/MfdPage';
import { GpsInfoChannelData, MfdGpsInfoDataProvider } from './MfdGpsInfoDataProvider';

import './MfdInfoPage.css';

/**
 * Converts a satellite PRN code to an NMEA ID.
 * @param prn The satellite PRN code to convert.
 * @returns The NMEA ID corresponding to the specified satellite PRN code.
 */
function prnToNmea(prn: number): number {
  // NMEA ID is equal to PRN for GPS satellites (PRN 1-32) and equal to PRN - 87 for SBAS satellites (PRN 120-158).
  return prn >= 120 ? prn - 87 : prn;
}

/**
 * Component props for {@link MfdInfoPage}.
 */
export interface MfdInfoPageProps extends MfdPageProps {
  /** Definitions for GPS receiver systems connected to the G3X Touch, indexed by GPS receiver system index. */
  gpsReceiverDefs: readonly Readonly<GpsReceiverDefinition>[];

  /** A configuration object defining options for GDUs. */
  gduDefsConfig: GduDefsConfig;

  /**
   * An array of the GPS computers used by the GPS receiver systems connected to the G3X Touch, indexed by GPS receiver
   * system index.
   */
  gpsSatComputers: readonly GPSSatComputer[];
}

/**
 * An MFD information page.
 */
export class MfdInfoPage extends AbstractMfdPage<MfdInfoPageProps> {

  private readonly constellationCanvasRef = FSComponent.createRef<HTMLCanvasElement>();
  private readonly signalStrengthContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly dateTimeSettingManager = G3XDateTimeUserSettings.getManager(this.props.uiService.bus);
  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private readonly dataProvider = new MfdGpsInfoDataProvider(
    this.props.uiService.bus,
    this.props.uiService.gduIndex,
    this.props.gpsSatComputers
  );
  private gpsHasPosition = false;

  private satList?: DynamicList<GpsInfoChannelData & DynamicListData>;

  private readonly realGpsPos = ConsumerValue.create(null, new LatLongAlt(0, 0, 0)).pause();

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.uiService.bus);

  private nearestContext?: G3XNearestContext;
  private readonly nearestWaypoint = Subject.create<Waypoint | null>(null);
  private readonly waypointStore = new WaypointInfoStore(
    this.nearestWaypoint,
    this.dataProvider.position,
  );
  private needUpdateNearestWaypoint = false;

  private readonly time = this.dataProvider.time.map(SubscribableMapFunctions.withPrecision(1000));
  private readonly timeFormat = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(settingMode => {
    switch (settingMode) {
      case DateTimeFormatSettingMode.Local24:
        return TimeDisplayFormat.Local24;
      case DateTimeFormatSettingMode.Local12:
        return TimeDisplayFormat.Local12;
      default:
        return TimeDisplayFormat.UTC;
    }
  });
  private readonly utcDisplayHidden = this.timeFormat.map(format => format === TimeDisplayFormat.UTC);
  private readonly localTime = MappedSubject.create(
    ([time, timeFormat, localOffset]) => timeFormat === TimeDisplayFormat.UTC ? time : time + localOffset,
    this.time,
    this.timeFormat,
    this.dateTimeSettingManager.getSetting('dateTimeLocalOffset')
  );

  // TODO: support GDU470 (portrait)
  private readonly constellationRadius = this.props.uiService.gduFormat === '460' ? 60 : 30;
  private readonly constellationOverdraw = this.props.uiService.gduFormat === '460' ? 16 : 8;
  private readonly constellationCanvasSize = (this.constellationRadius + this.constellationOverdraw) * 2;
  private readonly constellationLabel = new GpsSatelliteTextLabel(this.constellationCanvasSize, this.constellationRadius);
  private readonly nullProjection = new MapProjection(8, 8);

  private readonly conditionText = this.dataProvider.systemState.map(state => {
    switch (state) {
      case GPSSystemState.Searching:
        return 'Searching the Sky';
      case GPSSystemState.Acquiring:
        return 'Acquiring Satellites';
      case GPSSystemState.SolutionAcquired:
        return '3D GPS Location';
      case GPSSystemState.DiffSolutionAcquired:
        return '3D Differential';
      default:
        return '';
    }
  });
  private readonly sourceText = this.dataProvider.gpsIndex.map(index => {
    const gpsDef = this.props.gpsReceiverDefs[index];
    if (!gpsDef) {
      return '';
    }

    if (gpsDef.type === 'internal' && gpsDef.gduIndex !== this.props.uiService.gduIndex) {
      const gduConfig = this.props.gduDefsConfig.definitions[gpsDef.gduIndex];
      if (gduConfig) {
        const type = gduConfig.type;
        let gduTypeIndex: string;
        if (
          gduConfig.typeIndex === 1
          && this.props.gduDefsConfig.definitions.findIndex(config => config && config.type === type && config.typeIndex !== 1) < 0
        ) {
          gduTypeIndex = '';
        } else {
          gduTypeIndex = gduConfig.typeIndex.toString();
        }

        return ` (${type}${gduTypeIndex})`;
      }
    } else if (gpsDef.type === 'external' || gpsDef.type === 'external-navigator') {
      return ' (External)';
    }

    return '';
  });

  private isAlive = true;
  private isOpen = false;

  private nearestContextUpdateSub?: Subscription;
  private gpsSystemStateSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Info');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_gps_info.png`);

    this.dataProvider.init(true);

    this.initNearestAirportSearch();

    this.realGpsPos.setConsumer(this.props.uiService.bus.getSubscriber<GNSSEvents>().on('gps-position'));

    this.satList = new DynamicList(
      this.dataProvider.channelArray as SubscribableArray<GpsInfoChannelData & DynamicListData>,
      this.signalStrengthContainerRef.instance,
      this.renderSignalStrengthItem.bind(this),
      (a, b) => {
        if (a.satellite === null && b.satellite === null) {
          return 0;
        } else if (a.satellite === null) {
          return 1;
        } else if (b.satellite === null) {
          return -1;
        } else {
          return a.satellite.prn - b.satellite.prn;
        }
      }
    );
  }

  /**
   * Initializes the nearest airport search.
   */
  private async initNearestAirportSearch(): Promise<void> {
    if (!this.isAlive) {
      return;
    }

    this.nearestContext = await G3XNearestContext.getInstance();

    this.gpsSystemStateSub = this.dataProvider.systemState.sub(state => {
      const gpsHasPosition = state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired;
      if (gpsHasPosition !== this.gpsHasPosition && this.nearestContext) {
        this.needUpdateNearestWaypoint = true;
      }
      this.gpsHasPosition = gpsHasPosition;
    }, true, !this.isOpen);

    this.nearestContextUpdateSub = this.nearestContext.updateEvent.on(() => {
      if (this.gpsHasPosition) {
        this.needUpdateNearestWaypoint = true;
      }
    }, !this.isOpen);

    if (this.isOpen) {
      this.needUpdateNearestWaypoint = true;
    }
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.isOpen = true;

    this.dataProvider.resume();
    this.realGpsPos.resume();
    this.gpsSystemStateSub?.resume(true);
    this.nearestContextUpdateSub?.resume();
    this.needUpdateNearestWaypoint = this.nearestContext !== undefined;

    this.satList!.forEachComponent<SatelliteSignalStrengthItem>(s => s?.resume());
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;

    this.dataProvider.pause();
    this.realGpsPos.pause();
    this.gpsSystemStateSub!.pause();
    this.nearestContextUpdateSub?.pause();

    this.satList!.forEachComponent<SatelliteSignalStrengthItem>(s => s?.pause());
  }

  /** @inheritDoc */
  public onUpdate(): void {
    this.updateNearestWaypoint();
    this.updateConstellationDiagram();
  }

  /**
   * Updates the nearest waypoint displayed by this page.
   */
  private updateNearestWaypoint(): void {
    if (this.needUpdateNearestWaypoint && this.nearestContext) {
      if (!this.gpsHasPosition) {
        this.nearestWaypoint.set(null);
        return;
      }

      // TODO: support other nearest waypoint types.
      const nearestAirport = this.nearestContext.getNearest(FacilityType.Airport);
      this.nearestWaypoint.set(nearestAirport ? this.facWaypointCache.get(nearestAirport) : null);

      this.needUpdateNearestWaypoint = false;
    }
  }

  /**
   * Updates this page's GPS satellite constellation diagram.
   */
  private updateConstellationDiagram(): void {
    const context = this.constellationCanvasRef.instance.getContext('2d');

    if (context) {
      context.clearRect(0, 0, this.constellationCanvasSize, this.constellationCanvasSize);

      const maxZenithAngle = (Math.PI / 2) + this.calcHorizonAngle();
      this.constellationLabel.maxZenithAngle.set(maxZenithAngle);

      const channelArray = this.dataProvider.channelArray.getArray();
      for (let i = 0; i < channelArray.length; i++) {
        const data = channelArray[i];
        const sat = data.satellite;
        if (!sat) {
          continue;
        }

        this.constellationLabel.text.set(prnToNmea(sat.prn).toFixed(0).padStart(2, '0'));
        this.constellationLabel.state.set(sat.state.get());
        this.constellationLabel.location.set(sat.position.get());
        this.constellationLabel.draw(context, this.nullProjection);
      }
    }
  }

  /**
   * Calculates the horizon zenith angle.
   * @returns The calculated horizon zenith angle based on the current altitude.
   */
  private calcHorizonAngle(): number {
    return Math.acos(6378100 / (6378100 + Math.max(this.realGpsPos.get().alt, 0)));
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.NoOptionsPopup, false, { popupType: 'slideout-bottom-full' });
      return true;
    }

    return false;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='ui-view-generic-bg mfd-info-page'>
        <div class='mfd-info-pane-current-position-container ui-view-panel'>
          <div class='mfd-info-pane-current-position-title'>Current Position</div>
          <div class='mfd-info-pane-current-position-first-row'>
            <UiTouchButton class='mfd-info-pane-current-position-lat-lon-button'>
              <LatLonDisplay
                value={this.dataProvider.position}
                format={LatLonDisplayFormat.HDDD_MMmmm}
                splitPrefix
                blankPrefixWhenNaN
                class='mfd-info-pane-current-position-lat-lon-button-display'
              />
            </UiTouchButton>
            <div class='mfd-info-pane-current-position-accuracy'>
              <span class='mfd-info-pane-current-position-accuracy-title'>Accuracy</span>
              <G3XNumberUnitDisplay
                value={this.dataProvider.accuracy}
                displayUnit={this.unitsSettingManager.distanceUnitsSmall}
                formatter={NumberFormatter.create({ precision: 1, nanString: '__' })}
                class='mfd-info-pane-current-position-accuracy-value'
              />
            </div>
          </div>
          <div class='mfd-info-pane-current-position-divider' />
          <div
            class={{
              'mfd-info-pane-current-position-second-row': true,
              'hidden': this.waypointStore.waypoint.map(w => w === null)
            }}
          >
            <div class='mfd-info-pane-current-position-second-row-header'>
              From {this.waypointStore.name} ({this.waypointStore.facility.map(facility => facility ? ICAO.getIdent(facility.icao) : '')}):
            </div>
            <div class='mfd-info-pane-current-position-second-row-data'>
              <UiWaypointIcon
                waypoint={this.waypointStore.waypoint}
                class='mfd-info-pane-current-position-second-row-icon'
              />
              <G3XNumberUnitDisplay
                value={this.waypointStore.distance}
                displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' })}
                class='mfd-info-pane-current-position-second-row-distance'
              />
              <div class='mfd-info-pane-current-position-second-row-direction'>{this.waypointStore.radial.map(radial => HoldUtils.getDirectionString(radial.number, true))}</div>
              <G3XBearingDisplay
                value={this.waypointStore.radial}
                displayUnit={this.unitsSettingManager.navAngleUnits}
                formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
                class='mfd-info-pane-current-position-second-row-radial'
              />
            </div>
          </div>
        </div>
        <TabbedContainer
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
          tabsPerListPage={2}
          tabLength={214}
          tabSpacing={90}
          gduFormat={this.props.uiService.gduFormat}
          class='mfd-info-page-tabbed-container'
          tabPosition='top'
        >
          <GenericTabbedContent tabLabel='Satellite Status'>
            <div class='mfd-info-page-satellite-status'>
              <div class='mfd-info-page-satellite-status-top-row'>
                <div class='mfd-info-page-satellite-status-constellation'>
                  <svg viewBox='-50 -50 100 100' class='mfd-info-page-satellite-status-constellation-bg'>
                    <circle cx='0' cy='0' r='2' vector-effect='non-scaling-stroke' class='mfd-info-page-satellite-status-constellation-ring' />
                    <circle cx='0' cy='0' r='25' vector-effect='non-scaling-stroke' class='mfd-info-page-satellite-status-constellation-ring' />
                    <circle cx='0' cy='0' r='50' vector-effect='non-scaling-stroke' class='mfd-info-page-satellite-status-constellation-ring' />
                  </svg>
                  <div class='mfd-info-page-satellite-status-constellation-direction-label mfd-info-page-satellite-status-constellation-direction-label-n'>N</div>
                  <div class='mfd-info-page-satellite-status-constellation-direction-label mfd-info-page-satellite-status-constellation-direction-label-e'>E</div>
                  <div class='mfd-info-page-satellite-status-constellation-direction-label mfd-info-page-satellite-status-constellation-direction-label-s'>S</div>
                  <div class='mfd-info-page-satellite-status-constellation-direction-label mfd-info-page-satellite-status-constellation-direction-label-w'>W</div>
                  <canvas
                    ref={this.constellationCanvasRef}
                    class='mfd-info-page-satellite-status-constellation-canvas'
                    width={`${this.constellationCanvasSize}px`}
                    height={`${this.constellationCanvasSize}px`}
                  />
                </div>
                <div class='mfd-info-page-satellite-status-date-time-utc'>
                  <div class='mfd-info-page-satellite-status-date-time-row'>
                    <div class='mfd-info-page-satellite-status-date-time-title'>Date</div>
                    <div>{this.localTime.map(DateTimeFormatter.create('{dd}-{MON}-{YY}', { nanString: '__-___-__' }))}</div>
                  </div>
                  <div class='mfd-info-page-satellite-status-date-time-row'>
                    <div class='mfd-info-page-satellite-status-date-time-title'>Time</div>
                    <G3XTimeDisplay
                      time={this.localTime}
                      format={this.timeFormat}
                      localOffset={0}
                      suffixFormatter={(format, isAm) => {
                        switch (format) {
                          case TimeDisplayFormat.UTC:
                            return G3XSpecialChar.Utc;
                          case TimeDisplayFormat.Local12:
                            return isAm ? G3XSpecialChar.Am : G3XSpecialChar.Pm;
                          default:
                            return '';
                        }
                      }}
                      hideSuffixWhenNaN
                    />
                  </div>
                  <G3XTimeDisplay
                    time={this.time}
                    format={TimeDisplayFormat.UTC}
                    localOffset={0}
                    useVerticalSuffix
                    hideSuffixWhenNaN
                    class={{ 'mfd-info-page-satellite-status-utc': true, 'hidden': this.utcDisplayHidden }}
                  />
                </div>
              </div>
              <div class='mfd-info-page-satellite-status-condition'>{this.conditionText}{this.sourceText}</div>
              <div class='mfd-info-page-satellite-status-sigstrength'>
                <div class='mfd-info-page-satellite-status-sigstrength-bg'>
                  <div class='mfd-info-page-satellite-status-sigstrength-bg-line' />
                  <div class='mfd-info-page-satellite-status-sigstrength-bg-line' />
                  <div class='mfd-info-page-satellite-status-sigstrength-bg-line' />
                  <div class='mfd-info-page-satellite-status-sigstrength-bg-line' />
                  <div class='mfd-info-page-satellite-status-sigstrength-bg-line' />
                  <div class='mfd-info-page-satellite-status-sigstrength-bg-line' />
                </div>
                <div
                  ref={this.signalStrengthContainerRef}
                  class='mfd-info-page-satellite-status-sigstrength-columns'
                  style={{
                    '--channel-count': this.dataProvider.channelCount.map(count => count.toString())
                  }}
                />
              </div>
            </div>
          </GenericTabbedContent>
          <GenericTabbedContent tabLabel='Data Fields' isEnabled={false} />
        </TabbedContainer>
      </div>
    );
  }

  /**
   * Renders a satellite signal strength item for a GPS receiver channel data item.
   * @param data The data for which to render an item.
   * @returns A satellite signal strength item for the specified GPS receiver channel data, as a VNode.
   */
  private renderSignalStrengthItem(data: GpsInfoChannelData): VNode {
    const node: VNode = (
      <SatelliteSignalStrengthItem data={data} />
    );

    if (this.isOpen) {
      (node.instance as SatelliteSignalStrengthItem).resume();
    }

    return node;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    this.dataProvider.destroy();
    this.realGpsPos.destroy();
    this.timeFormat.destroy();

    this.satList?.destroy();
    this.nearestContextUpdateSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link SatelliteSignalStrengthItem}.
 */
interface SatelliteSignalStrengthProps extends ComponentProps {
  /** The satellite data to display. */
  data: GpsInfoChannelData;
}

/**
 * A component that displays a signal bar for a satellite.
 */
class SatelliteSignalStrengthItem extends DisplayComponent<SatelliteSignalStrengthProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly barHeight = this.props.data.satellite?.signalStrength.map(signalStrength => `${MathUtils.round(signalStrength * 100, 0.1)}%`);

  private stateSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.stateSub = this.props.data.satellite?.state.sub(state => {
      switch (state) {
        case GPSSatelliteState.InUse:
        case GPSSatelliteState.InUseDiffApplied:
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-acquired');
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-data-collected');
          this.rootRef.instance.classList.add('mfd-info-page-satellite-sigstrength-item-in-use');
          break;
        case GPSSatelliteState.DataCollected:
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-acquired');
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-in-use');
          this.rootRef.instance.classList.add('mfd-info-page-satellite-sigstrength-item-data-collected');
          break;
        case GPSSatelliteState.Acquired:
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-in-use');
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-data-collected');
          this.rootRef.instance.classList.add('mfd-info-page-satellite-sigstrength-item-acquired');
          break;
        default:
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-acquired');
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-data-collected');
          this.rootRef.instance.classList.remove('mfd-info-page-satellite-sigstrength-item-in-use');
      }
    }, true);
  }

  /**
   * A callback called to resume the item when the page is resumed.
   */
  public resume(): void {
    this.barHeight?.resume();
    this.stateSub?.resume(true);
  }

  /**
   * A callback called to pause the item when the page is paused.
   */
  public pause(): void {
    this.barHeight?.pause();
    this.stateSub?.pause();
  }

  /** @inheritDoc */
  public render(): VNode {
    const nmea = this.props.data.satellite ? prnToNmea(this.props.data.satellite.prn) : undefined;

    return (
      <div ref={this.rootRef} class='mfd-info-page-satellite-sigstrength-item'>
        <div class='mfd-info-page-satellite-sigstrength-item-bar-container'>
          <div
            class='mfd-info-page-satellite-sigstrength-item-bar'
            style={{
              'position': 'absolute',
              'bottom': '0px',
              'height': this.barHeight
            }}
          />
        </div>
        <div class='mfd-info-page-satellite-sigstrength-item-prn'>{nmea?.toFixed(0).padStart(2, '0') ?? '--'}</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.barHeight?.destroy();
    this.stateSub?.destroy();

    super.destroy();
  }
}

/**
 * A text label for a GPS satellite.
 */
class GpsSatelliteTextLabel extends AbstractMapTextLabel {
  public readonly location: Vec2Subject;
  public readonly maxZenithAngle: Subject<number>;
  public readonly text: Subject<string>;
  public readonly state: Subject<GPSSatelliteState>;

  /**
   * Creates a new instance of GPSSatelliteTextLabel.
   * @param canvasSize The size of the GPS constellation canvas along each dimension, in pixels.
   * @param constellationRadius The outermost radius of the GPS constellation diagram, in pixels.
   */
  public constructor(
    private readonly canvasSize: number,
    private readonly constellationRadius: number
  ) {
    const text = Subject.create('');
    const state = Subject.create<GPSSatelliteState>(GPSSatelliteState.Unreachable);

    const bgColor = state.map(s => {
      switch (s) {
        case GPSSatelliteState.DataCollected:
        case GPSSatelliteState.Acquired:
          return '#a8a8a8';
        case GPSSatelliteState.InUseDiffApplied:
        case GPSSatelliteState.InUse:
          return '#00f000';
        default:
          return '';
      }
    });

    const bgStroke = state.map(s => {
      switch (s) {
        case GPSSatelliteState.DataCollected:
        case GPSSatelliteState.Acquired:
          return '#545454';
        case GPSSatelliteState.InUseDiffApplied:
        case GPSSatelliteState.InUse:
          return '#007800';
        default:
          return '';
      }
    });

    super(text, 0, {
      font: 'DejaVuSans-SemiBold',
      fontSize: 16,
      fontColor: 'black',
      bgColor: bgColor,
      bgOutlineWidth: 1,
      bgOutlineColor: bgStroke,
      bgBorderRadius: 0,
      bgPadding: new Float64Array([3, 1, 0, 1]),
      anchor: new Float64Array([0.5, 0.5]),
      showBg: true
    });

    this.text = text;
    this.state = state;

    this.location = Vec2Subject.create(new Float64Array(2));
    this.maxZenithAngle = Subject.create(90);
  }

  /** @inheritDoc */
  protected getPosition(mapProjection: MapProjection, out: Float64Array): Float64Array {
    const pos = this.location.get();

    const center = this.canvasSize / 2;

    const radius = (pos[0] / this.maxZenithAngle.get()) * this.constellationRadius;
    const theta = pos[1] - (Math.PI / 2);

    const x = (radius * Math.cos(theta)) + center;
    const y = (radius * Math.sin(theta)) + center;

    return Vec2Math.set(x, y, out);
  }

  /** @inheritDoc */
  public drawBackground(context: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number): void {
    super.drawBackground(context, centerX, centerY, width, height);

    const bgPadding = this.bgPadding.get();
    const bgOutlineWidth = this.bgOutlineWidth.get();

    const backgroundLeft = centerX - width / 2 - (bgPadding[3] + bgOutlineWidth);
    const backgroundTop = centerY - height / 2 - (bgPadding[0] + bgOutlineWidth);
    const backgroundWidth = width + (bgPadding[1] + bgPadding[3] + 2 * bgOutlineWidth);
    const backgroundHeight = height + (bgPadding[0] + bgPadding[2] + 2 * bgOutlineWidth);

    const gradient = context.createLinearGradient(centerX, backgroundTop, centerX, backgroundTop + backgroundHeight);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

    context.fillStyle = gradient;
    context.fillRect(backgroundLeft, backgroundTop, backgroundWidth, backgroundHeight);
  }
}