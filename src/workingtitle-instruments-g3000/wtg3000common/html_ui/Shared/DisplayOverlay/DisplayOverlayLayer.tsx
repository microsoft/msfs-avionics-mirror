import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet, ToggleableClassNameRecord,
  VNode
} from '@microsoft/msfs-sdk';

import { DisplayOverlayComponent } from './DisplayOverlayComponent';

/**
 * Component props for {@link DisplayOverlayLayer}.
 */
export interface DisplayOverlayLayerProps extends ComponentProps {
  /** Whether to show the layer. */
  show: Subscribable<boolean>;

  /** CSS class(es) to apply to the layer's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An overlay layer that renders UI elements on top of the main content of a G3000 GDU or GTC display.
 */
export class DisplayOverlayLayer<P extends DisplayOverlayLayerProps = DisplayOverlayLayerProps> extends DisplayComponent<P> {
  private readonly cssClass = SetSubject.create<string>(['hidden']);

  protected readonly components: DisplayOverlayComponent[] = [];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    FSComponent.visitNodes(thisNode, node => {
      if (node !== thisNode && node.instance instanceof DisplayComponent) {
        if ((node.instance as any).isDisplayOverlayComponent === true) {
          this.registerComponent(node.instance as DisplayOverlayComponent);
        }
        return true;
      } else {
        return false;
      }
    });

    if (this.props.show.get()) {
      this.onVisibilityChanged(true);
    }
    this.props.show.sub(this.onVisibilityChanged.bind(this));
  }

  /**
   * Registers a component with this layer.
   * @param component The component to register.
   */
  protected registerComponent(component: DisplayOverlayComponent): void {
    this.components.push(component);
  }

  /**
   * Responds to when the visibility of this layer changes.
   * @param isVisible Whether this layer is visible.
   */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.cssClass.toggle('hidden', !isVisible);

    if (isVisible) {
      for (const component of this.components) {
        component.onWake();
      }
    } else {
      for (const component of this.components) {
        component.onSleep();
      }
    }
  }

  /**
   * Handles an interaction event. The event will be routed to each of this layer's {@link DisplayOverlayComponent}
   * descendants in order of render. If this layer is not visible, then the event will not be routed and will remain
   * unhandled.
   * @param event The interaction event to handle.
   * @returns Whether the interaction event was handled.
   */
  public onInteractionEvent(event: string): boolean {
    if (this.props.show.get()) {
      for (const component of this.components) {
        if (component.onInteractionEvent(event)) {
          return true;
        }
      }
    }

    return false;
  }

  /** @inheritDoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      FSComponent.bindCssClassSet(this.cssClass, this.props.class, ['hidden']);
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => classToFilter !== 'hidden')) {
        this.cssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.cssClass}>
        {this.props.children}
      </div>
    );
  }
}
