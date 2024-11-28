import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import './ListItem.css';

/** The props for ListItem. */
export interface ListItemProps extends ComponentProps {
  /**
   * Hides the list item border, allowing the content to easily fill the entire space of the list-item.
   * Defaults to false.
   */
  hideBorder?: boolean | Subscribable<boolean>;

  /**
   * Adds some default, commonly used padding to the list item.
   * Defaults to false.
   */
  paddedListItem?: boolean | Subscribable<boolean>;

  /** Controls the list item's visibility. Defaults to true. */
  isVisible?: boolean | Subscribable<boolean>;

  /** A callback function to execute when the list item is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the list item div element. */
  class?: string | SubscribableSet<string>;
}

/** A component that wraps list item content for use with Epic2List. */
export class ListItem extends DisplayComponent<ListItemProps> {
  private static readonly RESERVED_CLASSES = ['list-item', 'hide-border', 'padded-list-item'];
  private static readonly BASE_CLASSES = ['list-item'];

  private readonly hideBorder = SubscribableUtils.toSubscribable(this.props.hideBorder ?? false, true) as Subscribable<boolean>;
  private readonly paddedListItem = SubscribableUtils.toSubscribable(this.props.paddedListItem ?? false, true) as Subscribable<boolean>;
  private readonly isVisible = SubscribableUtils.toSubscribable(this.props.isVisible ?? true, true) as Subscribable<boolean>;

  private thisNode?: VNode;

  private cssClassSub?: Subscription;

  private subs = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** @inheritdoc */
  public render(): VNode {
    const { children, class: classes } = this.props;

    const cssClasses = SetSubject.create(ListItem.BASE_CLASSES);

    this.subs.push(this.hideBorder.sub(hideBorder => {
      cssClasses.toggle('hide-border', hideBorder);
    }, true));

    this.subs.push(this.paddedListItem.sub(paddedListItem => {
      cssClasses.toggle('padded-list-item', paddedListItem);
    }, true));

    this.subs.push(this.isVisible.sub(isVisible => {
      cssClasses.toggle('hidden', !isVisible);
    }, true));

    if (typeof classes === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(cssClasses, classes, ListItem.RESERVED_CLASSES);
    } else if (classes !== undefined && classes.length > 0) {
      FSComponent.parseCssClassesFromString(classes)
        .forEach(cssClass => {
          if (!ListItem.RESERVED_CLASSES.includes(cssClass)) {
            cssClasses.add(cssClass);
          }
        });
    }

    return (
      <div class={cssClasses}>
        {children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.cssClassSub?.destroy();

    this.subs.forEach(sub => sub.destroy());

    super.destroy();
  }
}
