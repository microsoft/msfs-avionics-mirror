import {
  ArraySubject, ConsumerSubject, FSComponent, NumberFormatter, NumberUnitSubject, Subject, Subscribable, Subscription,
  Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { DynamicListData, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import {
  ControllableDisplayPaneIndex, G3000WeightBalanceEvents, NumberUnitDisplay, WeightBalanceConfig,
  WeightBalanceLoadStationDef, WeightBalanceUserSettingManager, WeightFuelUserSettings
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcMomentArmDialog } from '../../Dialog/GtcMomentArmDialog';
import { GtcWeightDialog } from '../../Dialog/GtcWeightDialog';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcWeightBalanceConfigPage.css';

/**
 * Component props for {@link GtcWeightBalanceConfigPage}.
 */
export interface GtcWeightBalanceConfigPageProps extends GtcViewProps {
  /** A weight and balance configuration object. */
  weightBalanceConfig: WeightBalanceConfig;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager: WeightBalanceUserSettingManager;
}

/**
 * GTC view keys for popups owned by the weight and balance configuration page.
 */
enum GtcWeightBalanceConfigPagePopupKeys {
  Settings = 'WeightAndBalanceConfigSettings'
}

const WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1 });
const ARM_FORMATTER = NumberFormatter.create({ precision: 0.1 });

/**
 * A GTC weight and balance configuration page.
 */
export class GtcWeightBalanceConfigPage extends GtcView<GtcWeightBalanceConfigPageProps> {
  private thisNode?: VNode;

  private readonly weightFuelSettingManager = WeightFuelUserSettings.getManager(this.bus);
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly listRef = FSComponent.createRef<GtcList<any>>();
  private readonly loadStationArray = ArraySubject.create<WeightBalanceLoadStationDef & DynamicListData>(
    this.props.weightBalanceSettingManager.loadStationDefs.slice()
  );

  private readonly armUnit = this.unitsSettingManager.weightUnits.map(weightUnit => {
    if (weightUnit.equals(UnitType.KILOGRAM)) {
      return UnitType.CENTIMETER;
    } else {
      return UnitType.INCH;
    }
  });

  private readonly basicEmptyWeightSetting = this.weightFuelSettingManager.getSetting('weightFuelBasicEmpty');
  private readonly basicEmptyWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly basicEmptyArmSource = ConsumerSubject.create(null, 0).pause();
  private readonly basicEmptyArmValue = NumberUnitSubject.create(UnitType.INCH.createNumber(0));

  private readonly basicEmptyMacValueText = this.props.weightBalanceConfig.macArm
    ? this.basicEmptyArmSource.map(arm => {
      const [lemac, temac] = this.props.weightBalanceConfig.macArm!;
      return ((arm - lemac) / (temac - lemac) * 100).toFixed(1);
    }).pause()
    : undefined;

  private readonly subscriptions: Subscription[] = this.basicEmptyMacValueText
    ? [this.armUnit, this.basicEmptyArmSource, this.basicEmptyMacValueText]
    : [this.armUnit, this.basicEmptyArmSource];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcWeightBalanceConfigPagePopupKeys.Settings,
      this.props.controlMode,
      this.renderSettingsPopup.bind(this),
      this.props.displayPaneIndex
    );

    this._title.set('Weight and Balance Configuration');

    this.basicEmptyArmSource.setConsumer(this.props.gtcService.bus.getSubscriber<G3000WeightBalanceEvents>().on('weightbalance_basic_empty_arm'));

    this.subscriptions.push(
      this.basicEmptyWeightSetting.pipe(this.basicEmptyWeightValue, value => Math.max(value, 0), true),
      this.basicEmptyArmSource.pipe(this.basicEmptyArmValue, true)
    );

    this._activeComponent.set(this.listRef.instance);
  }

  /** @inheritDoc */
  public onOpen(wasPreviouslyOpened: boolean): void {
    if (!wasPreviouslyOpened) {
      this.listRef.instance.scrollToIndex(0, 0, false);
    }
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

  /**
   * Responds to when one of this page's settings buttons is pressed.
   * @param def The definition for the load station associated with the button that was pressed.
   */
  private onSettingsButtonPressed(def: WeightBalanceLoadStationDef): void {
    this.props.gtcService.openPopup<GtcWeightBalanceConfigSettingsPopup>(GtcWeightBalanceConfigPagePopupKeys.Settings)
      .ref.setLoadStation(def);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='weight-balance-config-page'>
        <div class='weight-balance-config-page-left-panel gtc-panel'>
          <div class='weight-balance-config-page-value-row'>
            <div class='weight-balance-config-page-value-row-title'>Basic Empty<br />Weight</div>
            <NumberUnitDisplay
              value={this.basicEmptyWeightValue}
              displayUnit={this.unitsSettingManager.weightUnits}
              formatter={WEIGHT_FORMATTER}
              class='weight-balance-config-page-value-row-value'
            />
          </div>
          <div class='weight-balance-config-page-value-row'>
            <div class='weight-balance-config-page-value-row-title'>Basic Empty<br />{this.props.weightBalanceConfig.armLabelShort}</div>
            <NumberUnitDisplay
              value={this.basicEmptyArmValue}
              displayUnit={this.armUnit}
              formatter={ARM_FORMATTER}
              class='weight-balance-config-page-value-row-value'
            />
          </div>
          {this.basicEmptyMacValueText !== undefined && (
            <div class='weight-balance-config-page-value-row'>
              <div class='weight-balance-config-page-value-row-title'>Basic Empty<br />MAC</div>
              <div class='weight-balance-config-page-value-row-value'>{this.basicEmptyMacValueText}%</div>
            </div>
          )}
        </div>
        <div class='weight-balance-config-page-list-panel gtc-panel'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            data={this.loadStationArray}
            renderItem={this.renderLoadStationItem.bind(this)}
            itemsPerPage={5}
            listItemHeightPx={this.props.gtcService.isHorizontal ? 136 : 72}
            listItemSpacingPx={this.props.gtcService.isHorizontal ? 2 : 1}
            maxRenderedItemCount={25}
            sidebarState={this._sidebarState}
            class='weight-balance-config-page-list'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders a load station list item.
   * @param def The definition for the list item's load station.
   * @returns A load station list item, as a VNode.
   */
  private renderLoadStationItem(def: WeightBalanceLoadStationDef): VNode {
    const enabledSetting = this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEnabled_${def.id}`);

    return (
      <GtcListItem hideBorder class='weight-balance-page-list-item'>
        <GtcToggleTouchButton
          state={enabledSetting}
          label={def.name}
          isEnabled={def.isEnabledEditable}
          gtcOrientation={this.props.gtcService.orientation}
          isInList
          class='weight-balance-page-list-item-toggle-button'
        />
        <GtcTouchButton
          label='Settings'
          onPressed={this.onSettingsButtonPressed.bind(this, def)}
          gtcOrientation={this.props.gtcService.orientation}
          isInList
          class='weight-balance-page-list-item-settings-button'
        />
      </GtcListItem>
    );
  }

  /**
   * Renders the settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The settings popup, as a VNode.
   */
  private renderSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcWeightBalanceConfigSettingsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        weightBalanceConfig={this.props.weightBalanceConfig}
        weightBalanceSettingManager={this.props.weightBalanceSettingManager}
        weightUnit={this.unitsSettingManager.weightUnits}
        armUnit={this.armUnit}
      />
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
 * Component props for {@link GtcWeightBalanceConfigSettingsPopup}.
 */
interface GtcWeightBalanceConfigSettingsPopupProps extends GtcViewProps {
  /** A weight and balance configuration object. */
  weightBalanceConfig: WeightBalanceConfig;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager: WeightBalanceUserSettingManager;

  /** The unit type in which to display weight values. */
  weightUnit: Subscribable<Unit<UnitFamily.Weight>>;

  /** The unit type in which to display moment arm values. */
  armUnit: Subscribable<Unit<UnitFamily.Distance>>;
}

/**
 * A GTC weight and balance configuration settings popup.
 */
class GtcWeightBalanceConfigSettingsPopup extends GtcView<GtcWeightBalanceConfigSettingsPopupProps> {
  private thisNode?: VNode;

  private readonly isEmptyWeightEnabled = Subject.create(false);
  private readonly emptyWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly isArmEnabled = Subject.create(false);
  private readonly armValue = NumberUnitSubject.create(UnitType.INCH.createNumber(0));

  private loadStationDef?: WeightBalanceLoadStationDef;
  private readonly loadStationPipes: Subscription[] = [];

  private isResumed = false;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /**
   * Sets the load station controlled by this popup.
   * @param def The definition for the load station to set.
   */
  public setLoadStation(def: WeightBalanceLoadStationDef): void {
    if (def.id === this.loadStationDef?.id) {
      return;
    }

    for (const pipe of this.loadStationPipes) {
      pipe.destroy();
    }
    this.loadStationPipes.length = 0;

    this.loadStationDef = def;

    this._title.set(`${def.name} Settings`);

    this.loadStationPipes.push(
      this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEmptyWeight_${def.id}`).pipe(this.emptyWeightValue, !this.isResumed),
      this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEmptyArm_${def.id}`).pipe(this.armValue, !this.isResumed)
    );

    this.isEmptyWeightEnabled.set(def.isEmptyWeightEditable);
    this.isArmEnabled.set(def.isArmEditable);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.isResumed = true;
    for (const pipe of this.loadStationPipes) {
      pipe.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    this.isResumed = false;
    for (const pipe of this.loadStationPipes) {
      pipe.pause();
    }
  }

  /**
   * Responds to when this popup's empty weight button is pressed.
   */
  private async onEmptyWeightButtonPressed(): Promise<void> {
    if (!this.loadStationDef) {
      return;
    }

    const setting = this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEmptyWeight_${this.loadStationDef.id}`);

    const unitType = this.props.weightUnit.get();
    const result = await this.props.gtcService.openPopup<GtcWeightDialog>(GtcViewKeys.WeightDialog1, 'normal', 'hide')
      .ref.request({
        title: `${this.loadStationDef.name} Empty Weight`,
        initialValue: setting.value,
        initialUnit: UnitType.POUND,
        unitType,
        maximumValue: UnitType.POUND.convertTo(this.loadStationDef.maxEmptyWeight, unitType)
      });

    if (!result.wasCancelled) {
      setting.value = result.payload.unit.convertTo(result.payload.value, UnitType.POUND);
    }
  }

  /**
   * Responds to when this popup's empty weight button is pressed.
   */
  private async onArmButtonPressed(): Promise<void> {
    if (!this.loadStationDef) {
      return;
    }

    const emptyArmSetting = this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationEmptyArm_${this.loadStationDef.id}`);
    const loadArmSetting = this.props.weightBalanceSettingManager.getSetting(`weightBalanceLoadStationLoadArm_${this.loadStationDef.id}`);

    const unitType = this.props.armUnit.get();
    const result = await this.props.gtcService.openPopup<GtcMomentArmDialog>(GtcViewKeys.MomentArmDialog, 'normal', 'hide')
      .ref.request({
        title: `${this.loadStationDef.name} Arm`,
        initialValue: emptyArmSetting.value,
        initialUnit: UnitType.INCH,
        unitType,
        minimumValue: UnitType.INCH.convertTo(this.loadStationDef.armRange[0], unitType),
        maximumValue: UnitType.INCH.convertTo(this.loadStationDef.armRange[1], unitType)
      });

    if (!result.wasCancelled) {
      const value = result.payload.unit.convertTo(result.payload.value, UnitType.INCH);
      emptyArmSetting.value = value;
      loadArmSetting.value = value;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    // TODO: We have no references for this popup, so everything here is just a guess.
    return (
      <div class='weight-balance-config-settings-popup gtc-popup-panel'>
        <GtcValueTouchButton
          state={this.emptyWeightValue}
          label='Empty Weight'
          renderValue={
            <NumberUnitDisplay
              value={this.emptyWeightValue}
              displayUnit={this.props.weightUnit}
              formatter={WEIGHT_FORMATTER}
            />
          }
          isEnabled={this.isEmptyWeightEnabled}
          onPressed={this.onEmptyWeightButtonPressed.bind(this)}
          class='weight-balance-config-settings-popup-button weight-balance-config-settings-popup-weight-button'
        />
        <GtcValueTouchButton
          state={this.armValue}
          label='Arm'
          renderValue={
            <NumberUnitDisplay
              value={this.armValue}
              displayUnit={this.props.armUnit}
              formatter={ARM_FORMATTER}
            />
          }
          isEnabled={this.isArmEnabled}
          onPressed={this.onArmButtonPressed.bind(this)}
          class='weight-balance-config-settings-popup-button weight-balance-config-settings-popup-arm-button'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const pipe of this.loadStationPipes) {
      pipe.destroy();
    }

    super.destroy();
  }
}
