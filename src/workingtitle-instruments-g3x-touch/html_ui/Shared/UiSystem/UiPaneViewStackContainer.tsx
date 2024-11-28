import { ComponentProps, DisplayComponent, FSComponent, NodeReference, ReadonlyFloat64Array, SubEvent, VNode, Vec2Math } from '@microsoft/msfs-sdk';

import { UiPaneContent } from './UiPaneContent';
import { UiPaneSizeMode } from './UiPaneTypes';
import { UiViewStackContainer } from './UiViewStackContainer';
import { UiViewSizeMode, UiViewStackLayer } from './UiViewTypes';

import './UiPaneViewStackContainer.css';

/**
 * Component props for UiPaneViewStackContainer.
 */
export interface UiPaneViewStackContainerProps extends ComponentProps {
  /** A callback function to execute on every UI pane update cycle. */
  onUpdate?: (time: number) => void;
}

/**
 * A UI view stack container contained in a UI pane.
 */
export class UiPaneViewStackContainer extends DisplayComponent<UiPaneViewStackContainerProps> implements UiPaneContent, UiViewStackContainer {
  /** @inheritdoc */
  public readonly isUiPaneContent = true;

  /** @inheritdoc */
  public readonly rootRef = FSComponent.createRef<HTMLElement>();

  private readonly layerRefs: Record<UiViewStackLayer, NodeReference<HTMLDivElement>> = {
    [UiViewStackLayer.Main]: FSComponent.createRef<HTMLDivElement>(),
    [UiViewStackLayer.Overlay]: FSComponent.createRef<HTMLDivElement>(),
  };

  private readonly _sizeChanged = new SubEvent<UiViewStackContainer, void>();
  /** @inheritdoc */
  public readonly sizeChanged = this._sizeChanged;

  private viewSizeMode = UiViewSizeMode.Hidden;
  private readonly dimensions = Vec2Math.create();

  /** @inheritdoc */
  public getSizeMode(): UiViewSizeMode {
    return this.viewSizeMode;
  }

  /** @inheritdoc */
  public getDimensions(): ReadonlyFloat64Array {
    return this.dimensions;
  }

  /** @inheritdoc */
  public onInit(sizeMode: UiPaneSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleSizeChanged(UiPaneSizeMode.Hidden, dimensions);
  }

  /** @inheritdoc */
  public onResume(sizeMode: UiPaneSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleSizeChanged(sizeMode, dimensions);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.handleSizeChanged(UiPaneSizeMode.Hidden, this.dimensions);
  }

  /** @inheritdoc */
  public onResize(sizeMode: UiPaneSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleSizeChanged(sizeMode, dimensions);
  }

  /**
   * Handles when this container's parent pane changes size.
   * @param sizeMode The new size mode of this container's parent pane.
   * @param dimensions The new dimensions of this container's parent pane, as `[width, height]` in pixels.
   */
  private handleSizeChanged(sizeMode: UiPaneSizeMode, dimensions: ReadonlyFloat64Array): void {
    let newViewSizeMode: UiViewSizeMode;

    switch (sizeMode) {
      case UiPaneSizeMode.Full:
        newViewSizeMode = UiViewSizeMode.Full;
        break;
      case UiPaneSizeMode.Half:
        newViewSizeMode = UiViewSizeMode.Half;
        break;
      default:
        newViewSizeMode = UiViewSizeMode.Hidden;
    }

    if (newViewSizeMode === this.viewSizeMode && Vec2Math.equals(dimensions, this.dimensions)) {
      return;
    }

    this.viewSizeMode = newViewSizeMode;
    this.dimensions.set(dimensions);
    this.sizeChanged.notify(this);
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    this.props.onUpdate && this.props.onUpdate(time);
  }

  /** @inheritdoc */
  public renderView(layer: UiViewStackLayer, view: VNode): void {
    FSComponent.render(view, this.layerRefs[layer].instance);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='ui-pane-view-stack-container'>
        <div ref={this.layerRefs[UiViewStackLayer.Main]} class='ui-pane-view-stack-container-layer ui-pane-view-stack-container-main' />
        <div ref={this.layerRefs[UiViewStackLayer.Overlay]} class='ui-pane-view-stack-container-layer ui-pane-view-stack-container-overlay' />
      </div>
    );
  }
}