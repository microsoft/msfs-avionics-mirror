import { FSComponent, MapLayer, MapLayerProps, Subscription, VNode } from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapPointerModule } from '../modules/MapPointerModule';

/**
 * Modules required by MapPointerLayer.
 */
export interface MapPointerLayerModules {
  /** Pointer module. */
  [GarminMapKeys.Pointer]: MapPointerModule;
}

/**
 * A map layer which displays a pointer.
 */
export class MapPointerLayer extends MapLayer<MapLayerProps<MapPointerLayerModules>> {
  private readonly pointerRef = FSComponent.createRef<HTMLElement>();

  private readonly pointerModule = this.props.model.getModule(GarminMapKeys.Pointer);

  private needRepositionPointer = false;

  private positionSub?: Subscription;
  private isActiveSub?: Subscription;

  /** @inheritdoc */
  public onVisibilityChanged(): void {
    this.pointerRef.getOrDefault() && this.updateFromVisibility();
  }

  /**
   * Updates this layer according to its current visibility.
   */
  private updateFromVisibility(): void {
    const isVisible = this.isVisible();
    this.pointerRef.instance.style.display = isVisible ? '' : 'none';
    if (isVisible) {
      this.positionSub?.resume(true);
    } else {
      this.positionSub?.pause();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.positionSub = this.pointerModule.position.sub(() => { this.needRepositionPointer = true; }, false, true);

    this.updateFromVisibility();

    this.isActiveSub = this.pointerModule.isActive.sub(isActive => this.setVisible(isActive), true);
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needRepositionPointer) {
      return;
    }

    this.repositionPointer();
    this.needRepositionPointer = false;
  }

  /**
   * Repositions this layer's pointer.
   */
  private repositionPointer(): void {
    const position = this.pointerModule.position.get();
    this.pointerRef.instance.style.transform = `translate3d(${position[0]}px, ${position[1]}px, 0)`;
  }

  /** @inheritdoc */
  public render(): VNode {
    return this.props.children?.some(child => child !== undefined) ?? false ? this.renderCustom() : this.renderDefault();
  }

  /**
   * Renders the default pointer icon.
   * @returns The default pointer icon, as a VNode.
   */
  private renderDefault(): VNode {
    return (
      <svg
        ref={this.pointerRef} class='map-pointer' viewBox='0 0 100 100'
        style='position: absolute; left: 0; top: 0; transform: translate3d(0, 0, 0);'
      >
        <polygon points='78.93 95.46 49.48 66.01 41.18 84.57 4.54 4.54 84.57 41.18 66.01 49.48 95.46 78.93 78.93 95.46' />
      </svg>
    );
  }

  /**
   * Renders a custom pointer icon.
   * @returns The custom pointer icon, as a VNode.
   */
  private renderCustom(): VNode {
    return (
      <div ref={this.pointerRef} style='position: absolute; left: 0; top: 0; transform: translate3d(0, 0, 0);' class='map-pointer'>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.positionSub?.destroy();
    this.isActiveSub?.destroy();
  }
}