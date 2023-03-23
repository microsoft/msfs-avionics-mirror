import {
  BasicNavAngleSubject, BasicNavAngleUnit, CombinedSubject, ComponentProps, DisplayComponent, FSComponent, MathUtils,
  NumberFormatter, NumberUnitSubject, ObjectSubject, SetSubject, Subject, Subscribable, SubscribableMapFunctions, Subscription,
  UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { UnitsUserSettingManager } from '../../../settings';
import { WindDataProvider } from '../../../wind/WindDataProvider';
import { BearingDisplay } from '../../common/BearingDisplay';
import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';

/**
 * Next-generation (NXi, G3000, etc) Garmin PFD wind display options.
 */
export enum WindDisplayOption {
  Option1 = 1,
  Option2 = 2,
  Option3 = 3
}

/**
 * Component props for WindDisplay.
 */
export interface WindDisplayProps extends ComponentProps {
  /** A provider of wind data. */
  dataProvider: WindDataProvider;

  /** The wind option to display. */
  option: Subscribable<WindDisplayOption>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD wind display.
 */
export class WindDisplay extends DisplayComponent<WindDisplayProps> {
  private readonly option1Ref = FSComponent.createRef<WindOption1>();
  private readonly option2Ref = FSComponent.createRef<WindOption2>();
  private readonly option3Ref = FSComponent.createRef<WindOption3>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly noDataStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['wind']);

  private readonly option1Declutter = Subject.create(true);
  private readonly option2Declutter = Subject.create(true);
  private readonly option3Declutter = Subject.create(true);

  private declutterSub?: Subscription;
  private isDeadReckoningSub?: Subscription;
  private isDataFailedSub?: Subscription;
  private optionSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const optionSub = this.optionSub = this.props.option.sub(option => {
      this.option1Declutter.set(option !== WindDisplayOption.Option1);
      this.option2Declutter.set(option !== WindDisplayOption.Option2);
      this.option3Declutter.set(option !== WindDisplayOption.Option3);
    }, false, true);

    const isDeadReckoningSub = this.isDeadReckoningSub = this.props.dataProvider.isGpsDeadReckoning.sub(isDr => {
      this.rootCssClass.toggle('dead-reckoning', isDr);
    }, false, true);

    const isDataFailedSub = this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isFailed => {
      if (isFailed) {
        this.noDataStyle.set('display', '');

        optionSub.pause();
        this.option1Declutter.set(true);
        this.option2Declutter.set(true);
        this.option3Declutter.set(true);
      } else {
        this.noDataStyle.set('display', 'none');

        optionSub.resume(true);
      }
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');

        isDeadReckoningSub.pause();
        isDataFailedSub.pause();
        optionSub.pause();
      } else {
        this.rootStyle.set('display', '');

        isDeadReckoningSub.resume(true);
        isDataFailedSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <WindOption1 ref={this.option1Ref} dataProvider={this.props.dataProvider} unitsSettingManager={this.props.unitsSettingManager} declutter={this.option1Declutter} />
        <WindOption2 ref={this.option2Ref} dataProvider={this.props.dataProvider} unitsSettingManager={this.props.unitsSettingManager} declutter={this.option2Declutter} />
        <WindOption3 ref={this.option3Ref} dataProvider={this.props.dataProvider} unitsSettingManager={this.props.unitsSettingManager} declutter={this.option3Declutter} />
        <div class='wind-no-data' style={this.noDataStyle}>NO WIND DATA</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.option1Ref.getOrDefault()?.destroy();
    this.option2Ref.getOrDefault()?.destroy();
    this.option3Ref.getOrDefault()?.destroy();

    this.declutterSub?.destroy();
    this.isDeadReckoningSub?.destroy();
    this.isDataFailedSub?.destroy();
    this.optionSub?.destroy();

    super.destroy();
  }
}

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
 * An option 1 display for a next-generation (NXi, G3000, etc) Garmin PFD wind display.
 */
class WindOption1 extends DisplayComponent<WindOptionProps> {
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

  private readonly headwindRounded = this.props.dataProvider.headwind.map(SubscribableMapFunctions.withPrecision(1));
  private readonly crosswindRounded = this.props.dataProvider.crosswind.map(SubscribableMapFunctions.withPrecision(1));

  private readonly headwindSign = this.headwindRounded.map(headwind => Math.sign(headwind));
  private readonly crosswindSign = this.crosswindRounded.map(crosswind => Math.sign(crosswind));

  private readonly headwindText = this.headwindRounded.map(SubscribableMapFunctions.abs());
  private readonly crosswindText = this.crosswindRounded.map(SubscribableMapFunctions.abs());

  private declutterSub?: Subscription;

  /** @inheritdoc */
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

        this.headwindRounded.pause();
        this.crosswindRounded.pause();
      } else {
        this.rootStyle.set('display', '');

        this.headwindRounded.resume();
        this.crosswindRounded.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='wind-option1' style={this.rootStyle}>
        <div class='wind-option1-arrows'>
          <svg viewBox='-13 -13 26 26' class='wind-option1-stem'>
            <rect x='-10' y='-1' width='20' height='2' />
            <rect x='-1' y='-10' width='2' height='20' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-option1-arrow wind-option1-arrow-left' style={this.leftArrowStyle}>
            <path d='M -12 0 l 5 -5 l 0 10 z' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-option1-arrow wind-option1-arrow-top' style={this.topArrowStyle}>
            <path d='M 0 -12 l -5 5 l 10 0 z' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-option1-arrow wind-option1-arrow-right' style={this.rightArrowStyle}>
            <path d='M 12 0 l -5 5 l 0 -10 z' />
          </svg>
          <svg viewBox='-13 -13 26 26' class='wind-option1-arrow wind-option1-arrow-bottom' style={this.bottomArrowStyle}>
            <path d='M 0 12 l -5 -5 l 10 0 z' />
          </svg>
        </div>
        <div class='wind-option1-crosswind'>{this.crosswindText}</div>
        <div class='wind-option1-headwind'>{this.headwindText}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.headwindRounded.destroy();
    this.crosswindRounded.destroy();

    this.declutterSub?.destroy();

    super.destroy();
  }
}

/**
 * An option 2 display for a next-generation (NXi, G3000, etc) Garmin PFD wind display.
 */
class WindOption2 extends DisplayComponent<WindOptionProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly arrowStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly windDirectionRounded = this.props.dataProvider.windDirectionRelative.map(SubscribableMapFunctions.withPrecision(0.1));
  private readonly windSpeedRounded = this.props.dataProvider.windSpeed.map(SubscribableMapFunctions.withPrecision(1));

  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.windDirectionRounded.sub(direction => {
      this.arrowStyle.set('transform', `rotate3d(0, 0, 1, ${direction}deg)`);
    }, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');

        this.windDirectionRounded.pause();
        this.windSpeedRounded.pause();
      } else {
        this.rootStyle.set('display', '');

        this.windDirectionRounded.resume();
        this.windSpeedRounded.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='wind-option2' style={this.rootStyle}>
        <svg viewBox='-11.5 -11.5 23 23' class='wind-option2-arrow' style={this.arrowStyle}>
          <rect x='-1' y='-10.5' width='2' height='17.5' />
          <path d='M 5 5.5 l -5 5 l -5 -5 z' />
        </svg>
        <div class='wind-option2-speed'>{this.windSpeedRounded}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.windDirectionRounded.destroy();
    this.windSpeedRounded.destroy();

    this.declutterSub?.destroy();

    super.destroy();
  }
}

/**
 * An option 3 display for a next-generation (NXi, G3000, etc) Garmin PFD wind display.
 */
class WindOption3 extends DisplayComponent<WindOptionProps> {
  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3 });
  private static readonly SPEED_FORMATTER = NumberFormatter.create({});

  private readonly bearingRef = FSComponent.createRef<BearingDisplay>();
  private readonly speedRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly arrowStyle = ObjectSubject.create({
    transform: 'rotate3d(0, 0, 1, 0deg)'
  });

  private readonly windDirectionRelRounded = this.props.dataProvider.windDirectionRelative.map(SubscribableMapFunctions.withPrecision(0.1));

  private readonly windBearingState = CombinedSubject.create(
    this.props.dataProvider.windDirection,
    this.props.dataProvider.magVar
  );

  private readonly windBearing = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(0));
  private readonly windSpeed = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private declutterSub?: Subscription;
  private windSpeedPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.windBearingState.sub(([bearing, magVar]) => {
      this.windBearing.set(MathUtils.round(bearing, 0.5), MathUtils.round(magVar, 0.5));
    }, true);

    const windSpeedPipe = this.windSpeedPipe = this.props.dataProvider.windSpeed.pipe(this.windSpeed, SubscribableMapFunctions.withPrecision(1), true);

    this.windDirectionRelRounded.sub(direction => {
      this.arrowStyle.set('transform', `rotate3d(0, 0, 1, ${direction}deg)`);
    }, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');

        this.windBearingState.pause();
        this.windDirectionRelRounded.pause();
        windSpeedPipe.pause();
      } else {
        this.rootStyle.set('display', '');

        this.windBearingState.resume();
        this.windDirectionRelRounded.resume();
        windSpeedPipe.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='wind-option3' style={this.rootStyle}>
        <svg viewBox='-11.5 -11.5 23 23' class='wind-option3-arrow' style={this.arrowStyle}>
          <rect x='-1' y='-10.5' width='2' height='17.5' />
          <path d='M 5 5.5 l -5 5 l -5 -5 z' />
        </svg>
        <BearingDisplay
          ref={this.bearingRef}
          value={this.windBearing}
          displayUnit={this.props.unitsSettingManager.navAngleUnits}
          formatter={WindOption3.BEARING_FORMATTER}
          class='wind-option3-direction'
        />
        <NumberUnitDisplay
          ref={this.speedRef}
          value={this.windSpeed}
          displayUnit={null}
          formatter={WindOption3.SPEED_FORMATTER}
          class='wind-option3-speed'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.bearingRef.getOrDefault()?.destroy();
    this.speedRef.getOrDefault()?.destroy();

    this.windDirectionRelRounded.destroy();
    this.windBearingState.destroy();

    this.declutterSub?.destroy();
    this.windSpeedPipe?.destroy();

    super.destroy();
  }
}
