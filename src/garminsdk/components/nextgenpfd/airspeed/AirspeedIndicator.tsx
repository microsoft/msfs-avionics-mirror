import {
  BitFlags, CombinedSubject, ComponentProps, DigitScroller, DisplayComponent, EventBus, FSComponent, MappedSubject, MappedSubscribable, MathUtils,
  MutableSubscribable, NodeReference, NumberFormatter, NumberUnitSubject, ObjectSubject, SetSubject, SubEvent, Subject, Subscribable, SubscribableMapFunctions,
  SubscribableSet, SubscribableUtils, Subscription, UnitType, UserSettingManager, VNode
} from 'msfssdk';

import { VSpeedUserSettingTypes } from '../../../settings/VSpeedUserSettings';
import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';
import { AirspeedIndicatorColorRange, AirspeedIndicatorColorRangeColor, AirspeedIndicatorColorRangeWidth } from './AirspeedIndicatorColorRange';
import { AirspeedAlert, AirspeedIndicatorDataProvider } from './AirspeedIndicatorDataProvider';

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
 * A definition for an airspeed indicator reference V-speed bug.
 */
export type VSpeedBugDefinition = {
  /** The name of the bug's reference V-speed. */
  readonly name: string;

  /** The bug's label text. */
  readonly label: string;
}

/**
 * Options for an airspeed indicator's displayed reference V-speed bugs.
 */
export type VSpeedBugOptions = {
  /** A user setting manager containing reference V-speed settings. */
  vSpeedSettingManager: UserSettingManager<VSpeedUserSettingTypes>;

  /** An iterable of definitions for each displayed reference V-speed bug. */
  vSpeedBugDefinitions: Iterable<VSpeedBugDefinition>;
};

/**
 * Component props for AirspeedIndicator.
 */
export interface AirspeedIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A data provider for the indicator. */
  dataProvider: AirspeedIndicatorDataProvider;

  /** Scale options for the airspeed tape. */
  tapeScaleOptions: Readonly<AirspeedTapeScaleOptions>;

  /** Definitions for color ranges to include on the airspeed tape. */
  colorRanges: Iterable<AirspeedIndicatorColorRange>;

  /** Options for the trend vector. */
  trendVectorOptions: Readonly<AirspeedTrendVectorOptions>;

  /** Options for airspeed alerts. */
  airspeedAlertOptions: Readonly<AirspeedAlertOptions>;

  /** Options for the bottom display box. */
  bottomDisplayOptions: Readonly<AirspeedIndicatorBottomDisplayOptions>;

  /** Options for reference V-speed bugs. */
  vSpeedBugOptions: Readonly<VSpeedBugOptions>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD airspeed indicator.
 */
export class AirspeedIndicator extends DisplayComponent<AirspeedIndicatorProps> {
  private readonly referenceRef = FSComponent.createRef<AirspeedReferenceDisplay>();
  private readonly alertRef = FSComponent.createRef<AirspeedProtectionAnnunciation>();
  private readonly tapeRef = FSComponent.createRef<AirspeedTape>();

  private readonly rootCssClass = SetSubject.create(['airspeed']);

  private readonly airspeedAlertOptions = { ...this.props.airspeedAlertOptions };

  private readonly activeAlert = this.props.dataProvider.airspeedAlerts.map((alerts): AirspeedAlert => {
    // We should never have an overspeed and underspeed alert at the same time, but just in case, underspeed alerts
    // will take precedence

    if (this.airspeedAlertOptions.supportUnderspeed && BitFlags.isAny(alerts, AirspeedAlert.Underspeed)) {
      return AirspeedAlert.Underspeed;
    } else if (this.airspeedAlertOptions.supportOverspeed && BitFlags.isAny(alerts, AirspeedAlert.Overspeed)) {
      return AirspeedAlert.Overspeed;
    } else if (this.airspeedAlertOptions.supportTrendUnderspeed && BitFlags.isAny(alerts, AirspeedAlert.TrendUnderspeed)) {
      return AirspeedAlert.TrendUnderspeed;
    } else if (this.airspeedAlertOptions.supportTrendOverspeed && BitFlags.isAny(alerts, AirspeedAlert.TrendOverspeed)) {
      return AirspeedAlert.TrendOverspeed;
    } else {
      return AirspeedAlert.None;
    }
  });

  private readonly isReferenceDisplayVisible = Subject.create(false);
  private readonly isBottomSpeedDisplayVisible = Subject.create(false);

  /** @inheritdoc */
  constructor(props: AirspeedIndicatorProps) {
    super(props);

    this.activeAlert.pause();
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.activeAlert.resume();

    this.isReferenceDisplayVisible.sub(isVisible => {
      if (isVisible) {
        this.rootCssClass.add('airspeed-reference-visible');
      } else {
        this.rootCssClass.delete('airspeed-reference-visible');
      }
    }, true);

    this.isBottomSpeedDisplayVisible.sub(isVisible => {
      if (isVisible) {
        this.rootCssClass.add('airspeed-bottom-speed-display-visible');
      } else {
        this.rootCssClass.delete('airspeed-bottom-speed-display-visible');
      }
    }, true);

    this.activeAlert.sub(this.updateAlertClass.bind(this), true);
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <AirspeedTape
          ref={this.tapeRef}
          dataProvider={this.props.dataProvider}
          {...this.props.tapeScaleOptions}
          colorRanges={this.props.colorRanges}
          {...this.props.trendVectorOptions}
          {...this.props.vSpeedBugOptions}
        />
        <div class='airspeed-top-container'>
          <AirspeedReferenceDisplay
            ref={this.referenceRef}
            referenceIas={this.props.dataProvider.referenceIas}
            referenceMach={this.props.dataProvider.referenceMach}
            isAirspeedHoldActive={this.props.dataProvider.isAirspeedHoldActive}
            isVisible={this.isReferenceDisplayVisible}
          />
          <AirspeedProtectionAnnunciation
            ref={this.alertRef}
            isOverspeedProtectionActive={this.props.dataProvider.isOverspeedProtectionActive}
            isUnderspeedProtectionActive={this.props.dataProvider.isUnderspeedProtectionActive}
          />
        </div>
        <div class='airspeed-bottom-container'>
          {
            this.props.bottomDisplayOptions.mode === AirspeedIndicatorBottomDisplayMode.TrueAirspeed
              ? (
                <AirspeedTasDisplay
                  tasKnots={this.props.dataProvider.tasKnots}
                  isVisible={this.isBottomSpeedDisplayVisible}
                />
              )
              : (
                <AirspeedMachDisplay
                  mach={this.props.dataProvider.mach}
                  threshold={this.props.bottomDisplayOptions.machThreshold ?? Subject.create(0)}
                  isVisible={this.isBottomSpeedDisplayVisible}
                />
              )
          }
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.referenceRef.getOrDefault()?.destroy();
    this.alertRef.getOrDefault()?.destroy();
    this.tapeRef.getOrDefault()?.destroy();

    this.activeAlert.destroy();
  }
}

/**
 * Component props for AirspeedTape.
 */
interface AirspeedTapeProps extends ComponentProps {
  /** A data provider for the indicator. */
  dataProvider: AirspeedIndicatorDataProvider;

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

  /** A user setting manager containing reference V-speed settings. */
  vSpeedSettingManager: UserSettingManager<VSpeedUserSettingTypes>;

  /** An iterable of definitions for each displayed reference V-speed bug. */
  vSpeedBugDefinitions: Iterable<VSpeedBugDefinition>;
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
  private readonly manualRefSpeedBugRef = FSComponent.createRef<ManualReferenceSpeedBug>();
  private readonly vSpeedBugRefs: NodeReference<VSpeedBug>[] = [];
  private readonly vSpeedOffScaleLabelRefs: NodeReference<VSpeedOffScaleLabel>[] = [];

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

  private readonly currentLength = Subject.create(0);
  private currentMinimum = 0;
  private readonly currentTranslate = Subject.create(0);

  private readonly minimum = SubscribableUtils.toSubscribable(this.props.minimum, true);
  private readonly maximum = SubscribableUtils.toSubscribable(this.props.maximum, true);
  private readonly window = SubscribableUtils.toSubscribable(this.props.window, true);
  private readonly majorTickInterval = SubscribableUtils.toSubscribable(this.props.majorTickInterval, true);
  private readonly minorTickFactor = SubscribableUtils.toSubscribable(this.props.minorTickFactor, true);

  private readonly options = CombinedSubject.create(
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
  );

  private readonly isIasAboveScale = MappedSubject.create(
    ([iasKnots, maximum]): boolean => {
      return iasKnots > maximum;
    },
    this.props.dataProvider.iasKnots,
    this.maximum
  );

  private readonly isIasOffScale = MappedSubject.create(
    ([isIasBelowScale, isIasAboveScale]): boolean => {
      return isIasBelowScale || isIasAboveScale;
    },
    this.isIasBelowScale,
    this.isIasAboveScale
  );

  private readonly iasTapeValue = MappedSubject.create(
    ([iasKnots, minimum, maximum]): number => {
      return MathUtils.clamp(iasKnots, minimum, maximum);
    },
    this.props.dataProvider.iasKnots,
    this.minimum,
    this.maximum
  );

  private readonly iasBoxValue = MappedSubject.create(
    ([iasKnots, isIasOffScale]): number => {
      return isIasOffScale ? NaN : iasKnots;
    },
    this.props.dataProvider.iasKnots,
    this.isIasOffScale
  );

  private readonly trendThreshold = SubscribableUtils.toSubscribable(this.props.trendThreshold, true);

  private readonly showTrendVector = MappedSubject.create(
    ([iasKnot, minimum, maximum, threshold, iasTrend]): boolean => {
      return iasKnot >= minimum && iasKnot < maximum && Math.abs(iasTrend) >= threshold;
    },
    this.props.dataProvider.iasKnots,
    this.minimum,
    this.maximum,
    this.trendThreshold,
    this.props.dataProvider.iasTrend
  );

  private readonly iasTrendParams = CombinedSubject.create(
    this.props.dataProvider.iasTrend,
    this.window
  );

  private readonly trendVectorHeight = Subject.create(0);
  private readonly trendVectorScale = Subject.create(1);

  private readonly updateTapeEvent = new SubEvent<this, void>();
  private readonly updateTapeWindowEvent = new SubEvent<this, void>();

  private readonly colorRangeSubscribables: MappedSubscribable<number>[] = [];

  /** @inheritdoc */
  constructor(props: AirspeedTapeProps) {
    super(props);

    this.iasTapeValue.pause();
    this.iasBoxValue.pause();
    this.showTrendVector.pause();
    this.iasTrendParams.pause();
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.iasTapeValue.resume();
    this.iasBoxValue.resume();

    this.iasTapeValue.sub(this.updateTape.bind(this));

    this.iasTrendParams.sub(this.updateTrendVector.bind(this));

    this.showTrendVector.resume();
    this.showTrendVector.sub(show => {
      if (show) {
        this.trendVectorStyle.set('display', '');
        this.iasTrendParams.resume();
      } else {
        this.iasTrendParams.pause();
        this.trendVectorStyle.set('display', 'none');
      }
    }, true);

    this.trendVectorHeight.sub(height => { this.trendVectorStyle.set('height', `${height}%`); });
    this.trendVectorScale.sub(scale => { this.trendVectorStyle.set('transform', `scale(${scale}) rotateX(0deg)`); });

    this.currentTranslate.sub(translate => {
      this.tapeStyle.set('transform', `translate3d(0, ${translate * 100}%, 0)`);
    });

    this.options.sub(this.rebuildTape.bind(this), true);

    this.isIasBelowScale.sub(isIasBelowScale => {
      this.vSpeedOffScaleContainerStyle.set('display', isIasBelowScale ? 'flex' : 'none');
    }, true);
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>

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
        </div>

        <div class='airspeed-trend' style={this.trendVectorStyle}>
        </div>

        <div class='airspeed-vspeed-offscale-container' style={this.vSpeedOffScaleContainerStyle}>
          {this.renderOffScaleVSpeedLabels()}
        </div>

        <div class='airspeed-vspeed-bug-container' style='position: absolute; top: 0; height: 100%; overflow: hidden;'>
          {this.renderVSpeedBugs()}
        </div>

        <AirspeedIasDisplayBox ref={this.iasBoxRef} ias={this.iasBoxValue} />

        <div class='airspeed-refspeed-bug-container' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden;'>
          <ManualReferenceSpeedBug
            ref={this.manualRefSpeedBugRef}
            referenceIas={this.props.dataProvider.referenceIas}
            referenceMach={this.props.dataProvider.referenceMach}
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

      if (SubscribableUtils.isSubscribable(minimum)) {
        this.colorRangeSubscribables.push(minimum);
      }
      if (SubscribableUtils.isSubscribable(maximum)) {
        this.colorRangeSubscribables.push(maximum);
      }

      ranges.push(
        <AirspeedColorRange
          ref={ref}
          width={definition.width}
          color={definition.color}
          minimum={minimum}
          maximum={maximum}
          updateEvent={this.updateTapeEvent}
          getPosition={getPosition}
        />
      );
    }

    return ranges;
  }

  /**
   * Renders this tape's reference V-speed bugs.
   * @returns This tape's reference V-speed bugs, as an array of VNodes.
   */
  private renderVSpeedBugs(): VNode[] {
    const getPosition = this.calculateWindowTapePosition.bind(this);
    const bugs: VNode[] = [];

    for (const def of this.props.vSpeedBugDefinitions) {
      const valueSetting = this.props.vSpeedSettingManager.tryGetSetting(`vSpeedValue_${def.name}`);
      const showSetting = this.props.vSpeedSettingManager.tryGetSetting(`vSpeedShow_${def.name}`);

      if (valueSetting !== undefined && showSetting !== undefined) {
        const ref = FSComponent.createRef<VSpeedBug>();
        this.vSpeedBugRefs.push(ref);

        bugs.push(
          <VSpeedBug
            ref={ref}
            value={valueSetting}
            label={def.label}
            isVisible={MappedSubject.create(([isIasOffScale, show]): boolean => !isIasOffScale && show, this.isIasOffScale, showSetting)}
            updateEvent={this.updateTapeWindowEvent}
            getPosition={getPosition}
          />
        );
      }
    }

    return bugs;
  }

  /**
   * Renders this tape's reference V-speed off-scale labels.
   * @returns This tape's reference V-speed off-scale labels, as an array of VNodes.
   */
  private renderOffScaleVSpeedLabels(): VNode[] {
    const labels: VNode[] = [];

    for (const def of this.props.vSpeedBugDefinitions) {
      const valueSetting = this.props.vSpeedSettingManager.tryGetSetting(`vSpeedValue_${def.name}`);
      const showSetting = this.props.vSpeedSettingManager.tryGetSetting(`vSpeedShow_${def.name}`);

      if (valueSetting !== undefined && showSetting !== undefined) {
        const ref = FSComponent.createRef<VSpeedOffScaleLabel>();
        this.vSpeedOffScaleLabelRefs.push(ref);

        labels.push(
          <VSpeedOffScaleLabel
            ref={ref}
            value={valueSetting}
            label={def.label}
            isVisible={showSetting}
          />
        );
      }
    }

    return labels;
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

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

    this.options.destroy();
    this.isIasBelowScale.destroy();
    this.isIasAboveScale.destroy();
    this.isIasOffScale.destroy();
    this.iasTapeValue.destroy();
    this.iasBoxValue.destroy();
    this.iasTrendParams.destroy();

    for (const subscribable of this.colorRangeSubscribables) {
      subscribable.destroy();
    }
  }
}

/**
 * Component props for AirspeedIasDisplayBox.
 */
interface AirspeedIasDisplayBoxProps extends ComponentProps {
  /** The indicated airspeed value to display. */
  ias: Subscribable<number>;
}

/**
 * An indicated airspeed display box for a next-generation (NXi, G3000, etc) Garmin airspeed tape.
 */
class AirspeedIasDisplayBox extends DisplayComponent<AirspeedIasDisplayBoxProps> {
  private readonly scrollerRefs: NodeReference<DigitScroller>[] = [];

  /** @inheritdoc */
  public render(): VNode {
    const onesScrollerRef = FSComponent.createRef<DigitScroller>();
    const tensScrollerRef = FSComponent.createRef<DigitScroller>();
    const hundredsScrollerRef = FSComponent.createRef<DigitScroller>();

    this.scrollerRefs.push(onesScrollerRef, tensScrollerRef, hundredsScrollerRef);

    return (
      <div class='airspeed-ias-box'>
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
              value={this.props.ias}
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
              value={this.props.ias}
              base={10}
              factor={10}
              scrollThreshold={9}
            />
          </div>
          <div class='airspeed-ias-box-digit-container airspeed-ias-box-ones'>
            <div class='airspeed-ias-box-digit-bg' />
            <DigitScroller
              ref={onesScrollerRef}
              value={this.props.ias}
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
    super.destroy();

    for (const ref of this.scrollerRefs) {
      ref.getOrDefault()?.destroy();
    }
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

  private readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    top: '0%',
    height: '0%'
  });

  private readonly minimum = SubscribableUtils.toSubscribable(this.props.minimum, true);
  private readonly maximum = SubscribableUtils.toSubscribable(this.props.maximum, true);

  private minimumSub?: Subscription;
  private maximumSub?: Subscription;
  private updateEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const handler = this.updatePosition.bind(this);

    this.minimumSub = this.minimum.sub(handler);
    this.maximumSub = this.maximum.sub(handler);
    this.updateEventSub = this.props.updateEvent.on(handler);

    this.updatePosition();
  }

  /**
   * Updates this color range's start and end positions on its parent airspeed tape.
   */
  private updatePosition(): void {
    const minPos = MathUtils.clamp(this.props.getPosition(this.minimum.get(), true), 0, 1);
    const maxPos = MathUtils.clamp(this.props.getPosition(this.maximum.get(), true), 0, 1);

    if (minPos <= maxPos) {
      this.style.set('display', 'none');
    } else {
      this.style.set('display', '');

      this.style.set('top', `${maxPos * 100}%`);
      this.style.set('height', `${(minPos - maxPos) * 100}%`);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    const widthClass = this.props.width === AirspeedIndicatorColorRangeWidth.Full ? 'airspeed-tape-color-range-full' : 'airspeed-tape-color-range-half';
    const colorClass = AirspeedColorRange.COLOR_CLASS[this.props.color];

    return (
      <div class={`airspeed-tape-color-range ${widthClass} ${colorClass}`} style={this.style}></div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.minimumSub?.destroy();
    this.maximumSub?.destroy();
    this.updateEventSub?.destroy();
  }
}

/**
 * Component props for SpeedBug.
 */
interface SpeedBugProps extends ComponentProps {
  /** The reference speed of the bug, in knots. */
  speedKnots: Subscribable<number>;

  /** Whether the speed bug is visible. */
  isVisible: Subscribable<boolean>;

  /** An event which signals that the speed bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the speed bug's parent tape window at which a particular airspeed is located. */
  getPosition: (iasKnots: number) => number;

  /** CSS class(es) to apply to the speed bug's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A speed bug for a next-generation (NXi, G3000, etc) Garmin airspeed tape.
 */
class SpeedBug extends DisplayComponent<SpeedBugProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    top: '50%',
    transform: 'translate3d(0, -50%, 0)'
  });

  private readonly position = Subject.create(0);

  private speedKnotsRounded?: MappedSubscribable<number>;

  private cssClassSub?: Subscription;
  private isVisibleSub?: Subscription;
  private updateEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const updateHandler = this.updatePosition.bind(this);

    this.speedKnotsRounded = this.props.speedKnots.map(SubscribableMapFunctions.withPrecision(1));
    this.speedKnotsRounded.pause();
    this.speedKnotsRounded.sub(updateHandler);
    this.updateEventSub = this.props.updateEvent.on(updateHandler, true);

    this.position.sub(translate => {
      this.style.set('top', `${translate}%`);
    });

    this.isVisibleSub = this.props.isVisible.sub(isVisible => {
      if (isVisible) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.speedKnotsRounded!.resume();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.updateEventSub!.resume();

        this.style.set('display', '');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.speedKnotsRounded!.pause();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.updateEventSub!.pause();

        this.style.set('display', 'none');
      }
    }, true);
  }

  /**
   * Updates this speed bug's position on its parent airspeed tape window.
   */
  private updatePosition(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pos = this.props.getPosition(this.speedKnotsRounded!.get());
    this.position.set(MathUtils.round(pos * 100, 0.1));
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;
    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['airspeed-speed-bug']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, ['airspeed-speed-bug']);
    } else {
      cssClass = `airspeed-speed-bug ${this.props.class ?? ''}`;
    }

    return (
      <div class={cssClass} style={this.style}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.speedKnotsRounded?.destroy();

    this.cssClassSub?.destroy();
    this.isVisibleSub?.destroy();
    this.updateEventSub?.destroy();
  }
}

/**
 * Component props for ReferenceSpeedBug.
 */
interface ReferenceSpeedBugProps extends ComponentProps {
  /** The reference indicated airspeed, in knots, or `null` if no such value exists. */
  referenceIas: Subscribable<number | null>;

  /** The reference mach number, or `null` if no such value exists. */
  referenceMach: Subscribable<number | null>;

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
abstract class ReferenceSpeedBug extends DisplayComponent<ReferenceSpeedBugProps> {
  private readonly bugRef = FSComponent.createRef<SpeedBug>();

  private readonly state = CombinedSubject.create(
    this.props.referenceIas,
    this.props.referenceMach,
    this.props.machToKias,
    this.props.isAirspeedHoldActive
  );

  private readonly isVisible = Subject.create(false);
  private readonly speedKnots = Subject.create(0);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.state.sub(this.update.bind(this), true);
  }

  /**
   * Updates this speed bug.
   * @param state The current reference airspeed state.
   */
  private update(
    state: readonly [
      referenceIas: number | null,
      referenceMach: number | null,
      machToKias: number,
      isAirspeedHoldActive: boolean
    ]
  ): void {
    const [ias, mach, machToKias, isAirspeedHoldActive] = state;

    if (isAirspeedHoldActive && (ias !== null || mach !== null)) {
      if (ias !== null) {
        this.speedKnots.set(ias);
      } else {
        this.speedKnots.set(mach as number * machToKias);
      }
      this.isVisible.set(true);
    } else {
      this.isVisible.set(false);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <SpeedBug
        ref={this.bugRef}
        speedKnots={this.speedKnots}
        isVisible={this.isVisible}
        updateEvent={this.props.updateEvent}
        getPosition={(iasKnots: number): number => MathUtils.clamp(this.props.getPosition(iasKnots, true), 0, 1)}
        class='airspeed-refspeed-bug'
      >
        {this.renderContent()}
      </SpeedBug>
    );
  }

  /**
   * Renders this speed bug's content.
   */
  protected abstract renderContent(): VNode;

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.bugRef.getOrDefault()?.destroy();
    this.state.destroy();
  }
}

/**
 * A manual reference speed bug.
 */
class ManualReferenceSpeedBug extends ReferenceSpeedBug {
  /** @inheritdoc */
  protected renderContent(): VNode {
    return (
      <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='airspeed-refspeed-bug-manual-icon'>
        <path d="M 5 5 h 90 v 90 h -90 v -30 L 55 50 L 5 30 Z" vector-effect='non-scaling-stroke' />
      </svg>
    );
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

  /** The bug's label text. */
  label: string;

  /** Whether the speed bug should be visible. */
  isVisible: Subscribable<boolean>;

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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <SpeedBug
        ref={this.bugRef}
        speedKnots={this.props.value}
        isVisible={this.props.isVisible}
        updateEvent={this.props.updateEvent}
        getPosition={(iasKnots: number): number => MathUtils.clamp(this.props.getPosition(iasKnots, false), -0.5, 1.5)}
        class='airspeed-vspeed-bug'
      >
        <VSpeedBugIcon>{this.props.label}</VSpeedBugIcon>
      </SpeedBug>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.bugRef.getOrDefault()?.destroy();
  }
}

/**
 * Component props for VSpeedOffScaleLabel.
 */
interface VSpeedOffScaleLabelProps extends ComponentProps {
  /** The value of the bug's reference V-speed, in knots. */
  value: Subscribable<number>;

  /** The bug's label text. */
  label: string;

  /** Whether the label should be visible. */
  isVisible: Subscribable<boolean>;
}

/**
 * A reference V-speed label displayed when the airspeed tape is off-scale.
 */
class VSpeedOffScaleLabel extends DisplayComponent<VSpeedOffScaleLabelProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    order: '0'
  });

  private readonly valueText = this.props.value.map(NumberFormatter.create({ precision: 1 }));

  private isVisibleSub?: Subscription;
  private valueSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isVisibleSub = this.props.isVisible.sub(isVisible => {
      this.style.set('display', isVisible ? '' : 'none');
    }, true);

    this.valueSub = this.props.value.sub(value => {
      this.style.set('order', value.toFixed(0));
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='airspeed-vspeed-offscale-label' style={this.style}>
        <div class='airspeed-vspeed-offscale-label-value'>{this.valueText}</div>
        <VSpeedBugIcon>{this.props.label}</VSpeedBugIcon>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.valueText.destroy();
    this.isVisibleSub?.destroy();
    this.valueSub?.destroy();
  }
}

/**
 * Component props for AirspeedReferenceDisplay.
 */
interface AirspeedReferenceDisplayProps extends ComponentProps {
  /** The reference indicated airspeed, in knots, or `null` if no such value exists. */
  referenceIas: Subscribable<number | null>;

  /** The reference mach number, or `null` if no such value exists. */
  referenceMach: Subscribable<number | null>;

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
  private readonly iasStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly machStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly referenceIas = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly referenceMach = Subject.create(0);

  private readonly state = CombinedSubject.create(
    this.props.referenceIas,
    this.props.referenceMach,
    this.props.isAirspeedHoldActive
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.state.sub(this.update.bind(this), true);
  }

  /**
   * Updates this display.
   * @param state The current reference airspeed state.
   */
  private update(state: readonly [referenceIas: number | null, referenceMach: number | null, isAirspeedHoldActive: boolean]): void {
    const [ias, mach, isAirspeedHoldActive] = state;

    if (isAirspeedHoldActive && (ias !== null || mach !== null)) {
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
      <div class='airspeed-refspeed-container' style={this.rootStyle}>
        <svg class='airspeed-refspeed-icon' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <path d='M 5 5 h 90 v 90 h -90 v -30 L 55 50 L 5 30 Z' vector-effect='non-scaling-stroke' />
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
  }
}

/**
 * Component props for AirspeedAlertAnnunciation.
 */
interface AirspeedProtectionAnnunciationProps extends ComponentProps {
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

  private readonly protectionState = CombinedSubject.create(
    this.props.isOverspeedProtectionActive,
    this.props.isUnderspeedProtectionActive
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.protectionState.sub(([isOverspeedActive, isUnderspeedActive]) => {
      if (isUnderspeedActive) {
        this.text.set('MINSPD');
        this.rootStyle.set('display', '');
      } else if (isOverspeedActive) {
        this.text.set('MAXSPD');
        this.rootStyle.set('display', '');
      } else {
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
  }
}

/**
 * Component props for AirspeedTasDisplay.
 */
interface AirspeedTasDisplayProps extends ComponentProps {
  /** The current true airspeed, in knots. */
  tasKnots: Subscribable<number>;

  /** A subscribable to bind to this display's visibility state. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A true airspeed display for an airspeed indicator.
 */
class AirspeedTasDisplay extends DisplayComponent<AirspeedTasDisplayProps> {
  private readonly style = ObjectSubject.create({
    display: ''
  });

  private readonly tas = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private tasSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.tasSub = this.props.tasKnots.sub(this.update.bind(this), true);

    this.props.isVisible.set(true);
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
      <div class='airspeed-bottom-speed-display airspeed-tas-display' style={this.style}>
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
    super.destroy();

    this.tasSub?.destroy();
  }
}

/**
 * Component props for AirspeedMachDisplay.
 */
interface AirspeedMachDisplayProps extends ComponentProps {
  /** The current mach number. */
  mach: Subscribable<number>;

  /** The minimum mach number required to show the display. */
  threshold: number | Subscribable<number>;

  /** A subscribable to bind to this display's visibility state. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A mach display for an airspeed indicator.
 */
class AirspeedMachDisplay extends DisplayComponent<AirspeedMachDisplayProps> {
  private readonly style = ObjectSubject.create({
    display: 'none'
  });

  private readonly roundedMach = Subject.create(0);

  private readonly state = CombinedSubject.create(
    this.props.mach,
    SubscribableUtils.toSubscribable(this.props.threshold, true)
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.state.sub(this.update.bind(this), true);
  }

  /**
   * Updates this display.
   * @param state The state of this display.
   */
  private update(state: readonly [mach: number, threshold: number]): void {
    const [mach, threshold] = state;

    if (mach < threshold) {
      this.style.set('display', 'none');
      this.props.isVisible.set(false);
    } else {
      this.roundedMach.set(MathUtils.round(mach, 0.001));

      this.style.set('display', '');
      this.props.isVisible.set(true);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='airspeed-bottom-speed-display airspeed-mach-display' style={this.style}>
        <div class='airspeed-mach-display-value'>M {this.roundedMach.map(NumberFormatter.create({ precision: 0.001, pad: 0 }))}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.state.destroy();
  }
}