import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, FSComponent, MagVar,
  MathUtils,
  MutableSubscribable, NumberFormatter, NumberUnitSubject, OneWayRunway, Subject, Subscribable,
  SubscribableMapFunctions, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';
import { AirportWaypoint, BearingDisplay, NumberUnitDisplay, UnitsAltitudeSettingMode, UnitsDistanceSettingMode, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, ToldUserSettingTypes } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcAltitudeDialog } from '../../Dialog/GtcAltitudeDialog';
import { GtcCourseDialog } from '../../Dialog/GtcCourseDialog';
import { GtcRunwayLengthDialog } from '../../Dialog/GtcRunwayLengthDialog';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcRunwayGradientDialog } from './GtcRunwayGradientDialog';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';
import { GtcToldOriginDestDisplay } from './GtcToldOriginDestDisplay';

import './GtcToldDataPageRunwayTab.css';

/**
 * Component props for GtcToldDataPageRunwayTab.
 */
export interface GtcToldDataPageRunwayTabProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The GTC control mode to which the view belongs. */
  controlMode: GtcControlMode;

  /** The index of the display pane that this view is tied to. */
  displayPaneIndex?: ControllableDisplayPaneIndex;

  /** The selected origin airport. */
  selectedAirport: Subscribable<AirportWaypoint | null>;

  /** The selected origin runway. */
  selectedRunway: MutableSubscribable<OneWayRunway | null>;

  /** The magnetic variation, in degrees, at the selected runway or airport. */
  magVar: Subscribable<number>;

  /** A manager for TOLD performance calculation user settings. */
  toldSettingManager: UserSettingManager<ToldUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the tab is for the takeoff data page. */
  isTakeoff: boolean;
}

/**
 * GTC view keys for popups owned by TOLD data page runway tabs.
 */
enum GtcToldDataPageRunwayTabPopupKeys {
  RunwayGradientDialog = 'RunwayGradientDialog'
}

/**
 * A GTC TOLD (takeoff/landing) data page runway tab.
 */
export class GtcToldDataPageRunwayTab extends DisplayComponent<GtcToldDataPageRunwayTabProps> implements GtcToldDataPageTabContent {
  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly LENGTH_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  private static readonly ELEVATION_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  private static readonly GRADIENT_FORMATTER = (value: number): string => {
    if (isNaN(value)) {
      return '_.__%';
    }

    const abs = Math.abs(value);
    return `${abs.toFixed(2)}% ${value < 0 ? 'Down' : 'Up'}`;
  };

  private static readonly MAX_ELEVATION_FEET = 99999;
  private static readonly MAX_ELEVATION_METERS = 30479;

  private thisNode?: VNode;

  private readonly settingString = this.props.isTakeoff ? 'Takeoff' : 'Landing';

  private readonly lengthSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}RunwayLength`);
  private readonly elevationSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}RunwayElevation`);
  private readonly headingSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}RunwayHeading`);
  private readonly gradientSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}RunwayGradient`);

  private readonly length = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly elevation = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly heading = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly gradient = Subject.create(NaN);

  private readonly canLoadRunway = this.props.selectedRunway.map(runway => runway !== null).pause();
  private readonly canEditParameters = this.canLoadRunway.map(SubscribableMapFunctions.not());

  private magVarSub?: Subscription;
  private lengthPipe?: Subscription;
  private elevationPipe?: Subscription;
  private headingPipe?: Subscription;
  private gradientPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcToldDataPageRunwayTabPopupKeys.RunwayGradientDialog,
      this.props.controlMode,
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcRunwayGradientDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.magVarSub = this.props.magVar.sub(magVar => {
      this.heading.set(this.heading.get().number, magVar);
    }, true);

    this.lengthPipe = this.lengthSetting.pipe(this.length, value => value < 0 ? NaN : value, true);
    this.elevationPipe = this.elevationSetting.pipe(this.elevation, value => value <= Number.MIN_SAFE_INTEGER ? NaN : value, true);
    this.headingPipe = this.headingSetting.pipe(this.heading, value => value < 0 ? NaN : value, true);
    this.gradientPipe = this.gradientSetting.pipe(this.gradient, value => value === Number.MIN_SAFE_INTEGER ? NaN : value / 100, true);
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritdoc */
  public onPause(): void {
    this.canLoadRunway.pause();
    this.lengthPipe?.pause();
    this.elevationPipe?.pause();
    this.headingPipe?.pause();
    this.gradientPipe?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.canLoadRunway.resume();
    this.lengthPipe?.resume(true);
    this.elevationPipe?.resume(true);
    this.headingPipe?.resume(true);
    this.gradientPipe?.resume(true);
  }

  /**
   * Loads database runway data into this tab's parameters.
   */
  private loadFromDatabase(): void {
    const runway = this.props.selectedRunway.get();

    if (runway === null) {
      return;
    }

    const length = runway.length - (this.props.isTakeoff ? 0 : runway.startThresholdLength);

    this.lengthSetting.value = UnitType.METER.convertTo(length, UnitType.FOOT);
    this.elevationSetting.value = UnitType.METER.convertTo(runway.elevation, UnitType.FOOT);
    this.headingSetting.value = runway.course;
    this.gradientSetting.value = runway.gradient * 100;
  }

  /**
   * Removes the selected runway.
   */
  private removeRunway(): void {
    this.props.selectedRunway.set(null);
  }

  /**
   * Opens a dialog chain to select this tab's runway length parameter.
   */
  private async selectLength(): Promise<void> {
    const unitsMode = this.props.unitsSettingManager.getSetting('unitsDistance').value === UnitsDistanceSettingMode.Metric ? 'meters' : 'feet';

    const result = await this.props.gtcService.openPopup<GtcRunwayLengthDialog>(GtcViewKeys.RunwayLengthDialog)
      .ref.request({
        title: 'Runway Length',
        initialValue: Math.max(this.lengthSetting.value, 0),
        initialUnit: UnitType.FOOT,
        unitsMode
      });

    if (!result.wasCancelled) {
      this.lengthSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.FOOT);
    }
  }

  /**
   * Opens a dialog chain to select this tab's runway elevation parameter.
   */
  private async selectElevation(): Promise<void> {
    const unitsMode = this.props.unitsSettingManager.getSetting('unitsAltitude').value === UnitsAltitudeSettingMode.Meters ? 'meters' : 'feet';
    const maximumValue = unitsMode === 'feet' ? GtcToldDataPageRunwayTab.MAX_ELEVATION_FEET : GtcToldDataPageRunwayTab.MAX_ELEVATION_METERS;

    const result = await this.props.gtcService.openPopup<GtcAltitudeDialog>(GtcViewKeys.AltitudeDialog1)
      .ref.request({
        title: 'Runway Elevation',
        initialValue: Math.max(this.elevationSetting.value, 0),
        initialUnit: UnitType.FOOT,
        unitsMode,
        minimumValue: 0,
        maximumValue
      });

    if (!result.wasCancelled) {
      this.elevationSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.FOOT);
    }
  }

  /**
   * Opens a dialog chain to select this tab's runway heading parameter.
   */
  private async selectHeading(): Promise<void> {
    // Convert the initial heading to magnetic or true degrees depending on the current nav angle setting.
    // If the heading is uninitialized, then set the initial value to 0 (360) degrees in the current nav angle unit.
    const isMagnetic = this.props.unitsSettingManager.navAngleUnits.get().isMagnetic();
    const initialValueTrueDeg = Math.max(0, this.headingSetting.value);
    const initialValue = Math.round(
      isMagnetic ? MagVar.trueToMagnetic(initialValueTrueDeg, this.props.magVar.get()) : initialValueTrueDeg
    ) % 360;

    const result = await this.props.gtcService.openPopup<GtcCourseDialog>(GtcViewKeys.CourseDialog)
      .ref.request({
        title: 'Runway Heading',
        initialValue: initialValue === 0 ? 360 : initialValue
      });

    if (!result.wasCancelled) {
      this.headingSetting.value = isMagnetic
        ? MagVar.magneticToTrue(result.payload, this.props.magVar.get())
        : result.payload;
    }
  }

  /**
   * Opens a dialog chain to select this tab's runway gradient parameter.
   */
  private async selectGradient(): Promise<void> {
    const initialValue = this.gradientSetting.value === Number.MIN_SAFE_INTEGER
      ? 0
      : MathUtils.clamp(this.gradientSetting.value, -999, 999);

    const result = await this.props.gtcService.openPopup<GtcRunwayGradientDialog>(GtcToldDataPageRunwayTabPopupKeys.RunwayGradientDialog)
      .ref.request({
        title: 'Runway Gradient',
        initialValue
      });

    if (!result.wasCancelled) {
      this.gradientSetting.value = result.payload;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-data-page-runway'>
        <div class='told-data-page-runway-left'>
          <GtcToldOriginDestDisplay
            selectedAirport={this.props.selectedAirport}
            selectedRunway={this.props.selectedRunway}
            runwayLengthDisplayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
            includeDisplacedThreshold={this.props.isTakeoff}
          />
          <div class='told-data-page-runway-left-buttons'>
            <GtcTouchButton
              label='Reload<br>from<br>Database'
              isEnabled={this.canLoadRunway}
              onPressed={this.loadFromDatabase.bind(this)}
              class='told-data-page-runway-left-button'
            />
            <GtcTouchButton
              label='Remove<br>Runway'
              isEnabled={this.canLoadRunway}
              onPressed={this.removeRunway.bind(this)}
              class='told-data-page-runway-left-button'
            />
          </div>
        </div>
        <div class='told-data-page-runway-right gtc-panel'>
          <GtcValueTouchButton
            state={this.length}
            label={this.props.isTakeoff ? 'Takeoff Run Available' : 'Landing DIS Available'}
            renderValue={
              <NumberUnitDisplay
                value={this.length}
                displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                formatter={GtcToldDataPageRunwayTab.LENGTH_FORMATTER}
              />
            }
            onPressed={this.selectLength.bind(this)}
            class='told-data-page-runway-right-button told-data-page-runway-length-button'
          />
          <GtcValueTouchButton
            state={this.elevation}
            label='Runway Elevation'
            renderValue={
              <NumberUnitDisplay
                value={this.elevation}
                displayUnit={this.props.unitsSettingManager.altitudeUnits}
                formatter={GtcToldDataPageRunwayTab.ELEVATION_FORMATTER}
              />
            }
            isEnabled={this.canEditParameters}
            onPressed={this.selectElevation.bind(this)}
            class='told-data-page-runway-right-button told-data-page-runway-elevation-button'
          />
          <GtcValueTouchButton
            state={this.heading}
            label='Runway Heading'
            renderValue={
              <BearingDisplay
                value={this.heading}
                displayUnit={this.props.unitsSettingManager.navAngleUnits}
                formatter={GtcToldDataPageRunwayTab.BEARING_FORMATTER}
              />
            }
            isEnabled={this.canEditParameters}
            onPressed={this.selectHeading.bind(this)}
            class='told-data-page-runway-right-button told-data-page-runway-heading-button'
          />
          <GtcValueTouchButton
            state={this.gradient}
            label='Runway Gradient'
            renderValue={GtcToldDataPageRunwayTab.GRADIENT_FORMATTER}
            isEnabled={this.canEditParameters}
            onPressed={this.selectGradient.bind(this)}
            class='told-data-page-runway-right-button told-data-page-runway-gradient-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.canLoadRunway.destroy();

    this.magVarSub?.destroy();
    this.lengthPipe?.destroy();
    this.elevationPipe?.destroy();
    this.headingPipe?.destroy();
    this.gradientPipe?.destroy();

    super.destroy();
  }
}