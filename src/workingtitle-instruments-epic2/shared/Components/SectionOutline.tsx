import { ComponentProps, DisplayComponent, EventBus, FSComponent, InstrumentEvents, Subject, VNode } from '@microsoft/msfs-sdk';

import './SectionOutline.css';

/** The properties for the {@link SectionOutline} component. */
interface SectionOutlineProps extends ComponentProps {
  /**
   * The event bus. Required for the map to respond appropriately to the mouse leaving the virtual cockpit instrument
   * screen while the user is over a section
   */
  bus: EventBus;
}


/** The SectionOutline component. */
export class SectionOutline extends DisplayComponent<SectionOutlineProps> {
  public readonly outlineElement = FSComponent.createRef<HTMLElement>();
  protected readonly instrumentMouseLeaveSub = this.props.bus?.getSubscriber<InstrumentEvents>()
    .on('vc_mouse_leave').handle(() => this.onMouseOut());
  public readonly outlineActive = Subject.create(false);
  private forceOutlineActive = false;

  /**
   * Forces the outline to be active - useful for some components such as the flight plan list item
   * where you want to show that they are still selected
   * @param state Whether to force the outline to be active
   */
  public forceOutline(state: boolean): void {
    this.forceOutlineActive = state;
    this.outlineActive.set(state);
  }

  /** @inheritdoc */
  public onAfterRender(): void {

    this.outlineElement.instance.addEventListener(
      'mouseover',
      this.onMouseOver,
    );
    this.outlineElement.instance.addEventListener(
      'mouseout',
      this.onMouseOut,
    );

  }
  /** Set the outline active */
  public onMouseOver = (): void => {
    this.outlineActive.set(true);
  };
  /** Set the outline inactive */
  public onMouseOut = (): void => {
    if (!this.forceOutlineActive) {
      this.outlineActive.set(false);
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.outlineElement} class={{
        'section-outline': true,
        'outline-active': this.outlineActive.map(
          (bool) => bool,
        ),
      }}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public onDestroy(): void {
    this.outlineActive.set(false);
    this.outlineElement.instance.removeEventListener('mouseover', () => null);
    this.outlineElement.instance.removeEventListener('mouseout', () => null);
  }
}
