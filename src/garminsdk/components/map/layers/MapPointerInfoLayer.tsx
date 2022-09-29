import {
  BitFlags, FSComponent, GeoPoint, GeoPointSubject, LatLonDisplay, MapLayer, MapLayerProps, MapOwnAirplanePropsModule, MapProjection, MapProjectionChangeType,
  MapSystemKeys, NavAngleSubject, NavAngleUnit, NavAngleUnitReferenceNorth, NumberFormatter, NumberUnitSubject, Subject, Unit, UnitFamily, UnitType, VNode
} from 'msfssdk';

import { BearingDisplay } from '../../common/BearingDisplay';
import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapPointerModule } from '../modules/MapPointerModule';
import { MapUnitsModule } from '../modules/MapUnitsModule';

/**
 * Modules required for MapPointerInfoLayer.
 */
export interface MapPointerInfoLayerModules {
  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Pointer module. */
  [GarminMapKeys.Pointer]: MapPointerModule;

  /** Display units module. */
  [GarminMapKeys.Units]?: MapUnitsModule;
}

/**
 * Map pointer information box size.
 */
export enum MapPointerInfoLayerSize {
  Full,
  Medium,
  Small
}

/**
 * Component props for MapPointerInfoLayer.
 */
export interface MapPointerInfoLayerProps extends MapLayerProps<MapPointerInfoLayerModules> {
  /** The size of the information box. */
  size: MapPointerInfoLayerSize;
}

/**
 * A map layer which displays a pointer information box.
 */
export class MapPointerInfoLayer extends MapLayer<MapPointerInfoLayerProps> {
  private static readonly geoPointCache = [new GeoPoint(0, 0)];

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly ownAirplanePropsModule = this.props.model.getModule(MapSystemKeys.OwnAirplaneProps);
  private readonly pointerModule = this.props.model.getModule(GarminMapKeys.Pointer);

  private readonly unitsModule = this.props.model.getModule(GarminMapKeys.Units);
  private readonly distanceLargeUnits = this.unitsModule?.distanceLarge ?? Subject.create(UnitType.NMILE);
  private readonly distanceSmallUnits = this.unitsModule?.distanceSmall ?? Subject.create(UnitType.FOOT);
  private readonly navAngleUnits = this.unitsModule?.navAngle ?? Subject.create(NavAngleUnit.create(true));

  private readonly distance = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(NaN));
  private readonly distanceUnit = Subject.create(UnitType.NMILE as Unit<UnitFamily.Distance>);
  private readonly bearing = NavAngleSubject.createFromNavAngle(new NavAngleUnit(NavAngleUnitReferenceNorth.True, 0, 0).createNumber(NaN));

  private readonly latLon = GeoPointSubject.createFromGeoPoint(new GeoPoint(0, 0));

  private readonly scheduleUpdateHandler = (): void => { this.needUpdate = true; };

  private needUpdate = false;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onVisibilityChanged(isVisible: boolean): void {
    this.rootRef.getOrDefault() && this.updateFromVisibility();
  }

  /**
   * Updates this layer according to its current visibility.
   */
  private updateFromVisibility(): void {
    if (this.isVisible()) {
      this.rootRef.instance.style.display = '';
      this.ownAirplanePropsModule.position.sub(this.scheduleUpdateHandler);
      this.pointerModule.position.sub(this.scheduleUpdateHandler, true);
    } else {
      this.rootRef.instance.style.display = 'none';
      this.ownAirplanePropsModule.position.unsub(this.scheduleUpdateHandler);
      this.pointerModule.position.unsub(this.scheduleUpdateHandler);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.updateFromVisibility();
    this.pointerModule.isActive.sub(isActive => this.setVisible(isActive), true);
    this.distanceLargeUnits.sub(this.updateDistanceUnit.bind(this));
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.needUpdate ||= this.isVisible() && BitFlags.isAny(
      changeFlags,
      MapProjectionChangeType.Center | MapProjectionChangeType.Rotation | MapProjectionChangeType.ProjectedResolution
    );
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdated(time: number, elapsed: number): void {
    if (!this.needUpdate) {
      return;
    }

    this.updateInfo();
    this.needUpdate = false;
  }

  /**
   * Updates this layer's displayed information.
   */
  private updateInfo(): void {
    const latLon = this.props.mapProjection.invert(this.pointerModule.position.get(), MapPointerInfoLayer.geoPointCache[0]);
    this.latLon.set(latLon);
    const airplanePos = this.ownAirplanePropsModule.position.get();

    this.distance.set(airplanePos.distance(latLon), UnitType.GA_RADIAN);
    this.updateDistanceUnit();

    this.bearing.set(airplanePos.bearingTo(latLon), airplanePos.lat, airplanePos.lon);
  }

  /**
   * Updates the displayed distance unit type.
   */
  private updateDistanceUnit(): void {
    const distance = this.distance.get();
    if (!distance.isNaN() && distance.asUnit(this.distanceLargeUnits.get()) < 0.1) {
      this.distanceUnit.set(this.distanceSmallUnits.get());
    } else {
      this.distanceUnit.set(this.distanceLargeUnits.get());
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='map-pointerinfolayer-box'>
        <div class='map-pointerinfolayer-box-column map-pointerinfolayer-box-dis'>
          <span class='map-pointerinfolayer-box-title' style={this.props.size === MapPointerInfoLayerSize.Small ? 'display: none;' : ''}>DIS</span>
          <NumberUnitDisplay
            value={this.distance} displayUnit={this.distanceUnit}
            formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: false, nanString: '__._' })}
            class='map-pointerinfolayer-box-title-value'
          />
        </div>
        <div class='map-pointerinfolayer-box-column map-pointerinfolayer-box-brg' style={this.props.size === MapPointerInfoLayerSize.Small ? 'display: none;' : ''}>
          <span class='map-pointerinfolayer-box-title'>BRG</span>
          <BearingDisplay
            value={this.bearing}
            displayUnit={this.navAngleUnits}
            formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
            class='map-pointerinfolayer-box-title-value'
          />
        </div>
        {
          this.props.size === MapPointerInfoLayerSize.Full
            ? <LatLonDisplay location={this.latLon} class='map-pointerinfolayer-box-column map-pointerinfolayer-box-title-value' />
            : null
        }
      </div>
    );
  }
}