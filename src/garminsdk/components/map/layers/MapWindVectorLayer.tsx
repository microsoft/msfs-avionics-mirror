import {
  BitFlags, CssTransformBuilder, CssTransformSubject, FSComponent, MapLayer, MapLayerProps, MapProjection, MapProjectionChangeType,
  MappedSubject, NumberFormatter, NumberUnitSubject, SetSubject, Subject, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapWindVectorModule } from '../modules/MapWindVectorModule';

/**
 * Modules required for {@link MapWindVectorLayer}.
 */
export interface MapWindVectorLayerModules {
  /** Wind vector module. */
  [GarminMapKeys.WindVector]: MapWindVectorModule;
}

/**
 * Component props for {@link MapWindVectorLayer}.
 */
export type MapWindVectorLayerProps = MapLayerProps<MapWindVectorLayerModules>

/**
 * A map layer which displays a readout of wind speed and an arrow depicting wind direction.
 */
export class MapWindVectorLayer extends MapLayer<MapWindVectorLayerProps> {
  private static readonly SHOW_ARROW_WIND_SPEED_THRESHOLD = 1; // knots
  private static readonly SHOW_ARROW_WIND_SPEED_HYSTERESIS = 0.5; // knots

  private static readonly FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly windVectorModule = this.props.model.getModule(GarminMapKeys.WindVector);

  private readonly rootDisplay = Subject.create('');

  private readonly arrowDisplay = Subject.create('');
  private readonly arrowTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly speedValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private readonly show = MappedSubject.create(
    ([show, isDataFailed]) => show && !isDataFailed,
    this.windVectorModule.show,
    this.windVectorModule.isDataFailed
  ).pause();

  private isAttached = false;
  private isAwake = true;
  private isPaused = true;

  private needUpdateArrow = false;

  private readonly pauseableSubs: Subscription[] = [];

  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.rootDisplay.set(isVisible ? '' : 'none');
    this.updateIsPaused();
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.isAttached = true;

    this.show.resume();
    this.show.sub(this.setVisible.bind(this), true);

    this.pauseableSubs.push(

      this.windVectorModule.windSpeed.pipe(this.arrowDisplay, (speed, display) => {
        return speed < MapWindVectorLayer.SHOW_ARROW_WIND_SPEED_THRESHOLD - (display === '' ? MapWindVectorLayer.SHOW_ARROW_WIND_SPEED_HYSTERESIS : 0) ? 'none' : '';
      }, true),

      this.windVectorModule.windDirection.sub(() => { this.needUpdateArrow = true; }, false, true),

      this.windVectorModule.windSpeed.pipe(this.speedValue, true),

    );

    this.updateIsPaused();

    this.needUpdateArrow = true;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.needUpdateArrow ||= BitFlags.isAny(changeFlags, MapProjectionChangeType.Rotation);
  }

  /** @inheritdoc */
  public onWake(): void {
    this.isAwake = true;
    this.show.resume();
    this.updateIsPaused();
  }

  /** @inheritdoc */
  public onSleep(): void {
    this.isAwake = false;
    this.show.pause();
    this.updateIsPaused();
  }

  /**
   * Updates whether this layer is paused.
   */
  private updateIsPaused(): void {
    const isPaused = !(this.isAttached && this.isVisible() && this.isAwake);

    if (isPaused !== this.isPaused) {
      this.isPaused = isPaused;
      if (isPaused) {
        for (const sub of this.pauseableSubs) {
          sub.pause();
        }
      } else {
        for (const sub of this.pauseableSubs) {
          sub.resume(true);
        }
      }
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdateArrow || !this.isVisible()) {
      return;
    }

    this.updateArrow();

    this.needUpdateArrow = false;
  }

  /**
   * Updates the rotation of this layer's arrow.
   */
  private updateArrow(): void {
    const rotation = this.windVectorModule.windDirection.get() + this.props.mapProjection.getRotation() * Avionics.Utils.RAD2DEG;
    this.arrowTransform.transform.set(0, 0, 1, rotation, 0.1);
    this.arrowTransform.resolve();
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass;
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass = SetSubject.create(['map-windvector']), this.props.class, ['map-windvector']);
    } else {
      cssClass = `map-windvector ${this.props.class ?? ''}`;
    }

    return (
      <div class={cssClass} style={{ 'display': this.rootDisplay }}>
        <div class='map-windvector-arrow-container'>
          <svg
            viewBox='-7 -10 14 20'
            class='map-windvector-arrow'
            style={{ 'display': this.arrowDisplay, 'transform': this.arrowTransform, 'overflow': 'visible' }}
          >
            <path d='M -2 -10 l 0 11 c -1 0 -2 -1 -5 -1 l 7 10 l 7 -10 c -3 0 -4 1 -5 1 l 0 -11 z' class='map-windvector-arrow-outline' />
            <path d='M -2 -10 l 0 11 c -1 0 -2 -1 -5 -1 l 7 10 l 7 -10 c -3 0 -4 1 -5 1 l 0 -11 z' class='map-windvector-arrow-stroke' />
          </svg>
        </div>
        <NumberUnitDisplay
          value={this.speedValue}
          displayUnit={null}
          formatter={MapWindVectorLayer.FORMATTER}
          class='map-windvector-speed'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.show.destroy();

    for (const sub of this.pauseableSubs) {
      sub.destroy();
    }

    this.cssClassSub?.destroy();

    super.destroy();
  }
}