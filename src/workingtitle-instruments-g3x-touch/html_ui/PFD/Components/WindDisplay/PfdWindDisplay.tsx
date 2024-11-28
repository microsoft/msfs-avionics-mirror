import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent,
  FSComponent, MappedSubject, MutableSubscribable, NumberFormatter, NumberUnitSubject, Subject, Subscribable,
  Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { TouchButton, UnitsUserSettingManager, WindDataProvider } from '@microsoft/msfs-garminsdk';

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

  private readonly isVisible = MappedSubject.create(
    ([declutter, mode]) => !declutter && mode !== WindDisplaySettingMode.Off,
    this.props.declutter,
    this.props.windDisplaySettingManager.getSetting('windDisplayMode')
  );

  private readonly noDataHidden = Subject.create(false);

  private readonly headXWindOptionDeclutter = Subject.create(true);
  private readonly speedDirOptionDeclutter = Subject.create(true);

  private isAwake = false;

  private isVisibleSub?: Subscription;
  private isDataFailedSub?: Subscription;
  private displayModeSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.displayModeSub = this.props.windDisplaySettingManager.getSetting('windDisplayMode').sub(mode => {
      this.headXWindOptionDeclutter.set(mode !== WindDisplaySettingMode.HeadXWind);
      this.speedDirOptionDeclutter.set(mode !== WindDisplaySettingMode.SpeedDir);
    }, false, true);

    this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(this.onDataFailedChanged.bind(this), false, true);
    this.isVisibleSub = this.isVisible.sub(this.onVisibilityChanged.bind(this), true, !this.isAwake);
  }

  /**
   * Wakes this display. While this display is awake, it will automatically update itself.
   */
  public wake(): void {
    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.isVisibleSub?.resume(true);
  }

  /**
   * Puts this display to sleep. While this display is asleep, it is hidden and does not automatically update itself.
   */
  public sleep(): void {
    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    if (this.isVisibleSub) {
      this.isVisibleSub.pause();
      this.onVisibilityChanged(false);
    }
  }

  /**
   * Responds to when this display's visibility changes.
   * @param isVisible Whether this display is visible.
   */
  private onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.isDataFailedSub!.resume(true);
    } else {
      this.isDataFailedSub!.pause();
      this.displayModeSub!.pause();

      this.headXWindOptionDeclutter.set(true);
      this.speedDirOptionDeclutter.set(true);
    }
  }

  /**
   * Responds to when this display's wind data failure state changes.
   * @param isFailed Whether wind data in a failed state.
   */
  private onDataFailedChanged(isFailed: boolean): void {
    if (isFailed) {
      this.noDataHidden.set(false);

      this.displayModeSub!.pause();
      this.headXWindOptionDeclutter.set(true);
      this.speedDirOptionDeclutter.set(true);
    } else {
      this.noDataHidden.set(true);

      this.displayModeSub!.resume(true);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <TouchButton
        isVisible={this.isVisible}
        isEnabled={this.noDataHidden}
        class='pfd-touch-button wind-display'
      >
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
        <div class={{ 'wind-display-wind-no-data': true, 'hidden': this.noDataHidden }}>NO WIND<br />DATA</div>
      </TouchButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.headXWindOptionRef.getOrDefault()?.destroy();
    this.speedDirOptionRef.getOrDefault()?.destroy();

    this.isVisible.destroy();

    this.isVisibleSub?.destroy();
    this.isDataFailedSub?.destroy();
    this.displayModeSub?.destroy();

    super.destroy();
  }
}

const SPEED_FORMATTER = NumberFormatter.create({ precision: 1 });
const BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3 });

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
  private readonly display = Subject.create('');

  private readonly headwindArrowDisplay = Subject.create('');
  private readonly tailwindArrowDisplay = Subject.create('');
  private readonly leftXWindArrowDisplay = Subject.create('');
  private readonly rightXWindArrowDisplay = Subject.create('');

  private readonly headwindValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  private readonly crosswindValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly pauseable: Subscription[] = [];

  private declutterSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.pauseable.push(
      this.props.dataProvider.headwind.sub(
        this.onWindComponentChanged.bind(this, this.headwindValue, this.headwindArrowDisplay, this.tailwindArrowDisplay),
        false,
        true
      ),

      this.props.dataProvider.crosswind.sub(
        this.onWindComponentChanged.bind(this, this.crosswindValue, this.rightXWindArrowDisplay, this.leftXWindArrowDisplay),
        false,
        true
      ),
    );

    this.declutterSub = this.props.declutter.sub(this.onDeclutterChanged.bind(this), true);
  }

  /**
   * Responds to when whether this component is decluttered changes.
   * @param declutter Whether this component is decluttered.
   */
  private onDeclutterChanged(declutter: boolean): void {
    if (declutter) {
      this.display.set('none');

      for (const sub of this.pauseable) {
        sub.pause();
      }
    } else {
      this.display.set('');

      for (const sub of this.pauseable) {
        sub.resume(true);
      }
    }
  }

  /**
   * Responds to when a wind component speed changes.
   * @param speedVal A mutable subscribable that controls the value of the component speed readout.
   * @param positiveArrowDisplay A mutable subscribable that controls the display of the arrow head that depicts
   * positive component speeds.
   * @param negativeArrowDisplay A mutable subscribable that controls the display of the arrow head that depicts
   * negative component speeds.
   * @param speed The new wind component speed, in knots.
   */
  private onWindComponentChanged(
    speedVal: MutableSubscribable<any, number>,
    positiveArrowDisplay: MutableSubscribable<any, string>,
    negativeArrowDisplay: MutableSubscribable<any, string>,
    speed: number
  ): void {
    const speedAbs = Math.abs(speed);
    speedVal.set(speedAbs);

    if (speedAbs < 0.5) {
      positiveArrowDisplay.set('none');
      negativeArrowDisplay.set('none');
    } else {
      positiveArrowDisplay.set(speed > 0 ? '' : 'none');
      negativeArrowDisplay.set(speed < 0 ? '' : 'none');
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='wind-display-head-xwind' style={{ 'display': this.display }}>
        <div class='wind-display-head-xwind-arrows'>
          <svg viewBox='-15 -15 30 30' class='wind-display-head-xwind-arrow-stems'>
            <path d='M -8 0 h 16' class='wind-display-arrow-stem' />
            <path d='M 0 -8 v 16' class='wind-display-arrow-stem' />
          </svg>
          <svg viewBox='-15 -15 30 30' class='wind-display-head-xwind-arrow-head' style={{ 'display': this.leftXWindArrowDisplay }}>
            <path d='M 0 -15 l 5 9 l -5 -1.5 l -5 1.5 z' transform='rotate(90)' class='wind-display-arrow-head' />
          </svg>
          <svg viewBox='-15 -15 30 30' class='wind-display-head-xwind-arrow-head' style={{ 'display': this.rightXWindArrowDisplay }}>
            <path d='M 0 -15 l 5 9 l -5 -1.5 l -5 1.5 z' transform='rotate(270)' class='wind-display-arrow-head' />
          </svg>
          <svg viewBox='-15 -15 30 30' class='wind-display-head-xwind-arrow-head' style={{ 'display': this.tailwindArrowDisplay }}>
            <path d='M 0 -15 l 5 9 l -5 -1.5 l -5 1.5 z' class='wind-display-arrow-head' />
          </svg>
          <svg viewBox='-15 -15 30 30' class='wind-display-head-xwind-arrow-head' style={{ 'display': this.headwindArrowDisplay }}>
            <path d='M 0 -15 l 5 9 l -5 -1.5 l -5 1.5 z' transform='rotate(180)' class='wind-display-arrow-head' />
          </svg>
        </div>
        <G3XNumberUnitDisplay
          value={this.crosswindValue}
          formatter={SPEED_FORMATTER}
          displayUnit={this.props.unitsSettingManager.speedUnits}
          useBasicUnitFormat
          class='wind-display-speed-value wind-display-head-xwind-crosswind-value'
        />
        <G3XNumberUnitDisplay
          value={this.headwindValue}
          formatter={value => SPEED_FORMATTER(value).padStart(3, ' ')}
          displayUnit={this.props.unitsSettingManager.speedUnits}
          useBasicUnitFormat
          class='wind-display-speed-value wind-display-head-xwind-headwind-value'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.pauseable) {
      sub.destroy();
    }

    this.declutterSub?.destroy();

    super.destroy();
  }
}

/**
 * Speed direction display component.
 */
class SpeedDirOption extends DisplayComponent<WindOptionProps> {
  private readonly display = Subject.create('');

  private readonly arrowTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));

  private readonly windDirectionNavAngleUnit = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly windSpeedRoundedSpeedUnit = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly pauseable: Subscription[] = [];

  private declutterSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.pauseable.push(
      this.props.dataProvider.windDirectionRelative.sub(this.onWindDirectionChanged.bind(this), false, true),
      this.props.dataProvider.windSpeed.pipe(this.windSpeedRoundedSpeedUnit, true),
      this.props.dataProvider.windDirection.pipe(this.windDirectionNavAngleUnit, true)
    );

    this.declutterSub = this.props.declutter.sub(this.onDeclutterChanged.bind(this), true);
  }

  /**
   * Responds to when whether this component is decluttered changes.
   * @param declutter Whether this component is decluttered.
   */
  private onDeclutterChanged(declutter: boolean): void {
    if (declutter) {
      this.display.set('none');

      for (const sub of this.pauseable) {
        sub.pause();
      }
    } else {
      this.display.set('');

      for (const sub of this.pauseable) {
        sub.resume(true);
      }
    }
  }

  /**
   * Responds to when the wind direction relative to aircraft heading changes.
   * @param direction The new wind direction relative to aircraft heading, in degrees.
   */
  private onWindDirectionChanged(direction: number): void {
    this.arrowTransform.transform.set(0, 0, 1, direction, 0.1);
    this.arrowTransform.resolve();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='wind-display-speed-direction' style={{ 'display': this.display }}>
        <div class='wind-display-speed-direction-arrow-container'>
          <svg viewBox='-13 -13 26 26' class='wind-display-speed-direction-arrow' style={{ 'transform': this.arrowTransform }}>
            <path d='M -0 -13 v 19' class='wind-display-arrow-stem' />
            <path d='M 0 13 l -5 -9 l 5 1.5 l 5 -1.5 z' class='wind-display-arrow-head' />
          </svg>
        </div>
        <G3XNumberUnitDisplay
          value={this.windSpeedRoundedSpeedUnit}
          formatter={SPEED_FORMATTER}
          displayUnit={this.props.unitsSettingManager.speedUnits}
          useBasicUnitFormat
          class='wind-display-speed-value'
        />
        <G3XBearingDisplay
          value={this.windDirectionNavAngleUnit}
          displayUnit={this.props.unitsSettingManager.navAngleUnits}
          formatter={BEARING_FORMATTER}
          useBasicUnitFormat
          class='wind-display-bearing-value'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.pauseable) {
      sub.destroy();
    }

    this.declutterSub?.destroy();

    super.destroy();
  }
}