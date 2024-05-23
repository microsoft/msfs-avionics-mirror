import {
  ComponentProps, DebounceTimer, DisplayComponent, FSComponent, FilteredMapSubject, MappedSubject, MappedSubscribable, Subject,
  Subscribable, SubscribableMapFunctions, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { ScrollList } from '../../../Shared/Components/List/ScrollList';
import { TouchList } from '../../../Shared/Components/List/TouchList';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { UiInteractionEvent, UiInteractionHandler } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { MfdPageSelectDialog } from '../../Views/PageSelectDialog/MfdPageSelectDialog';
import { MfdPageDefinition } from '../../PageNavigation/MfdPageDefinition';

import './MfdPageNavBar.css';

/**
 * Component props for {@link MfdPageNavBar}.
 */
export interface MfdPageNavBarProps extends ComponentProps {
  /**
   * An iterable of definitions for the navigation bar's selectable pages in the order in which their labels should
   * appear in the navigation bar's page list.
   */
  pageDefs: Iterable<Readonly<MfdPageDefinition>>;

  /** The UI service instance. */
  uiService: UiService;

  /** The key of the selected page. */
  selectedPageKey: Subscribable<string>;

  /** The selected page's title. */
  selectedPageTitle: Subscribable<string>;

  /** The file path to the selected page's icon image asset. */
  selectedPageIconSrc: Subscribable<string>;

  /** The width of the each page label, in pixels, in the navigation bar's page list. */
  labelWidth: number;

  /** The maximum number of page labels to show simultaneously in the navigation bar's page list. */
  maxLabelsPerListPage: Subscribable<number>;

  /** The key of the page select dialog to open when the navigation bar is pressed. */
  pageSelectDialogKey: string;

  /**
   * A function which is called when a page is selected through the navigation bar.
   * @param pageDef The definition for the selected page.
   */
  onPageSelected: (pageDef: Readonly<MfdPageDefinition>) => void;
}

/**
 * An MFD page navigation bar.
 */
export class MfdPageNavBar extends DisplayComponent<MfdPageNavBarProps> implements UiInteractionHandler {
  private static readonly SELECTED_LABEL_HIDE_DURATION = 250; // milliseconds

  private readonly buttonRef = FSComponent.createRef<UiTouchButton>();
  private readonly labelListRef = FSComponent.createRef<TouchList>();

  private readonly pageDefs = Array.from(this.props.pageDefs);

  private readonly selectedPageTitle = this.props.selectedPageTitle.map(SubscribableMapFunctions.identity());
  private readonly selectedPageIconSrc = this.props.selectedPageIconSrc.map(SubscribableMapFunctions.identity());

  protected readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.props.uiService.validKnobIds);
  /** @inheritdoc */
  public readonly knobLabelState = this._knobLabelState as Subscribable<UiKnobRequestedLabelState>;

  private selectedPageIndex = -1;

  private readonly _isResumed = Subject.create(false);

  private readonly labelsPerListPage = Subject.create(1);

  private readonly isLeftArrowHidden = Subject.create(false);
  private readonly isRightArrowHidden = Subject.create(false);

  private readonly selectedLabelHiddenDebounce = new DebounceTimer();
  private readonly isSelectedLabelHidden = Subject.create(false);
  private readonly showSelectedLabelFunc = this.isSelectedLabelHidden.set.bind(this.isSelectedLabelHidden, false);

  private readonly subs: MappedSubscribable<any>[] = [
    this.selectedPageTitle,
    this.selectedPageIconSrc
  ];

  private selectedPageKeySub?: Subscription;
  private labelsPerListPageSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.renderLabels();

    this._isResumed.sub(isResumed => {
      if (isResumed) {
        this._knobLabelState.setValue(UiKnobId.SingleOuter, 'Select Page');
        this._knobLabelState.setValue(UiKnobId.LeftOuter, 'Select Page');
        this._knobLabelState.setValue(UiKnobId.RightOuter, 'Select Page');
      } else {
        this._knobLabelState.delete(UiKnobId.SingleOuter);
        this._knobLabelState.delete(UiKnobId.LeftOuter);
        this._knobLabelState.delete(UiKnobId.RightOuter);
      }
    }, true);

    this.selectedPageKeySub = this.props.selectedPageKey.sub(this.onSelectedPageKeyChanged.bind(this), true);

    this.labelsPerListPageSub = this.props.maxLabelsPerListPage.sub(this.onMaxLabelsPerListPageChanged.bind(this), true);

    MappedSubject.create(
      this.labelListRef.instance.maxScrollPos,
      this.labelListRef.instance.scrollPos
    ).sub(this.onLabelListScrollChanged.bind(this), true);
  }

  /**
   * Resumes this navigation bar. When this bar is resumed, it will handle
   */
  public resume(): void {
    this._isResumed.set(true);
  }

  /**
   * Pauses this navigation bar.
   */
  public pause(): void {
    this._isResumed.set(false);
  }

  /**
   * Gets the index of a page definition with a given key.
   * @param key The key for which to search.
   * @returns The index of the page definition with the specified key, or `-1` if the key could not be found.
   */
  private indexOfPageDef(key: string): number {
    for (let i = 0; i < this.pageDefs.length; i++) {
      if (this.pageDefs[i].key === key) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Renders this navigation bar's page label buttons.
   */
  private renderLabels(): void {
    FSComponent.render(
      (
        <>
          {this.pageDefs.map(def => {
            const isSelected = this.props.selectedPageKey.map(key => key === def.key);
            this.subs.push(isSelected);

            return (
              <div
                class={{
                  'mfd-page-nav-bar-label': true,
                  'mfd-page-nav-bar-label-disabled': def.factory === undefined,
                  'mfd-page-nav-bar-label-selected': isSelected
                }}
              >
                <div class='mfd-page-nav-bar-label-text'>{def.label}</div>
              </div>
            );
          })}
        </>
      ),
      this.labelListRef.instance.getContainerRef()
    );
  }

  /**
   * Responds to when the key of the selected page changes.
   * @param key The key of the new selected page.
   */
  private onSelectedPageKeyChanged(key: string): void {
    this.selectedPageIndex = this.indexOfPageDef(key);
    if (this.selectedPageIndex < 0) {
      this.labelListRef.instance.scrollToIndex(0, 0, false);
    } else {
      this.labelListRef.instance.scrollToIndexWithMargin(this.selectedPageIndex, 2, false);
    }

    // When the selected page changes, both the selected page title and icon tend to change at the same time. However,
    // the image takes an extra frame to change over due to needing to load the image asset. This creates a distracting
    // effect. Therefore, we will hide both the selected page title and icon for a short period when the selected page
    // changes so that the user doesn't see the "glitch".
    this.isSelectedLabelHidden.set(true);
    this.selectedLabelHiddenDebounce.schedule(this.showSelectedLabelFunc, MfdPageNavBar.SELECTED_LABEL_HIDE_DURATION);
  }

  /**
   * Responds to when the maximum number of page labels per scrolling list page changes.
   * @param count The new maximum number of page labels per scrolling list page.
   */
  private onMaxLabelsPerListPageChanged(count: number): void {
    this.labelsPerListPage.set(Math.min(count, this.pageDefs.length));

    // Ensure that we are still respecting the scrolling margin.
    this.labelListRef.instance.scrollToIndexWithMargin(this.selectedPageIndex, 2, false);
  }

  /**
   * Responds to when this navigation bar's page label list's scroll position changes.
   * @param root0 The state of the page label list's scroll position.
   * @param root0."0" The page label list's maximum allowed scroll position, in pixels.
   * @param root0."1" The page label list's new scroll position, in pixels.
   */
  private onLabelListScrollChanged([maxScrollPos, scrollPos]: readonly [number, number]): void {
    this.isLeftArrowHidden.set(scrollPos <= 0);
    this.isRightArrowHidden.set(scrollPos >= maxScrollPos);
  }

  /**
   * Responds to when the user presses this navigation bar.
   */
  private async onButtonPressed(): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<MfdPageSelectDialog>(UiViewStackLayer.Main, this.props.pageSelectDialogKey, true, {
        popupType: 'slideout-bottom-full'
      }).ref.request({ initialSelectedKey: this.props.selectedPageKey.get() });

    if (!result.wasCancelled) {
      this.props.onPageSelected(result.payload);
    }
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (!this._isResumed.get()) {
      return false;
    }

    switch (event) {
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.changeSelectedPage(1);
        return true;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.changeSelectedPage(-1);
        return true;
      default:
        return false;
    }
  }

  /**
   * Changes the selected page to the next or previous valid page in this navigation bar's page list.
   * @param direction The direction in which to change the selected page (`1` = forward, `-1` = backward).
   */
  private changeSelectedPage(direction: 1 | -1): void {
    const startIndex = this.selectedPageIndex < 0
      ? direction === 1 ? -1 : this.pageDefs.length
      : this.selectedPageIndex;

    for (let i = startIndex + direction; i >= 0 && i < this.pageDefs.length; i += direction) {
      const pageDef = this.pageDefs[i];
      if (pageDef.factory) {
        this.props.onPageSelected(pageDef);
        break;
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'mfd-page-nav-bar': true, 'mfd-page-nav-bar-resumed': this._isResumed }}>
        <UiTouchButton
          ref={this.buttonRef}
          isEnabled={this._isResumed}
          onPressed={this.onButtonPressed.bind(this)}
          class='mfd-page-nav-bar-button'
        >
          <div class='mfd-page-nav-bar-selected'>
            <img src={this.selectedPageIconSrc} class={{ 'mfd-page-nav-bar-selected-icon': true, 'hidden': this.isSelectedLabelHidden }} />
            <div class={{ 'mfd-page-nav-bar-selected-title': true, 'hidden': this.isSelectedLabelHidden }}>{this.selectedPageTitle}</div>
          </div>
          <div class='mfd-page-nav-bar-labels-container'>
            <img
              src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_page_nav_bar_arrow.png`}
              class={{
                'mfd-page-nav-bar-labels-arrow': true,
                'mfd-page-nav-bar-labels-arrow-left': true,
                'hidden': this.isLeftArrowHidden
              }}
            />
            <ScrollList
              ref={this.labelListRef}
              bus={this.props.uiService.bus}
              scrollAxis='x'
              listItemLengthPx={this.props.labelWidth}
              itemsPerPage={this.labelsPerListPage}
              itemCount={this.pageDefs.length}
            >
            </ScrollList>
            <img
              src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_page_nav_bar_arrow.png`}
              class={{
                'mfd-page-nav-bar-labels-arrow': true,
                'mfd-page-nav-bar-labels-arrow-right': true,
                'hidden': this.isRightArrowHidden
              }}
            />
          </div>
        </UiTouchButton>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.selectedLabelHiddenDebounce.clear();

    this.labelListRef.getOrDefault()?.destroy();
    this.buttonRef.getOrDefault()?.destroy();

    for (const sub of this.subs) {
      sub.destroy();
    }

    this.selectedPageKeySub?.destroy();
    this.labelsPerListPageSub?.destroy();

    super.destroy();
  }
}