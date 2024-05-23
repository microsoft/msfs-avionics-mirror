import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, FSComponent, MappedSubject,
  NumberFormatter, NumberUnitSubject, ObjectSubject, Subject, Subscribable, SubscribableMapFunctions,
  Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager, WindDataProvider } from '@microsoft/msfs-garminsdk';

import { G3XBearingDisplay } from '../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { WindDisplaySettingMode, WindDisplayUserSettingTypes } from '../../../Shared/Settings/PfdUserSettings';

import './PfdWindDisplay.css';

/**
 * Component props for {@link PfdWindDisplay}.
 */
export interface PfdWindDisplayProps extends ComponentProps {
  /** A provider of wind data. */
  dataProvider: WindDataProvider;

  /** A manager for wind display user settings. */
  windDisplaySettingManager: UserSettingManager<WindDisplayUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3X Touch PFD wind display.
 */
export class PfdWindDisplay extends DisplayComponent<PfdWindDisplayProps> {
  private readonly headXWindOptionRef = FSComponent.createRef<HeadXWindOption>();
  private readonly speedDirOptionRef = FSComponent.createRef<SpeedDirOption>();

  private readonly hidden = MappedSubject.create(
    ([declutter, mode]) => declutter || mode === WindDisplaySettingMode.Off,
    this.props.declutter,
    this.props.windDisplaySettingManager.getSetting('windDisplayMode')
  );

  private readonly noDataHidden = Subject.create(false);

  private readonly headXWindOptionDeclutter = Subject.create(true);
  private readonly speedDirOptionDeclutter = Subject.create(true);

  private declutterSub?: Subscription;
  private isDeadReckoningSub?: Subscription;
  private isDataFailedSub?: Subscription;
  private displayModeSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    const displayModeSub = this.displayModeSub = this.props.windDisplaySettingManager.getSetting('windDisplayMode').sub(mode => {
      this.headXWindOptionDeclutter.set(mode !== WindDisplaySettingMode.HeadXWind);
      this.speedDirOptionDeclutter.set(mode !== WindDisplaySettingMode.SpeedDir);
    }, false, true);

    const isDataFailedSub = this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isFailed => {
      if (isFailed) {
        this.noDataHidden.set(false);

        displayModeSub.pause();
        this.headXWindOptionDeclutter.set(true);
        this.speedDirOptionDeclutter.set(true);
      } else {
        this.noDataHidden.set(true);

        displayModeSub.resume(true);
      }
    }, false, true);

    this.declutterSub = this.hidden.sub(hidden => {
      if (hidden) {
        isDataFailedSub.pause();
        displayModeSub.pause();
      } else {
        isDataFailedSub.resume(true);
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'wind-display': true, 'hidden': this.hidden }}>
        <HeadXWindOption
          ref={this.headXWindOptionRef}
          dataProvider={this.props.dataProvider}
          unitsSettingManager={this.props.unitsSettingManager}
          declutter={this.headXWindOptionDeclutter}
        />
        <SpeedDirOption
          ref={this.speedDirOptionRef}
          dataProvider={this.props.dataProvider}
          unitsSettingManager={this.props.unitsSettingManager}
          declutter={this.speedDirOptionDeclutter}
        />
        <div class={{ 'wind-display-wind-no-data': true, 'hidden': this.noDataHidden }}>NO WIND DATA</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.headXWindOptionRef.getOrDefault()?.destroy();
    this.speedDirOptionRef.getOrDefault()?.destroy();

    this.hidden.destroy();

    this.declutterSub?.destroy();
    this.isDeadReckoningSub?.destroy();
    this.isDataFailedSub?.destroy();
    this.displayModeSub?.destroy();

    super.destroy();
  }
}

const SPEED_FORMATTER = NumberFormatter.create({ precision: 1 });
const BEARING_FORMATTER = NumberFormatter.create({ precision: 1 });

/**
 * Component props for wind option displays.
 */
interface WindOptionProps extends ComponentProps {
  /** A provider of wind data. */
  dataProvider: WindDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * Headwind and crosswind display component.
 */
class HeadXWindOption extends DisplayComponent<WindOptionProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly topArrowStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly bottomArrowStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly leftArrowStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly rightArrowStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly headwindSign = this.props.dataProvider.headwind.map(headwind => Math.sign(headwind));
  private readonly crosswindSign = this.props.dataProvider.crosswind.map(crosswind => Math.sign(crosswind));

  private readonly headwindSpeedUnit = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  private readonly crosswindSpeedUnit = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly headwindSub: Subscription = this.props.dataProvider.headwind.map(SubscribableMapFunctions.abs()).pipe(this.headwindSpeedUnit);
  private readonly crosswindSub: Subscription = this.props.dataProvider.crosswind.map(SubscribableMapFunctions.abs()).pipe(this.crosswindSpeedUnit);

  private declutterSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {

    this.headwindSign.sub(headwindSign => {
      this.bottomArrowStyle.set('display', headwindSign > 0 ? '' : 'none');
      this.topArrowStyle.set('display', headwindSign < 0 ? '' : 'none');
    }, true);

    this.crosswindSign.sub(crosswindSign => {
      this.leftArrowStyle.set('display', crosswindSign > 0 ? '' : 'none');
      this.rightArrowStyle.set('display', crosswindSign < 0 ? '' : 'none');
    }, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');
        this.headwindSub.pause();
        this.crosswindSub.pause();
      } else {
        this.rootStyle.set('display', '');
        this.headwindSub.resume();
        this.crosswindSub.resume();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='wind-display-head-xwind' style={this.rootStyle}>
        <div class='wind-display-head-xwind-arrows'>
          <svg viewBox='-13 -13 26 26' class='wind-display-head-xwind-stem'>
            <rect x='-10' y='-1' width='20' height='2' />
            <rect x='-1' y='-10' width='2' height='20' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-display-head-xwind-arrow wind-display-head-xwind-arrow-left' style={this.leftArrowStyle}>
            <path d='M -12 0 l 5 -5 l 0 10 z' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-display-head-xwind-arrow wind-display-head-xwind-arrow-top' style={this.topArrowStyle}>
            <path d='M 0 -12 l -5 5 l 10 0 z' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-display-head-xwind-arrow wind-display-head-xwind-arrow-right' style={this.rightArrowStyle}>
            <path d='M 12 0 l -5 5 l 0 -10 z' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-display-head-xwind-arrow wind-display-head-xwind-arrow-bottom' style={this.bottomArrowStyle}>
            <path d='M 0 12 l -5 -5 l 10 0 z' />
          </svg>
        </div>
        <G3XNumberUnitDisplay
          class='wind-display-head-xwind-crosswind'
          value={this.crosswindSpeedUnit}
          formatter={SPEED_FORMATTER}
          displayUnit={this.props.unitsSettingManager.speedUnits}
          useBasicUnitFormat={true}
        />
        <G3XNumberUnitDisplay
          class='wind-display-head-xwind-headwind'
          value={this.headwindSpeedUnit}
          formatter={SPEED_FORMATTER}
          displayUnit={this.props.unitsSettingManager.speedUnits}
          useBasicUnitFormat={true}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {

    this.declutterSub?.destroy();
    this.crosswindSub.destroy();
    this.headwindSub.destroy();

    super.destroy();
  }
}

/**
 * Speed direction display component.
 */
class SpeedDirOption extends DisplayComponent<WindOptionProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly arrowStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly windDirectionNavAngleUnit = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly windSpeedRoundedSpeedUnit = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly windSpeedRoundedSub: Subscription = this.props.dataProvider.windSpeed.pipe(this.windSpeedRoundedSpeedUnit);
  private readonly windDirectionSub: Subscription = this.props.dataProvider.windDirection.pipe(this.windDirectionNavAngleUnit);
  private readonly windRelativeDirectionSub = this.props.dataProvider.windDirectionRelative.sub(direction => {
    this.arrowStyle.set('transform', `rotate3d(0, 0, 1, ${direction}deg)`);
  }, true);
  private readonly declutterSub: Subscription = this.props.declutter.sub(declutter => {
    if (declutter) {
      this.rootStyle.set('display', 'none');

      this.windRelativeDirectionSub.pause();
      this.windDirectionSub.pause();
      this.windSpeedRoundedSub.pause();
    } else {
      this.rootStyle.set('display', '');

      this.windRelativeDirectionSub.resume();
      this.windDirectionSub.resume();
      this.windSpeedRoundedSub.resume();
    }
  }, true);

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='wind-display-speed-direction' style={this.rootStyle}>
        <svg viewBox='-11.5 -11.5 23 23' class='wind-display-speed-direction-arrow' style={this.arrowStyle}>
          <rect x='-1' y='-10.5' width='2' height='17.5' />
          <path d='M 5 5.5 l -5 5 l -5 -5 z' />
        </svg>
        <G3XNumberUnitDisplay
          class='wind-display-speed-direction-speed'
          value={this.windSpeedRoundedSpeedUnit}
          formatter={SPEED_FORMATTER}
          displayUnit={this.props.unitsSettingManager.speedUnits}
          useBasicUnitFormat={true}
        />
        <G3XBearingDisplay
          class='wind-display-speed-direction-direction'
          value={this.windDirectionNavAngleUnit}
          displayUnit={this.props.unitsSettingManager.navAngleUnits}
          formatter={BEARING_FORMATTER}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.windDirectionSub.destroy();
    this.windSpeedRoundedSub.destroy();
    this.windRelativeDirectionSub.destroy();
    this.declutterSub.destroy();

    super.destroy();
  }
}