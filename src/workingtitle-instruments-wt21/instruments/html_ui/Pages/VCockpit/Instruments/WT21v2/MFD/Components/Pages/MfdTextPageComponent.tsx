import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * Props for an MFD text page
 */
export interface MfdTextPageProps extends ComponentProps {
  /**
   * The event bus
   */
  bus: EventBus,

  /**
   * MFD index of the page instance
   */
  mfdIndex: number,
}

/**
 * Base class for MFD text page
 */
export abstract class MfdTextPageComponent<T extends MfdTextPageProps = MfdTextPageProps> extends DisplayComponent<T> {
  protected readonly pageContainerDivRef = FSComponent.createRef<HTMLDivElement>();

  private readonly shownSub = Subject.create(false);

  /**
   * Shows the page
   */
  public show(): void {
    this.shownSub.set(true);
  }

  /**
   * Hides the page
   */
  public hide(): void {
    this.shownSub.set(false);
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.shownSub.sub((shown) => {
      this.pageContainerDivRef.instance.style.visibility = shown ? 'visible' : 'hidden';
    }, true);
  }
}