import { DisplayComponent, FSComponent, SetSubject, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';

import { TouchButton, TouchButtonProps } from '../TouchButton';
import { ListItem, ListItemProps } from './ListItem';

/** The props for ListButton. */
export interface ListButtonProps extends
  Omit<ListItemProps, 'class'>,
  Pick<TouchButtonProps, 'isEnabled' | 'isHighlighted' | 'onPressed' | 'label'> {

  /**
   * Whether the button should fill the entire list item.
   * Overrides hideBorder to be true when true.
   * Defaults to false. */
  fullSizeButton?: boolean;

  /** A callback function to execute when the list item is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the list item div element. */
  listItemClasses?: string | SubscribableSet<string>;

  /** CSS class(es) to apply to the list item div element. */
  touchButtonClasses?: string | SubscribableSet<string>;
}

/** A TouchButton used at the top level of a GtcList list item.
 * Handles cleaning up the TouchButton on destroy. */
export class ListButton extends DisplayComponent<ListButtonProps> {
  private static readonly RESERVED_CLASSES = ['list-item-button', 'full-size-list-item-button'];
  private static readonly BASE_CLASSES = ['list-item-button'];

  private readonly listItemRef = FSComponent.createRef<ListItem>();

  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public render(): VNode {
    const {
      children,
      hideBorder,
      paddedListItem,
      fullSizeButton,
      label,
      isEnabled,
      isHighlighted,
      onPressed,
      listItemClasses,
      touchButtonClasses
    } = this.props;

    const touchButtonClassSubject = SetSubject.create(ListButton.BASE_CLASSES);

    if (fullSizeButton) {
      touchButtonClassSubject.add('full-size-list-item-button');
    }

    if (typeof touchButtonClasses === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(touchButtonClassSubject, touchButtonClasses, ListButton.RESERVED_CLASSES);
    } else if (touchButtonClasses !== undefined && touchButtonClasses.length > 0) {
      FSComponent.parseCssClassesFromString(touchButtonClasses)
        .forEach(cssClass => {
          if (!ListButton.RESERVED_CLASSES.includes(cssClass)) {
            touchButtonClassSubject.add(cssClass);
          }
        });
    }

    return (
      <ListItem ref={this.listItemRef} hideBorder={fullSizeButton || hideBorder} paddedListItem={paddedListItem} class={listItemClasses}>
        <TouchButton
          label={label}
          isInList
          isEnabled={isEnabled}
          isHighlighted={isHighlighted}
          onPressed={onPressed}
          class={touchButtonClassSubject}
          variant="list-button"
        >
          {children}
        </TouchButton>
      </ListItem>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.listItemRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}
