import {
  AbstractMapWaypointIcon, BitFlags, FacilityWaypoint, FlightPathWaypoint, ICAO, MapBlankWaypointIcon, MapCullableLocationTextLabel, MapCullableTextLabel,
  MapLocationTextLabelOptions, MapWaypointIcon, MapWaypointImageIcon, MapWaypointRendererIconFactory, MapWaypointRendererLabelFactory, ReadonlyFloat64Array,
  Subscribable, VNavWaypoint, Waypoint
} from 'msfssdk';

import { WaypointIconImageCache } from '../../graphics/img/WaypointIconImageCache';
import { AirportWaypoint } from '../../navigation/AirportWaypoint';
import { ProcedureTurnLegWaypoint } from './flightplan/MapFlightPlanWaypointRecord';
import { MapAirportIcon, MapWaypointHighlightIcon, MapWaypointHighlightIconOptions } from './MapWaypointIcon';
import { MapWaypointRenderer, MapWaypointRenderRole } from './MapWaypointRenderer';

/**
 * Map waypoint icon styles.
 */
export type MapWaypointIconStyles = {
  /** The render priority of the icon. Icons with higher priority will be rendered on top of icons with lower priority. */
  priority: number | Subscribable<number>;

  /** The size of the icon, as `[width, height]` in pixels. */
  size: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
};

/**
 * Map highlighted waypoint icon styles.
 */
export type MapWaypointIconHighlightStyles = MapWaypointIconStyles & {
  /** Style options for the highlight icon. */
  highlightOptions: MapWaypointHighlightIconOptions;
};

/**
 * Map waypoint label styles.
 */
export type MapWaypointLabelStyles = {
  /**
   * The render priority of the label. Labels with higher priority will be rendered on top of labels with lower
   * priority. Moreover, labels with lower priority will be preferentially culled over labels with higher priority.
   */
  priority: number | Subscribable<number>;

  /** Whether the label is immune to culling. */
  alwaysShow: boolean | Subscribable<boolean>;

  /** Style options for the label. */
  options?: MapLocationTextLabelOptions
};

/**
 * Configures how waypoints are rendered.
 */
export interface MapWaypointDisplayBuilder {
  /**
   * Configures this builder to have the waypoint renderer use specific icon and label factories for certain render
   * roles.
   * @param roles The render roles for which to use the factories.
   * @param icon A function which creates the icon factory to use.
   * @param label A function which creates the label factory to use.
   * @returns This builder, after it has been configured.
   */
  withFactory(
    roles: number,
    icon: () => MapWaypointRendererIconFactory<Waypoint>,
    label: () => MapWaypointRendererLabelFactory<Waypoint>
  ): this;

  /**
   * Configures this builder to have the waypoint renderer use specific icon and label styles for waypoints rendered
   * under the normal role. Icon and label factories which respect the specified styles will automatically be created
   * for the role.
   * @param iconStyleSelector A function which selects styles for icons.
   * @param labelStyleSelector A function which selects styles for labels.
   * @returns This builder, after it has been configured.
   */
  withNormalStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this;

  /**
   * Configures this builder to have the waypoint renderer use specific icon and label styles for waypoints rendered
   * under the inactive flight plan role. Icon and label factories which respect the specified styles will
   * automatically be created for the role.
   * @param iconStyleSelector A function which selects styles for icons.
   * @param labelStyleSelector A function which selects styles for labels.
   * @returns This builder, after it has been configured.
   */
  withFlightPlanInactiveStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this;

  /**
   * Configures this builder to have the waypoint renderer use specific icon and label styles for waypoints rendered
   * under the active flight plan role. Icon and label factories which respect the specified styles will automatically
   * be created for the role.
   * @param iconStyleSelector A function which selects styles for icons.
   * @param labelStyleSelector A function which selects styles for labels.
   * @returns This builder, after it has been configured.
   */
  withFlightPlanActiveStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this;

  /**
   * Configures this builder to have the waypoint renderer use specific icon and label styles for waypoints rendered
   * under the highlight role. Icon and label factories which respect the specified styles will automatically be
   * created for the role.
   * @param iconStyleSelector A function which selects styles for icons.
   * @param labelStyleSelector A function which selects styles for labels.
   * @returns This builder, after it has been configured.
   */
  withHighlightStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this;

  /**
   * Configures this builder to have the waypoint renderer use specific icon and label styles for waypoints rendered
   * under the VNAV role. Icon and label factories which respect the specified styles will automatically be created
   * for the role.
   * @param iconStyleSelector A function which selects styles for icons.
   * @param labelStyleSelector A function which selects styles for labels.
   * @returns This builder, after it has been configured.
   */
  withVNavStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this;

  /**
   * Configures this builder to have the waypoint renderer use specific icon and label styles for waypoints rendered
   * under the procedure preview role. Icon and label factories which respect the specified styles will automatically
   * be created for the role.
   * @param iconStyleSelector A function which selects styles for icons.
   * @param labelStyleSelector A function which selects styles for labels.
   * @returns This builder, after it has been configured.
   */
  withProcPreviewStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this;

  /**
   * Configures this builder to have the waypoint renderer use specific icon and label styles for waypoints rendered
   * under the procedure transition preview role. Icon and label factories which respect the specified styles will
   * automatically be created for the role.
   * @param iconStyleSelector A function which selects styles for icons.
   * @param labelStyleSelector A function which selects styles for labels.
   * @returns This builder, after it has been configured.
   */
  withProcTransitionPreviewStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this;
}

/**
 * Factories for icon and label factories.
 */
type Factories = {
  /** A function which creates an icon factory. */
  icon: () => MapWaypointRendererIconFactory<Waypoint>;

  /** A function which creates a label factory. */
  label: () => MapWaypointRendererLabelFactory<Waypoint>;
}

/**
 *
 */
export class MapWaypointDisplayBuilderClass implements MapWaypointDisplayBuilder {
  private readonly factories = new Map<MapWaypointRenderRole, Factories>();

  /** @inheritdoc */
  public withFactory(
    roles: number,
    icon: () => MapWaypointRendererIconFactory<Waypoint>,
    label: () => MapWaypointRendererLabelFactory<Waypoint>
  ): this {
    BitFlags.forEach(roles, (val, index) => {
      this.factories.set(1 << index, { icon, label });
    }, true);

    return this;
  }

  /** @inheritdoc */
  public withNormalStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this {
    this.factories.set(
      MapWaypointRenderRole.Normal,
      {
        icon: () => new WaypointIconFactory(imgCache, iconStyleSelector),
        label: () => new WaypointLabelFactory(labelStyleSelector)
      }
    );

    return this;
  }

  /** @inheritdoc */
  public withFlightPlanInactiveStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this {
    this.factories.set(
      MapWaypointRenderRole.FlightPlanInactive,
      {
        icon: () => new WaypointIconFactory(imgCache, iconStyleSelector),
        label: () => new WaypointLabelFactory(labelStyleSelector)
      }
    );

    return this;
  }

  /** @inheritdoc */
  public withFlightPlanActiveStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this {
    this.factories.set(
      MapWaypointRenderRole.FlightPlanActive,
      {
        icon: () => new WaypointIconFactory(imgCache, iconStyleSelector),
        label: () => new WaypointLabelFactory(labelStyleSelector)
      }
    );

    return this;
  }

  /** @inheritdoc */
  public withHighlightStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconHighlightStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this {
    this.factories.set(
      MapWaypointRenderRole.Highlight,
      {
        icon: () => new WaypointHighlightIconFactory(imgCache, iconStyleSelector),
        label: () => new WaypointLabelFactory(labelStyleSelector)
      }
    );

    return this;
  }

  /** @inheritdoc */
  public withVNavStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconHighlightStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this {
    this.factories.set(
      MapWaypointRenderRole.VNav,
      {
        icon: () => new VNavWaypointIconFactory(imgCache, iconStyleSelector),
        label: () => new VNavWaypointLabelFactory(labelStyleSelector)
      }
    );

    return this;
  }

  /** @inheritdoc */
  public withProcPreviewStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this {
    this.factories.set(
      MapWaypointRenderRole.ProcedurePreview,
      {
        icon: () => new WaypointIconFactory(imgCache, iconStyleSelector),
        label: () => new WaypointLabelFactory(labelStyleSelector)
      }
    );

    return this;
  }

  /** @inheritdoc */
  public withProcTransitionPreviewStyles(
    imgCache: WaypointIconImageCache,
    iconStyleSelector: (waypoint: Waypoint) => MapWaypointIconStyles,
    labelStyleSelector: (waypoint: Waypoint) => MapWaypointLabelStyles
  ): this {
    this.factories.set(
      MapWaypointRenderRole.ProcedureTransitionPreview,
      {
        icon: () => new WaypointIconFactory(imgCache, iconStyleSelector),
        label: () => new WaypointLabelFactory(labelStyleSelector)
      }
    );

    return this;
  }

  /**
   * Applies this builder's configurations to a waypoint renderer.
   * @param renderer A waypoint renderer.
   */
  public apply(renderer: MapWaypointRenderer): void {
    for (const [role, factories] of this.factories) {
      renderer.setIconFactory(role, factories.icon());
      renderer.setLabelFactory(role, factories.label());
    }
  }
}

/**
 * A waypoint icon factory.
 */
class WaypointIconFactory implements MapWaypointRendererIconFactory<Waypoint> {
  private readonly cache = new Map<string, MapWaypointIcon<Waypoint>>();

  /**
   * Constructor.
   * @param imgCache The image cache from which to retrieve icon images.
   * @param styles A function which retrieves styles for icons.
   */
  constructor(
    private readonly imgCache: WaypointIconImageCache,
    private readonly styles: (waypoint: Waypoint) => MapWaypointIconStyles
  ) {
  }

  /** @inheritdoc */
  public getIcon<T extends Waypoint>(role: number, waypoint: T): MapWaypointIcon<T> {
    let existing = this.cache.get(waypoint.uid);
    if (!existing) {
      existing = this.createIcon(waypoint);
      this.cache.set(waypoint.uid, existing);
    }

    return existing as MapWaypointIcon<T>;
  }

  /**
   * Creates a new icon for a waypoint.
   * @param waypoint The waypoint for which to create an icon.
   * @returns a waypoint icon.
   */
  private createIcon<T extends Waypoint>(waypoint: T): MapWaypointIcon<T> {
    const { priority, size } = this.styles(waypoint);
    const img = this.imgCache.getForWaypoint(waypoint);

    if (img) {
      if (waypoint instanceof AirportWaypoint) {
        return new MapAirportIcon(waypoint, priority, img, size);
      } else if (waypoint instanceof FacilityWaypoint || waypoint instanceof FlightPathWaypoint) {
        return new MapWaypointImageIcon(waypoint, priority, img, size);
      }
    }

    return new MapBlankWaypointIcon(waypoint, 0);
  }
}

/**
 * A waypoint label factory.
 */
class WaypointLabelFactory implements MapWaypointRendererLabelFactory<Waypoint> {
  private readonly cache = new Map<string, MapCullableTextLabel>();

  /**
   * Constructor.
   * @param styles A function which retrieves styles for labels.
   */
  constructor(private readonly styles: (waypoint: Waypoint) => MapWaypointLabelStyles) {
  }

  /** @inheritdoc */
  public getLabel<T extends Waypoint>(role: number, waypoint: T): MapCullableTextLabel {
    let existing = this.cache.get(waypoint.uid);
    if (!existing) {
      existing = this.createLabel(waypoint);
      this.cache.set(waypoint.uid, existing);
    }

    return existing;
  }

  /**
   * Creates a new icon for a waypoint.
   * @param waypoint The waypoint for which to create an icon.
   * @returns a waypoint icon.
   */
  private createLabel<T extends Waypoint>(waypoint: T): MapCullableTextLabel {
    const { priority, alwaysShow, options } = this.styles(waypoint);

    let text = '';

    if (waypoint instanceof FacilityWaypoint) {
      text = ICAO.getIdent(waypoint.facility.get().icao);
    } else if (waypoint instanceof FlightPathWaypoint || waypoint instanceof ProcedureTurnLegWaypoint) {
      text = waypoint.ident;
    }

    return new MapCullableLocationTextLabel(text, priority, waypoint.location, alwaysShow, options);
  }
}

/**
 * A waypoint icon factory for highlighted waypoints.
 */
class WaypointHighlightIconFactory implements MapWaypointRendererIconFactory<Waypoint> {
  private readonly cache = new Map<string, MapWaypointIcon<Waypoint>>();

  /**
   * Constructor.
   * @param imgCache The image cache from which to retrieve icon images.
   * @param styles A function which retrieves styles for icons.
   */
  constructor(
    private readonly imgCache: WaypointIconImageCache,
    private readonly styles: (waypoint: Waypoint) => MapWaypointIconHighlightStyles
  ) {
  }

  /** @inheritdoc */
  public getIcon<T extends Waypoint>(role: number, waypoint: T): MapWaypointIcon<T> {
    let existing = this.cache.get(waypoint.uid);
    if (!existing) {
      existing = this.createIcon(waypoint);
      this.cache.set(waypoint.uid, existing);
    }

    return existing as MapWaypointIcon<T>;
  }

  /**
   * Creates a new icon for a waypoint.
   * @param waypoint The waypoint for which to create an icon.
   * @returns A waypoint icon.
   */
  private createIcon<T extends Waypoint>(waypoint: T): MapWaypointIcon<T> {
    const style = this.styles(waypoint);

    const baseIcon = this.createBaseIcon(waypoint, style);

    if (baseIcon) {
      return new MapWaypointHighlightIcon(baseIcon, baseIcon.priority, style.highlightOptions);
    }

    return new MapBlankWaypointIcon(waypoint, 0);
  }

  /**
   * Creates a new base icon for a waypoint.
   * @param waypoint The waypoint for which to create a base icon.
   * @param style The style to apply to the icon.
   * @returns A waypoint base icon.
   */
  private createBaseIcon<T extends Waypoint>(waypoint: T, style: MapWaypointIconStyles): AbstractMapWaypointIcon<T> | null {
    const { priority, size } = style;
    const img = this.imgCache.getForWaypoint(waypoint);

    if (img === undefined) {
      return null;
    }

    if (waypoint instanceof AirportWaypoint) {
      return new MapAirportIcon(waypoint, priority, img, size);
    } else if (waypoint instanceof FacilityWaypoint) {
      return new MapWaypointImageIcon(waypoint, priority, img, size);
    }

    return null;
  }
}

/**
 * A waypoint icon factory for VNAV waypoints.
 */
class VNavWaypointIconFactory implements MapWaypointRendererIconFactory<Waypoint> {
  /**
   * Constructor.
   * @param imgCache The image cache from which to retrieve icon images.
   * @param styles A function which retrieves styles for icons.
   */
  constructor(
    private readonly imgCache: WaypointIconImageCache,
    private readonly styles: (waypoint: Waypoint) => MapWaypointIconStyles
  ) {
  }

  /** @inheritdoc */
  public getIcon<T extends Waypoint>(role: number, waypoint: T): MapWaypointIcon<T> {
    return this.createIcon(waypoint);
  }

  /**
   * Creates a new icon for a waypoint.
   * @param waypoint The waypoint for which to create an icon.
   * @returns a waypoint icon.
   */
  private createIcon<T extends Waypoint>(waypoint: T): MapWaypointIcon<T> {
    const { priority, size } = this.styles(waypoint);
    const img = this.imgCache.getForWaypoint(waypoint);

    if (img) {
      return new MapWaypointImageIcon(waypoint, priority, img, size);
    }

    return new MapBlankWaypointIcon(waypoint, 0);
  }
}

/**
 * A waypoint label factory for VNAV waypoints.
 */
class VNavWaypointLabelFactory implements MapWaypointRendererLabelFactory<Waypoint> {
  /**
   * Constructor.
   * @param styles A function which retrieves styles for labels.
   */
  constructor(private readonly styles: (waypoint: Waypoint) => MapWaypointLabelStyles) {
  }

  /** @inheritdoc */
  public getLabel<T extends Waypoint>(role: number, waypoint: T): MapCullableTextLabel {
    return this.createLabel(waypoint);
  }

  /**
   * Creates a new icon for a waypoint.
   * @param waypoint The waypoint for which to create an icon.
   * @returns a waypoint icon.
   */
  private createLabel<T extends Waypoint>(waypoint: T): MapCullableTextLabel {
    const { priority, alwaysShow, options } = this.styles(waypoint);

    let text = '';

    if (waypoint instanceof VNavWaypoint) {
      text = waypoint.uid === 'vnav-tod' ? 'TOD' : 'BOD';
    }

    return new MapCullableLocationTextLabel(text, priority, waypoint.location, alwaysShow, options);
  }
}