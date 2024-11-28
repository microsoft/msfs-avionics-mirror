import { FSComponent, FilteredMapSubject, MappedSubject, ReadonlyFloat64Array, Subject, Subscription, VNode, Vec2Math } from '@microsoft/msfs-sdk';

import { EisLayouts, EisSizes } from '../../Shared/CommonTypes';
import { AbstractUiView } from '../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../Shared/UiSystem/UiKnobTypes';
import { UiKnobUtils } from '../../Shared/UiSystem/UiKnobUtils';
import { UiViewProps } from '../../Shared/UiSystem/UiView';
import { UiViewLifecyclePolicy, UiViewOcclusionType, UiViewSizeMode, UiViewStackLayer } from '../../Shared/UiSystem/UiViewTypes';
import { MfdPageNavBar } from '../Components/PageNavigation/MfdPageNavBar';
import { MfdPageContainer } from '../PageNavigation/MfdPageContainer';
import { MfdPageEntry, MfdPageSizeMode } from '../PageNavigation/MfdPageTypes';
import { MfdPageSelectDialog } from '../Views/PageSelectDialog/MfdPageSelectDialog';
import { MfdMainPageRegistrar } from './MfdMainPageRegistrar';

import './MfdMainView.css';

/**
 * Component props for MfdMainView.
 */
export interface MfdMainViewProps extends UiViewProps {
  /** A registrar for MFD main pages. */
  pageRegistrar: MfdMainPageRegistrar;
}

/**
 * UI view keys for popups owned by the MFD main display.
 */
enum MfdMainViewPopupKeys {
  PageSelectDialog = 'MfdMainPageSelectDialog'
}

/**
 * An MFD main display.
 */
export class MfdMainView extends AbstractUiView<MfdMainViewProps> {
  private thisNode?: VNode;

  private readonly pageContainerRef = FSComponent.createRef<MfdPageContainer>();
  private readonly navBarRef = FSComponent.createRef<MfdPageNavBar>();

  private readonly containerDimensions = Vec2Math.create();

  private readonly sizeMode = Subject.create(UiViewSizeMode.Hidden);

  private readonly selectedPageTitle = Subject.create('');
  private readonly selectedPageIconSrc = Subject.create('');

  private readonly maxLabelsPerListPage = this.props.uiService.gduFormat === '460'
    ? MappedSubject.create(
      ([sizeMode, eisLayout], previousVal?: number): number => {
        switch (sizeMode) {
          case UiViewSizeMode.Full:
            return 10;
          case UiViewSizeMode.Half:
            if (this.props.uiService.gdu460EisSize === undefined || eisLayout === EisLayouts.None) {
              return 9;
            } else {
              return this.props.uiService.gdu460EisSize === EisSizes.Narrow ? 8 : 7;
            }
          default:
            return previousVal ?? 10;
        }
      },
      this.sizeMode,
      this.props.uiService.gdu460EisLayout
    )
    : Subject.create(6);

  private readonly activePageRequestedKnobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.props.uiService.validKnobIds);
  private activePageRequestedKnobLabelStatePipe?: Subscription;

  private isResumed = false;

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    this.thisNode = node;

    this.pageContainerRef.instance.activePageEntry.sub(this.onActivePageChanged.bind(this), true);

    UiKnobUtils.reconcileRequestedLabelStates(
      this.props.uiService.validKnobIds, this._knobLabelState, false,
      this.activePageRequestedKnobLabelState,
      this.navBarRef.instance.knobLabelState
    );

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Main, UiViewLifecyclePolicy.Transient, MfdMainViewPopupKeys.PageSelectDialog,
      (uiService, containerRef) => {
        return (
          <MfdPageSelectDialog
            uiService={uiService}
            containerRef={containerRef}
            pageDefs={this.props.pageRegistrar.getRegisteredPagesArray()}
          />
        );
      }
    );
  }

  /**
   * Responds to when the active page changes.
   * @param pageEntry The entry for the new active page, or `null` if there is no active page.
   */
  private onActivePageChanged(pageEntry: MfdPageEntry | null): void {
    this.activePageRequestedKnobLabelStatePipe?.destroy();

    if (pageEntry) {
      this.activePageRequestedKnobLabelStatePipe = pageEntry.page.knobLabelState.pipe(this.activePageRequestedKnobLabelState);
    } else {
      this.activePageRequestedKnobLabelStatePipe = undefined;
      this.activePageRequestedKnobLabelState.clear();
    }
  }

  /** @inheritdoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleResize(sizeMode, dimensions);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.pageContainerRef.instance.sleep();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.isResumed = true;

    this.navBarRef.instance.resume();
    this.pageContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.isResumed = false;

    this.navBarRef.instance.pause();
    this.pageContainerRef.instance.pause();
  }

  /** @inheritdoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.handleResize(sizeMode, dimensions);
  }

  /**
   * Handles potential changes in the size mode or dimensions of this view's container.
   * @param sizeMode The new size mode of this view's container.
   * @param dimensions The new dimensions of this view's container, as `[width, height]` in pixels.
   */
  private handleResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    // TODO: Add support for GDU470 (portrait) dimensions.
    Vec2Math.set(dimensions[0], Math.max(dimensions[1] - 33, 0), this.containerDimensions);

    switch (sizeMode) {
      case UiViewSizeMode.Full:
        this.pageContainerRef.instance.setSize(MfdPageSizeMode.Full, this.containerDimensions);
        this.pageContainerRef.instance.wake();
        if (this.isResumed) {
          this.pageContainerRef.instance.resume();
        }
        break;
      case UiViewSizeMode.Half:
        this.pageContainerRef.instance.setSize(MfdPageSizeMode.Half, this.containerDimensions);
        this.pageContainerRef.instance.wake();
        if (this.isResumed) {
          this.pageContainerRef.instance.resume();
        }
        break;
      default:
        this.pageContainerRef.instance.sleep();
    }

    this.sizeMode.set(sizeMode);
  }

  /** @inheritdoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    this.pageContainerRef.instance.setOcclusion(occlusionType);
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    this.pageContainerRef.instance.update(time);
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (this.pageContainerRef.instance.onUiInteractionEvent(event)) {
      return true;
    }

    if (this.navBarRef.instance.onUiInteractionEvent(event)) {
      return true;
    }

    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    const pageDefs = this.props.pageRegistrar.getRegisteredPagesArray();

    return (
      <div class='mfd-main-view'>
        <MfdPageContainer
          ref={this.pageContainerRef}
          registeredPageDefs={pageDefs}
          uiService={this.props.uiService}
          containerRef={this.props.containerRef}
          selectedPageKey={this.props.uiService.selectedMfdMainPageKey}
          selectedPageTitle={this.selectedPageTitle}
          selectedPageIconSrc={this.selectedPageIconSrc}
        />
        <div class='mfd-main-view-nav-bar-container'>
          <MfdPageNavBar
            ref={this.navBarRef}
            pageDefs={pageDefs}
            uiService={this.props.uiService}
            selectedPageKey={this.props.uiService.selectedMfdMainPageKey}
            selectedPageTitle={this.selectedPageTitle}
            selectedPageIconSrc={this.selectedPageIconSrc}
            labelWidth={46}
            maxLabelsPerListPage={this.maxLabelsPerListPage}
            pageSelectDialogKey={MfdMainViewPopupKeys.PageSelectDialog}
            onPageSelected={pageDef => {
              this.props.uiService.selectMfdMainPage(pageDef.key);
            }}
          />
          <div class='ui-layered-darken' />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    'destroy' in this.maxLabelsPerListPage && this.maxLabelsPerListPage.destroy();

    this.activePageRequestedKnobLabelStatePipe?.destroy();

    super.destroy();
  }
}