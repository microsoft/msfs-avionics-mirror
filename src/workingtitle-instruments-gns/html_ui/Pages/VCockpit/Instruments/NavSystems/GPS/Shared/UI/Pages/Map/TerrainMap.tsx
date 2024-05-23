import { FlightPlanner, FSComponent, GNSSEvents, MapSystemKeys, NumberFormatter, NumberUnitSubject, UnitType, Vec2Math, Vec2Subject, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuDefinition, MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { GNSMapBuilder } from './GNSMapBuilder';
import { GNSMapController } from './GNSMapController';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from './GNSMapSystem';

import './TerrainMap.css';

/** A type describing the map controllers. */
type GNSStandardMapControllers = GNSMapControllers & {

  /** The root map controller instance. */
  [GNSMapKeys.Controller]: GNSMapController;
}

/**
 * Props on the ArcNavMap page.
 */
interface TerrainMapProps extends PageProps {
  /** The FMS */
  fms: Fms,

  /** The GNS user settings provider. */
  settingsProvider: GNSSettingsProvider;

  /** The GNS FMS system flight planner. */
  flightPlanner: FlightPlanner;

  /** The instrument index. */
  instrumentIndex: number;
}

/**
 * A page that display a terrain map.
 */
export class TerrainMap extends Page<TerrainMapProps> {

  private readonly mapSize = Vec2Subject.create(this.props.gnsType === 'wt430' ? Vec2Math.create(272, 174) : Vec2Math.create(255, 217));
  private readonly gsl = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly gslFormatter = NumberFormatter.create({ precision: 60 });
  private readonly pageMenu = new TerrainMapMenu(this.props.settingsProvider);
  private readonly compassEl = FSComponent.createRef<HTMLCanvasElement>();

  private readonly StandardMap = GNSMapBuilder
    .withStandardMap(this.props.bus, this.props.fms, this.props.settingsProvider, this.props.gnsType, this.props.instrumentIndex, true)
    .withController(GNSMapKeys.Controller, c => new GNSMapController(c, this.props.settingsProvider, this.props.fms, true))
    .withProjectedSize(this.mapSize)
    .build<GNSMapModules, GNSMapLayers, GNSStandardMapControllers, GNSMapContextProps>('terrain-map-container');

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(1).handle(pos => this.gsl.set(pos.alt));
    this.props.settingsProvider.map.getSetting('map_terr_arc_view_enabled').sub(this.onArcViewEnabledChanged.bind(this), true);
    this.props.settingsProvider.map.getSetting('map_terr_aviation_data').sub(this.onAviationDataChanged.bind(this), true);

    this.StandardMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.StandardMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.StandardMap.ref.instance.wake();
    this.StandardMap.context.getController(GNSMapKeys.Controller).setTerrainEnabled(true);
  }

  /**
   * Handles when the 120 degree arc view setting has changed.
   * @param enabled Whether the arc view is enabled.
   */
  private onArcViewEnabledChanged(enabled: boolean): void {
    const context = this.compassEl.instance.getContext('2d');
    const centerVec = new Float64Array([this.compassEl.instance.width / 2, this.compassEl.instance.height / 2]);
    const arcOffset = this.props.gnsType === 'wt430' ? 60 : 84;

    if (context !== null) {
      if (enabled) {
        this.StandardMap.context.projection.set({ targetProjectedOffset: Vec2Math.create(0, arcOffset) });
        centerVec[1] += (arcOffset - 4);

        context.clearRect(0, 0, this.compassEl.instance.width, this.compassEl.instance.height);
        context.beginPath();

        const startAngle = (-60 - 90) * Avionics.Utils.DEG2RAD;
        const endAngle = (60 - 90) * Avionics.Utils.DEG2RAD;

        context.lineWidth = 1;
        context.strokeStyle = 'cyan';

        const arcRadius = this.props.gnsType === 'wt430' ? 110 : 160;
        context.arc(centerVec[0], centerVec[1], arcRadius, startAngle, endAngle);
        context.moveTo(centerVec[0], centerVec[1]);

        const tempVec = new Float64Array(2);
        Vec2Math.setFromPolar(arcRadius, startAngle, tempVec);
        Vec2Math.add(centerVec, tempVec, tempVec);
        context.lineTo(tempVec[0], tempVec[1]);

        context.moveTo(centerVec[0], centerVec[1]);
        Vec2Math.setFromPolar(arcRadius, endAngle, tempVec);
        Vec2Math.add(centerVec, tempVec, tempVec);
        context.lineTo(tempVec[0], tempVec[1]);

        context.stroke();
      } else {
        this.StandardMap.context.projection.set({ targetProjectedOffset: Vec2Math.create(0, 0) });

        context.clearRect(0, 0, this.compassEl.instance.width, this.compassEl.instance.height);
        context.beginPath();

        context.setLineDash([1, 3]);
        context.lineWidth = 1;
        context.strokeStyle = 'cyan';

        context.arc(centerVec[0], centerVec[1], centerVec[1], 0, Math.PI * 2);
        context.stroke();

        context.beginPath();
        context.setLineDash([]);
        context.fillStyle = 'cyan';

        const tempVec = new Float64Array(2);
        for (let i = 0; i < 360; i += 30) {
          Vec2Math.setFromPolar(this.compassEl.instance.height / 2, Avionics.Utils.DEG2RAD * i, tempVec);
          Vec2Math.add(centerVec, tempVec, tempVec);

          context.fillRect(tempVec[0] - 2, tempVec[1] - 2, 4, 4);
        }
      }
    }
  }

  /**
   * Handles when the setting for showing aviation data changes.
   * @param enabled Whether or not showing aviation data is enabled.
   */
  private onAviationDataChanged(enabled: boolean): void {
    const mapContext = this.StandardMap.context;
    if (enabled) {
      mapContext.getLayer(MapSystemKeys.Airspace).setVisible(true);
      mapContext.getLayer(MapSystemKeys.NearestWaypoints).setVisible(true);
      mapContext.getLayer(GNSMapKeys.Runways).setVisible(true);
      mapContext.getLayer(`${MapSystemKeys.FlightPlan}0` as any).setVisible(true);
      mapContext.getLayer(MapSystemKeys.TextLayer).setVisible(true);
    } else {
      mapContext.getLayer(MapSystemKeys.Airspace).setVisible(false);
      mapContext.getLayer(MapSystemKeys.NearestWaypoints).setVisible(false);
      mapContext.getLayer(GNSMapKeys.Runways).setVisible(false);
      mapContext.getLayer(`${MapSystemKeys.FlightPlan}0` as any).setVisible(false);
      mapContext.getLayer(MapSystemKeys.TextLayer).setVisible(false);
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    switch (evt) {
      case InteractionEvent.RangeIncrease:
        this.StandardMap.context.getController(GNSMapKeys.Controller).increaseRange();
        return true;
      case InteractionEvent.RangeDecrease:
        this.StandardMap.context.getController(GNSMapKeys.Controller).decreaseRange();
        return true;
      case InteractionEvent.MENU:
        ViewService.menu(this.pageMenu);
        return true;
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page page-no-padding terrain-map-page hide-element' ref={this.el}>
        {this.StandardMap.map}
        <canvas class='terrain-map-compass' ref={this.compassEl}
          width={this.props.gnsType === 'wt430' ? '272px' : '255px'}
          height={this.props.gnsType === 'wt430' ? '174px' : '215px'} />
        <div class='terrain-map-name'>TERRAIN</div>
        <div class='terrain-map-trk'>TRK</div>
        <div class='terrain-map-gsl'>
          <label>GSL</label>
          <GNSNumberUnitDisplay formatter={this.gslFormatter} value={this.gsl} displayUnit={this.props.settingsProvider.units.altitudeUnits} />
        </div>
      </div>
    );
  }
}

/**
 * A page menu for the standard nav map page.
 */
class TerrainMapMenu extends MenuDefinition {

  /** @inheritDoc */
  constructor(private readonly settingsProvider: GNSSettingsProvider) {
    super();

    this.settingsProvider.map.getSetting('map_terr_arc_view_enabled').sub(v => {
      this.setEntryLabel(1, v ? 'View 360°?' : 'View 120°?');
    }, true);

    this.settingsProvider.map.getSetting('map_terr_aviation_data').sub(v => {
      this.setEntryLabel(2, v ? 'Hide Aviation Data?' : 'Show Aviation Data?');
    }, true);
  }

  /**
   * Toggles between arc 120 deg view and 360 deg view.
   */
  private toggleArcView(): void {
    const arcSetting = this.settingsProvider.map.getSetting('map_terr_arc_view_enabled');
    arcSetting.set(!arcSetting.get());

    ViewService.back();
  }

  /**
   * Toggles map aviation data on and off.
   */
  private toggleAviationData(): void {
    const arcSetting = this.settingsProvider.map.getSetting('map_terr_aviation_data');
    arcSetting.set(!arcSetting.get());

    ViewService.back();
  }

  /** @inheritDoc */
  public entries: MenuEntry[] = [
    { label: 'Inhibit Terrain?', disabled: true, action: () => { } },
    { label: 'View 120°?', disabled: false, action: this.toggleArcView.bind(this) },
    { label: 'Hide Aviation Data?', disabled: false, action: this.toggleAviationData.bind(this) },
  ];
}