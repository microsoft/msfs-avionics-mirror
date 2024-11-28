import {
  ArraySubject, ClockEvents, ComponentProps, ConsumerSubject, ConsumerValue, DisplayComponent, FSComponent,
  NodeReference, NumberFormatter, NumberUnitSubject, SimVarValueType, Subject, Subscribable, Subscription, UnitType,
  UserSetting, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { DynamicListData, UnitsUserSettingManager, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  ControllableDisplayPaneIndex, DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys, G3000FilePaths,
  G3000WeightBalanceEvents,
  GtcViewKeys, NumberUnitDisplay, WeightBalanceConfig, WeightBalanceLoadStationDef, WeightBalancePaneViewMode,
  WeightBalancePaneViewStateEvents, WeightBalancePaneViewUserSettings, WeightBalancePaneViewUserSettingTypes,
  WeightBalanceUserSettingManager, WeightFuelEvents, WeightFuelUserSettings, WeightFuelUserSettingTypes
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcMinuteDurationDialog } from '../../Dialog/GtcMinuteDurationDialog';
import { GtcWeightDialog } from '../../Dialog/GtcWeightDialog';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { SidebarState } from '../../GtcService/Sidebar';

import './GtcWeightBalancePage.css';

/**
 * Component props for {@link GtcWeightBalancePage}.
 */
export interface GtcWeightBalancePageProps extends GtcViewProps {
  /** A weight and balance configuration object. */
  weightBalanceConfig: WeightBalanceConfig;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager: WeightBalanceUserSettingManager;
}

/**
 * A GTC weight and balance page.
 */
export class GtcWeightBalancePage extends GtcView<GtcWeightBalancePageProps> {

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;

  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();
  private readonly displayButtonRef = FSComponent.createRef<GtcValueTouchButton<any>>();

  private readonly displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;
  private readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);
  private readonly weightBalancePaneSettingManager: UserSettingManager<WeightBalancePaneViewUserSettingTypes>;
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly isPaneHalfSize = ConsumerSubject.create(null, false);

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcWeightBalancePageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcWeightBalancePage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
    this.weightBalancePaneSettingManager = WeightBalancePaneViewUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Weight and Balance');

    this.isPaneHalfSize.setConsumer(
      this.props.gtcService.bus.getSubscriber<WeightBalancePaneViewStateEvents>()
        .on(`weight_balance_pane_is_half_size_${this.displayPaneIndex}`)
    );
  }

  /** @inheritDoc */
  public onOpen(wasPreviouslyOpened: boolean): void {
    this.displayPaneSettingManager.getSetting('displayPaneDesignatedView').value = DisplayPaneViewKeys.WeightBalance;
    this.displayPaneSettingManager.getSetting('displayPaneView').value = DisplayPaneViewKeys.WeightBalance;

    if (!wasPreviouslyOpened) {
      this.tabsRef.instance.selectTab(1);
    }
  }

  /** @inheritDoc */
  public onResume(): void {
    this.tabsRef.instance.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.tabsRef.instance.pause();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='weight-balance-page'>
        <TabbedContainer
          ref={this.tabsRef}
          configuration={TabConfiguration.Left5}
          class='weight-balance-page-tab-container'
        >
          {this.renderTab(1, 'Empty\nWeight', this.renderEmptyWeightTab.bind(this))}
          {this.renderTab(3, 'Aircraft\nLoading', this.renderLoadingTab.bind(this))}
          {this.renderTab(4, 'Fuel', this.renderFuelTab.bind(this))}
        </TabbedContainer>
        <GtcListSelectTouchButton
          ref={this.displayButtonRef}
          gtcService={this.props.gtcService}
          listDialogKey={GtcViewKeys.ListDialog1}
          state={this.weightBalancePaneSettingManager.getSetting('weightBalancePaneHalfMode')}
          label='Display'
          renderValue={mode => {
            switch (mode) {
              case WeightBalancePaneViewMode.Summary:
                return 'Summary';
              case WeightBalancePaneViewMode.Loading:
                return 'Loading';
              case WeightBalancePaneViewMode.Graph:
                return this.props.weightBalanceConfig.armLabelShort;
              default:
                return '';
            }
          }}
          listParams={{
            selectedValue: this.weightBalancePaneSettingManager.getSetting('weightBalancePaneHalfMode'),
            inputData: [
              {
                value: WeightBalancePaneViewMode.Summary,
                labelRenderer: () => 'Summary'
              },
              {
                value: WeightBalancePaneViewMode.Loading,
                labelRenderer: () => 'Loading'
              },
              {
                value: WeightBalancePaneViewMode.Graph,
                labelRenderer: () => this.props.weightBalanceConfig.armLabelShort
              }
            ]
          }}
          isVisible={this.isPaneHalfSize}
          class='weight-balance-page-display-button'
        />
      </div>
    );
  }

  /**
   * Renders a tab for this page's tab container.
   * @param position The position of the tab.
   * @param label The tab label.
   * @param renderContent A function which renders the tab contents.
   * @returns A tab for this page's tab container, as a VNode.
   */
  private renderTab(
    position: number,
    label: string,
    renderContent?: (contentRef: NodeReference<GtcWeightBalancePageTabContent>, sidebarState: Subscribable<SidebarState | null>) => VNode
  ): VNode {
    const contentRef = FSComponent.createRef<GtcWeightBalancePageTabContent>();
    const sidebarState = Subject.create<SidebarState | null>(null);

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={(): void => {
          this._activeComponent.set(null);
          sidebarState.set(null);
          contentRef.instance.onPause();
        }}
        onResume={(): void => {
          this._activeComponent.set(contentRef.getOrDefault());
          sidebarState.set(this._sidebarState);
          contentRef.instance.onResume();
        }}
        disabled={renderContent === undefined}
      >
        {renderContent && renderContent(contentRef, sidebarState)}
      </TabbedContent>
    );
  }

  /**
   * Renders the empty weight tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The empty weight tab, as a VNode.
   */
  private renderEmptyWeightTab(contentRef: NodeReference<GtcWeightBalancePageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcWeightBalancePageEmptyWeightTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        weightBalanceConfig={this.props.weightBalanceConfig}
        weightFuelSettingManager={this.weightFuelSettingManager}
        weightBalanceSettingManager={this.props.weightBalanceSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        sidebarState={sidebarState}
      />
    );
  }

  /**
   * Renders the aircraft loading tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The aircraft loading tab, as a VNode.
   */
  private renderLoadingTab(contentRef: NodeReference<GtcWeightBalancePageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcWeightBalancePageLoadingTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        weightBalanceConfig={this.props.weightBalanceConfig}
        weightFuelSettingManager={this.weightFuelSettingManager}
        weightBalanceSettingManager={this.props.weightBalanceSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        sidebarState={sidebarState}
      />
    );
  }

  /**
   * Renders the fuel tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The fuel tab, as a VNode.
   */
  private renderFuelTab(contentRef: NodeReference<GtcWeightBalancePageTabContent>, sidebarState: Subscribable<SidebarState | null>): VNode {
    return (
      <GtcWeightBalancePageFuelTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        weightBalanceConfig={this.props.weightBalanceConfig}
        weightFuelSettingManager={this.weightFuelSettingManager}
        weightBalanceSettingManager={this.props.weightBalanceSettingManager}
        unitsSettingManager={this.unitsSettingManager}
        sidebarState={sidebarState}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.tabsRef.getOrDefault()?.destroy();
    this.displayButtonRef.getOrDefault()?.destroy();

    this.isPaneHalfSize.destroy();

    super.destroy();
  }
}

/**
 * Component props for a GTC weight and balance page tab.
 */
interface GtcWeightBalancePageTabContentProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** A weight and balance configuration object. */
  weightBalanceConfig: WeightBalanceConfig;

  /** A manager for weight/fuel user settings. */
  weightFuelSettingManager: UserSettingManager<WeightFuelUserSettingTypes>;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager: WeightBalanceUserSettingManager;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** The SidebarState to use. */
  sidebarState: Subscribable<SidebarState | null>;
}

/**
 * A content component for a GTC weight and balance page tab.
 */
interface GtcWeightBalancePageTabContent<P extends GtcWeightBalancePageTabContentProps = GtcWeightBalancePageTabContentProps>
  extends DisplayComponent<P>, GtcInteractionHandler {

  /** A method which is called when this component's parent tab is resumed. */
  onResume(): void;

  /** A method which is called when this component's parent tab is paused. */
  onPause(): void;
}

/**
 * A GTC weight and balance page empty weight tab.
 */
class GtcWeightBalancePageEmptyWeightTab extends DisplayComponent<GtcWeightBalancePageTabContentProps> implements GtcWeightBalancePageTabContent {
  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1 });
  private static readonly ARM_FORMATTER = NumberFormatter.create({ precision: 0.1 });

  private thisNode?: VNode;

  private readonly basicEmptyWeightSetting = this.props.weightFuelSettingManager.getSetting('weightFuelBasicEmpty');
  private readonly basicEmptyWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly basicEmptyArmSource = ConsumerSubject.create(null, 0).pause();
  private readonly basicEmptyArmValue = NumberUnitSubject.create(UnitType.INCH.createNumber(0));
  private readonly basicEmptyArmUnit = this.props.unitsSettingManager.weightUnits.map(weightUnit => {
    if (weightUnit.equals(UnitType.KILOGRAM)) {
      return UnitType.CENTIMETER;
    } else {
      return UnitType.INCH;
    }
  });

  private readonly basicEmptyMacValueText = this.props.weightBalanceConfig.macArm
    ? this.basicEmptyArmSource.map(arm => {
      const [lemac, temac] = this.props.weightBalanceConfig.macArm!;
      return ((arm - lemac) / (temac - lemac) * 100).toFixed(1);
    }).pause()
    : undefined;

  private readonly subscriptions: Subscription[] = this.basicEmptyMacValueText
    ? [this.basicEmptyArmSource, this.basicEmptyArmUnit, this.basicEmptyMacValueText]
    : [this.basicEmptyArmSource, this.basicEmptyArmUnit];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.basicEmptyArmSource.setConsumer(this.props.gtcService.bus.getSubscriber<G3000WeightBalanceEvents>().on('weightbalance_basic_empty_arm'));

    this.subscriptions.push(
      this.props.sidebarState.sub(sidebarState => {
        sidebarState?.slot5.set(null);
      }, false, true),

      this.basicEmptyWeightSetting.pipe(this.basicEmptyWeightValue, value => Math.max(value, 0), true),
      this.basicEmptyArmSource.pipe(this.basicEmptyArmValue, true)
    );
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /**
   * Responds to when this tab's set empty weight and balance button is pressed.
   */
  private onEmptyWeightAndBalanceButtonPressed(): void {
    this.props.gtcService.changePageTo(GtcViewKeys.WeightAndBalanceConfig);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='weight-balance-page-empty-weight-tab'>
        <div class='weight-balance-page-empty-weight-tab-values-container'>
          <div class='weight-balance-page-empty-weight-tab-value-row'>
            <div class='weight-balance-page-empty-weight-tab-value-row-title'>Basic Empty Weight</div>
            <NumberUnitDisplay
              value={this.basicEmptyWeightValue}
              displayUnit={this.props.unitsSettingManager.weightUnits}
              formatter={GtcWeightBalancePageEmptyWeightTab.WEIGHT_FORMATTER}
              class='weight-balance-page-empty-weight-tab-value-row-value'
            />
          </div>
          <div class='weight-balance-page-empty-weight-tab-value-row'>
            <div class='weight-balance-page-empty-weight-tab-value-row-title'>Basic Empty {this.props.weightBalanceConfig.armLabelShort}</div>
            <NumberUnitDisplay
              value={this.basicEmptyArmValue}
              displayUnit={this.basicEmptyArmUnit}
              formatter={GtcWeightBalancePageEmptyWeightTab.ARM_FORMATTER}
              class='weight-balance-page-empty-weight-tab-value-row-value'
            />
          </div>
          {this.basicEmptyMacValueText !== undefined && (
            <div class='weight-balance-page-empty-weight-tab-value-row'>
              <div class='weight-balance-page-empty-weight-tab-value-row-title'>Basic Empty MAC</div>
              <div class='weight-balance-page-empty-weight-tab-value-row-value'>{this.basicEmptyMacValueText}%</div>
            </div>
          )}
        </div>
        <div class='weight-balance-page-empty-weight-tab-button-container'>
          {this.props.weightBalanceConfig.areLoadStationsEditable && (
            <GtcTouchButton
              label={'Set Empty\nWeight and Balance'}
              onPressed={this.onEmptyWeightAndBalanceButtonPressed.bind(this)}
              class='weight-balance-page-empty-weight-tab-button weight-balance-page-empty-weight-tab-set-empty-button'
            />
          )}
          {this.props.weightBalanceConfig.envelopeOptions.defs.length > 1 && (
            <GtcListSelectTouchButton
              gtcService={this.props.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              state={this.props.weightBalanceSettingManager.getSetting('weightBalanceActiveEnvelopeIndex')}
              label={'Active Envelope'}
              renderValue={index => this.props.weightBalanceSettingManager.envelopeDefs[index]?.name ?? ''}
              listParams={{
                selectedValue: this.props.weightBalanceSettingManager.getSetting('weightBalanceActiveEnvelopeIndex'),
                inputData: this.props.weightBalanceSettingManager.envelopeDefs.map((def, index) => {
                  return {
                    value: index,
                    labelRenderer: () => def.name
                  };
                })
              }}
              class='weight-balance-page-empty-weight-tab-button weight-balance-page-empty-weight-tab-envelope-button'
            />
          )}
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Data describing a load station list item for {@link GtcWeightBalancePageLoadingTab}.
 */
type LoadStationData = DynamicListData & {
  /** The definition for the data's associated load station. */
  def: Readonly<WeightBalanceLoadStationDef>;
};

/**
 * A GTC weight and balance page aircraft loading tab.
 */
class GtcWeightBalancePageLoadingTab extends DisplayComponent<GtcWeightBalancePageTabContentProps> implements GtcWeightBalancePageTabContent {
  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly listRef = FSComponent.createRef<GtcList<any>>();
  private readonly loadStationArray = ArraySubject.create<LoadStationData>();

  private readonly subscriptions = new Set<Subscription>();

  /** @inheritDoc */
  public onAfterRender(): void {
    this.loadStationArray.set(this.props.weightBalanceSettingManager.loadStationDefs.map(def => {
      return {
        def,
        isVisible: this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEnabled_${def.id}`)
      };
    }));
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /**
   * Responds to when one of this tab's load buttons is pressed.
   * @param def The definition for the button's associated load station.
   * @param setting The user setting that controls the load weight for the button's associated load station.
   */
  private async onLoadButtonPressed(def: WeightBalanceLoadStationDef, setting: UserSetting<number>): Promise<void> {
    const unitType = this.props.unitsSettingManager.weightUnits.get();
    const result = await this.props.gtcService.openPopup<GtcWeightDialog>(GtcViewKeys.WeightDialog1, 'normal', 'hide')
      .ref.request({
        title: `${def.name} Weight`,
        initialValue: setting.value,
        initialUnit: UnitType.POUND,
        unitType,
        maximumValue: UnitType.POUND.convertTo(def.maxLoadWeight, unitType)
      });

    if (!result.wasCancelled) {
      setting.value = result.payload.unit.convertTo(result.payload.value, UnitType.POUND);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='weight-balance-page-loading-tab'>
        <GtcList
          ref={this.listRef}
          bus={this.props.gtcService.bus}
          data={this.loadStationArray}
          renderItem={this.renderLoadStationItem.bind(this)}
          itemsPerPage={5}
          listItemHeightPx={this.props.gtcService.isHorizontal ? 136 : 72}
          listItemSpacingPx={this.props.gtcService.isHorizontal ? 2 : 1}
          maxRenderedItemCount={25}
          sidebarState={this.props.sidebarState}
          class='weight-balance-page-loading-tab-list'
        />
      </div>
    );
  }

  /**
   * Renders a load station list item.
   * @param data Data describing the list item to render.
   * @returns A load station list item described by the specified data, as a VNode.
   */
  private renderLoadStationItem(data: LoadStationData): VNode {
    const loadWeightSetting = this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationLoadWeight_${data.def.id}`);
    const loadWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));
    const loadWeightPipe = loadWeightSetting.pipe(loadWeightValue);
    this.subscriptions.add(loadWeightPipe);

    const valueDisplayRef = FSComponent.createRef<NumberUnitDisplay<any>>();

    return (
      <GtcListButton
        label={data.def.name}
        fullSizeButton
        onPressed={this.onLoadButtonPressed.bind(this, data.def, loadWeightSetting)}
        onDestroy={() => {
          valueDisplayRef.getOrDefault()?.destroy();
          loadWeightPipe.destroy();
          this.subscriptions.delete(loadWeightPipe);
        }}
        touchButtonClasses='touch-button-value'
      >
        <div class='touch-button-value-value'>
          <NumberUnitDisplay
            ref={valueDisplayRef}
            value={loadWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={GtcWeightBalancePageLoadingTab.WEIGHT_FORMATTER}
          />
        </div>
      </GtcListButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * A GTC weight and balance page fuel tab.
 */
class GtcWeightBalancePageFuelTab extends DisplayComponent<GtcWeightBalancePageTabContentProps> implements GtcWeightBalancePageTabContent {
  private static readonly TOTAL_FUEL_CAPACITY_GAL = SimVar.GetSimVarValue('FUEL TOTAL CAPACITY', SimVarValueType.GAL);

  private static readonly FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });
  private static readonly MIN_FORMATTER = NumberFormatter.create({ precision: 1 });

  private thisNode?: VNode;

  private readonly fuelOnBoardWeightSource = ConsumerValue.create<number | null>(null, null).pause();
  private readonly fuelOnBoardWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly taxiFuelWeightSetting = this.props.weightFuelSettingManager.getSetting('weightFuelTaxi');
  private readonly taxiFuelWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly fuelReservesWeightSetting = this.props.weightFuelSettingManager.getSetting('weightFuelReserves');
  private readonly fuelReservesWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly estHoldingTimeMinsSetting = this.props.weightFuelSettingManager.getSetting('weightFuelEstHoldingTime');
  private readonly estHoldingTimeMinsValue = NumberUnitSubject.create(UnitType.MINUTE.createNumber(0));

  private readonly holdingFuelSource = ConsumerValue.create<number | null>(null, null).pause();
  private readonly estHoldingFuelWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly subscriptions: Subscription[] = [
    this.fuelOnBoardWeightSource,
    this.holdingFuelSource
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const sub = this.props.gtcService.bus.getSubscriber<ClockEvents & WeightFuelEvents>();
    this.fuelOnBoardWeightSource.setConsumer(sub.on('weightfuel_fob_weight'));
    this.holdingFuelSource.setConsumer(sub.on('weightfuel_holding_fuel'));

    this.subscriptions.push(
      this.props.sidebarState.sub(sidebarState => {
        sidebarState?.slot5.set(null);
      }, false, true),

      this.taxiFuelWeightSetting.pipe(this.taxiFuelWeightValue, true),
      this.fuelReservesWeightSetting.pipe(this.fuelReservesWeightValue, true),
      this.estHoldingTimeMinsSetting.pipe(this.estHoldingTimeMinsValue, true),

      sub.on('realTime').atFrequency(1).handle(this.update.bind(this), true)
    );
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /**
   * Updates this tab.
   */
  private update(): void {
    this.fuelOnBoardWeightValue.set(this.fuelOnBoardWeightSource.get() ?? NaN);
    this.estHoldingFuelWeightValue.set(this.holdingFuelSource.get() ?? NaN);
  }

  /**
   * Opens a dialog to allow the user to select a fuel weight value.
   * @param title The title of the dialog.
   * @param setting The user setting to set when the user selects a value through the dialog.
   * @returns The dialog output if the dialog was not cancelled, otherwise `undefined`.
   */
  private async openFuelDialog(title: string, setting: UserSetting<number>): Promise<void> {
    const unitType = this.props.unitsSettingManager.fuelUnits.get();
    const result = await this.props.gtcService.openPopup<GtcWeightDialog>(GtcViewKeys.WeightDialog1, 'normal', 'hide')
      .ref.request({
        title,
        initialValue: setting.value,
        initialUnit: UnitType.POUND,
        unitType,
        maximumValue: UnitType.GALLON_FUEL.convertTo(GtcWeightBalancePageFuelTab.TOTAL_FUEL_CAPACITY_GAL, unitType)
      });

    if (!result.wasCancelled) {
      setting.value = result.payload.unit.convertTo(result.payload.value, UnitType.POUND);
    }
  }

  /**
   * Responds to when this tab's fuel init button is pressed.
   */
  private onFuelInitButtonPressed(): void {
    this.props.gtcService.changePageTo(GtcViewKeys.InitialFuel);
  }

  /**
   * Responds to when this tab's taxi fuel button is pressed.
   * @returns A Promise which is fulfilled when the callback operation is finished.
   */
  private onTaxiFuelButtonPressed(): Promise<void> {
    return this.openFuelDialog('Taxi Fuel', this.taxiFuelWeightSetting);
  }

  /**
   * Responds to when this tab's fuel reserves button is pressed.
   * @returns A Promise which is fulfilled when the callback operation is finished.
   */
  private onFuelReservesButtonPressed(): Promise<void> {
    return this.openFuelDialog('Fuel Reserves Weight', this.fuelReservesWeightSetting);
  }

  /**
   * Responds to when this tab's hold time button is pressed.
   */
  private async onHoldTimeButtonPressed(): Promise<void> {
    const result = await this.props.gtcService.openPopup<GtcMinuteDurationDialog>(GtcViewKeys.MinuteDurationDialog, 'normal', 'hide')
      .ref.request({ initialValue: this.estHoldingTimeMinsSetting.get(), max: 240 });

    if (!result.wasCancelled) {
      this.estHoldingTimeMinsSetting.set(result.payload);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='weight-balance-page-fuel-tab'>
        <div class='weight-balance-page-fuel-tab-row weight-balance-page-fuel-tab-value-row'>
          <GtcImgTouchButton
            label='Fuel Init'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_fuel.png`}
            onPressed={this.onFuelInitButtonPressed.bind(this)}
            class='weight-balance-page-fuel-tab-value-row-button weight-balance-page-fuel-tab-fuel-init-button gtc-directory-button'
          />
          <div class='weight-balance-page-fuel-tab-value-container'>
            <div class='weight-balance-page-fuel-tab-value-title'>Fuel On Board</div>
            <NumberUnitDisplay
              value={this.fuelOnBoardWeightValue}
              displayUnit={this.props.unitsSettingManager.fuelUnits}
              formatter={GtcWeightBalancePageFuelTab.FUEL_FORMATTER}
              class='weight-balance-page-fuel-tab-value-value'
            />
          </div>
        </div>
        <GtcValueTouchButton
          state={this.taxiFuelWeightValue}
          label='Taxi Fuel'
          renderValue={
            <NumberUnitDisplay
              value={this.taxiFuelWeightValue}
              displayUnit={this.props.unitsSettingManager.fuelUnits}
              formatter={GtcWeightBalancePageFuelTab.FUEL_FORMATTER}
            />
          }
          onPressed={this.onTaxiFuelButtonPressed.bind(this)}
          class='weight-balance-page-fuel-tab-row'
        />
        <GtcValueTouchButton
          state={this.fuelReservesWeightValue}
          label='Fuel Reserves'
          renderValue={
            <NumberUnitDisplay
              value={this.fuelReservesWeightValue}
              displayUnit={this.props.unitsSettingManager.fuelUnits}
              formatter={GtcWeightBalancePageFuelTab.FUEL_FORMATTER}
            />
          }
          onPressed={this.onFuelReservesButtonPressed.bind(this)}
          class='weight-balance-page-fuel-tab-row'
        />
        <div class='weight-balance-page-fuel-tab-row weight-balance-page-fuel-tab-value-row'>
          <GtcValueTouchButton
            state={this.estHoldingTimeMinsValue}
            label='Hold Time'
            renderValue={
              <NumberUnitDisplay
                value={this.estHoldingTimeMinsValue}
                displayUnit={UnitType.MINUTE}
                formatter={GtcWeightBalancePageFuelTab.MIN_FORMATTER}
              />
            }
            onPressed={this.onHoldTimeButtonPressed.bind(this)}
            class='weight-balance-page-fuel-tab-value-row-button weight-balance-page-fuel-tab-hold-button'
          />
          <div class='weight-balance-page-fuel-tab-value-container'>
            <div class='weight-balance-page-fuel-tab-value-title'>Hold Fuel</div>
            <NumberUnitDisplay
              value={this.estHoldingFuelWeightValue}
              displayUnit={this.props.unitsSettingManager.fuelUnits}
              formatter={GtcWeightBalancePageFuelTab.FUEL_FORMATTER}
              class='weight-balance-page-fuel-tab-value-value'
            />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
