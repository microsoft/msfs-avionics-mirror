import {
  BitFlags, CssTransformBuilder, CssTransformSubject, FSComponent, MapLayer, MapLayerProps, MapProjection,
  MapProjectionChangeType, SetSubject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapOrientation, MapOrientationModule, TouchButtonOnTouchedAction } from '@microsoft/msfs-garminsdk';

import { G3XTouchFilePaths } from '../../../G3XTouchFilePaths';
import { TouchButton } from '../../TouchButton/TouchButton';
import { G3XMapKeys } from '../G3XMapKeys';
import { MapOrientationOverrideModule } from '../Modules/MapOrientationOverrideModule';

import './G3XMapMiniCompassLayer.css';

/**
 * Modules required for G3XMapMiniCompassLayer.
 */
export interface G3XMapMiniCompassLayerModules {
  /** Map orientation module. */
  [GarminMapKeys.Orientation]?: MapOrientationModule;

  /** Map orientation override module. */
  [G3XMapKeys.OrientationOverride]?: MapOrientationOverrideModule;
}

/**
 * Component props for G3XMapMiniCompassLayer.
 */
export interface G3XMapMiniCompassLayerProps extends MapLayerProps<G3XMapMiniCompassLayerModules> {
  /**
   * Whether the compass should support the orientation toggle feature. If defined, then the compass will function as
   * a touchscreen button. If not defined, then the compass will not function as a button. The orientation toggle
   * feature requires the following modules:
   *
   * * `[GarminMapKeys.Orientation]: MapOrientationModule`
   * * `[G3XMapKeys.OrientationOverride]: MapOrientationOverrideModule`
   *
   * Defaults to `false`.
   */
  supportOrientationToggle?: boolean;
}

/**
 * A map layer which depicts a rotating compass arrow pointing to true north and optionally functions as a touchscreen
 * button allowing the user to toggle the map orientation setting.
 */
export class G3XMapMiniCompassLayer extends MapLayer<G3XMapMiniCompassLayerProps> {
  private static readonly RESERVED_CSS_CLASSES = ['map-minicompass', 'hidden'];

  private readonly rootCssClass = SetSubject.create(['map-minicompass']);

  private readonly arrowTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.rotate3d('rad')
  ));

  private readonly orientationModule = this.props.model.getModule(GarminMapKeys.Orientation);
  private readonly overrideModule = this.props.model.getModule(G3XMapKeys.OrientationOverride);

  private readonly isOverrideActive = this.overrideModule?.orientationOverride.map(mode => mode !== null);

  private needUpdate = false;

  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.rootCssClass.toggle('hidden', !isVisible);
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.arrowTransform.transform.getChild(0).set(-50, -50);
    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.needUpdate ||= BitFlags.isAll(changeFlags, MapProjectionChangeType.Rotation);
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    this.updateRotation();

    this.needUpdate = false;
  }

  /**
   * Updates the rotation of this compass's arrow.
   */
  private updateRotation(): void {
    this.arrowTransform.transform.getChild(1).set(0, 0, 1, this.props.mapProjection.getRotation(), 1e-4);
    this.arrowTransform.resolve();
  }

  /**
   * Responds to when this compass's button is pressed.
   */
  private onButtonPressed(): void {
    if (this.orientationModule && this.overrideModule) {
      let overrideModeToSet: MapOrientation | null;

      if (this.overrideModule.orientationOverride.get() === null) {
        switch (this.orientationModule.desiredOrientation.get()) {
          case MapOrientation.NorthUp:
            overrideModeToSet = MapOrientation.TrackUp;
            break;
          default:
            overrideModeToSet = MapOrientation.NorthUp;
        }
      } else {
        overrideModeToSet = null;
      }

      this.overrideModule.orientationOverride.set(overrideModeToSet);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, G3XMapMiniCompassLayer.RESERVED_CSS_CLASSES);
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !G3XMapMiniCompassLayer.RESERVED_CSS_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.rootCssClass}>
        {this.props.supportOrientationToggle
          ? (
            <TouchButton
              isHighlighted={this.isOverrideActive}
              onTouched={() => TouchButtonOnTouchedAction.Press}
              onPressed={this.onButtonPressed.bind(this)}
              focusOnDrag
              class='map-minicompass-button'
            >
              {this.renderArrow()}
            </TouchButton>
          ) : (
            this.renderArrow()
          )
        }
      </div>
    );
  }

  /**
   * Renders this compass's arrow.
   * @returns This compass's rendered arrow, as a VNode.
   */
  private renderArrow(): VNode {
    return (
      <div class='map-minicompass-arrow-container'>
        <img
          src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_minicompass.png`}
          class='map-minicompass-arrow'
          style={{
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'transform': this.arrowTransform
          }}
        />
        <div class='map-minicompass-arrow-text'>N</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isOverrideActive?.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}