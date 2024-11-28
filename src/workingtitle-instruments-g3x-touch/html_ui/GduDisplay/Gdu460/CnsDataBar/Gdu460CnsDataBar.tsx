import {
  ComponentProps, ConsumerSubject, DisplayComponent, FlightTimerEventsForId, FlightTimerUtils, FSComponent,
  MappedSubject, Subscribable, SubscribableMapFunctions, SubscribableUtils, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  DateTimeUserSettingTypes, DynamicList, GarminTimerManager, ImgTouchButton, NavDataBar, NavDataBarFieldModelFactory,
  NavDataFieldGpsValidity, NavDataFieldRenderer, UnitsUserSettingManager, ValueTouchButton
} from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from '../../../Shared/AvionicsConfig';
import { G3XNavDataBar } from '../../../Shared/Components/CnsDataBar/CnsDataBarFields/G3XNavDataBar';
import { G3XNavDataBarEditController } from '../../../Shared/Components/CnsDataBar/CnsDataBarFields/G3XNavDataBarEditController';
import { CnsDataBarItemData, CnsDataBarItemType } from '../../../Shared/Components/CnsDataBar/CnsDataBarItem';
import { CnsAudioButtonGroup } from '../../../Shared/Components/CnsDataBar/CnsDataBarItems/CnsAudioButtonGroup';
import { CnsComButtonGroup } from '../../../Shared/Components/CnsDataBar/CnsDataBarItems/CnsComButtonGroup';
import { CnsNavButtonGroup } from '../../../Shared/Components/CnsDataBar/CnsDataBarItems/CnsNavButtonGroup';
import { CnsXpdrButtonGroup } from '../../../Shared/Components/CnsDataBar/CnsDataBarItems/CnsXpdrButtonGroup';
import { UserTimerValueDisplay } from '../../../Shared/Components/Timer/UserTimerValueDisplay';
import { G3XFms } from '../../../Shared/FlightPlan/G3XFms';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { CnsDataBarUserSettingTypes } from '../../../Shared/Settings/CnsDataBarUserSettings';
import { DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { RenderedUiViewEntry } from '../../../Shared/UiSystem/UiViewTypes';
import { Gdu460CnsDataBarItemManager } from './Gdu460CnsDataBarItemManager';

import './Gdu460CnsDataBar.css';

/**
 * Component props for {@link Gdu460CnsDataBar}.
 */
export interface Gdu460CnsDataBarProps extends ComponentProps {
  /** The FMS. */
  fms: G3XFms;

  /** UI controller service */
  uiService: UiService;

  /** The factory to use to create data models for the data bar's data fields. */
  navDataBarFieldModelFactory: NavDataBarFieldModelFactory;

  /** The renderer to use to render the data bar's data fields. */
  navDataBarFieldRenderer: NavDataFieldRenderer;

  /** The GPS validity state for nav data fields. */
  navDataFieldGpsValidity: Subscribable<NavDataFieldGpsValidity>;

  /** A controller for editing the data bar's data fields. */
  navDataBarEditController: G3XNavDataBarEditController;

  /** The general avionics configuration object. */
  config: AvionicsConfig;

  /** A manager for the CNS data bar user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A manager for the CNS data bar user settings. */
  dataBarSettingManager: UserSettingManager<CnsDataBarUserSettingTypes>;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** A user setting manager for measurement units. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * CNS Data bar component for the G3X Touch
 */
export class Gdu460CnsDataBar extends DisplayComponent<Gdu460CnsDataBarProps> {
  private static readonly GDU460_COMPONENT_PRIORITIES: Record<CnsDataBarItemType, number> = {
    [CnsDataBarItemType.Split]: 0,
    [CnsDataBarItemType.Timer]: 1,
    [CnsDataBarItemType.Com]: 2,
    [CnsDataBarItemType.ComMinimized]: 2,
    [CnsDataBarItemType.Nav]: 3,
    [CnsDataBarItemType.NavMinimized]: 3,
    [CnsDataBarItemType.Audio]: 4,
    [CnsDataBarItemType.AudioMinimized]: 4,
    [CnsDataBarItemType.AudioOnly]: 4,
    [CnsDataBarItemType.Xpdr]: 5
  };

  private static readonly GDU460_LEFT_COMPARATOR = (a: CnsDataBarItemData, b: CnsDataBarItemData): number => {
    return Gdu460CnsDataBar.GDU460_COMPONENT_PRIORITIES[a.type] - Gdu460CnsDataBar.GDU460_COMPONENT_PRIORITIES[b.type];
  };

  private static readonly GDU460_RIGHT_COMPARATOR = (a: CnsDataBarItemData, b: CnsDataBarItemData): number => {
    return Gdu460CnsDataBar.GDU460_COMPONENT_PRIORITIES[b.type] - Gdu460CnsDataBar.GDU460_COMPONENT_PRIORITIES[a.type];
  };

  private readonly cnsLeftItemsContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly cnsRightItemsContainerRef = FSComponent.createRef<HTMLDivElement>();

  private leftItemsList: DynamicList<CnsDataBarItemData> | undefined;
  private rightItemsList: DynamicList<CnsDataBarItemData> | undefined;

  private readonly itemManager = new Gdu460CnsDataBarItemManager(
    this.props.uiService,
    this.props.displaySettingManager,
    this.props.dataBarSettingManager,
    {
      comCount: this.props.config.radios.comCount,
      navCount: this.props.config.radios.navCount,
      includeAudioButton: this.props.config.audio.audioPanel !== undefined,
      audioButtonIndicatorShape: this.props.config.audio.audioPanel?.cnsButtonIndicatorShape,
      includeTransponder: this.props.config.transponder !== undefined
    }
  );

  private readonly dataFieldsRef = FSComponent.createRef<NavDataBar>();
  private readonly visibleDataFieldCount = MappedSubject.create(
    SubscribableMapFunctions.min(),
    this.props.dataBarSettingManager.getSetting('cnsDataBarMaxFieldCount'),
    this.itemManager.maxDataFieldCount
  );
  private readonly isGpsLoi = this.props.navDataFieldGpsValidity.map(validity => validity !== NavDataFieldGpsValidity.Valid);

  private readonly isTimerRunning = ConsumerSubject.create(null, false);
  private readonly timerValue = ConsumerSubject.create(null, 0);

  /** @inheritDoc */
  public onAfterRender(): void {
    const renderFunc = this.renderItem.bind(this);
    this.leftItemsList = new DynamicList<CnsDataBarItemData>(
      this.itemManager.leftItems,
      this.cnsLeftItemsContainerRef.instance,
      renderFunc,
      Gdu460CnsDataBar.GDU460_LEFT_COMPARATOR
    );
    this.rightItemsList = new DynamicList<CnsDataBarItemData>(
      this.itemManager.rightItems,
      this.cnsRightItemsContainerRef.instance,
      renderFunc,
      Gdu460CnsDataBar.GDU460_RIGHT_COMPARATOR
    );

    const sub = this.props.uiService.bus.getSubscriber<FlightTimerEventsForId<'g3x'>>();

    this.isTimerRunning.setConsumer(FlightTimerUtils.onEvent('g3x', GarminTimerManager.GENERIC_TIMER_INDEX, sub, 'timer_is_running'));
    this.timerValue.setConsumer(FlightTimerUtils.onEvent('g3x', GarminTimerManager.GENERIC_TIMER_INDEX, sub, 'timer_value_ms'));
  }

  /**
   * Responds to when the timer button is pressed.
   */
  private onTimerButtonPressed(): void {
    if (!this.props.uiService.closePfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.UserTimer)) {
      this.props.uiService.openPfdPopup(UiViewKeys.UserTimer, true, { popupType: 'slideout-bottom-full', backgroundOcclusion: 'none' });
    }
  }

  /**
   * Renders a data bar item.
   * @param data Data describing the item to render.
   * @returns A rendered data bar item for the specified item data, as a VNode.
   */
  private renderItem(data: CnsDataBarItemData): VNode {
    return (
      <CnsDataBarItemWrapper data={data}>
        {this.renderItemContent(data)}
      </CnsDataBarItemWrapper>
    );
  }

  /**
   * Renders contents for a data bar item.
   * @param data Data describing the item to render.
   * @returns Data bar item contents for the specified item data, as a VNode.
   */
  private renderItemContent(data: CnsDataBarItemData): VNode | null {
    switch (data.type) {
      case CnsDataBarItemType.Split: {
        const isVisible = this.props.uiService.isInStartupPhase.map(SubscribableMapFunctions.not());
        const label = this.props.uiService.isPaneSplit.map(isSplit => isSplit ? 'Full' : 'Split');
        const imgSrc = this.props.uiService.isPaneSplit.map(isSplit => isSplit ? `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_fullscreen.png` : `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_splitscreen.png`);
        return (
          <ImgTouchButton
            class='cns-split ui-directory-button'
            label={label}
            imgSrc={imgSrc}
            isVisible={isVisible}
            onPressed={() => this.props.uiService.toggleSplitPaneMode()}
            onDestroy={() => {
              isVisible.destroy();
              label.destroy();
              imgSrc.destroy();
            }}
          />
        );
      }
      case CnsDataBarItemType.Timer:
        return (
          <ValueTouchButton
            state={this.timerValue}
            renderValue={
              <UserTimerValueDisplay
                value={this.timerValue}
                isRunning={this.isTimerRunning}
              />
            }
            label={'Timer'}
            onPressed={this.onTimerButtonPressed.bind(this)}
            class='cns-timer'
          />
        );
      case CnsDataBarItemType.Nav:
        return (
          <CnsNavButtonGroup
            uiService={this.props.uiService}
            radioIndex={data.index}
            radiosConfig={this.props.config.radios}
            isMinimized={false}
            useVolumeIndicator={this.props.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShow')}
          />
        );
      case CnsDataBarItemType.NavMinimized:
        return (
          <CnsNavButtonGroup
            uiService={this.props.uiService}
            radioIndex={data.index}
            radiosConfig={this.props.config.radios}
            isMinimized={true}
            useVolumeIndicator={this.props.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShow')}
          />
        );
      case CnsDataBarItemType.Com:
        return (
          <CnsComButtonGroup
            uiService={this.props.uiService}
            radioIndex={data.index}
            radiosConfig={this.props.config.radios}
            isMinimized={false}
            useVolumeIndicator={this.props.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShow')}
          />
        );
      case CnsDataBarItemType.ComMinimized:
        return (
          <CnsComButtonGroup
            uiService={this.props.uiService}
            radioIndex={data.index}
            radiosConfig={this.props.config.radios}
            isMinimized={true}
            useVolumeIndicator={this.props.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShow')}
          />
        );
      case CnsDataBarItemType.Xpdr:
        return (
          <CnsXpdrButtonGroup
            uiService={this.props.uiService}
          />
        );
      case CnsDataBarItemType.Audio:
        return (
          <CnsAudioButtonGroup
            uiService={this.props.uiService}
            type={'normal'}
            shape={data.shape}
            radiosConfig={this.props.config.radios}
          />
        );
      case CnsDataBarItemType.AudioMinimized:
        return (
          <CnsAudioButtonGroup
            uiService={this.props.uiService}
            type={'minimized'}
            shape={data.shape}
            radiosConfig={this.props.config.radios}
          />
        );
      case CnsDataBarItemType.AudioOnly:
        return (
          <CnsAudioButtonGroup
            uiService={this.props.uiService}
            type={'audio-only'}
            shape={data.shape}
            radiosConfig={this.props.config.radios}
          />
        );
      default:
        return null;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return <div class='cns-data-bar'>
      <div class='cns-data-bar-item-container cns-data-bar-item-container-left' ref={this.cnsLeftItemsContainerRef} />
      <G3XNavDataBar
        ref={this.dataFieldsRef}
        bus={this.props.uiService.bus}
        modelFactory={this.props.navDataBarFieldModelFactory}
        fieldRenderer={this.props.navDataBarFieldRenderer}
        dataBarSettingManager={this.props.dataBarSettingManager}
        visibleDataFieldCount={this.visibleDataFieldCount}
        isEditingActive={this.props.navDataBarEditController.isEditingActive}
        onEditPressed={index => {
          this.props.navDataBarEditController.setEditingIndex(index);
        }}
        updateFreq={1}
        class={{ 'nav-data-bar-gps-loi': this.isGpsLoi }}
      />
      <div class='cns-data-bar-item-container cns-data-bar-item-container-right' ref={this.cnsRightItemsContainerRef} />
    </div>;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.dataFieldsRef.getOrDefault()?.destroy();

    this.itemManager.destroy();

    this.isGpsLoi.destroy();
    this.visibleDataFieldCount.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link CnsDataBarItemWrapper}.
 */
interface CnsDataBarItemWrapperProps extends ComponentProps {
  /** Data describing the CNS data bar item. */
  data: Readonly<CnsDataBarItemData>;
}

/**
 * A wrapper for a CNS data bar item.
 */
class CnsDataBarItemWrapper extends DisplayComponent<CnsDataBarItemWrapperProps> {
  private readonly hidden = this.props.data.isVisible?.map(SubscribableMapFunctions.not()) ?? false;

  private thisNode?: VNode;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={{ 'cns-data-bar-item-container': true, 'hidden': this.hidden }}
        style={`position: relative; width: ${this.props.data.width}px`}
      >
        {this.props.children}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    if (SubscribableUtils.isSubscribable(this.hidden)) {
      this.hidden.destroy();
    }

    super.destroy();
  }
}
