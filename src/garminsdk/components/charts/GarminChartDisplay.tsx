import {
  ArrayUtils, BitFlags, ChartArea, ChartPage, ChartsClient, ChartUrl, ChartView, ComponentProps, CssTransformBuilder,
  CssTransformSubject, CssTranslate3dTransform, CssTranslateTransform, DisplayComponent, FSComponent, GeoPoint,
  GeoReferencedChartArea, LambertConformalConicProjection, LatLonInterface, MappedSubject, MathUtils,
  MutableSubscribable, ReadonlyFloat64Array, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableUtils,
  Subscription, ToggleableClassNameRecord, Transform2D, Vec2Math, Vec3Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { GarminChartDisplayLayer } from './GarminChartDisplayLayer';
import {
  GarminChartDisplayProjection, GarminChartDisplayProjectionChangeFlags, GarminChartDisplayProjectionDisplaySelection
} from './GarminChartDisplayProjection';

/**
 * Data describing a chart selected to be displayed by a {@link GarminChartDisplay}.
 */
export type GarminChartDisplaySelection = {
  /** The chart page to display. */
  page: ChartPage;

  /**
   * A mapping from display modes to the chart URLs to use to render the chart page to display for each display mode.
   * If a URL is not defined for the display's active display mode, then the chart will not be displayed.
   */
  urls: Partial<Record<string, ChartUrl>>;

  /** The area of the chart page to display, or `null` to display the entire page. */
  area: ChartArea | null;

  /** The geo-referenced area of the displayed chart, or `null` if geo-referencing data are not available. */
  geoReferencedArea: GeoReferencedChartArea | null;
};

/**
 * Statuses for the display of the selected chart in a {@link GarminChartDisplay}.
 */
export enum GarminChartDisplayChartStatus {
  /** No chart is selected for display. */
  NoSelection = 'NoSelection',

  /** The selected chart cannot be displayed. */
  NoChart = 'NoChart',

  /** The selected chart is loading. */
  Loading = 'Loading',

  /** The selected chart is displayed. */
  Displayed = 'Displayed',
}

/**
 * Component props for {@link GarminChartDisplay}.
 */
export interface GarminChartDisplayProps extends ComponentProps {
  /** The size of the display, as `[width, height]` in pixels. */
  size: Subscribable<ReadonlyFloat64Array>;

  /** The selected chart to display, or `null` to not display any chart. */
  selectedChart: Subscribable<Readonly<GarminChartDisplaySelection> | null>;

  /** The display mode to use. The display mode affects the URL used to the display the selected chart. */
  displayMode: Subscribable<string>;

  /**
   * The maximum zoom level allowed by the display. A zoom level of zero scales the displayed chart such that the
   * displayed width of the chart equals the width of the display. Every unit increase in zoom level increases the
   * scaling applied to the displayed chart by a factor of 2. Defaults to 3.
   */
  maxZoomLevel?: number | Subscribable<number>;

  /**
   * The amount by which a chart is allowed to be temporarily panned past the normal panning boundaries, as
   * `[left, top, right, bottom]` in pixels. Defaults to `[0, 0, 0, 0]`.
   */
  panOverscroll?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * Whether to disable the creation of a Coherent compositing layer for the image element that renders the chart.
   * Defaults to `false`.
   */
  disableChartCompositingLayer?: boolean;

  /** A mutable subscribable to which to write the current status of the chart selected for display. */
  chartStatus?: MutableSubscribable<any, GarminChartDisplayChartStatus>;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A Garmin terminal (airport) chart display. The display renders up to one chart page or sub-area of a chart page at
 * a time. The displayed chart can be scaled, rotated, and panned (translated). Optional geo-referencing data is also
 * supported.
 * 
 * The display also renders its child nodes on top of the displayed chart. Any descendant components that implement the
 * {@link GarminChartDisplayLayer} interface (that do not descend from another descendant component of the display)
 * are attached to the display once the display is rendered and can listen to various callbacks. Please refer to the
 * interface documentation for more information on these callbacks.
 */
export class GarminChartDisplay extends DisplayComponent<GarminChartDisplayProps> {
  private childrenNode?: VNode;

  private readonly vec2Cache = ArrayUtils.create(5, () => Vec2Math.create());

  private readonly chartView = new ChartView();
  private isChartViewInit = false;
  private readonly requestedChartUrl = Subject.create<string | null>(null);

  private readonly chartStatus = MappedSubject.create(
    ([requestedUrl, liveView]): GarminChartDisplayChartStatus => {
      if (requestedUrl === null) {
        return GarminChartDisplayChartStatus.NoSelection;
      } else if (requestedUrl) {
        if (liveView.chartUrl === requestedUrl) {
          return GarminChartDisplayChartStatus.Displayed;
        } else {
          return GarminChartDisplayChartStatus.Loading;
        }
      } else {
        return GarminChartDisplayChartStatus.NoChart;
      }
    },
    this.requestedChartUrl,
    this.chartView.liveView
  );

  private readonly rootWidth = this.props.size.map(size => `${size[0]}px`);
  private readonly rootHeight = this.props.size.map(size => `${size[1]}px`);

  private isChartAreaValid = false;

  private areaLeft = 0;
  private areaTop = 0;
  private areaRight = 0;
  private areaBottom = 0;

  private canTransformChart = false;

  private minScale = 1;
  private fitWidthScale = 1;

  private minZoomLevel = 0;
  private readonly maxZoomLevel = SubscribableUtils.toSubscribable(this.props.maxZoomLevel ?? 3, true);

  private zoomLevel = 0;

  private rotation = 0;

  private readonly panOverscroll = SubscribableUtils.toSubscribable(this.props.panOverscroll ?? VecNMath.create(4), true);
  private readonly panBounds = VecNMath.create(4);
  private isOverscrollSnapbackInhibited = false;
  // The offset of the center of the displayed chart area from the center of the display, *before* the scaling and
  // rotation transformations have been applied.
  private panOffsetX = 0;
  private panOffsetY = 0;

  private readonly initialChartTransform = new Transform2D();
  private readonly dynamicChartTransform = new Transform2D();
  private readonly chartScaleRotationTransform = new Transform2D();
  private readonly inverseChartScaleRotationTransform = new Transform2D();

  private readonly totalChartTransform = new Transform2D();
  private readonly inverseTotalChartTransform = new Transform2D();

  private readonly windowWidth = Subject.create('0px');
  private readonly windowHeight = Subject.create('0px');

  private readonly imageDisplay = this.chartStatus.map(status => status === GarminChartDisplayChartStatus.Displayed ? '' : 'none');
  private readonly imageWidth = Subject.create('0px');
  private readonly imageHeight = Subject.create('0px');

  private readonly disableCompositingLayer = this.props.disableChartCompositingLayer ?? false;
  private readonly windowCssTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    this.disableCompositingLayer ? CssTransformBuilder.translate('px') : CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.matrix(),
  ));
  private readonly initialWindowCssTransform = this.windowCssTransform.transform.getChild(0);
  private readonly dynamicWindowCssTransform = this.windowCssTransform.transform.getChild(1);

  private readonly imageCssTransform = CssTransformSubject.create(CssTransformBuilder.translate('px'));

  private isGeoReferenced = false;
  private readonly projectionCenter = { lat: 0, lon: 0 };
  private readonly projectionAnchorXY = Vec2Math.create();
  private readonly projectionPreRotation = Vec3Math.create();
  private readonly projectionTranslation = Vec2Math.create();
  private readonly projection = new LambertConformalConicProjection().setReflectY(true);

  private needUpdateDisplayedChart = false;
  private needUpdateDisplayedUrl = false;
  private needUpdateInitialTransformation = false;
  private needResetDynamicTransformation = false;
  private continueAnimateOverscrollSnapback = false;
  private needUpdateDynamicTransformation = false;
  private needUpdateTotalTransformation = false;
  private needUpdateProjection = false;

  private needResolveChartCssTransform = false;

  private readonly displayProjectionDisplaySelection: GarminChartDisplayProjectionDisplaySelection = {
    page: null,
    area: null,
    url: null,
  };
  private readonly displayProjectionSize = Vec2Math.create();
  private readonly displayProjectionChartBounds = VecNMath.create(4);
  private displayProjectionScale = 1;
  private displayProjectionRotation = 0;
  private readonly displayProjectionPan = Vec2Math.create();
  private readonly displayProjectionGeoReferenceChartBounds = VecNMath.create(4);

  private readonly displayProjection: GarminChartDisplayProjection = {
    getDisplaySelection: () => this.displayProjectionDisplaySelection,

    isValid: () => this.canTransformChart,

    isGeoReferenced: () => this.isGeoReferenced,

    getDisplaySize: () => this.displayProjectionSize,

    getChartBounds: () => this.displayProjectionChartBounds,

    getChartScale: () => this.displayProjectionScale,

    getChartRotation: () => this.displayProjectionRotation,

    getChartPan: () => this.displayProjectionPan,

    convertChartToDisplay: (point, out) => this.convertChartToDisplay(point, out),

    convertDisplayToChart: (point, out) => this.convertDisplayToChart(point, out),

    getGeoReferenceChartBounds: () => this.displayProjectionGeoReferenceChartBounds,

    getGeoReferenceScaleFactor: () => this.projection.getScaleFactor(),

    getGeoReferenceRotation: () => this.projection.getPostRotation(),

    convertGeoToChart: (point, out) => this.convertGeoToChart(point, out),

    convertChartToGeo: (point, out) => this.convertChartToGeo(point, out),

    convertGeoToDisplay: (point, out) => this.convertGeoToDisplay(point, out),

    convertDisplayToGeo: (point, out) => this.convertDisplayToGeo(point, out),
  };
  private displayProjectionChangeFlags = 0;

  private lastUpdateTime: number | undefined;

  private readonly layers: GarminChartDisplayLayer[] = [];

  private readonly subscriptions: Subscription[] = [];

  private selectedChartSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.initChartView();

    this.subscriptions.push(
      this.props.size.sub(() => {
        this.needUpdateInitialTransformation = true;
      }, true),

      this.props.displayMode.sub(() => {
        this.needUpdateDisplayedUrl = true;
      }),

      this.maxZoomLevel.sub(() => {
        this.needUpdateDynamicTransformation = true;
      }, true),

      this.panOverscroll.sub(() => {
        this.needUpdateDynamicTransformation = true;
      }, true),

      this.chartStatus.sub(() => {
        this.needUpdateInitialTransformation = true;
      }, true),
    );

    this.attachLayers();

    if (this.props.chartStatus) {
      this.subscriptions.push(
        this.chartStatus.pipe(this.props.chartStatus)
      );
    }
  }

  /**
   * Initializes this display's chart view component. Once the chart view is initialized, this display will be able to
   * render chart images.
   */
  private async initChartView(): Promise<void> {
    await ChartsClient.initializeChartView(this.chartView);
    this.isChartViewInit = true;

    if (!this.chartView.isAlive) {
      return;
    }

    this.selectedChartSub = this.props.selectedChart.sub(() => {
      this.needUpdateDisplayedChart = true;
    }, true);
  }

  /**
   * Attaches this display's child layers.
   */
  private attachLayers(): void {
    if (!this.childrenNode) {
      return;
    }

    // Enumerate every top-level (i.e. not a descendant of another DisplayComponent) DisplayComponent that is a
    // descendant of this display and implements the GarminChartDisplayLayer interface.
    FSComponent.visitNodes(this.childrenNode, node => {
      if (node === this.childrenNode) {
        return false;
      }

      if (node.instance instanceof DisplayComponent) {
        if ((node.instance as any).isTerminalChartDisplayLayer === true) {
          this.layers.push(node.instance as GarminChartDisplayLayer);
        }
        return true;
      } else {
        return false;
      }
    });

    for (const layer of this.layers) {
      layer.onAttached(this.displayProjection);
    }
  }

  /**
   * Sets this display's chart zoom level. The zoom level will be clamped between the minimum and maximum allowed
   * values. The minimum value is the greatest zoom level at which the entire displayed chart area fits within the
   * display. The maximum value is set via this display's `maxZoomLevel` prop. If there is no displayed chart or if
   * this display's area (width multiplied by height) is zero, then this method does nothing. Any changes to this
   * display made by this method will not take effect until the next time the display is updated.
   * 
   * A zoom level of zero scales the displayed chart area such that the displayed width of the chart area equals the
   * width of the display. Every unit increase in zoom level increases the scaling applied to the displayed chart area
   * by a factor of 2.
   * @param zoom The zoom level to set.
   */
  public setChartZoom(zoom: number): void {
    if (!this.canTransformChart) {
      return;
    }

    const oldZoomLevel = this.zoomLevel;
    this.zoomLevel = MathUtils.clamp(zoom, this.minZoomLevel, this.maxZoomLevel.get());

    if (oldZoomLevel !== this.zoomLevel) {
      this.needUpdateDynamicTransformation = true;
    }
  }

  /**
   * Changes this display's chart zoom level by a given amount. The final zoom level will be clamped between the
   * minimum and maximum allowed values. The minimum value is the greatest zoom level at which the entire displayed
   * chart area fits within the display. The maximum value is set via this display's `maxZoomLevel` prop. If there is
   * no displayed chart or if this display's area (width multiplied by height) is zero, then this method does nothing.
   * Any changes to this display made by this method will not take effect until the next time the display is updated.
   * 
   * A zoom level of zero scales the displayed chart area such that the displayed width of the chart area equals the
   * width of the display. Every unit increase in zoom level increases the scaling applied to the displayed chart area
   * by a factor of 2.
   * @param delta The amount by which to change the zoom level.
   */
  public changeChartZoom(delta: number): void;
  /**
   * Changes this display's chart zoom level by a given amount while quantizing the final zoom level. The final zoom
   * level will be clamped between the minimum and maximum allowed values. The minimum value is the greatest zoom level
   * at which the entire displayed chart area fits within the display. The maximum value is set via this display's
   * `maxZoomLevel` prop. If there is no displayed chart or if this display's area (width multiplied by height) is
   * zero, then this method does nothing. Any changes to this display made by this method will not take effect until
   * the next time the display is updated.
   * 
   * A zoom level of zero scales the displayed chart area such that the displayed width of the chart area equals the
   * width of the display. Every unit increase in zoom level increases the scaling applied to the displayed chart area
   * by a factor of 2.
   * @param delta The amount by which to change the zoom level, interpreted as a multiple of `step`.
   * @param step The amount to which the final zoom level should be quantized. The final zoom level will be restricted
   * to be an integer multiple of this value unless it is clamped to the minimum or maximum allowed zoom level. If
   * changing the initial zoom level by `delta * step` results in a final zoom level that is not properly quantized,
   * then the final zoom level will be set to the integer multiple of `step` between the initial and final zoom levels
   * (inclusive) that is closest to the final zoom level.
   */
  public changeChartZoom(delta: number, step: number): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public changeChartZoom(delta: number, step?: number): void {
    let newValue: number;

    if (step === undefined) {
      newValue = this.zoomLevel + delta;
    } else {
      if (delta < 0) {
        newValue = MathUtils.ceil(this.zoomLevel, step) + delta * step;
      } else {
        newValue = MathUtils.floor(this.zoomLevel, step) + delta * step;
      }
    }

    this.setChartZoom(newValue);
  }

  /**
   * Sets this display's chart rotation angle. If there is no displayed chart or if this display's area (width
   * multiplied by height) is zero, then this method does nothing. Any changes to this display made by this method will
   * not take effect until the next time the display is updated.
   * 
   * A rotation angle of zero results in the chart being displayed "upright", with positive angles rotating the chart
   * clockwise.
   * @param rotation The rotation angle to set, in degrees.
   */
  public setChartRotation(rotation: number): void {
    if (!this.canTransformChart) {
      return;
    }

    const oldRotation = this.rotation;
    this.rotation = MathUtils.normalizeAngle(rotation * Avionics.Utils.DEG2RAD);

    if (oldRotation !== this.rotation) {
      this.needUpdateDynamicTransformation = true;
    }
  }

  /**
   * Changes this display's chart rotation angle. If there is no displayed chart or if this display's area (width
   * multiplied by height) is zero, then this method does nothing. Any changes to this display made by this method will
   * not take effect until the next time the display is updated.
   * 
   * A rotation angle of zero results in the chart being displayed "upright", with positive angles rotating the chart
   * clockwise.
   * @param delta The amount by which to change the rotation angle, in degrees.
   */
  public changeChartRotation(delta: number): void {
    this.setChartRotation(this.rotation * Avionics.Utils.RAD2DEG + delta);
  }

  /**
   * Resets this display's chart panning offset to zero along both the x and y axes. If there is no displayed chart or
   * if this display's area (width multiplied by height) is zero, then this method does nothing. Any changes to this
   * display made by this method will not take effect until the next time the display is updated.
   * 
   * The panning offset is the offset of the center of the displayed chart area from the center of the display, as
   * `[x, y]` in the chart's internal coordinate system. An offset of `[0, 0]` indicates the displayed chart area is
   * centered in the display window.
   */
  public resetChartPan(): void {
    if (!this.canTransformChart) {
      return;
    }

    if (this.panOffsetX !== 0) {
      this.panOffsetX = 0;
      this.needUpdateDynamicTransformation = true;
    }

    if (this.panOffsetY !== 0) {
      this.panOffsetY = 0;
      this.needUpdateDynamicTransformation = true;
    }
  }

  /**
   * Changes this display's chart panning offset. The amount by which to move, specified by the `dx` and `dy`
   * parameters, is interpreted in the display's coordinate system *after* rotation and scaling have been applied to
   * the chart. For example, a change in offset of `dx = 5, dy = -5` always moves the chart 5 pixels to the right and
   * 5 pixels up in the display, regardless of the display's zoom level or rotation values. If there is no displayed
   * chart or if this display's area (width multiplied by height) is zero, then this method does nothing. Any changes
   * to this display made by this method will not take effect until the next time the display is updated.
   * @param dx The amount to change the offset along the display's x axis, in pixels. This value will move the
   * displayed chart along the x axis of the *display*.
   * @param dy The amount to change the offset along the display's y axis, in pixels. This value will move the
   * displayed chart along the y axis of the *display*.
   * @param allowOverscroll Whether to allow the chart to be panned into the overscroll zone. Defaults to `false`.
   */
  public changeChartPan(dx: number, dy: number, allowOverscroll = false): void {
    if (!this.canTransformChart) {
      return;
    }

    if (dx === 0 && dy === 0) {
      return;
    }

    const [panX, panY] = this.chartScaleRotationTransform.apply(
      Vec2Math.set(this.panOffsetX, this.panOffsetY, this.vec2Cache[0]),
      this.vec2Cache[0]
    );

    let [minPanX, minPanY, maxPanX, maxPanY] = this.panBounds;

    if (allowOverscroll) {
      const overscroll = this.panOverscroll.get();
      minPanX -= overscroll[0];
      minPanY -= overscroll[1];
      maxPanX += overscroll[2];
      maxPanY += overscroll[3];
    }

    dx = MathUtils.clamp(panX + dx, Math.min(minPanX, panX), Math.max(maxPanX, panX)) - panX;
    dy = MathUtils.clamp(panY + dy, Math.min(minPanY, panY), Math.max(maxPanY, panY)) - panY;

    const offsetDelta = this.inverseChartScaleRotationTransform.apply(
      Vec2Math.set(dx, dy, this.vec2Cache[0]),
      this.vec2Cache[0]
    );

    this.panOffsetX += offsetDelta[0];
    this.panOffsetY += offsetDelta[1];

    this.needUpdateDynamicTransformation = true;
  }

  /**
   * Sets whether to inhibit automatic overscroll snap-back. When the chart is panned into the overscroll zone,
   * overscroll snap-back gradually moves the chart out of the overscroll zone and back into the non-overscroll panning
   * bounds every time `update()` is called. Inhibiting snap-back prevents this from happening and allows the chart to
   * stay panned within the overscroll zone indefinitely.
   * @param inhibit Whether to inhibit automatic overscroll snap-back.
   */
  public setOverscrollSnapbackInhibit(inhibit: boolean): void {
    if (this.isOverscrollSnapbackInhibited === inhibit) {
      return;
    }

    this.isOverscrollSnapbackInhibited = inhibit;

    if (!inhibit) {
      this.continueAnimateOverscrollSnapback = true;
    }
  }

  /**
   * Resets this display's chart zoom level, chart rotation angle, and panning offset along the x axis to zero (the
   * offset along the y axis will remain unchanged). This has the effect of rotating the displayed chart to be
   * "upright", centering the chart area in the display along the x axis (horizontally), and scaling the chart such
   * that the width of the displayed chart area exactly fits in the width of the display. If there is no displayed
   * chart or if this display's area (width multiplied by height) is zero, then this method does nothing. Any changes
   * to this display made by this method will not take effect until the next time the display is updated.
   */
  public setFitWidth(): void {
    if (!this.canTransformChart) {
      return;
    }

    this.zoomLevel = 0;
    this.rotation = 0;
    this.panOffsetX = 0;

    this.needUpdateDynamicTransformation = true;
  }

  /**
   * Updates this display.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public update(time: number): void {
    const dt = this.lastUpdateTime === undefined ? 0 : Math.max(time - this.lastUpdateTime, 0);

    if (this.needUpdateDisplayedChart && this.isChartViewInit) {
      this.updateDisplayedChart();
      this.needUpdateDisplayedChart = false;
    }

    if (this.needUpdateDisplayedUrl && this.isChartViewInit) {
      this.updateDisplayedUrl();
      this.needUpdateDisplayedUrl = false;
    }

    if (this.needUpdateInitialTransformation) {
      this.updateInitialTransformation();
      this.needUpdateInitialTransformation = false;
    }

    if (this.needResetDynamicTransformation && this.canTransformChart) {
      this.resetDynamicTransformation();
      this.needResetDynamicTransformation = false;
    }

    if (this.needUpdateDynamicTransformation || this.continueAnimateOverscrollSnapback) {
      this.updateDynamicTransformation(dt);
      this.needUpdateDynamicTransformation = false;
    }

    if (this.needUpdateTotalTransformation) {
      this.updateTotalTransformation();
      this.needUpdateTotalTransformation = false;
    }

    if (this.needResolveChartCssTransform) {
      this.windowCssTransform.resolve();
      this.needResolveChartCssTransform = false;
    }

    if (this.needUpdateProjection) {
      this.updateProjection();
      this.needUpdateProjection = false;
    }

    this.updateLayers(time);

    this.displayProjectionChangeFlags = 0;
    this.lastUpdateTime = time;
  }

  /**
   * Updates the chart area rendered by this display.
   */
  private updateDisplayedChart(): void {
    const selection = this.props.selectedChart.get();

    // Reset dynamic transformation parameters when changing the selected chart.
    this.needResetDynamicTransformation = true;

    let page: ChartPage | null;
    let area: ChartArea | null;

    if (selection) {
      page = selection.page;
      area = selection.area;

      const nativeChartWidth = selection.page.width;
      const nativeChartHeight = selection.page.height;

      if (selection.area) {
        this.areaLeft = selection.area.chartRectangle.upperLeft[0];
        this.areaTop = selection.area.chartRectangle.upperLeft[1];
        this.areaRight = selection.area.chartRectangle.lowerRight[0];
        this.areaBottom = selection.area.chartRectangle.lowerRight[1];
      } else {
        this.areaLeft = 0;
        this.areaTop = 0;
        this.areaRight = nativeChartWidth;
        this.areaBottom = nativeChartHeight;
      }

      this.windowWidth.set(`${Math.max(this.areaRight - this.areaLeft, 0)}px`);
      this.windowHeight.set(`${Math.max(this.areaBottom - this.areaTop, 0)}px`);

      this.imageWidth.set(`${nativeChartWidth}px`);
      this.imageHeight.set(`${nativeChartHeight}px`);

      this.imageCssTransform.transform.set(-this.areaLeft, -this.areaTop);
      this.imageCssTransform.resolve();

      this.isChartAreaValid = this.areaRight > this.areaLeft && this.areaBottom > this.areaTop;
    } else {
      page = null;
      area = null;

      this.areaLeft = 0;
      this.areaTop = 0;
      this.areaRight = 0;
      this.areaBottom = 0;

      this.imageWidth.set('0px');
      this.imageHeight.set('0px');

      this.isChartAreaValid = false;
    }

    this.displayProjectionDisplaySelection.page = page;
    this.displayProjectionDisplaySelection.area = area;
    this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.DisplaySelection;

    if (
      this.areaLeft !== this.displayProjectionChartBounds[0]
      || this.areaTop !== this.displayProjectionChartBounds[1]
      || this.areaRight !== this.displayProjectionChartBounds[2]
      || this.areaBottom !== this.displayProjectionChartBounds[3]
    ) {
      this.displayProjectionChartBounds[0] = this.areaLeft;
      this.displayProjectionChartBounds[1] = this.areaTop;
      this.displayProjectionChartBounds[2] = this.areaRight;
      this.displayProjectionChartBounds[3] = this.areaBottom;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.ChartBounds;
    }

    this.needUpdateDisplayedUrl = true;
    this.needUpdateInitialTransformation = true;
    this.needUpdateProjection = true;
  }

  /**
   * Updates the URL used to render the displayed chart.
   */
  private updateDisplayedUrl(): void {
    const selectedChart = this.props.selectedChart.get();
    const url = selectedChart?.urls[this.props.displayMode.get()] ?? null;
    const requestedChartUrl = url
      ? url.url
      : selectedChart ? '' : null;

    // chartView.showChartImage() ignores invalid URLs, so only call the method when we have a valid URL to set. When
    // the requested URL is not valid, the image element that displays the chart will be hidden, so we don't have to
    // worry about displaying the incorrect image.
    if (requestedChartUrl) {
      this.chartView.showChartImage(requestedChartUrl);
    }

    this.requestedChartUrl.set(requestedChartUrl);

    if (url?.url !== this.displayProjectionDisplaySelection.url?.url) {
      this.displayProjectionDisplaySelection.url = url;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.DisplaySelection;
    }
  }

  /**
   * Updates the initial (static) transformation applied to the displayed chart. The initial transformation
   * centers the displayed chart area in the display and scales the chart such that the chart area's width equals
   * the display's width.
   */
  private updateInitialTransformation(): void {
    const displaySize = this.props.size.get();

    this.displayProjectionSize[0] = Math.max(displaySize[0], 0);
    this.displayProjectionSize[1] = Math.max(displaySize[1], 0);

    const canTransformChart = this.isChartAreaValid
      && this.chartStatus.get() === GarminChartDisplayChartStatus.Displayed
      && displaySize[0] > 0
      && displaySize[1] > 0;

    if (canTransformChart !== this.canTransformChart) {
      this.canTransformChart = canTransformChart;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.IsValid;
    }

    if (this.canTransformChart) {
      const displayCenterX = 0.5 * displaySize[0];
      const displayCenterY = 0.5 * displaySize[1];
      const areaCenterX = 0.5 * (this.areaLeft + this.areaRight);
      const areaCenterY = 0.5 * (this.areaTop + this.areaBottom);

      const initialTranslateX = displayCenterX - areaCenterX + this.areaLeft;
      const initialTranslateY = displayCenterY - areaCenterY + this.areaTop;

      this.initialChartTransform.toTranslation(initialTranslateX, initialTranslateY);
      if (this.disableCompositingLayer) {
        (this.initialWindowCssTransform as CssTranslateTransform).set(initialTranslateX, initialTranslateY, 0.1, 0.1);
      } else {
        (this.initialWindowCssTransform as CssTranslate3dTransform).set(initialTranslateX, initialTranslateY, 0, 0.1, 0.1);
      }

      const nativeAreaWidthRatio = displaySize[0] / (this.areaRight - this.areaLeft);
      const nativeAreaHeightRatio = displaySize[1] / (this.areaBottom - this.areaTop);

      // The minimum scaling factor is the largest scaling factor that fits the entire chart in the display when the
      // chart is centered.
      this.minScale = Math.min(nativeAreaWidthRatio, nativeAreaHeightRatio);

      // The fit-width scaling factor is the scaling factor where the width of the chart equals the width of the
      // display.
      this.fitWidthScale = nativeAreaWidthRatio;

      // Each zoom level is 2x scale, with zoom level 0 defined as the zoom level at which the scaling factor
      // equals the fit-width scaling factor.
      this.minZoomLevel = Math.log(this.minScale / this.fitWidthScale) / Math.LN2;
    } else {
      this.initialChartTransform.toIdentity();
      if (this.disableCompositingLayer) {
        (this.initialWindowCssTransform as CssTranslateTransform).set(0, 0);
      } else {
        (this.initialWindowCssTransform as CssTranslate3dTransform).set(0, 0, 0);
      }

      this.minScale = 1;
      this.fitWidthScale = 1;
      this.minZoomLevel = 0;
    }

    this.needUpdateDynamicTransformation = true;
    this.needUpdateTotalTransformation = true;
    this.needResolveChartCssTransform = true;
  }

  /**
   * Resets the parameters of the dynamic transformation applied to the displayed chart. The zoom level is set to the
   * minimum allowed zoom level. The rotation angle is set to zero. The panning offset is set to zero along both axes.
   */
  private resetDynamicTransformation(): void {
    this.zoomLevel = this.minZoomLevel;
    this.rotation = 0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
  }

  /**
   * Updates the dynamic transformation applied to the displayed chart. The dynamic transformation applies the scaling
   * from zoom level, the chart rotation, and the translation from panning offset.
   * @param dt The elapsed time since the last update, in milliseconds.
   */
  private updateDynamicTransformation(dt: number): void {
    let scale: number;

    this.continueAnimateOverscrollSnapback = false;

    if (this.canTransformChart) {
      this.zoomLevel = MathUtils.clamp(this.zoomLevel, this.minZoomLevel, this.maxZoomLevel.get());
      scale = Math.pow(2, this.zoomLevel) * this.fitWidthScale;

      this.dynamicChartTransform
        .toScale(scale, scale)
        .addRotation(this.rotation);

      this.chartScaleRotationTransform.set(this.dynamicChartTransform);

      // Compute panning translation after applying scaling and rotation.

      let [panX, panY] = this.chartScaleRotationTransform.apply(
        Vec2Math.set(this.panOffsetX, this.panOffsetY, this.vec2Cache[0]),
        this.vec2Cache[0]
      );

      // Compute display-aligned bounding box (before translation).

      const displaySize = this.props.size.get();
      const displayCenter = Vec2Math.set(0.5 * displaySize[0], 0.5 * displaySize[1], this.vec2Cache[0]);

      const halfWidth = 0.5 * (this.areaRight - this.areaLeft);
      const halfHeight = 0.5 * (this.areaBottom - this.areaTop);

      const topLeft = Vec2Math.set(-halfWidth, -halfHeight, this.vec2Cache[1]);
      const topRight = Vec2Math.set(halfWidth, -halfHeight, this.vec2Cache[2]);
      const bottomRight = Vec2Math.set(halfWidth, halfHeight, this.vec2Cache[3]);
      const bottomLeft = Vec2Math.set(-halfWidth, halfHeight, this.vec2Cache[4]);

      Vec2Math.add(this.chartScaleRotationTransform.apply(topLeft, topLeft), displayCenter, topLeft);
      Vec2Math.add(this.chartScaleRotationTransform.apply(topRight, topRight), displayCenter, topRight);
      Vec2Math.add(this.chartScaleRotationTransform.apply(bottomRight, bottomRight), displayCenter, bottomRight);
      Vec2Math.add(this.chartScaleRotationTransform.apply(bottomLeft, bottomLeft), displayCenter, bottomLeft);

      const bbLeft = Math.min(topLeft[0], topRight[0], bottomRight[0], bottomLeft[0]);
      const bbTop = Math.min(topLeft[1], topRight[1], bottomRight[1], bottomLeft[1]);
      const bbRight = Math.max(topLeft[0], topRight[0], bottomRight[0], bottomLeft[0]);
      const bbBottom = Math.max(topLeft[1], topRight[1], bottomRight[1], bottomLeft[1]);

      // Clamp post-scaling/rotation panning translation to bounds.

      const overscroll = this.panOverscroll.get();

      const overscrollLeft = Math.max(overscroll[0], 0);
      const overscrollTop = Math.max(overscroll[1], 0);
      const overscrollRight = Math.max(overscroll[2], 0);
      const overscrollBottom = Math.max(overscroll[3], 0);

      const minPanX = Math.min(-bbLeft, displaySize[0] - bbRight);
      const minPanY = Math.min(-bbTop, displaySize[1] - bbBottom);
      const maxPanX = Math.max(displaySize[0] - bbRight, -bbLeft);
      const maxPanY = Math.max(displaySize[1] - bbBottom, -bbTop);

      VecNMath.set(
        this.panBounds,
        minPanX,
        minPanY,
        maxPanX,
        maxPanY
      );

      panX = MathUtils.clamp(panX, minPanX - overscrollLeft, maxPanX + overscrollRight);
      panY = MathUtils.clamp(panY, minPanY - overscrollTop, maxPanY + overscrollBottom);

      // If overscroll snap-back is not inhibited, then we need to snap the panning back to the bounds *without*
      // overscroll if panning is in the overscroll zone.
      if (!this.isOverscrollSnapbackInhibited) {
        // If any parameter that affects the panning boundaries changed, then immediately snap the panning all the way
        // back to the non-overscroll bounds. Otherwise, animate the snap-back instead. This ensures that we only play
        // the snap-back animation in response to when the chart is *panned* into the overscroll zone.
        if (
          this.rotation !== this.displayProjectionRotation
          || scale !== this.displayProjectionScale
          || BitFlags.isAny(
            this.displayProjectionChangeFlags,
            GarminChartDisplayProjectionChangeFlags.DisplaySize | GarminChartDisplayProjectionChangeFlags.ChartBounds
          )
        ) {
          panX = MathUtils.clamp(panX, minPanX, maxPanX);
          panY = MathUtils.clamp(panY, minPanY, maxPanY);
        } else {
          // Animate the snap-back. The panning translation will be driven back toward the bounds *without*
          // overscroll via an exponential curve.

          const factor = Math.exp(-dt * 0.01 / Math.LN2);

          if (panX < minPanX) {
            const overscrolled = panX - minPanX;
            panX = overscrolled < -1 ? minPanX + factor * overscrolled : minPanX;
          } else if (panX > maxPanX) {
            const overscrolled = panX - maxPanX;
            panX = overscrolled > 1 ? maxPanX + factor * overscrolled : maxPanX;
          }
          if (panY < minPanY) {
            const overscrolled = panY - minPanY;
            panY = overscrolled < -1 ? minPanY + factor * overscrolled : minPanY;
          } else if (panY > maxPanY) {
            const overscrolled = panY - maxPanY;
            panY = overscrolled > 1 ? maxPanY + factor * overscrolled : maxPanY;
          }

          // If we are still overscrolled, then set a flag to ensure that we continue to animate the snap-back during the
          // next update.
          this.continueAnimateOverscrollSnapback
            = panX < minPanX
            || panX > maxPanX
            || panY < minPanY
            || panY > maxPanY;
        }
      }

      // Convert post-scaling/rotation panning translation back to pre-scaling/rotation translation ("panning offset").

      this.inverseChartScaleRotationTransform.set(this.chartScaleRotationTransform).invert();

      const panOffset = this.inverseChartScaleRotationTransform.apply(
        Vec2Math.set(panX, panY, this.vec2Cache[0]),
        this.vec2Cache[0]
      );

      this.panOffsetX = panOffset[0];
      this.panOffsetY = panOffset[1];

      // Finalize the full dynamic translation and apply it to the CSS transform.

      this.dynamicChartTransform.addTranslation(this.panOffsetX, this.panOffsetY, 'before');

      const [scaleX, skewX, translateX, skewY, scaleY, translateY] = this.dynamicChartTransform.getParameters();
      this.dynamicWindowCssTransform.set(scaleX, skewY, skewX, scaleY, translateX, translateY);
    } else {
      this.zoomLevel = 0;
      this.panOffsetX = 0;
      this.panOffsetY = 0;
      this.rotation = 0;

      scale = 1;

      this.panBounds.fill(0);

      this.dynamicChartTransform.toIdentity();
      this.chartScaleRotationTransform.toIdentity();
      this.inverseChartScaleRotationTransform.toIdentity();
      this.dynamicWindowCssTransform.set(1, 0, 0, 1, 0, 0);
    }

    if (this.panOffsetX !== this.displayProjectionPan[0] || this.panOffsetY !== this.displayProjectionPan[1]) {
      this.displayProjectionPan[0] = this.panOffsetX;
      this.displayProjectionPan[1] = this.panOffsetY;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.ChartPan;
    }

    if (this.rotation !== this.displayProjectionRotation) {
      this.displayProjectionRotation = this.rotation;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.ChartRotation;
    }

    if (scale !== this.displayProjectionScale) {
      this.displayProjectionScale = scale;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.ChartScale;
    }

    this.needUpdateTotalTransformation = true;
    this.needResolveChartCssTransform = true;
  }

  /**
   * Updates the representation of the total transformation applied to the displayed chart. The total transformation
   * includes both the initial (static) transformation and the dynamic transformation.
   */
  private updateTotalTransformation(): void {
    if (this.canTransformChart) {
      const displaySize = this.props.size.get();
      const areaCenterX = 0.5 * (this.areaLeft + this.areaRight);
      const areaCenterY = 0.5 * (this.areaTop + this.areaBottom);
      const scale = Math.pow(2, this.zoomLevel) * this.fitWidthScale;

      this.totalChartTransform
        .toTranslation(-areaCenterX + this.panOffsetX, -areaCenterY + this.panOffsetY)
        .addScale(scale, scale)
        .addRotation(this.rotation)
        .addTranslation(0.5 * displaySize[0], 0.5 * displaySize[1]);

      this.inverseTotalChartTransform.set(this.totalChartTransform).invert();
    } else {
      this.totalChartTransform.toIdentity();
      this.inverseTotalChartTransform.toIdentity();
    }
  }

  /**
   * Updates the Lambert conformal conic projection representing the displayed chart's geo-referencing data.
   */
  private updateProjection(): void {
    const selectedChart = this.props.selectedChart.get();

    let isGeoReferenced: boolean;

    let geoReferenceLeft = 0;
    let geoReferenceTop = 0;
    let geoReferenceRight = 0;
    let geoReferenceBottom = 0;

    const oldScaleFactor = this.projection.getScaleFactor();
    const [oldStandardParallel1, oldStandardParallel2] = this.projection.getStandardParallels();
    const oldCentralMeridian = this.projection.getPreRotation()[0];
    const { lat: oldCenterLat, lon: oldCenterLon } = this.projection.getCenter();
    const oldPostRotation = this.projection.getPostRotation();
    const [oldTranslationX, oldTranslationY] = this.projection.getTranslation();

    if (selectedChart && selectedChart.geoReferencedArea) {
      const geoReferencedArea = selectedChart.geoReferencedArea;

      const topLeftLatLon = geoReferencedArea.worldRectangle.upperLeft;
      const topLeftXY = geoReferencedArea.chartRectangle.upperLeft;

      const bottomRightLatLon = geoReferencedArea.worldRectangle.lowerRight;
      const bottomRightXY = geoReferencedArea.chartRectangle.lowerRight;

      geoReferenceLeft = Math.max(topLeftXY[0], this.areaLeft);
      geoReferenceTop = Math.max(topLeftXY[1], this.areaTop);
      geoReferenceRight = Math.min(bottomRightXY[0], this.areaRight);
      geoReferenceBottom = Math.min(bottomRightXY[1], this.areaBottom);

      // Pre-rotate the central meridian to 0 deg longitude.
      this.projectionPreRotation[0] = -geoReferencedArea.projection.centralMeridian * Avionics.Utils.DEG2RAD;

      // Project the top-left corner of the area to (0, 0). Note that this is *before* post-projection translation
      // is applied.
      this.projectionCenter.lat = topLeftLatLon[1];
      this.projectionCenter.lon = topLeftLatLon[0];

      // Reset the post-projection translation so that the top-left corner is projected to (0, 0) *after* the
      // post-projection translation is applied.
      this.projectionTranslation.fill(0);

      this.projection
        .setScaleFactor(1)
        .setStandardParallels(geoReferencedArea.projection.standardParallel1, geoReferencedArea.projection.standardParallel2)
        .setPreRotation(this.projectionPreRotation)
        .setCenter(this.projectionCenter)
        .setPostRotation(-geoReferencedArea.worldRectangle.orientation * Avionics.Utils.DEG2RAD)
        .setTranslation(this.projectionTranslation);

      this.projectionAnchorXY.set(bottomRightLatLon);
      const bottomRightProjected = this.projection.project(this.projectionAnchorXY, this.projectionAnchorXY);

      // Solve for the scale factor by comparing the projected distance between top-left and bottom-right with scale
      // factor of 1 to the desired projected distance (from the georeferenced area specs). Remember that the top-left
      // corner is guaranteed to be projected to (0, 0).
      const scaleFactor = Math.hypot(bottomRightXY[0] - topLeftXY[0], bottomRightXY[1] - topLeftXY[1])
        / Math.hypot(bottomRightProjected[0], bottomRightProjected[1]);

      // Add post-projection translation so that the projected coordinates match the coordinates of the chart image,
      // with (0, 0) being the top-left of the *entire* chart area.
      this.projectionTranslation.set(topLeftXY);

      this.projection
        .setScaleFactor(scaleFactor)
        .setTranslation(this.projectionTranslation);

      isGeoReferenced = isFinite(scaleFactor);
    } else {
      isGeoReferenced = false;
    }

    if (!isGeoReferenced) {
      geoReferenceLeft = 0;
      geoReferenceTop = 0;
      geoReferenceRight = 0;
      geoReferenceBottom = 0;

      this.projectionPreRotation[0] = 0;

      this.projectionCenter.lat = 0;
      this.projectionCenter.lon = 0;

      this.projectionTranslation[0] = 0;
      this.projectionTranslation[1] = 0;

      this.projection
        .setScaleFactor(1)
        .setStandardParallels(0)
        .setPreRotation(this.projectionPreRotation)
        .setCenter(this.projectionCenter)
        .setPostRotation(0)
        .setTranslation(this.projectionTranslation);
    }

    if (isGeoReferenced !== this.isGeoReferenced) {
      this.isGeoReferenced = isGeoReferenced;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.IsGeoReferenced;
    }

    if (
      geoReferenceLeft !== this.displayProjectionGeoReferenceChartBounds[0]
      || geoReferenceTop !== this.displayProjectionGeoReferenceChartBounds[1]
      || geoReferenceRight !== this.displayProjectionGeoReferenceChartBounds[2]
      || geoReferenceBottom !== this.displayProjectionGeoReferenceChartBounds[3]
    ) {
      this.displayProjectionGeoReferenceChartBounds[0] = geoReferenceLeft;
      this.displayProjectionGeoReferenceChartBounds[1] = geoReferenceTop;
      this.displayProjectionGeoReferenceChartBounds[2] = geoReferenceRight;
      this.displayProjectionGeoReferenceChartBounds[3] = geoReferenceBottom;
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.GeoReferenceBounds;
    }

    if (
      oldScaleFactor !== this.projection.getScaleFactor()
      || oldStandardParallel1 !== this.projection.getStandardParallels()[0]
      || oldStandardParallel2 !== this.projection.getStandardParallels()[1]
      || oldCentralMeridian !== this.projection.getPreRotation()[0]
      || oldCenterLat !== this.projection.getCenter().lat
      || oldCenterLon !== this.projection.getCenter().lon
      || oldPostRotation !== this.projection.getPostRotation()
      || oldTranslationX !== this.projection.getTranslation()[0]
      || oldTranslationY !== this.projection.getTranslation()[1]
    ) {
      this.displayProjectionChangeFlags |= GarminChartDisplayProjectionChangeFlags.GeoReferenceProjection;
    }
  }

  /**
   * Updates this display's child layers.
   * @param time The real (operating system) time, as a Javascript timestamp.
   */
  private updateLayers(time: number): void {
    if (this.displayProjectionChangeFlags !== 0) {
      for (let i = 0; i < this.layers.length; i++) {
        this.layers[i].onProjectionChanged(this.displayProjection, this.displayProjectionChangeFlags);
      }
    }

    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].onUpdate(time, this.displayProjection);
    }
  }

  /**
   * Converts a point defined in the displayed chart's internal coordinate system to the pixel coordinates in the
   * display window to which the original point is projected. If there is no displayed chart or if the area of the
   * display window (width multiplied by height) is zero, then this method returns `[NaN, NaN]`.
   * @param point The point to convert, as `[x, y]` in the displayed chart's internal coordinate system.
   * @param out The array to which to write the result.
   * @returns The pixel coordinates in the display window, as `[x, y]`, to which the specified point in the displayed
   * chart's internal coordinate system is projected.
   */
  private convertChartToDisplay(point: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    if (this.canTransformChart) {
      return this.totalChartTransform.apply(point, out);
    } else {
      out[0] = NaN;
      out[1] = NaN;
      return out;
    }
  }

  /**
   * Converts a point in the display window to a set of coordinates in the displayed chart's internal coordinate system
   * from which the original point is projected. If there is no displayed chart or if the area of the display window
   * (width multiplied by height) is zero, then this method returns `[NaN, NaN]`.
   * @param point The point to convert, as `[x, y]` in pixels.
   * @param out The array to which to write the result.
   * @returns The coordinates, as `[x, y]` in the displayed chart's internal coordinate system, that is projected to
   * the specified point in the display window.
   */
  private convertDisplayToChart(point: ReadonlyFloat64Array, out: Float64Array): Float64Array {
    if (this.canTransformChart) {
      return this.inverseTotalChartTransform.apply(point, out);
    } else {
      out[0] = NaN;
      out[1] = NaN;
      return out;
    }
  }

  /**
   * Checks whether a point is within the bounds of the displayed chart's geo-referenced area.
   * @param point The point to check, as `[x, y]` in the displayed chart's internal coordinate system.
   * @returns Whether the specified point is within the bounds of the displayed chart's geo-referenced area.
   */
  private isInGeoReferenceChartBounds(point: ReadonlyFloat64Array): boolean {
    return point[0] >= this.displayProjectionGeoReferenceChartBounds[0]
      && point[1] >= this.displayProjectionGeoReferenceChartBounds[1]
      && point[0] <= this.displayProjectionGeoReferenceChartBounds[2]
      && point[1] <= this.displayProjectionGeoReferenceChartBounds[3];
  }

  /**
   * Converts a set of geographic coordinates in the geo-referenced area of the displayed chart to the corresponding
   * coordinates in the chart's internal coordinate system, as `[x, y]`. If there are no geo-referencing data available
   * or the geographic coordinates fall outside the geo-referenced area, then this method returns `[NaN, NaN]`.
   * @param point The geographic coordinates to convert, as either `[lon, lat]` in degrees or a `LatLonInterface`.
   * @param out The array to which to write the results.
   * @returns The set of coordinates in the chart's internal coordinate system, as `[x, y]`, corresponding to the
   * specified geographical coordinates.
   */
  private convertGeoToChart(point: ReadonlyFloat64Array | LatLonInterface, out: Float64Array): Float64Array {
    if (this.isGeoReferenced) {
      this.projection.project(point, out);
      if (this.isInGeoReferenceChartBounds(out)) {
        return out;
      }
    }

    out[0] = NaN;
    out[1] = NaN;
    return out;
  }

  /**
   * Converts a set of coordinates in the displayed chart's internal coordinate system within the geo-referenced area
   * to the corresponding geographic coordinates. If there are no geo-referencing data available or the coordinates
   * fall outside the geo-referenced area, then this method returns `NaN` for both latitude and longitude.
   * @param point The point to convert, as `[x, y]` in the displayed chart's internal coordinate system.
   * @param out The object to which to write the results. If an array is supplied, then the coordinates are returned as
   * `[lon, lat]` in degrees.
   * @returns The geographic coordinates corresponding to the specified coordinates in the displayed chart's internal
   * coordinate system.
   */
  private convertChartToGeo<T extends Float64Array | GeoPoint>(point: ReadonlyFloat64Array, out: T): T {
    if (
      this.isGeoReferenced
      && this.isInGeoReferenceChartBounds(point)
    ) {
      return this.projection.invert(point, out);
    } else {
      if (out instanceof Float64Array) {
        out[0] = NaN;
        out[1] = NaN;
      } else {
        out.set(NaN, NaN);
      }
      return out;
    }
  }

  /**
   * Converts a set of geographic coordinates in the geo-referenced area of the displayed chart to the corresponding
   * coordinates in the display window, as `[x, y]` in pixels. If there is no displayed chart, or if the area of the
   * display window (width multiplied by height) is zero, or there are no geo-referencing data available, or the
   * geographic coordinates fall outside the geo-referenced area, then this method returns `[NaN, NaN]`.
   * @param point The geographic coordinates to convert, as either `[lon, lat]` in degrees or a `LatLonInterface`.
   * @param out The array to which to write the results.
   * @returns The set of coordinates in the display window, as `[x, y]` in pixels, corresponding to the specified
   * geographical coordinates.
   */
  private convertGeoToDisplay(point: ReadonlyFloat64Array | LatLonInterface, out: Float64Array): Float64Array {
    if (this.isGeoReferenced) {
      this.projection.project(point, out);
      if (this.isInGeoReferenceChartBounds(out)) {
        return this.totalChartTransform.apply(out, out);
      }
    }

    out[0] = NaN;
    out[1] = NaN;
    return out;
  }

  /**
   * Converts a set of coordinates in the display window within the geo-referenced area to the corresponding geographic
   * coordinates. If there is no displayed chart, or if the area of the display window (width multiplied by height) is
   * zero, or if there are no geo-referencing data available, or the coordinates fall outside the geo-referenced area,
   * then this method returns `NaN` for both latitude and longitude.
   * @param point The point to convert, as `[x, y]` in pixels.
   * @param out The object to which to write the results. If an array is supplied, then the coordinates are returned as
   * `[lon, lat]` in degrees.
   * @returns The geographic coordinates corresponding to the specified coordinates in the display window.
   */
  private convertDisplayToGeo<T extends Float64Array | GeoPoint>(point: ReadonlyFloat64Array, out: T): T {
    if (this.isGeoReferenced) {
      const projectedChart = this.inverseTotalChartTransform.apply(point, this.vec2Cache[0]);
      if (this.isInGeoReferenceChartBounds(projectedChart)) {
        return this.projection.invert(projectedChart, out);
      }
    }

    if (out instanceof Float64Array) {
      out[0] = NaN;
      out[1] = NaN;
    } else {
      out.set(NaN, NaN);
    }
    return out;
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('terminal-chart-display');

      const subs = FSComponent.bindCssClassSet(cssClass, this.props.class, ['terminal-chart-display']);
      if (Array.isArray(subs)) {
        this.subscriptions.push(...subs);
      } else {
        this.subscriptions.push(subs);
      }
    } else {
      cssClass = 'terminal-chart-display';

      if (this.props.class) {
        cssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, classToFilter => classToFilter !== 'terminal-chart-display')
            .join(' ');
      }
    }

    return (
      <div
        class={cssClass}
        style={{
          'width': this.rootWidth,
          'height': this.rootHeight,
          'overflow': 'hidden',
        }}
      >
        <div
          class='terminal-chart-display-img-window'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'width': this.windowWidth,
            'height': this.windowHeight,
            'transform': this.windowCssTransform,
            'overflow': 'hidden',
          }}
        >
          <img
            src={this.chartView.liveViewName}
            class='terminal-chart-display-img'
            style={{
              'display': this.imageDisplay,
              'position': 'absolute',
              'left': '0px',
              'top': '0px',
              'width': this.imageWidth,
              'height': this.imageHeight,
              'transform': this.imageCssTransform,
            }}
          />
        </div>
        {this.childrenNode = <>{this.props.children}</>}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.childrenNode && FSComponent.shallowDestroy(this.childrenNode);

    this.rootWidth.destroy();
    this.rootHeight.destroy();

    this.selectedChartSub?.destroy();

    this.chartView.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
