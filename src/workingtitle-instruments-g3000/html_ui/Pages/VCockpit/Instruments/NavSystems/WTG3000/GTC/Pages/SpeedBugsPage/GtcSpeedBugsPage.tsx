import {
  AdcEvents, ComponentProps, ConsumerSubject, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, NumberFormatter,
  NumberUnitSubject, SetSubject, Subject, Subscribable, Subscription, UnitType, UserSetting, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { VSpeedUserSettingTypes, VSpeedUserSettingUtils } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay, ToldUserSettings, VSpeedGroup, VSpeedGroupType } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton, GtcTouchButtonProps } from '../../Components/TouchButton/GtcTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcVSpeedDialog } from './GtcVSpeedDialog';

import './GtcSpeedBugsPage.css';

/**
 * Component props for GtcSpeedBugsPage.
 */
export interface GtcSpeedBugsPageProps extends GtcViewProps {
  /** Definitions for the reference V-speeds to support, organized in groups. */
  vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>;

  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: UserSettingManager<VSpeedUserSettingTypes>;

  /** Whether TOLD (takeoff/landing) performance calculations are supported by the FMS. */
  isToldSupported: boolean;
}

/**
 * GTC view keys for popups owned by the speed bugs page.
 */
enum GtcSpeedBugsPagePopupKeys {
  VSpeedValue = 'VSpeedValue'
}

/**
 * A GTC speed bugs page.
 */
export class GtcSpeedBugsPage extends GtcView<GtcSpeedBugsPageProps> {
  private static readonly TAB_LABEL_TEXT = {
    [VSpeedGroupType.General]: 'General',
    [VSpeedGroupType.Takeoff]: 'Takeoff',
    [VSpeedGroupType.Landing]: 'Landing'
  };

  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();
  private readonly restoreButtonRef = FSComponent.createRef<TouchButton>();

  private readonly groupTypeTabPositions = new Map(
    [VSpeedGroupType.General, VSpeedGroupType.Takeoff, VSpeedGroupType.Landing]
      .filter(type => (this.props.vSpeedGroups.get(type)?.vSpeedDefinitions.length ?? 0) > 0)
      .map((type, index) => [type, index + 1])
  );

  private readonly allVSpeedNames = [
    ...(this.props.vSpeedGroups.get(VSpeedGroupType.General)?.vSpeedDefinitions.map(def => def.name) ?? []),
    ...(this.props.vSpeedGroups.get(VSpeedGroupType.Takeoff)?.vSpeedDefinitions.map(def => def.name) ?? []),
    ...(this.props.vSpeedGroups.get(VSpeedGroupType.Landing)?.vSpeedDefinitions.map(def => def.name) ?? [])
  ];

  private readonly allUserValueSettings = this.allVSpeedNames.map(name => this.props.vSpeedSettingManager.getSetting(`vSpeedUserValue_${name}`));
  private readonly allShowSettings = this.allVSpeedNames.map(name => this.props.vSpeedSettingManager.getSetting(`vSpeedShow_${name}`));

  private readonly toldSettingManager = this.props.isToldSupported ? ToldUserSettings.getManager(this.bus) : undefined;

  private readonly listItemHeight = this.props.gtcService.orientation === 'horizontal' ? 130 : 70;
  private readonly listItemSpacing = this.props.gtcService.orientation === 'horizontal' ? 1 : 1;

  private readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground'), false);

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Speed Bugs');

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcSpeedBugsPagePopupKeys.VSpeedValue,
      this.props.controlMode,
      (gtcService, controlMode, displayPaneIndex) => <GtcVSpeedDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />,
      this.props.displayPaneIndex
    );
  }

  /** @inheritdoc */
  public onOpen(): void {
    if (this.isOnGround.get()) {
      const takeoffTabPosition = this.groupTypeTabPositions.get(VSpeedGroupType.Takeoff);
      if (takeoffTabPosition !== undefined) {
        this.tabContainerRef.instance.selectTab(takeoffTabPosition);
      }
    } else {
      const landingTabPosition = this.groupTypeTabPositions.get(VSpeedGroupType.Landing);
      if (landingTabPosition !== undefined) {
        this.tabContainerRef.instance.selectTab(landingTabPosition);
      }
    }
  }

  /** @inheritdoc */
  public onResume(): void {
    this.tabContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.tabContainerRef.instance.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    const tabs = [...this.groupTypeTabPositions.entries()]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(([type, position]) => this.renderTab(position, this.props.vSpeedGroups.get(type)!));

    return (
      <div class='speed-bugs-page'>
        <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.Left5} class='speed-bugs-page-tabs'>
          {...tabs}
        </TabbedContainer>
        <TouchButton
          ref={this.restoreButtonRef}
          label={'Restore All\nDefaults'}
          onPressed={() => {
            this.toldSettingManager?.getSetting('toldTakeoffVSpeedsAccepted').set(false);
            this.toldSettingManager?.getSetting('toldLandingVSpeedsAccepted').set(false);

            this.allUserValueSettings.forEach(setting => { setting.value = -1; });
            this.allShowSettings.forEach(setting => { setting.value = false; });
          }}
          class='speed-bugs-page-restore-button'
        />
      </div>
    );
  }

  /**
   * Renders a settings tab for this page's tab container.
   * @param position The position of the tab.
   * @param vSpeedGroup The V-speed group associated with the tab.
   * @returns A settings tab for this page's tab container, as a VNode.
   */
  private renderTab(
    position: number,
    vSpeedGroup: VSpeedGroup
  ): VNode {
    const contentRef = FSComponent.createRef<VSpeedGroupTabContent>();
    const sidebarState = Subject.create<SidebarState | null>(null);

    let useFmsVSpeedsSetting: UserSetting<boolean> | undefined;

    switch (vSpeedGroup.type) {
      case VSpeedGroupType.Takeoff:
        useFmsVSpeedsSetting = this.toldSettingManager?.getSetting('toldTakeoffVSpeedsAccepted');
        break;
      case VSpeedGroupType.Landing:
        useFmsVSpeedsSetting = this.toldSettingManager?.getSetting('toldLandingVSpeedsAccepted');
        break;
    }

    return (
      <TabbedContent
        position={position}
        label={GtcSpeedBugsPage.TAB_LABEL_TEXT[vSpeedGroup.type as VSpeedGroupType.General | VSpeedGroupType.Takeoff | VSpeedGroupType.Landing]}
        onPause={(): void => {
          this._activeComponent.set(null);
          sidebarState.set(null);
        }}
        onResume={(): void => {
          this._activeComponent.set(contentRef.getOrDefault());
          sidebarState.set(this._sidebarState);
        }}
      >
        <VSpeedGroupTabContent
          ref={contentRef}
          gtcService={this.props.gtcService}
          vSpeedGroup={vSpeedGroup}
          vSpeedSettingManager={this.props.vSpeedSettingManager}
          fmsVSpeedsAcceptedSetting={useFmsVSpeedsSetting}
          listItemHeight={this.listItemHeight}
          listItemSpacing={this.listItemSpacing}
          sidebarState={sidebarState}
        />
      </TabbedContent>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tabContainerRef.getOrDefault()?.destroy();
    this.restoreButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Component props for VSpeedGroupTabContent.
 */
interface VSpeedGroupTabContentProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The reference V-speed group associated with the tab. */
  vSpeedGroup: VSpeedGroup;

  /** A manager for V-speed user settings. */
  vSpeedSettingManager: UserSettingManager<VSpeedUserSettingTypes>;

  /**
   * The setting that controls whether FMS-defined V-speed values of the group associated with the tab have been
   * accepted for use by the user. If the tab's V-speed group does not support FMS-defined values or FMS-defined
   * V-speed values are not supported in general, this setting is undefined.
   */
  fmsVSpeedsAcceptedSetting?: UserSetting<boolean>;

  /** The height of each list item, in pixels. */
  listItemHeight: number;

  /** The spacing between each list item, in pixels. */
  listItemSpacing: number;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;
}

/**
 * A tab for a reference V-speed group.
 */
class VSpeedGroupTabContent extends DisplayComponent<VSpeedGroupTabContentProps> implements GtcInteractionHandler {
  private readonly onButtonRef = FSComponent.createRef<TouchButton>();
  private readonly offButtonRef = FSComponent.createRef<TouchButton>();
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly allShowSettings = this.props.vSpeedGroup.vSpeedDefinitions.map(def => {
    return this.props.vSpeedSettingManager.getSetting(`vSpeedShow_${def.name}`);
  });

  private readonly isAllOnEnabled = MappedSubject.create(
    (showSettings) => showSettings.includes(false),
    ...this.allShowSettings
  );

  private readonly isAllOffEnabled = MappedSubject.create(
    (showSettings) => showSettings.includes(true),
    ...this.allShowSettings
  );

  private readonly subscribables: MappedSubscribable<any>[] = [];

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='speed-bugs-page-tab-content'>
        <div class='speed-bugs-page-tab-header'>
          <TouchButton
            label={'All On'}
            isEnabled={this.isAllOnEnabled}
            onPressed={() => { this.allShowSettings.forEach(setting => { setting.value = true; }); }}
          />
          <TouchButton
            label={'All Off'}
            isEnabled={this.isAllOffEnabled}
            onPressed={() => { this.allShowSettings.forEach(setting => { setting.value = false; }); }}
          />
        </div>
        <div class='speed-bugs-page-tab-separator' />
        <div class='speed-bugs-page-tab-list-container'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            itemsPerPage={4}
            listItemHeightPx={this.props.listItemHeight}
            listItemSpacingPx={this.props.listItemSpacing}
            sidebarState={this.props.sidebarState}
            class='speed-bugs-page-tab-list'
          >
            {
              this.props.vSpeedGroup.vSpeedDefinitions.map((def, index, array) => {
                const activeValue = VSpeedUserSettingUtils.activeValue(def.name, this.props.vSpeedSettingManager, true);
                const isToggleEnabled = activeValue.map(value => value > 0);

                this.subscribables.push(activeValue);
                this.subscribables.push(isToggleEnabled);

                let vSpeedAboveNames: string[];
                let vSpeedBelowNames: string[];

                switch (this.props.vSpeedGroup.type) {
                  case VSpeedGroupType.Takeoff:
                    vSpeedAboveNames = array.slice(index + 1).map(above => above.name);
                    vSpeedBelowNames = array.slice(0, index).map(below => below.name);
                    break;
                  case VSpeedGroupType.Landing:
                    vSpeedAboveNames = array.slice(0, index).map(above => above.name);
                    vSpeedBelowNames = array.slice(index + 1).map(below => below.name);
                    break;
                  default:
                    vSpeedAboveNames = [];
                    vSpeedBelowNames = [];
                }

                return (
                  <GtcListItem paddedListItem class='speed-bugs-page-row'>
                    <GtcToggleTouchButton
                      state={this.props.vSpeedSettingManager.getSetting(`vSpeedShow_${def.name}`)}
                      isEnabled={isToggleEnabled}
                      label={`V${def.name}`}
                      isInList
                      gtcOrientation={this.props.gtcService.orientation}
                      class='speed-bugs-page-row-left'
                    />
                    <VSpeedUserValueButton
                      gtcService={this.props.gtcService}
                      vSpeedName={def.name}
                      activeValue={activeValue}
                      vSpeedAboveNames={vSpeedAboveNames}
                      vSpeedBelowNames={vSpeedBelowNames}
                      vSpeedSettingManager={this.props.vSpeedSettingManager}
                      fmsVSpeedsAcceptedSetting={this.props.fmsVSpeedsAcceptedSetting}
                      class='speed-bugs-page-row-right'
                    />
                  </GtcListItem>
                );
              })
            }
          </GtcList>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.onButtonRef.getOrDefault()?.destroy();
    this.offButtonRef.getOrDefault()?.destroy();
    this.listRef.getOrDefault()?.destroy();

    this.isAllOnEnabled.destroy();
    this.isAllOffEnabled.destroy();

    this.subscribables.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

/**
 * Component props for VSpeedUserValueButton.
 */
interface VSpeedUserValueButtonProps extends Pick<GtcTouchButtonProps, 'isHighlighted' | 'class'> {
  /** The GTC service. */
  gtcService: GtcService;

  /** The name of the reference V-speed whose value is controlled by the button. */
  vSpeedName: string;

  /** The active value of the reference V-speed, in knots. */
  activeValue: Subscribable<number>;

  /** The names of all reference V-speeds required to have values greater than or equal to the V-speed controlled by the button. */
  vSpeedAboveNames: readonly string[];

  /** The names of all reference V-speeds required to have values less than or equal to the V-speed controlled by the button. */
  vSpeedBelowNames: readonly string[];

  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: UserSettingManager<VSpeedUserSettingTypes>;

  /**
   * The setting that controls whether FMS-defined V-speed values of the group to which the button's controlled V-speed
   * belongs have been accepted for use by the user. If the button's controlled V-speed's group does not support
   * FMS-defined values or FMS-defined V-speed values are not supported in general, this setting is undefined.
   */
  fmsVSpeedsAcceptedSetting?: UserSetting<boolean>;
}

/**
 * A touchscreen button which displays the value of a reference V-speed and when pressed, opens a dialog which allows
 * the user to select a user-defined V-speed value.
 */
class VSpeedUserValueButton extends DisplayComponent<VSpeedUserValueButtonProps> {
  private static readonly RESERVED_CSS_CLASSES = ['speed-bug-value-button-fms'];

  private static readonly FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });

  private readonly buttonRef = FSComponent.createRef<TouchButton>();

  private readonly rootCssClass = SetSubject.create<string>();
  private readonly pencilCssClass = SetSubject.create(['speed-bug-value-button-pencil']);

  private readonly showSetting = this.props.vSpeedSettingManager.getSetting(`vSpeedShow_${this.props.vSpeedName}`);
  private readonly defaultValueSetting = this.props.vSpeedSettingManager.getSetting(`vSpeedDefaultValue_${this.props.vSpeedName}`);
  private readonly userValueSetting = this.props.vSpeedSettingManager.getSetting(`vSpeedUserValue_${this.props.vSpeedName}`);
  private readonly fmsValueSetting = this.props.vSpeedSettingManager.getSetting(`vSpeedFmsValue_${this.props.vSpeedName}`);

  private readonly isFmsValueActive = VSpeedUserSettingUtils.isFmsValueActive(this.props.vSpeedName, this.props.vSpeedSettingManager);

  private readonly valueEditState = MappedSubject.create(
    this.defaultValueSetting,
    this.userValueSetting,
    this.fmsValueSetting
  );

  private readonly value = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private readonly vSpeedAboveValueSettings = this.props.vSpeedAboveNames.map(name => {
    return {
      default: this.props.vSpeedSettingManager.getSetting(`vSpeedDefaultValue_${name}`),
      user: this.props.vSpeedSettingManager.getSetting(`vSpeedUserValue_${name}`),
      show: this.props.vSpeedSettingManager.getSetting(`vSpeedShow_${name}`)
    };
  });
  private readonly vSpeedBelowValueSettings = this.props.vSpeedBelowNames.map(name => {
    return {
      default: this.props.vSpeedSettingManager.getSetting(`vSpeedDefaultValue_${name}`),
      user: this.props.vSpeedSettingManager.getSetting(`vSpeedUserValue_${name}`),
      show: this.props.vSpeedSettingManager.getSetting(`vSpeedShow_${name}`)
    };
  });

  private cssClassSub?: Subscription;
  private activeValuePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.activeValuePipe = this.props.activeValue.pipe(this.value, value => value < 1 ? NaN : value);

    this.isFmsValueActive.sub(isActive => { this.rootCssClass.toggle('speed-bug-value-button-fms', isActive); }, true);

    this.valueEditState.sub(([defaultVal, userVal, fmsVal]) => {
      this.pencilCssClass.toggle('hidden', userVal < 0 || (fmsVal >= 0 ? userVal === fmsVal : userVal === defaultVal));
    }, true);
  }

  /**
   * Responds to when this button is pressed.
   */
  private async onPressed(): Promise<void> {
    const currentValue = this.props.activeValue.get();
    const initialValue = currentValue < 1 ? 0 : Math.round(currentValue);
    const result = await this.props.gtcService.openPopup<GtcVSpeedDialog>(GtcSpeedBugsPagePopupKeys.VSpeedValue, 'normal', 'hide')
      .ref.request({ vSpeedName: this.props.vSpeedName, initialValue });

    if (result.wasCancelled) {
      return;
    }

    const value = result.payload;
    this.userValueSetting.value = value;
    this.showSetting.value = true;

    // Automatically change the user-defined values of any V-speeds that are required to be faster/slower than this
    // button's V-speed, if necessary.

    for (let i = 0; i < this.vSpeedAboveValueSettings.length; i++) {
      const settings = this.vSpeedAboveValueSettings[i];
      const userValue = settings.user.value;

      let needChange = false;

      if (userValue < 0) {
        // User-defined value does not exist, so look at default value
        const defaultValue = settings.default.value;
        needChange = defaultValue < 0 || defaultValue < value;
      } else {
        needChange = userValue < value;
      }

      if (needChange) {
        settings.user.value = value;
        settings.show.value = true;
      }
    }

    for (let i = 0; i < this.vSpeedBelowValueSettings.length; i++) {
      const settings = this.vSpeedBelowValueSettings[i];
      const userValue = settings.user.value;

      let needChange = false;

      if (userValue < 0) {
        // User-defined value does not exist, so look at default value
        const defaultValue = settings.default.value;
        needChange = defaultValue < 0 || defaultValue > value;
      } else {
        needChange = userValue > value;
      }

      if (needChange) {
        settings.user.value = value;
        settings.show.value = true;
      }
    }

    this.props.fmsVSpeedsAcceptedSetting?.set(false);
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, VSpeedUserValueButton.RESERVED_CSS_CLASSES);
    } else if (this.props.class !== undefined) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !VSpeedUserValueButton.RESERVED_CSS_CLASSES.includes(cssClass))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <GtcTouchButton
        ref={this.buttonRef}
        onPressed={this.onPressed.bind(this)}
        isHighlighted={this.props.isHighlighted}
        isInList
        gtcOrientation={this.props.gtcService.orientation}
        class={this.rootCssClass}
      >
        <NumberUnitDisplay
          value={this.value}
          displayUnit={null}
          formatter={VSpeedUserValueButton.FORMATTER}
          class='speed-bug-value-button-value'
        />
        <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_pencil.png' class={this.pencilCssClass} />
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    this.isFmsValueActive.destroy();
    this.valueEditState.destroy();

    this.cssClassSub?.destroy();
    this.activeValuePipe?.destroy();

    super.destroy();
  }
}