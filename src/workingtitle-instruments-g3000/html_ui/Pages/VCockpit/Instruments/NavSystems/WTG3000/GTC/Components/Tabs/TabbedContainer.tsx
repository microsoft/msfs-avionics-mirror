import {
  ArrayUtils, ComponentProps, DisplayComponent, FSComponent, NodeReference, SetSubject, Subject, Subscribable,
  SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';
import { TabbedContent } from './TabbedContent';

import './TabbedContainer.css';

/**
 * Tab arrangement configurations for {@link TabbedContainer}.
 */
export enum TabConfiguration {
  /** Four vertically stacked tabs on the left edge. */
  Left4 = 'L4',

  /** Five vertically stacked tabs on the left edge. */
  Left5 = 'L5',

  /** Four verticall stacked tabs on each of the left and right edges. */
  LeftRight4 = 'LR4',

  /** Five horizontally stacked tabs on the top edge. */
  Top = 'Top'
}

/** Properties for TabbedContainer */
export interface TabbedContainerProps extends ComponentProps {
  /** The configuration of the tabs. */
  configuration: TabConfiguration;

  /** Optionally specify the tab position to initially open to. Defaults to 1. */
  initiallySelectedTabPosition?: number;

  /** CSS class(es) to apply to the container's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * An entry describing a single tab and its contents.
 */
type TabEntry = {
  /** The position of this entry's tab. */
  readonly position: number;

  /** Whether this entry's tab is enabled. */
  readonly isEnabled: Subject<boolean>;

  /** Whether this entry's tab is selected. */
  readonly isSelected: Subscribable<boolean>;

  /** The root VNode of this entry's tab. */
  readonly tabNode: VNode;

  /** The root VNode of this entry's content, including wrapper. */
  readonly contentNode: VNode;

  /** A reference to this entry's root tab element. */
  readonly tabRef: NodeReference<HTMLDivElement>;

  /** This entry's tab content. */
  readonly content: TabbedContent;

  /** The mouse event handler for this entry's tab. */
  clickHandler?: () => void;
};

/** A TabbedContainer which holds TabbedContent(s) */
export class TabbedContainer extends DisplayComponent<TabbedContainerProps> {
  private readonly tabEntries: (TabEntry | undefined)[] = [];

  private readonly selectedTabPosition: Subject<number> = Subject.create<number>(this.props.initiallySelectedTabPosition ?? 1);

  private cssClassSub?: Subscription;

  private isPaused = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    if (!this.getTabEntry().isEnabled.get()) {
      throw new Error('TabbedContainer: cannot initialize a TabbedContainer to a disabled tab');
    }

    this.tabEntries.forEach(entry => {
      if (entry === undefined) {
        return;
      }

      // Only set up mouse listeners for tabs that are not permanently disabled.
      if (entry.content.props.disabled !== true) {
        entry.clickHandler = this.onTabClicked.bind(this, entry);
        entry.tabRef.instance.addEventListener('mousedown', entry.clickHandler);
      }
    });
  }

  /**
   * Gets the tab entry at a specified position.
   * @param position The position of the tab whose entry is to be retrieved. Defaults to the currently selected tab
   * position.
   * @returns The tab entry instance at the specified position.
   * @throws Error if there is no tab at the specified position.
   */
  private getTabEntry(position: number = this.selectedTabPosition.get()): TabEntry {
    const entry = this.tabEntries[position];
    if (!entry) { throw new Error(`TabbedContainer: Tab entry at position ${position} does not exist`); }
    return entry;
  }

  /**
   * Responds to when the user clicks on a tab.
   * @param entry The tab entry associated with the clicked tab.
   */
  private onTabClicked(entry: TabEntry): void {
    if (entry.isEnabled.get()) {
      this.selectTab(entry.position);
    }
  }

  /**
   * Selects and opens a tab. If the chosen tab is disabled, this method does nothing.
   * @param position The position at which the tab to select is located.
   * @throws Error if no tab exists at the specified position.
   */
  public selectTab(position: number): void {
    const entry = this.getTabEntry(position);

    if (!entry.isEnabled.get() || entry.isSelected.get()) {
      return;
    }

    if (!this.isPaused) {
      // Call onPause for the outgoing TabbedComponent
      entry.content.onPause();
    }

    // Update the selected tab
    this.selectedTabPosition.set(position);

    if (!this.isPaused) {
      // Call onResume for the incoming TabbedComponent
      this.getTabEntry().content.onResume();
    }
  }

  /**
   * Sets whether a tab is enabled. If a tab is enabled, it can be freely selected. If a tab is disabled, it cannot be
   * selected. Disabling the currently selected tab will not close the tab or change the selected tab, but will prevent
   * it from being re-selected while it remains disabled once the selected tab changes.
   * @param position The position of the tab to enable or disable.
   * @param enabled Whether the tab should be enabled.
   */
  public setTabEnabled(position: number, enabled: boolean): void {
    const entry = this.getTabEntry(position);

    if (entry.content.props.disabled || entry.isEnabled.get() === enabled) {
      return;
    }

    entry.isEnabled.set(enabled);
  }

  /** Resume the currently-selected tab's content view */
  public resume(): void {
    if (!this.isPaused) { return; }
    this.isPaused = false;
    this.getTabEntry().content.onResume();
  }

  /** Pause the currently-selected tab's content view */
  public pause(): void {
    if (this.isPaused) { return; }
    this.isPaused = true;
    this.getTabEntry().content.onPause();
  }

  /** @inheritdoc */
  public render(): VNode {
    this.validateChildren();

    const baseCssClass = `gtc-tabbed-container gtc-tabbed-container-${this.props.configuration.toLowerCase()}`;

    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      const reservedClasses = [
        'gtc-tabbed-container',
        'gtc-tabbed-container-l4',
        'gtc-tabbed-container-l5',
        'gtc-tabbed-container-lr4',
        'gtc-tabbed-container-top'
      ];
      cssClass = SetSubject.create(FSComponent.parseCssClassesFromString(baseCssClass));
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, reservedClasses);
    } else {
      cssClass = `${baseCssClass} ${this.props.class ?? ''}`;
    }

    return (
      <div class={cssClass}>
        {this.tabEntries.map(entry => entry?.tabNode)}
        <div class="gtc-tab-content-background"></div>
        <div class="gtc-tab-content-selected-tab-border-cover"></div>
        <div class="gtc-tab-content-container">
          {this.tabEntries.map(entry => entry?.contentNode)}
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.getTabEntry().content.onPause();

    this.tabEntries.forEach(entry => {
      if (entry !== undefined) {
        entry.clickHandler && entry.tabRef.getOrDefault()?.removeEventListener('mousedown', entry.clickHandler);
        entry.content.destroy();
      }
    });

    this.cssClassSub?.destroy();

    super.destroy();
  }

  /**
   * Validates this container's children and generates a tab entry for each child.
   * @throws Error if a child is passed that is not an instance of {@link TabbedContent}.
   * @throws Error if a position passed to a TabbedContent component is out of bounds for the passed configuration.
   * @throws Error if the positions passed to TabbedContent components are not all unique.
   */
  private validateChildren(): void {
    if (this.props.children === undefined) {
      return;
    }

    // Flatten all array children before iterating through them.
    (ArrayUtils.flat(this.props.children, Infinity) as (VNode | string | number | Subscribable<any>)[]).forEach(child => {
      if (child === null || typeof child !== 'object' || SubscribableUtils.isSubscribable(child)) {
        throw new Error('TabbedContainer: a child that is not an instance of TabbedContent was found');
      }

      const instance: unknown = (child as VNode).instance;
      if (!(instance instanceof TabbedContent)) {
        throw new Error('TabbedContainer: a child that is not an instance of TabbedContent was found');
      }

      const position: number = instance.props.position;

      if (
        (this.props.configuration === TabConfiguration.Left4 && position > 4) ||
        (this.props.configuration === TabConfiguration.Left5 && position > 5) ||
        (this.props.configuration === TabConfiguration.Top && position > 5) ||
        (this.props.configuration === TabConfiguration.LeftRight4 && position > 8)
      ) {
        throw new Error(`TabbedContainer: position passed to TabbedContent (${position}) is out of bounds for the tab configuration (${this.props.configuration})`);
      }

      if (this.tabEntries[position] !== undefined) {
        throw new Error(`TabbedContainer: more than one tab was defined at position ${position}`);
      }

      const isEnabled = Subject.create(instance.props.disabled !== true);
      const isSelected = this.selectedTabPosition.map(selected => selected === position);
      const tabRef = FSComponent.createRef<HTMLDivElement>();
      const tabNode = this.renderTab(tabRef, instance, isEnabled, isSelected);
      const contentNode = this.renderContent(child, isSelected);

      this.tabEntries[position] = {
        position,
        isEnabled,
        isSelected,
        tabNode,
        contentNode,
        tabRef,
        content: instance
      };
    });
  }

  /**
   * Renders a tab.
   * @param ref The reference to assign to the tab's root element.
   * @param content The content for the tab to render.
   * @param isEnabled Whether the tab is enabled.
   * @param isSelected Whether the tab is selected.
   * @returns A tab, as a VNode.
   */
  private renderTab(ref: NodeReference<HTMLDivElement>, content: TabbedContent, isEnabled: Subscribable<boolean>, isSelected: Subscribable<boolean>): VNode {
    const position: number = content.props.position;

    const classes: string[] = [];
    classes.push('gtc-tab-scooped-corner');
    if (this.props.configuration !== TabConfiguration.Top) {
      classes.push(this.isTabRight(position) ?
        'gtc-tab-scooped-corner-vert-right' : 'gtc-tab-scooped-corner-vert-left');
    }
    const topClasses: string = [...classes, this.props.configuration === TabConfiguration.Top ?
      'gtc-tab-scooped-corner-hor-left' : 'gtc-tab-scooped-corner-vert-top',
    ].join(' ');
    const bottomClasses: string = [...classes, this.props.configuration === TabConfiguration.Top ?
      'gtc-tab-scooped-corner-hor-right' : 'gtc-tab-scooped-corner-vert-bottom',
    ].join(' ');

    const rootCssClass = this.generateTabClasses(position);

    isEnabled.sub(enabled => { rootCssClass.toggle('gtc-tab-disabled', !enabled); }, true);
    isSelected.sub(selected => { rootCssClass.toggle('gtc-tab-selected', selected); }, true);

    return (
      <div
        ref={ref}
        data-position={position}
        class={rootCssClass}
      >
        <div class={topClasses}></div>
        {content.props.label}
        <div class={bottomClasses}></div>
      </div>
    );
  }

  /**
   * Generates the CSS classes of tabs
   * @param position The position of the tab being rendered
   * @returns The CSS classes of tabs
   */
  private generateTabClasses(position: number): SetSubject<string> {
    const cssClass = SetSubject.create<string>();

    cssClass.add('gtc-tab');
    cssClass.add(`gtc-tab${position}`);
    if (this.props.configuration === TabConfiguration.Top) {
      cssClass.add('gtc-tab-top');
      if (position === 1) { cssClass.add('gtc-tab-hor-start'); }
      if (position === 5) { cssClass.add('gtc-tab-hor-end'); }
    } else {
      const height: number = this.props.configuration === TabConfiguration.Left5 ? 5 : 4;
      cssClass.add(this.isTabRight(position) ? 'gtc-tab-right' : 'gtc-tab-left');
      if (position === 1 || position % (height + 1) === 0) { cssClass.add('gtc-tab-vert-start'); }
      if (position % height === 0) { cssClass.add('gtc-tab-vert-end'); }
    }

    return cssClass;
  }

  /**
   * Renders a set of tab contents with wrapper.
   * @param contentNode The root VNode of the tab content.
   * @param isSelected Whether the tab is selected.
   * @returns A set of tab contents with wrapper, as a VNode.
   */
  private renderContent(contentNode: VNode, isSelected: Subscribable<boolean>): VNode {
    return (
      <div class={isSelected.map(selected =>
        `gtc-tab-content${selected ? '' : ' hidden'}`)}
      >
        {contentNode}
      </div>
    );
  }

  /**
   * Returns whether the tab position is on the right-hand side
   * @param position The tab position to evaluate
   * @returns Whether the tab position is on the right-hand side
   */
  private isTabRight(position: number): boolean {
    return this.props.configuration === TabConfiguration.LeftRight4 && position >= 5;
  }
}