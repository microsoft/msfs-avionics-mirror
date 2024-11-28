import {
  BitFlags, ComponentProps, CssTransformBuilder, CssTransformSubject, DigitScroller, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, MathUtils,
  MutableSubscribable, NodeReference, NumberFormatter, NumberUnitSubject, ObjectSubject, SetSubject, SubEvent, Subject,
  Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord,
  UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { VSpeedUserSettingTypes, VSpeedUserSettingUtils } from '../../../settings/VSpeedUserSettings';
import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';
import { AirspeedDefinition } from './AirspeedDefinition';
import { AirspeedDefinitionFactory } from './AirspeedDefinitionFactory';
import { AirspeedIndicatorColorRange, AirspeedIndicatorColorRangeColor, AirspeedIndicatorColorRangeWidth } from './AirspeedIndicatorColorRange';
import { AirspeedAlert, AirspeedIndicatorDataProvider } from './AirspeedIndicatorDataProvider';
import { VSpeedAnnunciation, VSpeedAnnunciationDataProvider } from './VSpeedAnnunciationDataProvider';
import { VSpeedBugColor, VSpeedBugDefinition } from './VSpeedBugDefinition';

/**
 * Scale options for an airspeed tape.
 */
export type AirspeedTapeScaleOptions = Pick<AirspeedTapeProps, 'minimum' | 'maximum' | 'window' | 'majorTickInterval' | 'minorTickFactor'>;

/**
 * Options for an airspeed trend vector.
 */
export type AirspeedTrendVectorOptions = Pick<AirspeedTapeProps, 'trendThreshold'>;

/**
 * Options for airspeed alerts.
 */
export type AirspeedAlertOptions = {
  /** Whether to support the overspeed alert. */
  supportOverspeed: boolean;

  /** Whether to support the trend overspeed alert. */
  supportTrendOverspeed: boolean;

  /** Whether to support the underspeed alert. */
  supportUnderspeed: boolean;

  /** Whether to suppor the trend underspeed alert. */
  supportTrendUnderspeed: boolean;
};

/**
 * Modes for an airspeed indicator's bottom display box.
 */
export enum AirspeedIndicatorBottomDisplayMode {
  TrueAirspeed = 'Tas',
  Mach = 'Mach'
}

/**
 * Options for an airspeed indicator's bottom display box.
 */
export type AirspeedIndicatorBottomDisplayOptions = {
  /** The display mode. */
  mode: AirspeedIndicatorBottomDisplayMode;

  /** The minimum mach number required to display the box, if it is in mach display mode. Defaults to `0`. */
  machThreshold?: number | Subscribable<number>;
};

/**
 * Options for an airspeed indicator's displayed reference V-speed bugs.
 */
export type VSpeedBugOptions = {
  /** A user setting manager containing reference V-speed settings. */
  vSpeedSettingManager: UserSettingManager<VSpeedUserSettingTypes>;

  /** An iterable of definitions for each displayed reference V-speed bug. */
  vSpeedBugDefinitions: Iterable<VSpeedBugDefinition>;

  /** Whether to allow V-speed bugs to be displayed with a speed value of zero. */
  allowZeroValue?: boolean;
};

/**
 * Options for an airspeed indicator's approach cue bug.
 */
export type AirspeedApproachCueBugOptions = {
  /**
   * A factory that generates the speed value of the bug, in knots. If the speed value is `NaN`, then the bug will be
   * hidden.
   */
  speed: AirspeedDefinitionFactory;
};

/**
 * Component props for {@link AirspeedIndicator}.
 */
export interface AirspeedIndicatorProps extends ComponentProps {
  /** A data provider for the indicator. */
  dataProvider: AirspeedIndicatorDataProvider;

  /** A provider of V-speed annunciation data. If not defined, the indicator will not display V-speed annunciations. */
  vSpeedAnnunciationDataProvider?: VSpeedAnnunciationDataProvider;

  /**
   * Whether the indicator should be decluttered due to unusual attitudes. When decluttered, the following features are
   * hidden:
   * * Airspeed reference display
   * * Airspeed protection annunciations
   */
  declutter: Subscribable<boolean>;

  /**
   * Whether the indicator should be shown in simplified mode. In simplified mode, the airspeed reference display is
   * replaced by an 'Speed' label, and the following features are hidden:
   * * Airspeed protection annunciations
   * * Airspeed alert (overspeed/underspeed) indications
   * * Color ranges
   * * Reference airspeed bug
   * * V-speed bugs
   * * Approach cue bug
   * * Trend vector
   * * Bottom display box
   *
   * Defaults to `false`.
   */
  simplified?: boolean | Subscribable<boolean>;

  /** Scale options for the airspeed tape. */
  tapeScaleOptions: Readonly<AirspeedTapeScaleOptions>;

  /** Definitions for color ranges to include on the airspeed tape. */
  colorRanges: Iterable<AirspeedIndicatorColorRange>;

  /** Options for the trend vector. */
  trendVectorOptions: Readonly<AirspeedTrendVectorOptions>;

  /** Options for airspeed alerts. If not defined, then airspeed alert indications will not be displayed. */
  airspeedAlertOptions?: Readonly<AirspeedAlertOptions>;

  /** Options for the bottom display box. */
  bottomDisplayOptions: Readonly<AirspeedIndicatorBottomDisplayOptions>;

  /** Options for reference V-speed bugs. If not defined, then V-speed bugs will not be displayed. */
  vSpeedBugOptions?: Readonly<VSpeedBugOptions>;

  /** Options for the approach cue bug. If not defined, then the approach cue bug will not be displayed. */
  approachCueBugOptions?: Readonly<AirspeedApproachCueBugOptions>;

  /** CSS class(es) to apply to the indicator's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD airspeed indicator.
 */
export class AirspeedIndicator extends DisplayComponent<AirspeedIndicatorProps> {
  private static readonly RESERVED_CLASSES = [
    'airspeed',
    'airspeed-reference-visible',
    'airspeed-bottom-display-visible',
    'airspeed-alert-overspeed',
    'airspeed-alert-trend-overspeed',
    'airspeed-alert-underspeed',
    'airspeed-alert-trend-underspeed',
    'data-failed'
  ];

  private readonly referenceRef = FSComponent.createRef<AirspeedReferenceDisplay>();
  private readonly alertRef = FSComponent.createRef<AirspeedProtectionAnnunciation>();
  private readonly tapeRef = FSComponent.createRef<AirspeedTape>();

  private readonly rootCssClass = SetSubject.create(['airspeed']);

  private readonly simplified = SubscribableUtils.toSubscribable(this.props.simplified ?? false, true) as Subscribable<boolean>;

  private readonly airspeedAlertOptions = this.props.airspeedAlertOptions ? { ...this.props.airspeedAlertOptions } : undefined;

  private readonly activeAlert = this.airspeedAlertOptions ?
    MappedSubject.create(
      ([alerts, simplified]): AirspeedAlert => {
        if (simplified) {
          return AirspeedAlert.None;
        }

        // We should never have an overspeed and underspeed alert at the same time, but just in case, underspeed alerts
        // will take precedence

        if (this.airspeedAlertOptions!.supportUnderspeed && BitFlags.isAny(alerts, AirspeedAlert.Underspeed)) {
          return AirspeedAlert.Underspeed;
        } else if (this.airspeedAlertOptions!.supportOverspeed && BitFlags.isAny(alerts, AirspeedAlert.Overspeed)) {
          return AirspeedAlert.Overspeed;
        } else if (this.airspeedAlertOptions!.supportTrendUnderspeed && BitFlags.isAny(alerts, AirspeedAlert.TrendUnderspeed)) {
          return AirspeedAlert.TrendUnderspeed;
        } else if (this.airspeedAlertOptions!.supportTrendOverspeed && BitFlags.isAny(alerts, AirspeedAlert.TrendOverspeed)) {
          return AirspeedAlert.TrendOverspeed;
        } else {
          return AirspeedAlert.None;
        }
      },
      this.props.dataProvider.airspeedAlerts,
      this.simplified
    ).pause()
    : undefined;

  private readonly showDefaultTopBottomDisplays = MappedSubject.create(
    SubscribableMapFunctions.nor(),
    this.props.declutter,
    this.simplified
  ).pause();

  private readonly topAltitudeLabelDisplay = this.simplified.map(simplified => simplified ? '' : 'none').pause();

  private readonly isAirspeedReferenceDisplayVisible = Subject.create(false);

  private readonly isTopDisplayVisible = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.isAirspeedReferenceDisplayVisible,
    this.simplified
  ).pause();
  private readonly isBottomDisplayVisible = Subject.create(false);

  private isAlive = true;
  private isAwake = false;

  private readonly subscriptions: Subscription[] = [
    this.showDefaultTopBottomDisplays,
    this.topAltitudeLabelDisplay,
    this.isTopDisplayVisible,
  ];

  private isDataFailedSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.isTopDisplayVisible.sub(isVisible => {
      this.rootCssClass.toggle('airspeed-reference-visible', isVisible);
    }, true);

    this.isBottomDisplayVisible.sub(isVisible => {
      this.rootCssClass.toggle('airspeed-bottom-display-visible', isVisible);
    }, true);

    this.activeAlert?.sub(this.updateAlertClass.bind(this), true);

    this.subscriptions.push(
      this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(this.onDataFailedChanged.bind(this), true, !this.isAwake)
    );
  }

  /**
   * Wakes this indicator. While awake, this indicator will automatically update its appearance.
   * @throws Error if this indicator is dead.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('AirspeedIndicator: cannot wake a dead component');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.activeAlert?.resume();
    this.showDefaultTopBottomDisplays.resume();
    this.topAltitudeLabelDisplay.resume();
    this.isTopDisplayVisible.resume();

    this.isDataFailedSub?.resume(true);

    this.tapeRef.instance.wake();
  }

  /**
   * Puts this indicator to sleep. While asleep, this indicator will not automatically update its appearance.
   * @throws Error if this indicator is dead.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('AirspeedIndicator: cannot sleep a dead component');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.activeAlert?.pause();
    this.showDefaultTopBottomDisplays.pause();
    this.topAltitudeLabelDisplay.pause();
    this.isTopDisplayVisible.pause();

    this.isDataFailedSub?.pause();

    this.tapeRef.instance.sleep();
  }

  /**
   * Responds to when whether airspeed data is in a failed state changes.
   * @param isDataFailed Whether airspeed data is in a failed state.
   */
  private onDataFailedChanged(isDataFailed: boolean): void {
    this.rootCssClass.toggle('data-failed', isDataFailed);
  }

  /**
   * Updates this indicator's root CSS class list in response to the current active airspeed alert.
   * @param alert The current active airspeed alert.
   */
  private updateAlertClass(alert: AirspeedAlert): void {
    this.rootCssClass.delete('airspeed-alert-overspeed');
    this.rootCssClass.delete('airspeed-alert-trend-overspeed');
    this.rootCssClass.delete('airspeed-alert-underspeed');
    this.rootCssClass.delete('airspeed-alert-trend-underspeed');

    switch (alert) {
      case AirspeedAlert.Overspeed:
        this.rootCssClass.add('airspeed-alert-overspeed');
        break;
      case AirspeedAlert.TrendOverspeed:
        this.rootCssClass.add('airspeed-alert-trend-overspeed');
        break;
      case AirspeedAlert.Underspeed:
        this.rootCssClass.add('airspeed-alert-underspeed');
        break;
      case AirspeedAlert.TrendUnderspeed:
        this.rootCssClass.add('airspeed-alert-trend-underspeed');
        break;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, AirspeedIndicator.RESERVED_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !AirspeedIndicator.RESERVED_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    let isTasDisplayVisible: Subject<boolean> | undefined;
    let isMachDisplayVisible: Subject<boolean> | undefined;
    let isTakeoffVSpeedAnnuncVisible: Subject<boolean> | undefined;
    let isLandingVSpeedAnnuncVisible: Subject<boolean> | undefined;

    let showTas: Subscribable<boolean> | undefined;
    let showMach: Subscribable<boolean> | undefined;
    let showTakeoffVSpeedAnnunc: Subscribable<boolean> | undefined;
    let showLandingVSpeedAnnunc: Subscribable<boolean> | undefined;

    if (this.props.bottomDisplayOptions.mode === AirspeedIndicatorBottomDisplayMode.TrueAirspeed) {
      // Bottom displays TAS.

      isTasDisplayVisible = Subject.create<boolean>(false);

      if (this.props.vSpeedAnnunciationDataProvider) {
        isTakeoffVSpeedAnnuncVisible = Subject.create<boolean>(false);
        isLandingVSpeedAnnuncVisible = Subject.create<boolean>(false);

        // TAS display is hidden whenever any V-speed annunciation is active.
        showTas = MappedSubject.create(
          ([showDefaultTopBottomDisplays, isTakeoffVSpeedVisible, isLandingVSpeedVisible]) => {
            return showDefaultTopBottomDisplays && !(isTakeoffVSpeedVisible || isLandingVSpeedVisible);
          },
          this.showDefaultTopBottomDisplays,
          isTakeoffVSpeedAnnuncVisible,
          isLandingVSpeedAnnuncVisible
        );

        showTakeoffVSpeedAnnunc = this.showDefaultTopBottomDisplays;
        showLandingVSpeedAnnunc = this.showDefaultTopBottomDisplays;

        MappedSubject.create(
          ([isTasVisible, isTakeoffVSpeedVisible, isLandingVSpeedVisible]) => isTasVisible || isTakeoffVSpeedVisible || isLandingVSpeedVisible,
          isTasDisplayVisible,
          isTakeoffVSpeedAnnuncVisible,
          isLandingVSpeedAnnuncVisible
        ).pipe(this.isBottomDisplayVisible);
      } else {
        showTas = this.showDefaultTopBottomDisplays;
        isTasDisplayVisible.pipe(this.isBottomDisplayVisible);
      }
    } else {
      // Bottom displays Mach.

      isMachDisplayVisible = Subject.create<boolean>(false);

      if (this.props.vSpeedAnnunciationDataProvider) {
        isTakeoffVSpeedAnnuncVisible = Subject.create<boolean>(false);
        isLandingVSpeedAnnuncVisible = Subject.create<boolean>(false);

        // Mach display is hidden when the takeoff V-speed annunciation is active.
        showMach = MappedSubject.create(
          ([showDefaultTopBottomDisplays, isTakeoffVSpeedAnnuncVisibleVal]) => showDefaultTopBottomDisplays && !isTakeoffVSpeedAnnuncVisibleVal,
          this.showDefaultTopBottomDisplays,
          isTakeoffVSpeedAnnuncVisible
        );

        showTakeoffVSpeedAnnunc = this.showDefaultTopBottomDisplays;
        // Landing V-speed annunciation is hidden when the mach display is visible.
        showLandingVSpeedAnnunc = MappedSubject.create(
          ([showDefaultTopBottomDisplays, isMachDisplayVisibleVal]) => showDefaultTopBottomDisplays && !isMachDisplayVisibleVal,
          this.showDefaultTopBottomDisplays,
          isMachDisplayVisible
        );

        MappedSubject.create(
          ([isTasVisible, isTakeoffVSpeedVisible, isLandingVSpeedVisible]) => isTasVisible || isTakeoffVSpeedVisible || isLandingVSpeedVisible,
          isMachDisplayVisible,
          isTakeoffVSpeedAnnuncVisible,
          isLandingVSpeedAnnuncVisible
        ).pipe(this.isBottomDisplayVisible);
      } else {
        showMach = this.showDefaultTopBottomDisplays;
        isMachDisplayVisible.pipe(this.isBottomDisplayVisible);
      }
    }

    return (
      <div class={this.rootCssClass} data-checklist="checklist-airspeed">
        <AirspeedTape
          ref={this.tapeRef}
          dataProvider={this.props.dataProvider}
          simplified={this.simplified}
          {...this.props.tapeScaleOptions}
          colorRanges={this.props.colorRanges}
          {...this.props.trendVectorOptions}
          vSpeedBugOptions={this.props.vSpeedBugOptions}
          approachCueBugOptions={this.props.approachCueBugOptions}
        />
        <div class='airspeed-top-container' data-checklist="checklist-airspeed-top">
          <div class='airspeed-top-label-container' style={{ 'display': this.topAltitudeLabelDisplay }}>
            <div class='airspeed-top-label-text'>
              Speed
            </div>
          </div>
          <AirspeedReferenceDisplay
            ref={this.referenceRef}
            show={this.showDefaultTopBottomDisplays}
            referenceIas={this.props.dataProvider.referenceIas}
            referenceMach={this.props.dataProvider.referenceMach}
            referenceIsManual={this.props.dataProvider.referenceIsManual}
            isAirspeedHoldActive={this.props.dataProvider.isAirspeedHoldActive}
            isVisible={this.isAirspeedReferenceDisplayVisible}
          />
          <AirspeedProtectionAnnunciation
            ref={this.alertRef}
            show={this.showDefaultTopBottomDisplays}
            isOverspeedProtectionActive={this.props.dataProvider.isOverspeedProtectionActive}
            isUnderspeedProtectionActive={this.props.dataProvider.isUnderspeedProtectionActive}
          />
        </div>
        <div class='airspeed-bottom-container' data-checklist="checklist-airspeed-bottom">
          {this.props.bottomDisplayOptions.mode === AirspeedIndicatorBottomDisplayMode.TrueAirspeed && (
            <AirspeedTasDisplay
              show={showTas as Subscribable<boolean>}
              tasKnots={this.props.dataProvider.tasKnots}
              isDataFailed={this.props.dataProvider.isDataFailed}
              isVisible={isTasDisplayVisible as Subject<boolean>}
            />
          )}
          {this.props.vSpeedAnnunciationDataProvider !== undefined && (
            <AirspeedVSpeedAnnunciation
              annunciationType={VSpeedAnnunciation.Landing}
              show={showLandingVSpeedAnnunc as Subscribable<boolean>}
              activeAnnunciation={this.props.vSpeedAnnunciationDataProvider.annunciation}
              isDataFailed={this.props.dataProvider.isDataFailed}
              isVisible={isLandingVSpeedAnnuncVisible as Subject<boolean>}
            />
          )}
          {this.props.bottomDisplayOptions.mode === AirspeedIndicatorBottomDisplayMode.Mach && (
            <AirspeedMachDisplay
              show={showMach as Subscribable<boolean>}
              mach={this.props.dataProvider.mach}
              threshold={this.props.bottomDisplayOptions.machThreshold ?? Subject.create(0)}
              isDataFailed={this.props.dataProvider.isDataFailed}
              isVisible={isMachDisplayVisible as Subject<boolean>}
            />
          )}
          {this.props.vSpeedAnnunciationDataProvider !== undefined && (
            <AirspeedVSpeedAnnunciation
              annunciationType={VSpeedAnnunciation.Takeoff}
              show={showTakeoffVSpeedAnnunc as Subscribable<boolean>}
              activeAnnunciation={this.props.vSpeedAnnunciationDataProvider.annunciation}
              isDataFailed={this.props.dataProvider.isDataFailed}
              isVisible={isTakeoffVSpeedAnnuncVisible as Subject<boolean>}
            />
          )}
        </div>

        <div class='failed-box' />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.referenceRef.getOrDefault()?.destroy();
    this.alertRef.getOrDefault()?.destroy();
    this.tapeRef.getOrDefault()?.destroy();

    this.activeAlert?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for AirspeedTape.
 */
interface AirspeedTapeProps extends ComponentProps {
  /** A data provider for the indicator. */
  dataProvider: AirspeedIndicatorDataProvider;

  /** Whether the tape should be shown in simplified mode. */
  simplified: Subscribable<boolean>;

  /** The minimum airspeed representable on the tape, in knots. */
  minimum: number | Subscribable<number>;

  /** The maximum airspeed representable on the tape, in knots. */
  maximum: number | Subscribable<number>;

  /**
   * The size of the airspeed tape window, in knots (i.e. the difference between the highest and lowest airspeeds
   * visible on the tape at any given time).
   */
  window: number | Subscribable<number>;

  /** The interval between major ticks, in knots. */
  majorTickInterval: number | Subscribable<number>;

  /** The number of minor ticks for each major tick. */
  minorTickFactor: number | Subscribable<number>;

  /** Definitions for color ranges to include on the tape. */
  colorRanges: Iterable<AirspeedIndicatorColorRange>;

  /** The minimum absolute value of the airspeed trend, in knots, required to display the trend vector. */
  trendThreshold: number | Subscribable<number>;

  /** Options for reference V-speed bugs. If not defined, then V-speed bugs will not be displayed. */
  vSpeedBugOptions?: Readonly<VSpeedBugOptions>;

  /** Options for the approach cue bug. If not defined, then the approach cue bug will not be displayed. */
  approachCueBugOptions?: Readonly<AirspeedApproachCueBugOptions>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin airspeed tape.
 */
class AirspeedTape extends DisplayComponent<AirspeedTapeProps> {
  private readonly iasBoxRef = FSComponent.createRef<AirspeedIasDisplayBox>();
  private readonly minorTickContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly majorTickContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly labelContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly colorRangeRefs: NodeReference<AirspeedColorRange>[] = [];
  private readonly manualRefSpeedBugRef = FSComponent.createRef<ReferenceSpeedBug>();
  private readonly vSpeedBugRefs: NodeReference<VSpeedBug>[] = [];
  private readonly vSpeedOffScaleLabelRefs: NodeReference<VSpeedOffScaleLabel>[] = [];
  private readonly vSpeedLegendRefs: NodeReference<VSpeedLegend>[] = [];
  private readonly approachCueBugRef = FSComponent.createRef<ApproachCueBug>();

  private readonly rootCssClass = SetSubject.create(['airspeed-tape-container']);

  private readonly labelTexts: Subject<string>[] = [];

  private readonly tapeStyle = ObjectSubject.create({
    position: 'absolute',
    left: '0%',
    bottom: '50%',
    width: '100%',
    height: '100%',
    transform: 'translate3d(0, 0, 0)'
  });
  private readonly tapeClipStyle = ObjectSubject.create({
    position: 'absolute',
    left: '0%',
    bottom: '0%',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  });
  private readonly tapeOverflowTopStyle = ObjectSubject.create({
    position: 'absolute',
    left: '0%',
    bottom: '100%',
    width: '100%',
    height: '50%'
  });

  private readonly trendVectorStyle = ObjectSubject.create({
    display: '',
    position: 'absolute',
    bottom: '50%',
    height: '0%',
    transform: 'rotateX(0deg)',
    'transform-origin': '50% 100%'
  });

  private readonly vSpeedOffScaleContainerStyle = ObjectSubject.create({
    display: 'flex',
    'flex-flow': 'column-reverse nowrap',
    position: 'absolute',
    bottom: '0%',
    overflow: 'hidden'
  });

  private readonly vSpeedLegendContainerStyle = ObjectSubject.create({
    display: 'none',
    'flex-flow': 'column-reverse nowrap',
    position: 'absolute',
    bottom: '0%',
    overflow: 'hidden'
  });

  private readonly currentLength = Subject.create(0);
  private currentMinimum = 0;
  private readonly currentTranslate = Subject.create(0);

  private readonly isAwake = Subject.create(false);

  private readonly minimum = SubscribableUtils.toSubscribable(this.props.minimum, true);
  private readonly maximum = SubscribableUtils.toSubscribable(this.props.maximum, true);
  private readonly window = SubscribableUtils.toSubscribable(this.props.window, true);
  private readonly majorTickInterval = SubscribableUtils.toSubscribable(this.props.majorTickInterval, true);
  private readonly minorTickFactor = SubscribableUtils.toSubscribable(this.props.minorTickFactor, true);

  private readonly options = MappedSubject.create(
    this.minimum,
    this.maximum,
    this.window,
    this.majorTickInterval,
    this.minorTickFactor
  );

  private readonly isIasBelowScale = MappedSubject.create(
    ([iasKnots, minimum]): boolean => {
      return iasKnots < minimum;
    },
    this.props.dataProvider.iasKnots,
    this.minimum
  ).pause();

  private readonly isIasAboveScale = MappedSubject.create(
    ([iasKnots, maximum]): boolean => {
      return iasKnots > maximum;
    },
    this.props.dataProvider.iasKnots,
    this.maximum
  ).pause();

  private readonly isIasOffScale = MappedSubject.create(
    ([isIasBelowScale, isIasAboveScale]): boolean => {
      return isIasBelowScale || isIasAboveScale;
    },
    this.isIasBelowScale,
    this.isIasAboveScale
  );

  private readonly iasTapeValue = MappedSubject.create(
    ([iasKnots, minimum, maximum, window, isDataFailed]): number => {
      return isDataFailed ? minimum + window / 2 : MathUtils.clamp(iasKnots, minimum, maximum);
    },
    this.props.dataProvider.iasKnots,
    this.minimum,
    this.maximum,
    this.window,
    this.props.dataProvider.isDataFailed
  ).pause();

  private readonly iasBoxValue = MappedSubject.create(
    ([iasKnots, isIasOffScale]): number => {
      return isIasOffScale ? NaN : iasKnots;
    },
    this.props.dataProvider.iasKnots,
    this.isIasOffScale
  ).pause();

  private readonly trendThreshold = SubscribableUtils.toSubscribable(this.props.trendThreshold, true);

  private readonly showTrendVector = MappedSubject.create(
    ([iasKnot, minimum, maximum, threshold, iasTrend, isDataFailed, simplified]): boolean => {
      return !simplified && !isDataFailed && iasKnot >= minimum && iasKnot < maximum && Math.abs(iasTrend) >= threshold;
    },
    this.props.dataProvider.iasKnots,
    this.minimum,
    this.maximum,
    this.trendThreshold,
    this.props.dataProvider.iasTrend,
    this.props.dataProvider.isDataFailed,
    this.props.simplified
  ).pause();

  private readonly iasTrendParams = MappedSubject.create(
    this.props.dataProvider.iasTrend,
    this.window
  ).pause();

  private readonly trendVectorHeight = Subject.create(0);
  private readonly trendVectorScale = Subject.create(1);

  private readonly updateTapeEvent = new SubEvent<this, void>();
  private readonly updateTapeWindowEvent = new SubEvent<this, void>();

  private readonly colorRangeSpeedDefs: AirspeedDefinition[] = [];

  private readonly vSpeedBugSubscribables: MappedSubscribable<any>[] = [];

  private readonly approachCueBugSpeedDef = this.props.approachCueBugOptions?.speed(this.props.dataProvider);

  private readonly showAirspeedData = this.props.dataProvider.isDataFailed.map(SubscribableMapFunctions.not()).pause();

  private readonly showColorRangesAndBugs = MappedSubject.create(
    ([isAwake, showIndicatedAltData, simplified]) => isAwake && showIndicatedAltData && !simplified,
    this.isAwake,
    this.showAirspeedData,
    this.props.simplified
  );

  private optionsSub?: Subscription;
  private showTrendVectorSub?: Subscription;
  private iasTrendParamsSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.iasTapeValue.sub(this.updateTape.bind(this), true);

    this.iasTrendParamsSub = this.iasTrendParams.sub(this.updateTrendVector.bind(this), false, true);

    this.showTrendVectorSub = this.showTrendVector.sub(show => {
      if (show) {
        this.trendVectorStyle.set('display', '');
        this.iasTrendParams.resume();
        this.iasTrendParamsSub!.resume(true);
      } else {
        this.iasTrendParamsSub!.pause();
        this.iasTrendParams.pause();
        this.trendVectorStyle.set('display', 'none');
      }
    }, true, !this.isAwake);

    this.trendVectorHeight.sub(height => { this.trendVectorStyle.set('height', `${height}%`); }, true);
    this.trendVectorScale.sub(scale => { this.trendVectorStyle.set('transform', `scale(${scale}) rotateX(0deg)`); }, true);

    this.currentTranslate.sub(translate => {
      this.tapeStyle.set('transform', `translate3d(0, ${translate * 100}%, 0)`);
    }, true);

    this.optionsSub = this.options.sub(this.rebuildTape.bind(this), true, !this.isAwake);

    this.isIasBelowScale.sub(isIasBelowScale => {
      this.vSpeedOffScaleContainerStyle.set('display', isIasBelowScale ? 'flex' : 'none');
    }, true);
  }

  /**
   * Wakes this tape. While awake, this tape will automatically update its appearance.
   */
  public wake(): void {
    if (this.isAwake.get()) {
      return;
    }

    this.isAwake.set(true);

    this.isIasBelowScale.resume();
    this.isIasAboveScale.resume();
    this.iasTapeValue.resume();
    this.iasBoxValue.resume();

    this.showTrendVector.resume();

    this.showAirspeedData.resume();

    this.optionsSub?.resume(true);
    this.showTrendVectorSub?.resume(true);
  }

  /**
   * Puts this tape to sleep. While asleep, this display will not automatically update its appearance.
   */
  public sleep(): void {
    if (!this.isAwake.get()) {
      return;
    }

    this.isAwake.set(false);

    this.isIasBelowScale.pause();
    this.isIasAboveScale.pause();
    this.iasTapeValue.pause();
    this.iasBoxValue.pause();

    this.showTrendVector.pause();
    this.showTrendVectorSub?.pause();

    this.iasTrendParams.pause();
    this.iasTrendParamsSub?.pause();

    this.showAirspeedData.pause();

    this.optionsSub?.pause();
  }

  /**
   * Calculates the absolute vertical position on the tape at which a particular airspeed is located, with `0` at the
   * top of the tape and `1` at the bottom.
   * @param iasKnots An airspeed, in knots.
   * @param clamp Whether the airspeed should be clamped to the range defined by this tape's minimum and maximum
   * representable airspeeds. Defaults to `false`.
   * @returns The absolute vertical position on the tape at which the specified airspeed is located, with `0` at the
   * top of the tape and `1` at the bottom.
   */
  private calculateAbsoluteTapePosition(iasKnots: number, clamp = false): number {
    if (clamp) {
      iasKnots = MathUtils.clamp(iasKnots, this.minimum.get(), this.maximum.get());
    }

    return 1 - (iasKnots - this.currentMinimum) / this.currentLength.get();
  }

  /**
   * Calculates the vertical position on the tape window at which a particular airspeed is located, with `0` at the top
   * of the tape window and `1` at the bottom.
   * @param iasKnots An airspeed, in knots.
   * @param clamp Whether the airspeed should be clamped to the range defined by this tape's minimum and maximum
   * representable airspeeds. Defaults to `false`.
   * @returns The vertical position on the tape window at which the specified airspeed is located, with `0` at the top
   * of the tape window and `1` at the bottom.
   */
  private calculateWindowTapePosition(iasKnots: number, clamp = false): number {
    return (this.calculateAbsoluteTapePosition(iasKnots, clamp) - 1 + this.currentTranslate.get()) * this.currentLength.get() / this.window.get() + 0.5;
  }

  /**
   * Rebuilds this tape's ticks and labels.
   * @param options Scale options for this tape, as `[minimum, maximum, window, majorTickInterval, minorTickFactor]`.
   */
  private rebuildTape(options: readonly [number, number, number, number, number]): void {
    const [minimum, maximum, window, majorTickInterval, minorTickFactor] = options;

    this.labelTexts.length = 0;

    this.minorTickContainerRef.instance.innerHTML = '';
    this.majorTickContainerRef.instance.innerHTML = '';
    this.labelContainerRef.instance.innerHTML = '';

    const majorTickCount = Math.ceil(window / majorTickInterval) * 2 + 1;
    const desiredRange = (majorTickCount - 1) * majorTickInterval;
    this.currentLength.set(desiredRange);

    const maxRange = maximum - minimum;
    const trueRange = Math.min(maxRange, desiredRange);
    const heightFactor = trueRange / desiredRange;

    const len = (majorTickCount - 1) * minorTickFactor;
    for (let i = 0; i <= len; i++) {
      const y = 100 - (i / len) * 100 / heightFactor;

      if (i % minorTickFactor === 0) {
        // major tick
        FSComponent.render(
          <path d={`M 0 ${y} L 100 ${y}`} vector-effect='non-scaling-stroke' class='airspeed-tape-tick airspeed-tape-tick-major'>.</path>,
          this.majorTickContainerRef.instance
        );

        const text = Subject.create('0');
        FSComponent.render(
          <div class='airspeed-tape-label' style={`position: absolute; right: 0%; top: ${y}%; transform: translateY(-50%)`}>
            {text}
          </div>,
          this.labelContainerRef.instance
        );

        this.labelTexts.push(text);
      } else {
        // minor tick
        FSComponent.render(
          <path d={`M 0 ${y} L 100 ${y}`} vector-effect='non-scaling-stroke' class='airspeed-tape-tick airspeed-tape-tick-minor'>.</path>,
          this.minorTickContainerRef.instance
        );
      }
    }

    this.tapeStyle.set('height', `${100 * desiredRange / window}%`);
    this.tapeClipStyle.set('height', `${100 * heightFactor}%`);

    this.currentMinimum = minimum;
    this.updateTapeEvent.notify(this);

    this.updateTapeLabels();
    this.updateTapeOverflow();
    this.updateTape(this.iasTapeValue.get());
  }

  /**
   * Updates the tape based on the current indicated airspeed.
   * @param iasKnots The current indicated airspeed, in knots.
   */
  private updateTape(iasKnots: number): void {
    let tapePos = this.calculateAbsoluteTapePosition(iasKnots);
    if (tapePos <= 0.25 || tapePos >= 0.75) {
      const [minimum, maximum, window, majorTickInterval] = this.options.get();

      const desiredMinimum = Math.floor((iasKnots - window) / majorTickInterval) * majorTickInterval;
      const constrainedMinimum = Math.ceil((maximum - this.currentLength.get()) / majorTickInterval) * majorTickInterval;
      const minimumToSet = Math.max(minimum, Math.min(constrainedMinimum, desiredMinimum));
      if (this.currentMinimum !== minimumToSet) {
        this.currentMinimum = minimumToSet;
        this.updateTapeEvent.notify(this);

        this.updateTapeLabels();
        this.updateTapeOverflow();

        tapePos = MathUtils.clamp(this.calculateAbsoluteTapePosition(iasKnots), 0, 1);
      }
    }

    this.currentTranslate.set(MathUtils.round(1 - tapePos, 1e-3));
    this.updateTapeWindowEvent.notify(this);
  }

  /**
   * Updates this tape's labels.
   */
  private updateTapeLabels(): void {
    const interval = this.majorTickInterval.get();

    for (let i = 0; i < this.labelTexts.length; i++) {
      this.labelTexts[i].set((this.currentMinimum + interval * i).toFixed(0));
    }
  }

  /**
   * Updates this tape's overflow regions.
   */
  private updateTapeOverflow(): void {
    const maximumPos = this.calculateAbsoluteTapePosition(this.maximum.get());
    this.tapeOverflowTopStyle.set('bottom', `${Math.min(100, 100 - maximumPos * 100)}%`);
  }

  /**
   * Updates this tape's speed trend vector.
   * @param params Parameters for the speed trend vector, as `[iasTrend, window]`.
   */
  private updateTrendVector(params: readonly [number, number]): void {
    const [iasTrend, window] = params;

    this.trendVectorHeight.set(MathUtils.clamp(MathUtils.round(Math.abs(iasTrend) / window * 100, 0.1), 0, 50));
    this.trendVectorScale.set(iasTrend < 0 ? -1 : 1);
  }

  /** @inheritDoc */
  public render(): VNode {
    const { bugs: vSpeedBugs, offscale: vSpeedOffscaleLabels, legends: vSpeedLegends } = this.renderVSpeedBugs();

    return (
      <div class={this.rootCssClass} data-checklist="checklist-airspeed-tape">

        <div class='airspeed-tape-border-top'></div>
        <div class='airspeed-tape-border-bottom'></div>

        <div class='airspeed-tape-window' style='overflow: hidden;'>
          <div class='airspeed-tape' style={this.tapeStyle}>
            <div class='airspeed-tape-color-range-container' style='position: absolute; left: 0%; top: 0%; height: 100%; width: 100%'>
              {this.renderColorRanges()}
            </div>
            <div class='airspeed-tape-clip' style={this.tapeClipStyle}>
              <svg
                ref={this.minorTickContainerRef}
                class='airspeed-tape-tick-minor-container'
                viewBox='0 0 100 100' preserveAspectRatio='none'
                style='position: absolute; top: 0; height: 100%;'
              />
              <svg
                ref={this.majorTickContainerRef}
                class='airspeed-tape-tick-major-container'
                viewBox='0 0 100 100' preserveAspectRatio='none'
                style='position: absolute; top: 0; height: 100%;'
              />
              <div
                ref={this.labelContainerRef}
                class='airspeed-tape-label-container'
                style='position: absolute; top: 0; height: 100%; text-align: right;'
              />
            </div>
            <div class='airspeed-tape-overflow' style={this.tapeOverflowTopStyle}></div>
            <div class='airspeed-tape-overflow' style='position: absolute; left: 0; top: 100%; width: 100%; height: 50%;'></div>
          </div>

          <div class='airspeed-vspeed-legend-container' style={this.vSpeedLegendContainerStyle}>
            {vSpeedLegends}
          </div>
        </div>

        <div class='airspeed-trend' style={this.trendVectorStyle}>
        </div>

        <div class='airspeed-vspeed-offscale-container' style={this.vSpeedOffScaleContainerStyle}>
          {vSpeedOffscaleLabels}
        </div>

        <div class='airspeed-vspeed-bug-container' style='position: absolute; top: 0; height: 100%; overflow: hidden;'>
          {vSpeedBugs}
        </div>

        {this.approachCueBugSpeedDef !== undefined && (
          <div class='airspeed-approach-cue-bug-container' style='position: absolute; top: 0; height: 100%; overflow: hidden;'>
            <ApproachCueBug
              ref={this.approachCueBugRef}
              value={SubscribableUtils.toSubscribable(this.approachCueBugSpeedDef.value, true)}
              show={this.showColorRangesAndBugs}
              updateEvent={this.updateTapeWindowEvent}
              getPosition={this.calculateWindowTapePosition.bind(this)}
            />
          </div>
        )}

        <AirspeedIasDisplayBox
          ref={this.iasBoxRef}
          show={this.showAirspeedData}
          ias={this.iasBoxValue}
        />

        <div class='airspeed-refspeed-bug-container' style='position: absolute; top: 0; height: 100%; overflow: hidden;'>
          <ReferenceSpeedBug
            ref={this.manualRefSpeedBugRef}
            show={this.showColorRangesAndBugs}
            referenceIas={this.props.dataProvider.referenceIas}
            referenceMach={this.props.dataProvider.referenceMach}
            referenceIsManual={this.props.dataProvider.referenceIsManual}
            machToKias={this.props.dataProvider.machToKias}
            isAirspeedHoldActive={this.props.dataProvider.isAirspeedHoldActive}
            updateEvent={this.updateTapeWindowEvent}
            getPosition={this.calculateWindowTapePosition.bind(this)}
          />
        </div>
      </div>
    );
  }

  /**
   * Renders this tape's color ranges.
   * @returns This tape's color ranges, as an array of VNodes.
   */
  private renderColorRanges(): VNode[] {
    const getPosition = this.calculateAbsoluteTapePosition.bind(this);
    const ranges: VNode[] = [];

    for (const definition of this.props.colorRanges) {
      const minimum = definition.minimum(this.props.dataProvider);
      const maximum = definition.maximum(this.props.dataProvider);

      const ref = FSComponent.createRef<AirspeedColorRange>();
      this.colorRangeRefs.push(ref);

      this.colorRangeSpeedDefs.push(minimum);
      this.colorRangeSpeedDefs.push(maximum);

      ranges.push(
        <AirspeedColorRange
          ref={ref}
          width={definition.width}
          color={definition.color}
          show={this.showColorRangesAndBugs}
          minimum={minimum.value}
          maximum={maximum.value}
          updateEvent={this.updateTapeEvent}
          getPosition={getPosition}
        />
      );
    }

    return ranges;
  }

  /**
   * Renders this tape's reference V-speed bugs and off-scale labels.
   * @returns This tape's reference V-speed bugs and off-scale labels, as arrays of VNodes.
   */
  private renderVSpeedBugs(): {
    /** The reference V-speed bugs. */
    bugs: VNode[],
    /** The off-scale reference V-speed labels. */
    offscale: VNode[],
    /** The reference V-speed legends. */
    legends: VNode[]
  } {
    const getPosition = this.calculateWindowTapePosition.bind(this);
    const bugs: VNode[] = [];
    const offscale: VNode[] = [];
    const legends: VNode[] = [];
    const legendShow: Subscribable<boolean>[] = [];

    const options = this.props.vSpeedBugOptions;

    if (options) {
      const allowZeroValue = options.allowZeroValue ?? false;

      for (const def of options.vSpeedBugDefinitions) {
        const showSetting = options.vSpeedSettingManager.tryGetSetting(`vSpeedShow_${def.name}`);

        if (showSetting !== undefined) {
          const bugRef = FSComponent.createRef<VSpeedBug>();
          this.vSpeedBugRefs.push(bugRef);

          const labelColor = def.labelColor ?? VSpeedBugColor.Cyan;
          const labelColorIgnoreFms = def.labelColorIgnoreFms ?? false;

          const activeValue = VSpeedUserSettingUtils.activeValue(def.name, options.vSpeedSettingManager, true, allowZeroValue);
          const isFmsValueActive = VSpeedUserSettingUtils.isFmsValueActive(def.name, options.vSpeedSettingManager);
          const isFmsConfigMiscompare = options.vSpeedSettingManager.tryGetSetting(`vSpeedFmsConfigMiscompare_${def.name}`) ?? Subject.create(false);

          const showBug = MappedSubject.create(
            ([isAwake, showAirspeedData, isIasOffScale, show, value, isConfigMiscompare, simplified]): boolean => {
              return isAwake
                && showAirspeedData
                && !isIasOffScale
                && show
                && (allowZeroValue ? value >= 0 : value > 0)
                && !isConfigMiscompare
                && !simplified;
            },
            this.isAwake,
            this.showAirspeedData,
            this.isIasOffScale,
            showSetting,
            activeValue,
            isFmsConfigMiscompare,
            this.props.simplified
          );

          this.vSpeedBugSubscribables.push(activeValue);
          isFmsValueActive && this.vSpeedBugSubscribables.push(isFmsValueActive);
          this.vSpeedBugSubscribables.push(showBug);

          bugs.push(
            <VSpeedBug
              ref={bugRef}
              value={activeValue}
              isFmsValueActive={isFmsValueActive}
              label={def.label}
              labelColor={labelColor}
              labelColorIgnoreFms={labelColorIgnoreFms}
              show={showBug}
              updateEvent={this.updateTapeWindowEvent}
              getPosition={getPosition}
            />
          );

          if (def.showOffscale) {
            const labelRef = FSComponent.createRef<VSpeedOffScaleLabel>();
            this.vSpeedOffScaleLabelRefs.push(labelRef);

            const showLabel = MappedSubject.create(
              ([isAwake, showAirspeedData, show, value, simplified]): boolean => {
                return isAwake
                  && showAirspeedData
                  && show
                  && (allowZeroValue ? value >= 0 : value > 0)
                  && !simplified;
              },
              this.isAwake,
              this.showAirspeedData,
              showSetting,
              activeValue,
              this.props.simplified
            );
            this.vSpeedBugSubscribables.push(showLabel);

            offscale.push(
              <VSpeedOffScaleLabel
                ref={labelRef}
                value={activeValue}
                isFmsValueActive={isFmsValueActive}
                isFmsConfigMiscompare={isFmsConfigMiscompare}
                label={def.label}
                labelColor={labelColor}
                labelColorIgnoreFms={labelColorIgnoreFms}
                show={showLabel}
              />
            );
          }

          if (def.showLegend) {
            const legendRef = FSComponent.createRef<VSpeedLegend>();
            this.vSpeedLegendRefs.push(legendRef);

            legendShow.push(showBug);

            legends.push(
              <VSpeedLegend
                ref={legendRef}
                value={activeValue}
                isFmsValueActive={isFmsValueActive}
                isFmsConfigMiscompare={isFmsConfigMiscompare}
                label={def.label}
                labelColor={labelColor}
                labelColorIgnoreFms={labelColorIgnoreFms}
                show={showBug}
              />
            );
          }
        }
      }

      if (legendShow.length > 0) {
        // Initialize logic to show/hide the V-speed legend container. The container should be visible if and only if IAS
        // is not below scale and at least one legend is visible.
        MappedSubject.create(
          inputs => {
            if (inputs[0]) { // IAS is below scale
              return false;
            }

            return inputs.includes(true, 1);
          },
          this.isIasBelowScale,
          ...legendShow
        ).sub(show => {
          this.vSpeedLegendContainerStyle.set('display', show ? 'flex' : 'none');
        }, true);
      }
    }

    return { bugs, offscale, legends };
  }

  /** @inheritDoc */
  public destroy(): void {
    this.iasBoxRef.getOrDefault()?.destroy();

    for (const ref of this.colorRangeRefs) {
      ref.getOrDefault()?.destroy();
    }

    this.manualRefSpeedBugRef.getOrDefault()?.destroy();

    for (const ref of this.vSpeedBugRefs) {
      ref.getOrDefault()?.destroy();
    }

    for (const ref of this.vSpeedOffScaleLabelRefs) {
      ref.getOrDefault()?.destroy();
    }

    for (const ref of this.vSpeedLegendRefs) {
      ref.getOrDefault()?.destroy();
    }

    this.approachCueBugRef.getOrDefault()?.destroy();

    this.options.destroy();
    this.isIasBelowScale.destroy();
    this.isIasAboveScale.destroy();
    this.isIasOffScale.destroy();
    this.iasTapeValue.destroy();
    this.iasBoxValue.destroy();
    this.showTrendVector.destroy();
    this.iasTrendParams.destroy();
    this.showAirspeedData.destroy();
    this.showColorRangesAndBugs.destroy();

    for (const def of this.colorRangeSpeedDefs) {
      def.destroy?.();
    }

    for (const subscribable of this.vSpeedBugSubscribables) {
      subscribable.destroy();
    }

    this.approachCueBugSpeedDef?.destroy?.();

    super.destroy();
  }
}

/**
 * Component props for AirspeedIasDisplayBox.
 */
interface AirspeedIasDisplayBoxProps extends ComponentProps {
  /** Whether to show the display. */
  show: Subscribable<boolean>;

  /** The indicated airspeed value to display. */
  ias: Subscribable<number>;
}

/**
 * An indicated airspeed display box for a next-generation (NXi, G3000, etc) Garmin airspeed tape.
 */
class AirspeedIasDisplayBox extends DisplayComponent<AirspeedIasDisplayBoxProps> {
  private readonly scrollerRefs: NodeReference<DigitScroller>[] = [];

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly ias = this.props.ias.map(SubscribableMapFunctions.identity()).pause();

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootStyle.set('display', '');
        this.ias.resume();
      } else {
        this.rootStyle.set('display', 'none');
        this.ias.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    const onesScrollerRef = FSComponent.createRef<DigitScroller>();
    const tensScrollerRef = FSComponent.createRef<DigitScroller>();
    const hundredsScrollerRef = FSComponent.createRef<DigitScroller>();

    this.scrollerRefs.push(onesScrollerRef, tensScrollerRef, hundredsScrollerRef);

    return (
      <div class='airspeed-ias-box' style={this.rootStyle}>
        <svg viewBox="0 0 90 70" class='airspeed-ias-box-bg' preserveAspectRatio='none'>
          <path
            vector-effect='non-scaling-stroke'
            d='M 86 35 l -11 -6 l 0 -26 c 0 -1 -1 -2 -2 -2 l -19 0 c -1 0 -2 1 -2 2 l 0 11 l -44 0 c -1 0 -2 1 -2 2 l 0 38 c 0 1 1 2 2 2 l 44 0 l 0 11 c 0 1 1 2 2 2 l 19 0 c 1 0 2 -1 2 -2 l 0 -26 l 11 -6 z'
          />
        </svg>
        <div class='airspeed-ias-box-scrollers' style='position: absolute; left: 6.7%; top: 1.5%; width: 76.6%; height: 97%;'>
          <div class='airspeed-ias-box-digit-container airspeed-ias-box-hundreds'>
            <div class='airspeed-ias-box-digit-bg' />
            <DigitScroller
              ref={hundredsScrollerRef}
              value={this.ias}
              base={10}
              factor={100}
              scrollThreshold={99}
              renderDigit={(digit): string => digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
            />
          </div>
          <div class='airspeed-ias-box-digit-container airspeed-ias-box-tens'>
            <div class='airspeed-ias-box-digit-bg' />
            <DigitScroller
              ref={tensScrollerRef}
              value={this.ias}
              base={10}
              factor={10}
              scrollThreshold={9}
            />
          </div>
          <div class='airspeed-ias-box-digit-container airspeed-ias-box-ones'>
            <div class='airspeed-ias-box-digit-bg' />
            <DigitScroller
              ref={onesScrollerRef}
              value={this.ias}
              base={10}
              factor={1}
            />
            <div class='airspeed-ias-box-scroller-mask'></div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const ref of this.scrollerRefs) {
      ref.getOrDefault()?.destroy();
    }

    this.ias.destroy();

    this.showSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for AirspeedColorRange.
 */
interface AirspeedColorRangeProps extends ComponentProps {
  /** The width of the color range. */
  width: AirspeedIndicatorColorRangeWidth;

  /** The color of the color range. */
  color: AirspeedIndicatorColorRangeColor;

  /** Whether the color range should be visible. */
  show: Subscribable<boolean>;

  /** The minimum speed of the color range, in knots. */
  minimum: number | Subscribable<number>;

  /** The maximum speed of the color range, in knots. */
  maximum: number | Subscribable<number>;

  /** An event which signals that the color range needs to be updated with new tape positions. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the absolute position on the color range's parent tape at which a particular airspeed is located. */
  getPosition: (iasKnots: number, clamp?: boolean) => number;

  /** CSS class(es) to apply to the color range's root element. */
  class?: string;
}

/**
 * A color range for an airspeed indicator tape.
 */
class AirspeedColorRange extends DisplayComponent<AirspeedColorRangeProps> {
  private static readonly COLOR_CLASS = {
    [AirspeedIndicatorColorRangeColor.Red]: 'airspeed-tape-color-range-red',
    [AirspeedIndicatorColorRangeColor.Yellow]: 'airspeed-tape-color-range-yellow',
    [AirspeedIndicatorColorRangeColor.White]: 'airspeed-tape-color-range-white',
    [AirspeedIndicatorColorRangeColor.Green]: 'airspeed-tape-color-range-green',
    [AirspeedIndicatorColorRangeColor.BarberPole]: 'airspeed-tape-color-range-barber-pole',
  };

  private readonly rootStyle = ObjectSubject.create({
    display: '',
    position: 'absolute',
    top: '0%',
    height: this.props.color === AirspeedIndicatorColorRangeColor.BarberPole ? '0%' : '100%',
    transform: `translate3d(0px, 0px, 0px) scaleY(${this.props.color === AirspeedIndicatorColorRangeColor.BarberPole ? 1 : 0})`,
    'transform-origin': '50% 0%'
  });

  private readonly minimum = SubscribableUtils.toSubscribable(this.props.minimum, true);
  private readonly maximum = SubscribableUtils.toSubscribable(this.props.maximum, true);

  private minPos = 0;
  private maxPos = 0;

  private readonly setStyles = this.props.color === AirspeedIndicatorColorRangeColor.BarberPole
    ? this.setStylesTopHeight.bind(this)
    : this.setStylesTransform.bind(this);

  private showSub?: Subscription;
  private minimumSub?: Subscription;
  private maximumSub?: Subscription;
  private updateEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const handler = this.updatePosition.bind(this);

    const minSub = this.minimumSub = this.minimum.sub(handler, false, true);
    const maxSub = this.maximumSub = this.maximum.sub(handler, false, true);
    const updateSub = this.updateEventSub = this.props.updateEvent.on(handler, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        minSub.resume();
        maxSub.resume();
        updateSub.resume();

        this.updatePosition();
      } else {
        minSub.pause();
        maxSub.pause();
        updateSub.pause();

        this.rootStyle.set('display', 'none');
      }
    }, true);

    this.updatePosition();
  }

  /**
   * Updates this color range's start and end positions on its parent airspeed tape.
   */
  private updatePosition(): void {
    const minimum = this.minimum.get();
    const maximum = this.maximum.get();

    if (isNaN(maximum - minimum)) {
      this.rootStyle.set('display', 'none');
      return;
    }

    const minPos = MathUtils.clamp(MathUtils.round(this.props.getPosition(minimum, true), 0.001), 0, 1);
    const maxPos = MathUtils.clamp(MathUtils.round(this.props.getPosition(maximum, true), 0.001), 0, 1);

    if (minPos <= maxPos) {
      this.rootStyle.set('display', 'none');
    } else {
      this.rootStyle.set('display', '');

      if (minPos !== this.minPos || maxPos !== this.maxPos) {
        this.setStyles(minPos, maxPos);
        this.minPos = minPos;
        this.maxPos = maxPos;
      }
    }
  }

  /**
   * Positions this color range using the top and height styles.
   * @param minPos The position of this color range's minimum airspeed on its parent tape.
   * @param maxPos The position of this color range's maximum airspeed on its parent tape.
   */
  private setStylesTopHeight(minPos: number, maxPos: number): void {
    this.rootStyle.set('top', `${maxPos * 100}%`);
    this.rootStyle.set('height', `${(minPos - maxPos) * 100}%`);
  }

  /**
   * Positions this color range using the transform style.
   * @param minPos The position of this color range's minimum airspeed on its parent tape.
   * @param maxPos The position of this color range's maximum airspeed on its parent tape.
   */
  private setStylesTransform(minPos: number, maxPos: number): void {
    const translate = maxPos * 100;
    const scale = minPos - maxPos;

    this.rootStyle.set('transform', `translate3d(0px, ${translate}%, 0px) scaleY(${scale})`);
  }

  /** @inheritdoc */
  public render(): VNode {
    const widthClass = this.props.width === AirspeedIndicatorColorRangeWidth.Full ? 'airspeed-tape-color-range-full' : 'airspeed-tape-color-range-half';
    const colorClass = AirspeedColorRange.COLOR_CLASS[this.props.color];

    return (
      <div class={`airspeed-tape-color-range ${widthClass} ${colorClass}`} style={this.rootStyle}></div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.minimumSub?.destroy();
    this.maximumSub?.destroy();
    this.updateEventSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for SpeedBug.
 */
interface SpeedBugProps extends ComponentProps {
  /** Whether the speed bug should be visible. */
  show: Subscribable<boolean>;

  /** The reference speed of the bug, in knots. */
  speedKnots: Subscribable<number>;

  /** An event which signals that the speed bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the speed bug's parent tape window at which a particular airspeed is located. */
  getPosition: (iasKnots: number) => number;

  /** CSS class(es) to apply to the speed bug's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A speed bug for a next-generation (NXi, G3000, etc) Garmin airspeed tape.
 */
class SpeedBug extends DisplayComponent<SpeedBugProps> {
  private static readonly RESERVED_CSS_CLASSES = ['airspeed-speed-bug'];

  private readonly display = Subject.create('');

  private readonly transform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translateY('%'),
    CssTransformBuilder.translate3d('px', '%', 'px')
  ));

  private cssClassSub?: Subscription | Subscription[];
  private showSub?: Subscription;
  private speedKnotsSub?: Subscription;
  private updateEventSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.transform.transform.getChild(0).set(-50);

    const updateHandler = this.updatePosition.bind(this);

    this.speedKnotsSub = this.props.speedKnots.sub(updateHandler, false, true);
    this.updateEventSub = this.props.updateEvent.on(updateHandler, true);

    this.showSub = this.props.show.sub(this.onShowChanged.bind(this), true);
  }

  /**
   * Responds to when whether to show this bug changes.
   * @param show Whether to show this bug.
   */
  private onShowChanged(show: boolean): void {
    if (show) {
      this.updatePosition();

      this.speedKnotsSub!.resume();
      this.updateEventSub!.resume();
    } else {
      this.speedKnotsSub!.pause();
      this.updateEventSub!.pause();

      this.display.set('none');
    }
  }

  /**
   * Updates this speed bug's position on its parent airspeed tape window.
   */
  private updatePosition(): void {
    const knots = this.props.speedKnots.get();
    if (isFinite(knots)) {
      this.display.set('');
      const pos = this.props.getPosition(knots);
      this.transform.transform.getChild(1).set(0, pos * 100, 0, undefined, 0.1);
      this.transform.resolve();
    } else {
      this.display.set('none');
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;
    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('airspeed-speed-bug');
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, SpeedBug.RESERVED_CSS_CLASSES);
    } else {
      cssClass = `airspeed-speed-bug ${this.props.class ?? ''}`;
    }

    return (
      <div
        class='airspeed-speed-bug-translating'
        style={{
          'display': this.display,
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '100%',
          'height': '100%',
          'transform': this.transform
        }}
      >
        <div class={cssClass} style='position: absolute; top: 50%; transform: translateY(-50%);'>
          {this.props.children}
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    this.showSub?.destroy();
    this.speedKnotsSub?.destroy();
    this.updateEventSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for ReferenceSpeedBug.
 */
interface ReferenceSpeedBugProps extends ComponentProps {
  /** Whether the bug should be visible. */
  show: Subscribable<boolean>;

  /** The reference indicated airspeed, in knots, or `null` if no such value exists. */
  referenceIas: Subscribable<number | null>;

  /** The reference mach number, or `null` if no such value exists. */
  referenceMach: Subscribable<number | null>;

  /** Whether the reference airspeed was set manually. */
  referenceIsManual: Subscribable<boolean>;

  /** The current conversion factor from mach number to knots indicated airspeed. */
  machToKias: Subscribable<number>;

  /** Whether an airspeed hold mode is active on the flight director. */
  isAirspeedHoldActive: Subscribable<boolean>;

  /** An event which signals that the speed bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the speed bug's parent tape window at which a particular airspeed is located. */
  getPosition: (iasKnots: number, clamp?: boolean) => number;
}

/**
 * A reference speed bug.
 */
class ReferenceSpeedBug extends DisplayComponent<ReferenceSpeedBugProps> {
  private readonly bugRef = FSComponent.createRef<SpeedBug>();

  private readonly bugCssClass = SetSubject.create(['airspeed-refspeed-bug']);

  private readonly manualStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly fmsStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly state = MappedSubject.create(
    this.props.referenceIas,
    this.props.referenceMach,
    this.props.referenceIsManual,
    this.props.machToKias,
    this.props.isAirspeedHoldActive
  );

  private readonly show = Subject.create(false);
  private readonly speedKnots = Subject.create(0);

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const stateSub = this.state.sub(this.update.bind(this), false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        stateSub.resume(true);
      } else {
        stateSub.pause();
        this.show.set(false);
      }
    }, true);
  }

  /**
   * Updates this speed bug.
   * @param state The current reference airspeed state.
   */
  private update(
    state: readonly [
      referenceIas: number | null,
      referenceMach: number | null,
      referenceIsManual: boolean,
      machToKias: number,
      isAirspeedHoldActive: boolean
    ]
  ): void {
    const [ias, mach, referenceIsManual, machToKias, isAirspeedHoldActive] = state;

    if (isAirspeedHoldActive && (ias !== null || mach !== null)) {
      this.bugCssClass.toggle('airspeed-refspeed-bug-manual', referenceIsManual);
      this.bugCssClass.toggle('airspeed-refspeed-bug-fms', !referenceIsManual);

      if (referenceIsManual) {
        this.fmsStyle.set('display', 'none');
        this.manualStyle.set('display', '');
      } else {
        this.manualStyle.set('display', 'none');
        this.fmsStyle.set('display', '');
      }

      if (ias !== null) {
        this.speedKnots.set(ias);
      } else {
        this.speedKnots.set(mach as number * machToKias);
      }
      this.show.set(true);
    } else {
      this.show.set(false);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <SpeedBug
        ref={this.bugRef}
        speedKnots={this.speedKnots}
        show={this.show}
        updateEvent={this.props.updateEvent}
        getPosition={(iasKnots: number): number => MathUtils.clamp(this.props.getPosition(iasKnots, true), 0, 1)}
        class={this.bugCssClass}
      >
        <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='airspeed-refspeed-bug-icon airspeed-refspeed-bug-icon-manual' style={this.manualStyle}>
          <path d="M 5 5 h 90 v 90 h -90 v -30 L 55 50 L 5 30 Z" vector-effect='non-scaling-stroke' />
        </svg>
        <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='airspeed-refspeed-bug-icon airspeed-refspeed-bug-icon-fms' style={this.fmsStyle}>
          <path d="M 5 5 v 90 l 90 -45 Z" vector-effect='non-scaling-stroke' />
        </svg>
      </SpeedBug>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    this.state.destroy();

    this.showSub?.destroy();

    super.destroy();
  }
}

/**
 * An icon for a reference V-speed bug.
 */
class VSpeedBugIcon extends DisplayComponent<ComponentProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='airspeed-vspeed-bug-icon'>
        <svg class='airspeed-vspeed-bug-icon-arrow' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <path d='M 0 50 L 100 0 L 100 100 Z' vector-effect='non-scaling-stroke' />
        </svg>
        <div class='airspeed-vspeed-bug-icon-label'>{this.props.children}</div>
      </div>
    );
  }
}

/**
 * Component props for VSpeedBug.
 */
interface VSpeedBugProps extends ComponentProps {
  /** The value of the bug's reference V-speed, in knots. */
  value: Subscribable<number>;

  /** Whether the FMS-defined value is the active value for this bug's reference V-speed. */
  isFmsValueActive: Subscribable<boolean>;

  /** The bug's label text. */
  label: string;

  /** The bug's label color. */
  labelColor: VSpeedBugColor;

  /** Whether the bug's displayed label color should ignore whether the bug's reference V-speed has been set by FMS. */
  labelColorIgnoreFms: boolean;

  /** Whether the speed bug should be visible. */
  show: Subscribable<boolean>;

  /** An event which signals that the speed bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the speed bug's parent tape window at which a particular airspeed is located. */
  getPosition: (iasKnots: number, clamp?: boolean) => number;
}

/**
 * A reference V-speed bug.
 */
class VSpeedBug extends DisplayComponent<VSpeedBugProps> {
  private readonly bugRef = FSComponent.createRef<SpeedBug>();

  private readonly isFmsValueActive = this.props.isFmsValueActive.map(SubscribableMapFunctions.identity()).pause();

  private showSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.isFmsValueActive.resume();
      } else {
        this.isFmsValueActive.pause();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <SpeedBug
        ref={this.bugRef}
        speedKnots={this.props.value}
        show={this.props.show}
        updateEvent={this.props.updateEvent}
        getPosition={(iasKnots: number): number => MathUtils.clamp(this.props.getPosition(iasKnots, false), -0.5, 1.5)}
        class={{
          'airspeed-vspeed-bug': true,
          [`airspeed-vspeed-color-${this.props.labelColor.toLowerCase()}`]: true,
          'airspeed-vspeed-color-use-fms': !this.props.labelColorIgnoreFms,
          'airspeed-vspeed-fms': this.isFmsValueActive
        }}
      >
        <VSpeedBugIcon>{this.props.label}</VSpeedBugIcon>
      </SpeedBug>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    this.isFmsValueActive.destroy();

    this.showSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link ApproachCueBug}.
 */
interface ApproachCueBugProps extends ComponentProps {
  /** The value of the bug's speed, in knots. */
  value: Subscribable<number>;

  /** Whether the speed bug should be visible. */
  show: Subscribable<boolean>;

  /** An event which signals that the speed bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the speed bug's parent tape window at which a particular airspeed is located. */
  getPosition: (iasKnots: number, clamp?: boolean) => number;
}

/**
 * An approach cue bug.
 */
class ApproachCueBug extends DisplayComponent<ApproachCueBugProps> {
  private readonly bugRef = FSComponent.createRef<SpeedBug>();

  /** @inheritDoc */
  public render(): VNode {
    return (
      <SpeedBug
        ref={this.bugRef}
        speedKnots={this.props.value}
        show={this.props.show}
        updateEvent={this.props.updateEvent}
        getPosition={(iasKnots: number): number => MathUtils.clamp(this.props.getPosition(iasKnots, false), -0.5, 1.5)}
        class='airspeed-approach-cue-bug'
      >
        <svg viewBox='-6 6 12 12' class='airspeed-approach-cue-bug-icon'>
          <path d='M 0 -6 a 6 6 90 0 0 0 12 a 6 6 90 0 0 0 -12 m 0 3.5 a 2.5 2.5 90 0 1 0 5 a 2.5 2.5 90 0 1 0 -5' vector-effect='non-scaling-stroke' />
        </svg>
      </SpeedBug>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Component props for VSpeedOffScaleLabel.
 */
interface VSpeedOffScaleLabelProps extends ComponentProps {
  /** The value of the label's reference V-speed, in knots. */
  value: Subscribable<number>;

  /** Whether the FMS-defined value is the active value for this label's reference V-speed. */
  isFmsValueActive: Subscribable<boolean>;

  /**
   * Whether the aircraft configuration does not match the one used by the FMS to calculate the value of this label's
   * V-speed reference.
   */
  isFmsConfigMiscompare: Subscribable<boolean>;

  /** The label text. */
  label: string;

  /** The label color. */
  labelColor: VSpeedBugColor;

  /** Whether the displayed label color should ignore whether the label's reference V-speed has been set by FMS. */
  labelColorIgnoreFms: boolean;

  /** Whether the label should be visible. */
  show: Subscribable<boolean>;
}

/**
 * A reference V-speed label displayed when the airspeed tape is off-scale.
 */
class VSpeedOffScaleLabel extends DisplayComponent<VSpeedOffScaleLabelProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    order: '0'
  });

  private readonly valueText = MappedSubject.create(
    ([value, isFmsValueActive, miscompare]) => isFmsValueActive && miscompare ? '–––' : value.toFixed(0),
    this.props.value,
    this.props.isFmsValueActive,
    this.props.isFmsConfigMiscompare
  ).pause();

  private readonly isFmsValueActive = this.props.isFmsValueActive.map(SubscribableMapFunctions.identity()).pause();
  private readonly isFmsConfigMiscompare = this.props.isFmsConfigMiscompare.map(SubscribableMapFunctions.identity()).pause();

  private showSub?: Subscription;
  private valueSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.valueSub = this.props.value.sub(value => {
      this.style.set('order', value.toFixed(0));
    }, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.valueText.resume();
        this.isFmsValueActive.resume();
        this.isFmsConfigMiscompare.resume();
        this.style.set('display', '');
      } else {
        this.valueText.pause();
        this.isFmsValueActive.pause();
        this.isFmsConfigMiscompare.pause();
        this.style.set('display', 'none');
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={{
          'airspeed-vspeed-offscale-label': true,
          [`airspeed-vspeed-color-${this.props.labelColor.toLowerCase()}`]: true,
          'airspeed-vspeed-color-use-fms': !this.props.labelColorIgnoreFms,
          'airspeed-vspeed-fms': this.isFmsValueActive,
          'airspeed-vspeed-fms-config-miscompare': this.isFmsConfigMiscompare
        }}
        style={this.style}
      >
        <div class='airspeed-vspeed-offscale-label-value'>{this.valueText}</div>
        <VSpeedBugIcon>{this.props.label}</VSpeedBugIcon>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.valueText.destroy();
    this.isFmsValueActive.destroy();
    this.isFmsConfigMiscompare.destroy();
    this.showSub?.destroy();
    this.valueSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for VSpeedLegend.
 */
interface VSpeedLegendProps extends ComponentProps {
  /** The value of the legend's reference V-speed, in knots. */
  value: Subscribable<number>;

  /** Whether the FMS-defined value is the active value for this legend's reference V-speed. */
  isFmsValueActive: Subscribable<boolean>;

  /**
   * Whether the aircraft configuration does not match the one used by the FMS to calculate the value of this legend's
   * V-speed reference.
   */
  isFmsConfigMiscompare: Subscribable<boolean>;

  /** The legend's label text. */
  label: string;

  /** The legend's label color. */
  labelColor: VSpeedBugColor;

  /** Whether the legend's displayed label color should ignore whether the legend's reference V-speed has been set by FMS. */
  labelColorIgnoreFms: boolean;

  /** Whether the legend should be visible. */
  show: Subscribable<boolean>;
}

/**
 * A reference V-speed legend.
 */
class VSpeedLegend extends DisplayComponent<VSpeedLegendProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    order: '0'
  });

  private readonly valueText = MappedSubject.create(
    ([value, isFmsValueActive, miscompare]) => isFmsValueActive && miscompare ? '–––' : value.toFixed(0),
    this.props.value,
    this.props.isFmsValueActive,
    this.props.isFmsConfigMiscompare
  ).pause();

  private readonly isFmsValueActive = this.props.isFmsValueActive.map(SubscribableMapFunctions.identity()).pause();
  private readonly isFmsConfigMiscompare = this.props.isFmsConfigMiscompare.map(SubscribableMapFunctions.identity()).pause();

  private showSub?: Subscription;
  private valueSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.valueSub = this.props.value.sub(value => {
      this.style.set('order', value.toFixed(0));
    }, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.valueText.resume();
        this.isFmsValueActive.resume();
        this.isFmsConfigMiscompare.resume();
        this.style.set('display', '');
      } else {
        this.valueText.pause();
        this.isFmsValueActive.pause();
        this.isFmsConfigMiscompare.pause();
        this.style.set('display', 'none');
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={{
          'airspeed-vspeed-legend': true,
          [`airspeed-vspeed-color-${this.props.labelColor.toLowerCase()}`]: true,
          'airspeed-vspeed-color-use-fms': !this.props.labelColorIgnoreFms,
          'airspeed-vspeed-fms': this.isFmsValueActive,
          'airspeed-vspeed-fms-config-miscompare': this.isFmsConfigMiscompare
        }}
        style={this.style}
      >
        <div class='airspeed-vspeed-legend-name'>{this.props.label}</div>
        <div class='airspeed-vspeed-legend-value'>{this.valueText}</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.valueText.destroy();
    this.isFmsValueActive.destroy();
    this.isFmsConfigMiscompare.destroy();
    this.showSub?.destroy();
    this.valueSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for AirspeedReferenceDisplay.
 */
interface AirspeedReferenceDisplayProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** The reference indicated airspeed, in knots, or `null` if no such value exists. */
  referenceIas: Subscribable<number | null>;

  /** The reference mach number, or `null` if no such value exists. */
  referenceMach: Subscribable<number | null>;

  /** Whether the reference airspeed was set manually. */
  referenceIsManual: Subscribable<boolean>;

  /** Whether an airspeed hold mode is active on the flight director. */
  isAirspeedHoldActive: Subscribable<boolean>;

  /** A subscribable to bind to this display's visibility state. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A display for an airspeed reference value.
 */
class AirspeedReferenceDisplay extends DisplayComponent<AirspeedReferenceDisplayProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly manualStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly fmsStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly iasStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly machStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['airspeed-refspeed-container']);

  private readonly referenceIas = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly referenceMach = Subject.create(0);

  private readonly state = MappedSubject.create(
    this.props.referenceIas,
    this.props.referenceMach,
    this.props.referenceIsManual,
    this.props.isAirspeedHoldActive
  );

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const stateSub = this.state.sub(this.update.bind(this), false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        stateSub.resume(true);
      } else {
        stateSub.pause();

        this.rootStyle.set('display', 'none');

        this.props.isVisible.set(false);
      }
    }, true);
  }

  /**
   * Updates this display.
   * @param state The current reference airspeed state.
   */
  private update(state: readonly [referenceIas: number | null, referenceMach: number | null, referenceIsManual: boolean, isAirspeedHoldActive: boolean]): void {
    const [ias, mach, referenceIsManual, isAirspeedHoldActive] = state;

    if (isAirspeedHoldActive && (ias !== null || mach !== null)) {
      this.rootCssClass.toggle('airspeed-refspeed-container-manual', referenceIsManual);
      this.rootCssClass.toggle('airspeed-refspeed-container-fms', !referenceIsManual);

      if (referenceIsManual) {
        this.fmsStyle.set('display', 'none');
        this.manualStyle.set('display', '');
      } else {
        this.manualStyle.set('display', 'none');
        this.fmsStyle.set('display', '');
      }

      if (ias !== null) {
        this.iasStyle.set('display', '');
        this.machStyle.set('display', 'none');

        this.referenceIas.set(Math.round(ias));
      } else {
        this.machStyle.set('display', '');
        this.iasStyle.set('display', 'none');

        this.referenceMach.set(MathUtils.round(mach as number, 0.001));
      }

      this.rootStyle.set('display', '');
      this.props.isVisible.set(true);
    } else {
      this.rootStyle.set('display', 'none');
      this.props.isVisible.set(false);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <svg class='airspeed-refspeed-icon airspeed-refspeed-icon-manual' viewBox='0 0 100 100' preserveAspectRatio='none' style={this.manualStyle}>
          <path d='M 5 5 h 90 v 90 h -90 v -30 L 55 50 L 5 30 Z' vector-effect='non-scaling-stroke' />
        </svg>
        <svg class='airspeed-refspeed-icon airspeed-refspeed-icon-fms' viewBox='0 0 100 100' preserveAspectRatio='none' style={this.fmsStyle}>
          <path d='M 5 5 v 90 l 90 -45 Z' vector-effect='non-scaling-stroke' />
        </svg>
        <div class='airspeed-refspeed-text'>
          <div class='airspeed-refspeed-ias' style={this.iasStyle}>
            <NumberUnitDisplay
              value={this.referenceIas}
              displayUnit={null}
              formatter={NumberFormatter.create({ precision: 1 })}
            />
          </div>
          <div class='airspeed-refspeed-mach' style={this.machStyle}>M {this.referenceMach.map(NumberFormatter.create({ pad: 0, precision: 0.001 }))}</div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.state.destroy();

    this.showSub?.destroy();
  }
}

/**
 * Component props for AirspeedAlertAnnunciation.
 */
interface AirspeedProtectionAnnunciationProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** Whether autopilot overspeed protection is active. */
  isOverspeedProtectionActive: Subscribable<boolean>;

  /** Whether autopilot underspeed protection is active. */
  isUnderspeedProtectionActive: Subscribable<boolean>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin airspeed alert annunciation.
 */
class AirspeedProtectionAnnunciation extends DisplayComponent<AirspeedProtectionAnnunciationProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly text = Subject.create('');

  private readonly protectionState = MappedSubject.create(
    this.props.isOverspeedProtectionActive,
    this.props.isUnderspeedProtectionActive
  );

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const stateSub = this.protectionState.sub(([isOverspeedActive, isUnderspeedActive]) => {
      if (isUnderspeedActive) {
        this.text.set('MINSPD');
        this.rootStyle.set('display', '');
      } else if (isOverspeedActive) {
        this.text.set('MAXSPD');
        this.rootStyle.set('display', '');
      } else {
        this.rootStyle.set('display', 'none');
      }
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        stateSub.resume(true);
      } else {
        stateSub.pause();

        this.rootStyle.set('display', 'none');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='airspeed-protection-container' style={this.rootStyle}>
        <div class='airspeed-protection-text'>{this.text}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.protectionState.destroy();

    this.showSub?.destroy();
  }
}

/**
 * Component props for AirspeedTasDisplay.
 */
interface AirspeedTasDisplayProps extends ComponentProps {
  /** Whether to the show the display. */
  show: Subscribable<boolean>;

  /** The current true airspeed, in knots. */
  tasKnots: Subscribable<number>;

  /** Whether airspeed data is in a failed state. */
  isDataFailed: Subscribable<boolean>;

  /** A subscribable to bind to this display's visibility state. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A true airspeed display for an airspeed indicator.
 */
class AirspeedTasDisplay extends DisplayComponent<AirspeedTasDisplayProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: ''
  });

  private readonly tas = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private showSub?: Subscription;
  private tasSub?: Subscription;
  private isDataFailedSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const tasSub = this.tasSub = this.props.tasKnots.sub(this.update.bind(this), false, true);

    const isDataFailedSub = this.isDataFailedSub = this.props.isDataFailed.sub(isFailed => {
      if (isFailed) {
        tasSub.pause();

        this.rootStyle.set('display', 'none');
        this.props.isVisible.set(false);
      } else {
        this.rootStyle.set('display', '');
        this.props.isVisible.set(true);

        tasSub.resume(true);
      }
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        isDataFailedSub.resume(true);
      } else {
        isDataFailedSub.pause();
        tasSub.pause();

        this.rootStyle.set('display', 'none');
        this.props.isVisible.set(false);
      }
    }, true);
  }

  /**
   * Updates this display.
   * @param tasKnots The current true airspeed, in knots.
   */
  private update(tasKnots: number): void {
    this.tas.set(MathUtils.round(tasKnots, 1));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='airspeed-bottom-display airspeed-tas-display' style={this.rootStyle}>
        <div class='airspeed-tas-display-title'>TAS</div>
        <NumberUnitDisplay
          value={this.tas}
          displayUnit={null}
          formatter={NumberFormatter.create({ precision: 1 })}
          class='airspeed-tas-display-value'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.tasSub?.destroy();
    this.isDataFailedSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for AirspeedMachDisplay.
 */
interface AirspeedMachDisplayProps extends ComponentProps {
  /** Whether to the show the display. */
  show: Subscribable<boolean>;

  /** The current mach number. */
  mach: Subscribable<number>;

  /** The minimum mach number required to show the display. */
  threshold: number | Subscribable<number>;

  /** Whether airspeed data is in a failed state. */
  isDataFailed: Subscribable<boolean>;

  /** A subscribable to bind to this display's visibility state. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A mach display for an airspeed indicator.
 */
class AirspeedMachDisplay extends DisplayComponent<AirspeedMachDisplayProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly roundedMach = Subject.create(0);

  private readonly state = MappedSubject.create(
    this.props.mach,
    SubscribableUtils.toSubscribable(this.props.threshold, true)
  );

  private showSub?: Subscription;
  private isDataFailedSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const stateSub = this.state.sub(this.update.bind(this), false, true);

    const isDataFailedSub = this.isDataFailedSub = this.props.isDataFailed.sub(isFailed => {
      if (isFailed) {
        stateSub.pause();

        this.rootStyle.set('display', 'none');
        this.props.isVisible.set(false);
      } else {
        stateSub.resume(true);
      }
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        isDataFailedSub.resume(true);
      } else {
        isDataFailedSub.pause();
        stateSub.pause();

        this.rootStyle.set('display', 'none');
        this.props.isVisible.set(false);
      }
    }, true);
  }

  /**
   * Updates this display.
   * @param state The state of this display.
   */
  private update(state: readonly [mach: number, threshold: number]): void {
    const [mach, threshold] = state;

    if (mach < threshold) {
      this.rootStyle.set('display', 'none');
      this.props.isVisible.set(false);
    } else {
      this.roundedMach.set(MathUtils.round(mach, 0.001));

      this.rootStyle.set('display', '');
      this.props.isVisible.set(true);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='airspeed-bottom-display airspeed-mach-display' style={this.rootStyle}>
        <div class='airspeed-mach-display-value'>M {this.roundedMach.map(NumberFormatter.create({ precision: 0.001, pad: 0 }))}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.state.destroy();

    this.showSub?.destroy();
    this.isDataFailedSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for AirspeedVSpeedAnnunciation.
 */
interface AirspeedVSpeedAnnunciationProps extends ComponentProps {
  /** The type of V-speed annunciation that the component displays. */
  annunciationType: VSpeedAnnunciation;

  /** Whether to the show the annunciation. */
  show: Subscribable<boolean>;

  /** The currently active V-speed annunciation. */
  activeAnnunciation: Subscribable<VSpeedAnnunciation>;

  /** Whether airspeed data is in a failed state. */
  isDataFailed: Subscribable<boolean>;

  /** A subscribable to bind to this annunciation's visibility state. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A V-speed annunciation an airspeed indicator.
 */
class AirspeedVSpeedAnnunciation extends DisplayComponent<AirspeedVSpeedAnnunciationProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: ''
  });

  private showSub?: Subscription;
  private annunciationSub?: Subscription;
  private isDataFailed?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const annunciationSub = this.annunciationSub = this.props.activeAnnunciation.sub(this.update.bind(this), false, true);

    const isDataFailedSub = this.isDataFailed = this.props.isDataFailed.sub(isFailed => {
      if (isFailed) {
        annunciationSub.pause();

        this.rootStyle.set('display', 'none');
        this.props.isVisible.set(false);
      } else {
        annunciationSub.resume(true);
      }
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        isDataFailedSub.resume(true);
      } else {
        isDataFailedSub.pause();
        annunciationSub.pause();

        this.rootStyle.set('display', 'none');
        this.props.isVisible.set(false);
      }
    }, true);
  }

  /**
   * Updates this display.
   * @param annunciation The current true airspeed, in knots.
   */
  private update(annunciation: VSpeedAnnunciation): void {
    if (annunciation === this.props.annunciationType) {
      this.rootStyle.set('display', '');
      this.props.isVisible.set(true);
    } else {
      this.rootStyle.set('display', 'none');
      this.props.isVisible.set(false);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    let typeClass: string;
    switch (this.props.annunciationType) {
      case VSpeedAnnunciation.Takeoff:
        typeClass = 'airspeed-vspeed-annunciation-takeoff';
        break;
      case VSpeedAnnunciation.Landing:
        typeClass = 'airspeed-vspeed-annunciation-landing';
        break;
      default:
        typeClass = '';
    }

    return (
      <div class={`airspeed-bottom-display airspeed-vspeed-annunciation ${typeClass}`} style={this.rootStyle}>
        <div class='airspeed-vspeed-annunciation-box'>VSPEEDS</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.isDataFailed?.destroy();
    this.annunciationSub?.destroy();

    super.destroy();
  }
}
