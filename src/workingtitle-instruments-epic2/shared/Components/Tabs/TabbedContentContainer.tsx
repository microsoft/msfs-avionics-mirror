import { ComponentProps, DisplayComponent, EventBus, FSComponent, NodeReference, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { TabContent } from './TabContent';
import { Tab } from './TabTypes';

import './TabbedContentContainer.css';

/** The properties for the {@link TabbedContentContainer} component. */
interface TabbedContentContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** Array of tab names to be displayed on each tab. Must have at least 1 element. */
  readonly tabs: readonly Tab[];
  /** Subscribable holding the active tab. */
  readonly activeTab: Subscribable<Tab>;
  /** Class for root element. */
  readonly className?: FSComponent.JSX.IntrinsicElements[string]['class'];
  /** Class for each tab content element. */
  readonly tabContentClassName?: string;
}

/** The TabbedContentContainer component. */
export class TabbedContentContainer extends DisplayComponent<TabbedContentContainerProps> {

  private readonly renderedTabbedDivs = new Map<Tab, NodeReference<HTMLDivElement>>();
  private readonly renderedTabbedContents = new Map<Tab, NodeReference<TabContent>>();

  private currentTab: Tab | undefined;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.activeTab.sub(activeTab => {
      this.currentTab && this.renderedTabbedContents.get(this.currentTab)?.instance.onPause();

      this.renderedTabbedContents.get(activeTab)?.instance.onResume();

      this.currentTab = activeTab;
    }, true);
  }

  /** Called when container is resumed/revealed. */
  public onResume(): void {
    this.currentTab && this.renderedTabbedContents.get(this.currentTab)?.instance.onResume();
  }

  /** Called when container is paused/hidden. */
  public onPause(): void {
    this.currentTab && this.renderedTabbedContents.get(this.currentTab)?.instance.onPause();
  }

  /**
   * Handles line select key presses when the tab is active.
   * @param key The number of the key pressed, starting at 0 for the topmost key next to the tab view area.
   */
  public onLineSelectKey(key: number): void {
    this.currentTab && this.renderedTabbedContents.get(this.currentTab)?.instance.onLineSelectKey(key);
  }

  /** @inheritdoc */
  public render(): VNode {
    const { tabs, className = '', tabContentClassName = '' } = this.props;

    return (
      <div class={className} style="position: relative;">
        {tabs.map(tab => {
          const divRef = FSComponent.createRef<HTMLDivElement>();
          const contentRef = FSComponent.createRef<TabContent>();

          this.renderedTabbedDivs.set(tab, divRef);
          this.renderedTabbedContents.set(tab, contentRef);

          const vnode = tab.renderContent();
          contentRef.instance = vnode.instance as TabContent;

          if (!contentRef.instance.onResume || !contentRef.instance.onLineSelectKey) {
            console.error(`Tab '${tab.renderLabel}' does not extend TabContent, but it must.`);
          }

          return (
            <div
              class={{
                [tabContentClassName]: !!tabContentClassName,
                'hidden': this.props.activeTab.map(activeTab => activeTab !== tab),
              }}
              style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
              ref={divRef}
            >
              {vnode}
            </div>
          );
        })}
      </div>
    );
  }
}
