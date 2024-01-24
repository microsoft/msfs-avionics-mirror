import { NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface, UnitFamily, VNode } from '@microsoft/msfs-sdk';
import {
  NavDataFieldRenderer, GenericNavDataFieldRenderer, UnitsUserSettingManager, NavDataFieldType,
  NavDataFieldTypeModelMap, NextGenDisplayUnitNavDataFieldTypeRenderer, NavDataFieldTextRenderer,
  NavDataFieldModel, NavDataFieldBearingRenderer, NavDataFieldDurationRenderer, NavDataFieldNumberUnitRenderer,
} from '@microsoft/msfs-garminsdk';

/** A SR22T implementation of {@link NavDataFieldRenderer} which supports Destination Airport Info's field types. */
export class Sr22tDestAirportInfoFieldRenderer implements NavDataFieldRenderer {
  protected readonly renderer: GenericNavDataFieldRenderer;

  /**
   * Constructor.
   * @param unitsSettingManager A display units user setting manager.
   */
  constructor(unitsSettingManager: UnitsUserSettingManager) {
    this.renderer = new GenericNavDataFieldRenderer();

    this.renderer.register(NavDataFieldType.Destination, new Sr22tNavDataFieldDestRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TimeToDestination, new Sr22tNavDataFieldEteRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelOverDestination, new Sr22tNavDataFieldFodRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToDestination, new Sr22tNavDataFieldDisRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.BearingToWaypoint, new Sr22tNavDataFieldBrgRenderer(unitsSettingManager));
  }

  /** @inheritdoc */
  public render<T extends NavDataFieldType>(type: T, model: NavDataFieldTypeModelMap[T]): VNode {
    return this.renderer.render(type, model);
  }
}

/** Renders SR22T MFD Destination Airport Info data block's DEST data field. */
class Sr22tNavDataFieldDestRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.Destination> {
  private readonly renderer = new NavDataFieldTextRenderer<NavDataFieldType.Destination>({
    title: 'DEST',
    class: 'sr22t-dest-airport-info-data-field sr22t-dest-airport'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<string>): VNode {
    return this.renderer.render(model);
  }
}

/** Renders SR22T MFD Destination Airport Info data block's Time to Waypoint navigation data field. */
class Sr22tNavDataFieldEteRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TimeToWaypoint> {
  private readonly renderer = new NavDataFieldDurationRenderer<NavDataFieldType.TimeToWaypoint>({
    title: 'ETE',
    options: NextGenDisplayUnitNavDataFieldTypeRenderer.DURATION_OPTIONS,
    class: 'sr22t-dest-airport-info-data-field sr22t-destination-ete'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return this.renderer.render(model);
  }
}

/** Renders SR22T MFD Destination Airport Info data block's Fuel Over Destination navigation data field. */
class Sr22tNavDataFieldFodRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.FuelOverDestination> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.FuelOverDestination>({
    title: 'FOD',
    displayUnit: this.unitsSettingManager.fuelUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.FUEL_FORMATTER,
    class: 'sr22t-dest-airport-info-data-field sr22t-fod'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>): VNode {
    return this.renderer.render(model);
  }
}

/** Renders SR22T MFD Destination Airport Info data block's Distance to Waypoint navigation data field. */
class Sr22tNavDataFieldDisRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.DistanceToWaypoint> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.DistanceToWaypoint>({
    title: 'DIS',
    displayUnit: this.unitsSettingManager.distanceUnitsLarge,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.DISTANCE_FORMATTER,
    class: 'sr22t-dest-airport-info-data-field sr22t-waypoint-distance'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return this.renderer.render(model);
  }
}

/** Renders SR22T MFD Destination Airport Info data block's Bearing to Waypoint navigation data field. */
class Sr22tNavDataFieldBrgRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.BearingToWaypoint> {
  private readonly renderer = new NavDataFieldBearingRenderer<NavDataFieldType.BearingToWaypoint>({
    title: 'BRG',
    displayUnit: this.unitsSettingManager.navAngleUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.BEARING_FORMATTER,
    class: 'sr22t-dest-airport-info-data-field sr22t-waypoint-brg'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>): VNode {
    return this.renderer.render(model);
  }
}