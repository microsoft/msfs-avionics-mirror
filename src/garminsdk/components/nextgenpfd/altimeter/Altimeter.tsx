import {
  ComponentProps, ComputedSubject, DebounceTimer, DigitScroller, DisplayComponent, EventBus, FSComponent, MappedSubject,
  MathUtils, NodeReference, NumberFormatter, NumberUnitSubject, ObjectSubject, SetSubject, SubEvent, Subject, Subscribable, SubscribableMapFunctions,
  SubscribableSet, SubscribableUtils, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AltimeterUserSettingTypes } from '../../../settings';
import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';
import { AltimeterDataProvider } from './AltimeterDataProvider';
import { AltitudeAlertState } from './AltitudeAlerter';
import { MinimumsAlertState } from '../minimums/MinimumsAlerter';

/**
 * Scale options for an altimeter tape.
 */
export type AltimeterTapeScaleOptions = Pick<AltimeterTapeProps, 'minimum' | 'maximum' | 'window' | 'majorTickInterval' | 'minorTickFactor'>;

/**
 * Options for an altitude trend vector.
 */
export type AltimeterTrendVectorOptions = Pick<AltimeterTapeProps, 'trendThreshold'>;

/**
 * Component props for Altimeter.
 */
export interface AltimeterProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A data provider for the indicator. */
  dataProvider: AltimeterDataProvider;

  /** The current altitude alert state. */
  altitudeAlertState: Subscribable<AltitudeAlertState>;

  /** The current minimums alert state. */
  minimumsAlertState: Subscribable<MinimumsAlertState>;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;

  /** Scale options for the airspeed tape. */
  tapeScaleOptions: Readonly<AltimeterTapeScaleOptions>;

  /** Options for the trend vector. */
  trendVectorOptions: Readonly<AltimeterTrendVectorOptions>;

  /** Whether to support the display of the preselected barometric pressure setting. */
  supportBaroPreselect: boolean;

  /** A manager for altimeter user settings. */
  settingManager: UserSettingManager<AltimeterUserSettingTypes>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD altimeter.
 */
export class Altimeter extends DisplayComponent<AltimeterProps> {
  private readonly tapeRef = FSComponent.createRef<AltimeterTape>();
  private readonly selectedAltitudeRef = FSComponent.createRef<SelectedAltitudeDisplay>();
  private readonly baroSettingRef = FSComponent.createRef<BaroSettingDisplay>();

  private readonly rootCssClass = SetSubject.create(['altimeter']);

  private readonly showTopBottomDisplays = this.props.declutter.map(SubscribableMapFunctions.not());

  private minimumsAlertSub?: Subscription;
  private isDataFailedSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showTopBottomDisplays.sub(show => {
      this.rootCssClass.toggle('altimeter-top-visible', show);
      this.rootCssClass.toggle('altimeter-bottom-visible', show);
    }, true);

    this.minimumsAlertSub = this.props.minimumsAlertState.sub(state => {
      this.rootCssClass.delete('minimums-alert-within100');
      this.rootCssClass.delete('minimums-alert-atorbelow');

      switch (state) {
        case MinimumsAlertState.Within100:
          this.rootCssClass.add('minimums-alert-within100');
          break;
        case MinimumsAlertState.AtOrBelow:
          this.rootCssClass.add('minimums-alert-atorbelow');
          break;
      }
    }, true);

    this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isDataFailed => {
      if (isDataFailed) {
        this.rootCssClass.add('data-failed');
      } else {
        this.rootCssClass.delete('data-failed');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} data-checklist="checklist-altimeter">
        <AltimeterTape
          ref={this.tapeRef}
          dataProvider={this.props.dataProvider}
          {...this.props.tapeScaleOptions}
          {...this.props.trendVectorOptions}
          showMetric={this.props.settingManager.getSetting('altMetric')}
        />
        <div class='altimeter-top-container' data-checklist="checklist-altimeter-top">
          <SelectedAltitudeDisplay
            show={this.showTopBottomDisplays}
            selectedAlt={this.props.dataProvider.selectedAlt}
            altitudeAlertState={this.props.altitudeAlertState}
          />
        </div>
        <div class='altimeter-bottom-container' data-checklist="checklist-altimeter-bottom">
          <BaroSettingDisplay
            show={this.showTopBottomDisplays}
            baroSetting={this.props.dataProvider.baroSetting}
            isStdActive={this.props.dataProvider.baroIsStdActive}
            baroPreselect={this.props.supportBaroPreselect ? this.props.dataProvider.baroPreselect : undefined}
            isMetric={this.props.settingManager.getSetting('altimeterBaroMetric')}
          />
        </div>

        <div class='failed-box' />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.tapeRef.getOrDefault()?.destroy();
    this.selectedAltitudeRef.getOrDefault()?.destroy();
    this.baroSettingRef.getOrDefault()?.destroy();

    this.showTopBottomDisplays.destroy();

    this.minimumsAlertSub?.destroy();
    this.isDataFailedSub?.destroy();
  }
}

/**
 * Component props for AltimeterTape.
 */
interface AltimeterTapeProps extends ComponentProps {
  /** A data provider for the indicator. */
  dataProvider: AltimeterDataProvider;

  /** The minimum altitude representable on the tape, in feet. */
  minimum: number | Subscribable<number>;

  /** The maximum altitude representable on the tape, in feet. */
  maximum: number | Subscribable<number>;

  /**
   * The size of the altimeter tape window, in feet (i.e. the difference between the highest and lowest altitudes
   * visible on the tape at any given time).
   */
  window: number | Subscribable<number>;

  /** The interval between major ticks, in feet. */
  majorTickInterval: number | Subscribable<number>;

  /** The number of minor ticks for each major tick. */
  minorTickFactor: number | Subscribable<number>;

  /** The minimum absolute value of the altitude trend, in feet, required to display the trend vector. */
  trendThreshold: number | Subscribable<number>;

  /** Whether to show the metric indicated altitude and selected altitude displays. */
  showMetric: Subscribable<boolean>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin altimeter tape.
 */
class AltimeterTape extends DisplayComponent<AltimeterTapeProps> {
  private readonly indicatedAltBoxRef = FSComponent.createRef<IndicatedAltDisplayBox>();
  private readonly metricIndicatedAltDisplayRef = FSComponent.createRef<MetricIndicatedAltDisplay>();
  private readonly metricSelectedAltDisplayRef = FSComponent.createRef<MetricSelectedAltitudeDisplay>();
  private readonly minorTickContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly majorTickContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly labelContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly selectedAltBugRef = FSComponent.createRef<SelectedAltitudeBug>();
  private readonly minimumsBugRef = FSComponent.createRef<MinimumsBug>();

  private readonly rootCssClass = SetSubject.create(['altimeter-tape-container']);

  private readonly labelAltitudes: Subject<number>[] = [];

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

  private readonly options = MappedSubject.create(
    this.minimum,
    this.maximum,
    this.window,
    this.majorTickInterval,
    this.minorTickFactor
  );

  private readonly isIndicatedAltBelowScale = MappedSubject.create(
    ([indicatedAlt, minimum]): boolean => {
      return indicatedAlt < minimum;
    },
    this.props.dataProvider.indicatedAlt,
    this.minimum
  );

  private readonly isIndicatedAltAboveScale = MappedSubject.create(
    ([indicatedAlt, maximum]): boolean => {
      return indicatedAlt > maximum;
    },
    this.props.dataProvider.indicatedAlt,
    this.maximum
  );

  private readonly isIndicatedAltOffScale = MappedSubject.create(
    ([isIndicatedAltBelowScale, isIndicatedAltAboveScale]): boolean => {
      return isIndicatedAltBelowScale || isIndicatedAltAboveScale;
    },
    this.isIndicatedAltBelowScale,
    this.isIndicatedAltAboveScale
  );

  private readonly indicatedAltTapeValue = MappedSubject.create(
    ([indicatedAlt, minimum, maximum, window, isDataFailed]): number => {
      return isDataFailed ? minimum + window / 2 : MathUtils.clamp(indicatedAlt, minimum, maximum);
    },
    this.props.dataProvider.indicatedAlt,
    this.minimum,
    this.maximum,
    this.window,
    this.props.dataProvider.isDataFailed
  );

  private readonly indicatedAltBoxValue = MappedSubject.create(
    ([indicatedAlt, isIndicatedAltOffScale]): number => {
      return isIndicatedAltOffScale ? NaN : indicatedAlt;
    },
    this.props.dataProvider.indicatedAlt,
    this.isIndicatedAltOffScale
  );

  private readonly showMetricIndicatedAlt = MappedSubject.create(
    ([showMetric, isDataFailed]): boolean => showMetric && !isDataFailed,
    this.props.showMetric,
    this.props.dataProvider.isDataFailed
  );

  private readonly metricIndicatedAltValue = MappedSubject.create(
    ([indicatedAltFeet, minimum, maximum]): number => {
      return UnitType.FOOT.convertTo(MathUtils.clamp(indicatedAltFeet, minimum, maximum), UnitType.METER);
    },
    this.props.dataProvider.indicatedAlt,
    this.minimum,
    this.maximum
  );

  private readonly showGroundLine = MappedSubject.create(
    ([isIndicatedAltOffScale, isDataFailed]): boolean => !isIndicatedAltOffScale && !isDataFailed,
    this.isIndicatedAltOffScale,
    this.props.dataProvider.isDataFailed
  );

  private readonly trendThreshold = SubscribableUtils.toSubscribable(this.props.trendThreshold, true);

  private readonly showTrendVector = MappedSubject.create(
    ([indicatedAlt, minimum, maximum, threshold, altitudeTrend, isDataFailed]): boolean => {
      return !isDataFailed && indicatedAlt >= minimum && indicatedAlt < maximum && Math.abs(altitudeTrend) >= threshold;
    },
    this.props.dataProvider.indicatedAlt,
    this.minimum,
    this.maximum,
    this.trendThreshold,
    this.props.dataProvider.altitudeTrend,
    this.props.dataProvider.isDataFailed
  );

  private readonly altitudeTrendParams = MappedSubject.create(
    this.props.dataProvider.altitudeTrend,
    this.window
  );

  private readonly trendVectorHeight = Subject.create(0);
  private readonly trendVectorScale = Subject.create(1);

  private readonly selectedAltMeters = this.props.dataProvider.selectedAlt.map(selectedAltFeet => {
    return selectedAltFeet === null ? null : UnitType.FOOT.convertTo(selectedAltFeet, UnitType.METER);
  });

  private readonly updateTapeEvent = new SubEvent<this, void>();
  private readonly updateTapeWindowEvent = new SubEvent<this, void>();

  private readonly showIndicatedAltData = this.props.dataProvider.isDataFailed.map(SubscribableMapFunctions.not());

  /** @inheritdoc */
  constructor(props: AltimeterTapeProps) {
    super(props);

    this.indicatedAltTapeValue.pause();
    this.indicatedAltBoxValue.pause();
    this.showTrendVector.pause();
    this.altitudeTrendParams.pause();
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.indicatedAltTapeValue.resume();
    this.indicatedAltBoxValue.resume();

    this.indicatedAltTapeValue.sub(this.updateTape.bind(this));

    this.altitudeTrendParams.sub(this.updateTrendVector.bind(this));

    this.showTrendVector.resume();
    this.showTrendVector.sub(show => {
      if (show) {
        this.trendVectorStyle.set('display', '');
        this.altitudeTrendParams.resume();
      } else {
        this.altitudeTrendParams.pause();
        this.trendVectorStyle.set('display', 'none');
      }
    }, true);

    this.trendVectorHeight.sub(height => { this.trendVectorStyle.set('height', `${height}%`); });
    this.trendVectorScale.sub(scale => { this.trendVectorStyle.set('transform', `scale(${scale}) rotateX(0deg)`); });

    this.currentTranslate.sub(translate => {
      this.tapeStyle.set('transform', `translate3d(0, ${translate * 100}%, 0)`);
    });

    this.options.sub(this.rebuildTape.bind(this), true);

    this.isIndicatedAltBelowScale.sub(isIasBelowScale => {
      this.vSpeedOffScaleContainerStyle.set('display', isIasBelowScale ? 'flex' : 'none');
    }, true);
  }

  /**
   * Calculates the absolute vertical position on the tape at which a particular altitude is located, with `0` at the
   * top of the tape and `1` at the bottom.
   * @param indicatedAlt An altitude, in feet.
   * @param clamp Whether the altitude should be clamped to the range defined by this tape's minimum and maximum
   * representable altitudes. Defaults to `false`.
   * @returns The absolute vertical position on the tape at which the specified altitude is located, with `0` at the
   * top of the tape and `1` at the bottom.
   */
  private calculateAbsoluteTapePosition(indicatedAlt: number, clamp = false): number {
    if (clamp) {
      indicatedAlt = MathUtils.clamp(indicatedAlt, this.minimum.get(), this.maximum.get());
    }

    return 1 - (indicatedAlt - this.currentMinimum) / this.currentLength.get();
  }

  /**
   * Calculates the vertical position on the tape window at which a particular altitude is located, with `0` at the top
   * of the tape window and `1` at the bottom.
   * @param indicatedAlt An altitude, in knots.
   * @param clamp Whether the altitude should be clamped to the range defined by this tape's minimum and maximum
   * representable altitudes. Defaults to `false`.
   * @returns The vertical position on the tape window at which the specified altitude is located, with `0` at the top
   * of the tape window and `1` at the bottom.
   */
  private calculateWindowTapePosition(indicatedAlt: number, clamp = false): number {
    return (this.calculateAbsoluteTapePosition(indicatedAlt, clamp) - 1 + this.currentTranslate.get()) * this.currentLength.get() / this.window.get() + 0.5;
  }

  /**
   * Rebuilds this tape's ticks and labels.
   * @param options Scale options for this tape, as `[minimum, maximum, window, majorTickInterval, minorTickFactor]`.
   */
  private rebuildTape(options: readonly [number, number, number, number, number]): void {
    const [minimum, maximum, window, majorTickInterval, minorTickFactor] = options;

    this.labelAltitudes.length = 0;

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
          <path d={`M 0 ${y} L 100 ${y}`} vector-effect='non-scaling-stroke' class='altimeter-tape-tick altimeter-tape-tick-major'>.</path>,
          this.majorTickContainerRef.instance
        );

        const altitude = Subject.create(0);
        FSComponent.render(
          <div class='altimeter-tape-label' style={`position: absolute; right: 0%; top: ${y}%; transform: translateY(-50%)`}>
            <span class='altimeter-tape-label-hundreds'>{altitude.map(alt => Math.trunc(alt / 100).toString())}</span>
            <span class='altimeter-tape-label-tens'>{altitude.map(alt => (Math.abs(alt) % 100).toFixed(0).padStart(2, '0'))}</span>
          </div>,
          this.labelContainerRef.instance
        );

        this.labelAltitudes.push(altitude);
      } else {
        // minor tick
        FSComponent.render(
          <path d={`M 0 ${y} L 100 ${y}`} vector-effect='non-scaling-stroke' class='altimeter-tape-tick altimeter-tape-tick-minor'>.</path>,
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
    this.updateTape(this.indicatedAltTapeValue.get());
  }

  /**
   * Updates the tape based on the current indicated altitude.
   * @param indicatedAlt The current indicated altitude, in feet.
   */
  private updateTape(indicatedAlt: number): void {
    let tapePos = this.calculateAbsoluteTapePosition(indicatedAlt);
    if (tapePos <= 0.25 || tapePos >= 0.75) {
      const [minimum, maximum, window, majorTickInterval] = this.options.get();

      const desiredMinimum = Math.floor((indicatedAlt - window) / majorTickInterval) * majorTickInterval;
      const constrainedMinimum = Math.ceil((maximum - this.currentLength.get()) / majorTickInterval) * majorTickInterval;
      const minimumToSet = Math.max(minimum, Math.min(constrainedMinimum, desiredMinimum));
      if (this.currentMinimum !== minimumToSet) {
        this.currentMinimum = minimumToSet;
        this.updateTapeEvent.notify(this);

        this.updateTapeLabels();
        this.updateTapeOverflow();

        tapePos = MathUtils.clamp(this.calculateAbsoluteTapePosition(indicatedAlt), 0, 1);
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

    for (let i = 0; i < this.labelAltitudes.length; i++) {
      this.labelAltitudes[i].set(this.currentMinimum + interval * i);
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
      <div class={this.rootCssClass} data-checklist="checklist-altimeter-tape">

        <div class='altimeter-tape-border-top'></div>
        <div class='altimeter-tape-border-bottom'></div>

        <div class='altimeter-tape-window' style='overflow: hidden;'>
          <div class='altimeter-tape' style={this.tapeStyle}>
            <div class='altimeter-tape-clip' style={this.tapeClipStyle}>
              <svg
                ref={this.minorTickContainerRef}
                class='altimeter-tape-tick-minor-container'
                viewBox='0 0 100 100' preserveAspectRatio='none'
                style='position: absolute; top: 0; height: 100%;'
              />
              <svg
                ref={this.majorTickContainerRef}
                class='altimeter-tape-tick-major-container'
                viewBox='0 0 100 100' preserveAspectRatio='none'
                style='position: absolute; top: 0; height: 100%;'
              />
              <div
                ref={this.labelContainerRef}
                class='altimeter-tape-label-container'
                style='position: absolute; top: 0; height: 100%; text-align: right;'
              />
            </div>
            <div class='altimeter-tape-overflow' style={this.tapeOverflowTopStyle}></div>
            <div class='altimeter-tape-overflow' style='position: absolute; left: 0; top: 100%; width: 100%; height: 50%;'></div>
          </div>
        </div>

        <GroundLine
          show={this.showGroundLine}
          indicatedAlt={this.props.dataProvider.indicatedAlt}
          radarAlt={this.props.dataProvider.radarAlt}
          updateEvent={this.updateTapeWindowEvent}
          getPosition={this.calculateWindowTapePosition.bind(this)}
        />

        <div class='altimeter-trend' style={this.trendVectorStyle}>
        </div>

        <IndicatedAltDisplayBox
          ref={this.indicatedAltBoxRef}
          show={this.showIndicatedAltData}
          indicatedAlt={this.indicatedAltBoxValue}
        />

        <MetricIndicatedAltDisplay
          ref={this.metricIndicatedAltDisplayRef}
          show={this.showMetricIndicatedAlt}
          indicatedAltMeters={this.metricIndicatedAltValue}
        />

        <MetricSelectedAltitudeDisplay
          ref={this.metricSelectedAltDisplayRef}
          show={this.props.showMetric}
          selectedAltMeters={this.selectedAltMeters}
        />

        <div class='altimeter-bug-container' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden;'>
          <MinimumsBug
            ref={this.minimumsBugRef}
            show={this.showIndicatedAltData}
            minimums={this.props.dataProvider.minimums}
            updateEvent={this.updateTapeWindowEvent}
            getPosition={this.calculateWindowTapePosition.bind(this)}
          />
          <SelectedAltitudeBug
            ref={this.selectedAltBugRef}
            show={this.showIndicatedAltData}
            selectedAlt={this.props.dataProvider.selectedAlt}
            updateEvent={this.updateTapeWindowEvent}
            getPosition={this.calculateWindowTapePosition.bind(this)}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.indicatedAltBoxRef.getOrDefault()?.destroy();
    this.metricIndicatedAltDisplayRef.getOrDefault()?.destroy();
    this.metricSelectedAltDisplayRef.getOrDefault()?.destroy();

    this.selectedAltBugRef.getOrDefault()?.destroy();
    this.minimumsBugRef.getOrDefault()?.destroy();

    this.options.destroy();
    this.isIndicatedAltBelowScale.destroy();
    this.isIndicatedAltAboveScale.destroy();
    this.isIndicatedAltOffScale.destroy();
    this.indicatedAltTapeValue.destroy();
    this.indicatedAltBoxValue.destroy();
    this.metricIndicatedAltValue.destroy();
    this.altitudeTrendParams.destroy();
    this.selectedAltMeters.destroy();
    this.showIndicatedAltData.destroy();
    this.showMetricIndicatedAlt.destroy();

    super.destroy();
  }
}

/**
 * Component props for IndicatedAltDisplayBox.
 */
interface IndicatedAltDisplayBoxProps extends ComponentProps {
  /** Whether to show the display. */
  show: Subscribable<boolean>;

  /** The indicated altitude value to display. */
  indicatedAlt: Subscribable<number>;
}

/**
 * An indicated altitude display box for a next-generation (NXi, G3000, etc) Garmin altimeter tape.
 */
class IndicatedAltDisplayBox extends DisplayComponent<IndicatedAltDisplayBoxProps> {
  private readonly scrollerRefs: NodeReference<DigitScroller>[] = [];

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly negativeSignStyles = Array.from({ length: 3 }, () => {
    return ComputedSubject.create(false, show => show ? '' : 'display: none;');
  });

  private readonly indicatedAlt = this.props.indicatedAlt.map(SubscribableMapFunctions.identity()).pause();

  private readonly showNegativeSign = Array.from({ length: 3 }, (val, index) => {
    const topThreshold = index === 0 ? 0 : Math.pow(10, index + 1) - 20;
    const bottomThreshold = Math.pow(10, index + 2) - 20;

    return this.indicatedAlt.map(indicatedAlt => {
      return indicatedAlt < -topThreshold && indicatedAlt >= -bottomThreshold;
    });
  });

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showNegativeSign.forEach((show, index) => {
      show.pipe(this.negativeSignStyles[index]);
    });

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootStyle.set('display', '');
        this.indicatedAlt.resume();
      } else {
        this.rootStyle.set('display', 'none');
        this.indicatedAlt.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    const tensScrollerRef = FSComponent.createRef<DigitScroller>();
    const hundredsScrollerRef = FSComponent.createRef<DigitScroller>();
    const thousandsScrollerRef = FSComponent.createRef<DigitScroller>();
    const tenThousandsScrollerRef = FSComponent.createRef<DigitScroller>();

    this.scrollerRefs.push(tensScrollerRef, tensScrollerRef, hundredsScrollerRef, tenThousandsScrollerRef);

    return (
      <div class='altimeter-indicatedalt-box' style={this.rootStyle}>
        <svg viewBox="0 0 105 70" class='altimeter-indicatedalt-box-bg' preserveAspectRatio='none'>
          <path
            vector-effect='non-scaling-stroke'
            d='M 4 35 l 8 -6 l 0 -13 c 0 -1 1 -2 2 -2 l 54 0 l 0 -11 c 0 -1 1 -2 2 -2 l 30 0 c 1 0 2 1 2 2 l 0 64 c 0 1 -1 2 -2 2 l -30 0 c -1 0 -2 -1 -2 -2 l 0 -11 l -54 0 c -1 0 -2 -1 -2 -2 l 0 -13 z'
          />
        </svg>
        <div class='altimeter-indicatedalt-box-scrollers' style='position: absolute; right: 2.8%; top: 1.5%; width: 85.8%; height: 97%;'>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-ten-thousands'>
            <div class='altimeter-indicatedalt-box-digit-bg' />
            <DigitScroller
              ref={tenThousandsScrollerRef}
              value={this.indicatedAlt}
              base={10}
              factor={10000}
              scrollThreshold={9980}
              renderDigit={(digit): string => digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
            />
            <div class='altimeter-indicatedalt-box-negative-sign' style={this.negativeSignStyles[2]}>–</div>
          </div>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-thousands'>
            <div class='altimeter-indicatedalt-box-digit-bg' />
            <DigitScroller
              ref={thousandsScrollerRef}
              value={this.indicatedAlt}
              base={10}
              factor={1000}
              scrollThreshold={980}
              renderDigit={(digit): string => digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
            />
            <div class='altimeter-indicatedalt-box-negative-sign' style={this.negativeSignStyles[1]}>–</div>
          </div>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-hundreds'>
            <div class='altimeter-indicatedalt-box-digit-bg' />
            <DigitScroller
              ref={hundredsScrollerRef}
              value={this.indicatedAlt}
              base={10}
              factor={100}
              scrollThreshold={80}
              renderDigit={(digit): string => digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
            />
            <div class='altimeter-indicatedalt-box-negative-sign' style={this.negativeSignStyles[0]}>–</div>
          </div>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-tens'>
            <div class='altimeter-indicatedalt-box-digit-bg' />
            <DigitScroller
              ref={tensScrollerRef}
              value={this.indicatedAlt}
              base={5}
              factor={20}
              renderDigit={(digit): string => ((Math.abs(digit) % 5) * 20).toString().padStart(2, '0')}
              nanString={'––'}
            />
            <div class='altimeter-indicatedalt-box-scroller-mask'></div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const show of this.showNegativeSign) {
      show.destroy();
    }

    for (const ref of this.scrollerRefs) {
      ref.getOrDefault()?.destroy();
    }

    this.indicatedAlt.destroy();

    this.showSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for MetricIndicatedAltDisplay.
 */
interface MetricIndicatedAltDisplayProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** The indicated altitude value to display, in meters. */
  indicatedAltMeters: Subscribable<number>;
}

/**
 * A metric indicated altitude display for a next-generation (NXi, G3000, etc) Garmin altimeter tape.
 */
class MetricIndicatedAltDisplay extends DisplayComponent<MetricIndicatedAltDisplayProps> {
  private readonly style = ObjectSubject.create({
    display: 'none'
  });

  private readonly indicatedAlt = NumberUnitSubject.create(UnitType.METER.createNumber(0));

  private showSub?: Subscription;
  private indicatedAltPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const indicatedAltPipe = this.indicatedAltPipe = this.props.indicatedAltMeters.pipe(this.indicatedAlt, alt => Math.round(alt), true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.style.set('display', '');

        indicatedAltPipe.resume(true);
      } else {
        this.style.set('display', 'none');

        indicatedAltPipe.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='altimeter-metric-indicatedalt' style={this.style}>
        <NumberUnitDisplay
          value={this.indicatedAlt}
          displayUnit={null}
          formatter={NumberFormatter.create({ precision: 1 })}
          class='altimeter-metric-indicatedalt-value'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
    this.indicatedAltPipe?.destroy();
  }
}

/**
 * Component props for MetricSelectedAltitudeDisplay.
 */
interface MetricSelectedAltitudeDisplayProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** The selected altitude in meters, or `null` if no such value exists. */
  selectedAltMeters: Subscribable<number | null>;
}

/**
 * A metric selected altitude display for a next-generation (NXi, G3000, etc) Garmin altimeter tape.
 */
class MetricSelectedAltitudeDisplay extends DisplayComponent<MetricSelectedAltitudeDisplayProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly textStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly defaultStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly selectedAlt = NumberUnitSubject.create(UnitType.METER.createNumber(0));

  private showSub?: Subscription;
  private selectedAltSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.selectedAltSub = this.props.selectedAltMeters.sub(selectedAlt => {
      if (selectedAlt === null) {
        this.textStyle.set('display', 'none');
        this.defaultStyle.set('display', '');
      } else {
        this.textStyle.set('display', '');
        this.defaultStyle.set('display', 'none');

        this.selectedAlt.set(Math.round(selectedAlt));
      }
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootStyle.set('display', '');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedAltSub!.resume(true);
      } else {
        this.rootStyle.set('display', 'none');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedAltSub!.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='altimeter-metric-selectedalt' style={this.rootStyle}>
        <div class='altimeter-metric-selectedalt-text' style={this.textStyle}>
          <NumberUnitDisplay
            value={this.selectedAlt}
            displayUnit={null}
            formatter={NumberFormatter.create({ precision: 1 })}
            class='altimeter-metric-selectedalt-value'
          />
        </div>
        <div class='altimeter-metric-selectedalt-default' style={this.defaultStyle}>––––</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
    this.selectedAltSub?.destroy();
  }
}

/**
 * Component props for GroundLine.
 */
interface GroundLineProps extends ComponentProps {
  /** Whether the ground line should be visible. */
  show: Subscribable<boolean>;

  /** The current indicated altitude, in feet. */
  indicatedAlt: Subscribable<number>;

  /** The current radar altitude, in feet, or `null` if there is no valid radar altitude. */
  radarAlt: Subscribable<number | null>;

  /** An event which signals that the ground line needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the altitude bug's parent tape window at which a particular altitude is located. */
  getPosition: (indicatedAlt: number) => number;
}

/**
 * A radar altimeter ground line for a next-generation (NXi, G3000, etc) Garmin altimeter tape. Depicts the
 * position of the ground on the altitude tape as determined by the radar altimeter.
 */
class GroundLine extends DisplayComponent<GroundLineProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    bottom: '0%',
    height: '0%',
    transform: 'rotateX(0deg)'
  });

  private readonly position = Subject.create(0);

  private readonly groundAltitudeRounded = MappedSubject.create(
    ([indicatedAlt, radarAlt]): number | null => {
      return radarAlt === null ? null : Math.round(indicatedAlt - radarAlt);
    },
    this.props.indicatedAlt,
    this.props.radarAlt
  ).pause();

  private showSub?: Subscription;
  private updateEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const updateHandler = this.updatePosition.bind(this);

    const groundAltitudeRoundedSub = this.groundAltitudeRounded.sub(updateHandler, false, true);

    const updateEventSub = this.updateEventSub = this.props.updateEvent.on(updateHandler, true);

    this.position.sub(translate => {
      this.style.set('height', `${100 - translate}%`);
    });

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.groundAltitudeRounded.resume();
        groundAltitudeRoundedSub.resume(true);
        updateEventSub.resume();
      } else {
        this.style.set('display', 'none');

        this.groundAltitudeRounded.pause();
        groundAltitudeRoundedSub.pause();
        updateEventSub.pause();
      }
    }, true);
  }

  /**
   * Updates this line's position on its parent altimeter tape window.
   */
  private updatePosition(): void {
    const groundAltitudeRounded = this.groundAltitudeRounded.get();
    const pos = groundAltitudeRounded === null ? NaN : this.props.getPosition(groundAltitudeRounded);

    if (isNaN(pos) || pos > 1) {
      this.style.set('display', 'none');
    } else {
      this.style.set('display', '');
      this.position.set(MathUtils.round(Math.max(pos, 0) * 100, 0.1));
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='altimeter-ground-line' style={this.style}></div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.groundAltitudeRounded.destroy();

    this.showSub?.destroy();
    this.updateEventSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for AltitudeBug.
 */
interface AltitudeBugProps extends ComponentProps {
  /** Whether the altitude bug should be visible. */
  show: Subscribable<boolean>;

  /** The reference altitude of the bug, in feet. */
  altitudeFeet: Subscribable<number>;

  /** An event which signals that the altitude bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the altitude bug's parent tape window at which a particular altitude is located. */
  getPosition: (indicatedAlt: number) => number;

  /** CSS class(es) to apply to the altitude bug's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * An altitude bug for a next-generation (NXi, G3000, etc) Garmin altimeter tape.
 */
class AltitudeBug extends DisplayComponent<AltitudeBugProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    top: '50%',
    transform: 'translate3d(0, -50%, 0)'
  });

  private readonly position = Subject.create(0);

  private readonly altitudeFeetRounded = this.props.altitudeFeet.map(SubscribableMapFunctions.withPrecision(1)).pause();

  private cssClassSub?: Subscription;
  private showSub?: Subscription;
  private updateEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const updateHandler = this.updatePosition.bind(this);

    const altitudeFeetRoundedSub = this.altitudeFeetRounded.sub(updateHandler);
    const updateSub = this.updateEventSub = this.props.updateEvent.on(updateHandler, true);

    this.position.sub(translate => {
      this.style.set('top', `${translate}%`);
    });

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.altitudeFeetRounded.resume();
        altitudeFeetRoundedSub.resume();
        updateSub.resume();

        this.updatePosition();

        this.style.set('display', '');
      } else {
        this.altitudeFeetRounded.pause();
        altitudeFeetRoundedSub.pause();
        updateSub.pause();

        this.style.set('display', 'none');
      }
    }, true);
  }

  /**
   * Updates this altitude bug's position on its parent altimeter tape window.
   */
  private updatePosition(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pos = this.props.getPosition(this.altitudeFeetRounded!.get());
    this.position.set(MathUtils.round(pos * 100, 0.1));
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;
    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['altimeter-altitude-bug']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, ['altimeter-altitude-bug']);
    } else {
      cssClass = `altimeter-altitude-bug ${this.props.class ?? ''}`;
    }

    return (
      <div class={cssClass} style={this.style}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.altitudeFeetRounded.destroy();

    this.cssClassSub?.destroy();
    this.showSub?.destroy();
    this.updateEventSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for SelectedAltitudeBug.
 */
interface SelectedAltitudeBugProps extends ComponentProps {
  /** Whether the altitude bug should be visible. */
  show: Subscribable<boolean>;

  /** The selected altitude, in feet, or `null` if no such value exists. */
  selectedAlt: Subscribable<number | null>;

  /** An event which signals that the altitude bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the altitude bug's parent tape window at which a particular altitude is located. */
  getPosition: (indicatedAlt: number, clamp?: boolean) => number;
}

/**
 * A selected altitude bug.
 */
class SelectedAltitudeBug extends DisplayComponent<SelectedAltitudeBugProps> {
  private readonly bugRef = FSComponent.createRef<AltitudeBug>();

  private readonly visibilityState = MappedSubject.create(
    this.props.show,
    this.props.selectedAlt
  ).pause();

  private readonly show = Subject.create(false);
  private readonly selectedAltFeet = Subject.create(0);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.visibilityState.resume();

    this.visibilityState.sub(([show, selectedAlt]) => {
      if (show && selectedAlt !== null) {
        this.show.set(true);
        this.selectedAltFeet.set(selectedAlt);
      } else {
        this.show.set(false);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <AltitudeBug
        ref={this.bugRef}
        altitudeFeet={this.selectedAltFeet}
        show={this.show}
        updateEvent={this.props.updateEvent}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt, true), 0, 1)}
        class='altimeter-selectedalt-bug'
      >
        <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='altimeter-selectedalt-bug-icon'>
          <path d='M 95 5 h -90 v 90 h 90 v -30 L 45 50 L 95 30 Z' vector-effect='non-scaling-stroke' />
        </svg>
      </AltitudeBug>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    this.visibilityState.destroy();

    super.destroy();
  }
}

/**
 * Component props for MinimumsBug.
 */
interface MinimumsBugProps extends ComponentProps {
  /** Whether the altitude bug should be visible. */
  show: Subscribable<boolean>;

  /** The current active minimums, in feet indicated altitude, or `null` if no such value exists. */
  minimums: Subscribable<number | null>;

  /** An event which signals that the altitude bug needs to be updated with a new tape window position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the altitude bug's parent tape window at which a particular altitude is located. */
  getPosition: (indicatedAlt: number, clamp?: boolean) => number;
}

/**
 * A minimums bug.
 */
class MinimumsBug extends DisplayComponent<MinimumsBugProps> {
  private readonly bugRef = FSComponent.createRef<AltitudeBug>();

  private readonly visibilityState = MappedSubject.create(
    this.props.show,
    this.props.minimums
  ).pause();

  private readonly show = Subject.create(false);
  private readonly minimumsFeet = Subject.create(0);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.visibilityState.resume();

    this.visibilityState.sub(([show, minimums]) => {
      if (show && minimums !== null) {
        this.show.set(true);
        this.minimumsFeet.set(minimums);
      } else {
        this.show.set(false);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <AltitudeBug
        ref={this.bugRef}
        altitudeFeet={this.minimumsFeet}
        show={this.show}
        updateEvent={this.props.updateEvent}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt, true), -0.5, 1.5)}
        class='altimeter-minimums-bug'
      >
        <svg viewBox='0 0 20 40' preserveAspectRatio='none' class='altimeter-minimums-bug-icon'>
          <path d='M 5 20 l 8 -5 l 0 -14 l 3 0 l 0 14 l -9 5 l 9 5 l 0 14 l -3 0 l 0 -14 z' vector-effect='non-scaling-stroke' />
        </svg>
      </AltitudeBug>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    this.visibilityState.destroy();

    super.destroy();
  }
}

/**
 * Component props for SelectedAltitudeDisplay.
 */
interface SelectedAltitudeDisplayProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** The selected altitude in feet, or `null` if no such value exists. */
  selectedAlt: Subscribable<number | null>;

  /** The current altitude alert state. */
  altitudeAlertState: Subscribable<AltitudeAlertState>;
}

/**
 * A display for a selected altitude value.
 */
class SelectedAltitudeDisplay extends DisplayComponent<SelectedAltitudeDisplayProps> {
  private static readonly ALERT_FLASH_DURATION = 5000; // milliseconds

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly textStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly defaultStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly cssClassSet = SetSubject.create(['altimeter-selectedalt-container']);

  private readonly selectedAlt = Subject.create(0);

  private readonly animationDebounceTimer = new DebounceTimer();

  private lastAlertState: AltitudeAlertState | undefined = undefined;

  private showSub?: Subscription;
  private selectedAltSub?: Subscription;
  private alertStateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const selectedAltSub = this.selectedAltSub = this.props.selectedAlt.sub(selectedAlt => {
      if (selectedAlt === null) {
        this.textStyle.set('display', 'none');
        this.defaultStyle.set('display', '');
      } else {
        this.textStyle.set('display', '');
        this.defaultStyle.set('display', 'none');

        this.selectedAlt.set(Math.round(selectedAlt));
      }
    }, false, true);

    this.alertStateSub = this.props.altitudeAlertState.sub(state => {
      this.cssClassSet.delete('alt-alert-within1000-flash');
      this.cssClassSet.delete('alt-alert-within1000');
      this.cssClassSet.delete('alt-alert-deviation-flash');
      this.cssClassSet.delete('alt-alert-deviation');

      // Do not clear the flash animation if we are going from within 200 to captured.
      if (!(state === AltitudeAlertState.Captured && this.lastAlertState === AltitudeAlertState.Within200)) {
        this.cssClassSet.delete('alt-alert-within200-flash');
        this.animationDebounceTimer.clear();
      }

      switch (state) {
        case AltitudeAlertState.Within1000:
          if (this.lastAlertState === AltitudeAlertState.Armed) {
            this.cssClassSet.add('alt-alert-within1000-flash');
            this.animationDebounceTimer.schedule(() => {
              this.cssClassSet.delete('alt-alert-within1000-flash');
              this.cssClassSet.add('alt-alert-within1000');
            }, SelectedAltitudeDisplay.ALERT_FLASH_DURATION);
          } else {
            this.cssClassSet.add('alt-alert-within1000');
          }

          break;

        case AltitudeAlertState.Within200:
          if (this.lastAlertState === AltitudeAlertState.Within1000) {
            this.cssClassSet.add('alt-alert-within200-flash');
            this.animationDebounceTimer.schedule(() => {
              this.cssClassSet.delete('alt-alert-within200-flash');
            }, SelectedAltitudeDisplay.ALERT_FLASH_DURATION);
          }

          break;

        case AltitudeAlertState.Deviation:
          this.cssClassSet.add('alt-alert-deviation-flash');
          this.animationDebounceTimer.schedule(() => {
            this.cssClassSet.delete('alt-alert-deviation-flash');
            this.cssClassSet.add('alt-alert-deviation');
          }, SelectedAltitudeDisplay.ALERT_FLASH_DURATION);

          break;
      }

      this.lastAlertState = state;
    }, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootStyle.set('display', '');

        selectedAltSub.resume(true);
      } else {
        this.rootStyle.set('display', 'none');

        selectedAltSub.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet} style={this.rootStyle}>
        <svg class='altimeter-selectedalt-icon' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <path d='M 95 5 h -90 v 90 h 90 v -25 L 50 50 L 95 25 Z' vector-effect='non-scaling-stroke' />
        </svg>
        <div class='altimeter-selectedalt-text' style={this.textStyle}>
          <span class='altimeter-selectedalt-text-hundreds'>{this.selectedAlt.map(alt => Math.abs(alt) < 100 ? '' : Math.trunc(alt / 100).toString())}</span>
          <span class='altimeter-selectedalt-text-tens'>{this.selectedAlt.map(alt => (Math.abs(alt) % 100).toFixed(0).padStart(alt === 0 ? 1 : 2, '0'))}</span>
        </div>
        <div class='altimeter-selectedalt-default' style={this.defaultStyle}>––––</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
    this.selectedAltSub?.destroy();
    this.alertStateSub?.destroy();
  }
}

/**
 * Component props for BaroSettingDisplay.
 */
interface BaroSettingDisplayProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** The barometric pressure setting, in inches of mercury. */
  baroSetting: Subscribable<number>;

  /** Whether STD BARO mode is active. */
  isStdActive: Subscribable<boolean>;

  /**
   * The pre-selected pressure setting, in inches of mercury. If not defined, the pre-selected pressure setting will
   * not be displayed.
   */
  baroPreselect?: Subscribable<number>;

  /** Whether to display values in metric units (hectopascals). */
  isMetric: Subscribable<boolean>;
}

/**
 * A display for altimeter barometric pressure setting.
 */
class BaroSettingDisplay extends DisplayComponent<BaroSettingDisplayProps> {
  private static readonly IN_HG_FORMATTER = NumberFormatter.create({ precision: 0.01 });
  private static readonly HPA_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly baroSettingValueStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly baroStdStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly baroPreselectStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly cssClassSet = SetSubject.create(['altimeter-baro-container']);

  private readonly baroSetting = NumberUnitSubject.create(UnitType.IN_HG.createNumber(29.92));
  private readonly baroPreselect = NumberUnitSubject.create(UnitType.IN_HG.createNumber(29.92));
  private readonly displayUnit = this.props.isMetric.map(isMetric => isMetric ? UnitType.HPA : UnitType.IN_HG);

  private readonly animationDebounceTimer = new DebounceTimer();

  private showSub?: Subscription;
  private baroSettingPipe?: Subscription;
  private baroPreselectPipe?: Subscription;
  private isStdActiveSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const baroSettingPipe = this.baroSettingPipe = this.props.baroSetting.pipe(this.baroSetting, true);
    this.baroPreselectPipe = this.props.baroPreselect?.pipe(this.baroPreselect, true);

    const isStdActiveSub = this.isStdActiveSub = this.props.isStdActive.sub(isStdActive => {
      if (isStdActive) {
        this.baroSettingValueStyle.set('display', 'none');
        this.baroStdStyle.set('display', '');
        this.baroPreselectStyle.set('display', '');
      } else {
        this.baroSettingValueStyle.set('display', '');
        this.baroStdStyle.set('display', 'none');
        this.baroPreselectStyle.set('display', 'none');
      }
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootStyle.set('display', '');

        baroSettingPipe.resume(true);
        this.baroPreselectPipe?.resume(true);
        isStdActiveSub.resume(true);
      } else {
        this.rootStyle.set('display', 'none');

        this.animationDebounceTimer.clear();

        baroSettingPipe.pause();
        this.baroPreselectPipe?.pause();
        isStdActiveSub.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet} style={this.rootStyle}>
        <div class='altimeter-baro-setting-value' style={this.baroSettingValueStyle}>
          <NumberUnitDisplay
            value={this.baroSetting}
            displayUnit={this.displayUnit}
            formatter={(number): string => {
              return (this.props.isMetric.get() ? BaroSettingDisplay.HPA_FORMATTER : BaroSettingDisplay.IN_HG_FORMATTER)(number);
            }}
          />
        </div>
        <div class='altimeter-baro-std' style={this.baroStdStyle}>STD BARO</div>
        {
          this.props.baroPreselect === undefined
            ? null
            : (
              <div class='altimeter-baro-preselect' style={this.baroPreselectStyle}>
                <div class='altimeter-baro-preselect-title'>PRE</div>
                <NumberUnitDisplay
                  value={this.baroPreselect}
                  displayUnit={this.displayUnit}
                  formatter={(number): string => {
                    return (this.props.isMetric.get() ? BaroSettingDisplay.HPA_FORMATTER : BaroSettingDisplay.IN_HG_FORMATTER)(number);
                  }}
                  class='altimeter-baro-preselect-value'
                />
              </div>
            )
        }
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.displayUnit.destroy();

    this.showSub?.destroy();
    this.baroSettingPipe?.destroy();
    this.baroPreselectPipe?.destroy();
    this.isStdActiveSub?.destroy();
  }
}