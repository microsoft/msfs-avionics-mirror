import {
  AltitudeSelectEvents, ArrayUtils, ComponentProps, DebounceTimer, DigitScroller, DisplayComponent, FSComponent,
  KeyEventManager, MappedSubject, MathUtils, NodeReference, NumberFormatter, NumberUnitSubject, ObjectSubject,
  SetSubject, SimVarValueType, SubEvent, Subject, Subscribable, SubscribableMapFunctions, SubscribableSet,
  SubscribableUtils, Subscription, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { AltimeterDataProvider, AltitudeAlertState, MinimumsAlertState } from '@microsoft/msfs-garminsdk';

import { BaroPressureDialog } from '../../../MFD/Dialogs/BaroPressureDialog';
import { SelectedAltitudeDialog } from '../../../MFD/Views/SelectedAltitudeDialog/SelectedAltitudeDialog';
import { G3XFailureBox } from '../../../Shared/Components/Common/G3XFailureBox';
import { G3XNumberUnitDisplay } from '../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { TouchButton } from '../../../Shared/Components/TouchButton/TouchButton';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';

import './G3XAltimeter.css';

/**
 * Component props for {@link G3XAltimeter}.
 */
export interface G3XAltimeterProps extends ComponentProps {
  /** The UI service. */
  uiService: UiService;

  /** The index of the sim altimeter whose indicated altitude and barometric pressure setting is bound to the altimeter. */
  index: number;

  /** A provider of altimeter data. */
  dataProvider: AltimeterDataProvider;

  /** The unit type in which to display the altimeter barometric pressure setting. */
  baroDisplayUnit: Subscribable<Unit<UnitFamily.Pressure>>;

  /** The current altitude alert state. */
  altitudeAlertState: Subscribable<AltitudeAlertState>;

  /** The current minimums alert state. */
  minimumsAlertState: Subscribable<MinimumsAlertState>;

  /** Whether the altimeter should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3X Touch PFD altimeter.
 */
export class G3XAltimeter extends DisplayComponent<G3XAltimeterProps> {
  private thisNode?: VNode;

  private readonly rootCssClass = SetSubject.create(['altimeter']);

  private readonly showTopBottomDisplays = this.props.declutter.map(SubscribableMapFunctions.not());

  private keyEventManager?: KeyEventManager;

  private minimumsAlertSub?: Subscription;
  private isDataFailedSub?: Subscription;

  /** @inheritdoc */
  public constructor(props: G3XAltimeterProps) {
    super(props);

    KeyEventManager.getManager(this.props.uiService.bus).then(manager => {
      this.keyEventManager = manager;
    });
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

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
      this.rootCssClass.toggle('data-failed', isDataFailed);
    }, true);
  }

  /**
   * Responds to when this altimeter's selected altitude button is pressed.
   */
  private async onSelectedAltitudePressed(): Promise<void> {
    // Close selected altitude dialog if already open.
    if (this.props.uiService.closeMfdPopup(popup => popup.layer === UiViewStackLayer.Overlay && popup.key === UiViewKeys.SelectedAltitudeDialog)) {
      return;
    }

    const result = await this.props.uiService
      .openMfdPopup<SelectedAltitudeDialog>(UiViewStackLayer.Overlay, UiViewKeys.SelectedAltitudeDialog)
      .ref.request({
        minimumValue: -1000,
        maximumValue: 50000,
        initialValue: this.props.dataProvider.selectedAlt.get() ?? 0
      });

    if (!result.wasCancelled) {
      SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR', SimVarValueType.Feet, result.payload);
      this.props.uiService.bus.getPublisher<AltitudeSelectEvents>().pub('alt_select_is_initialized', true, true, true);
    }
  }

  /**
   * Responds to when this altimeter's barometric pressure setting button is pressed.
   */
  private async onBaroSettingPressed(): Promise<void> {
    // Close baro pressure dialog if already open.
    if (this.props.uiService.closeMfdPopup(popup => popup.layer === UiViewStackLayer.Overlay && popup.key === UiViewKeys.BaroPressureDialog)) {
      return;
    }

    const displayUnit = this.props.baroDisplayUnit.get();
    const unitsMode = displayUnit.equals(UnitType.HPA) ? 'hpa' : displayUnit.equals(UnitType.MB) ? 'mb' : 'inhg';
    const minimumValue = unitsMode === 'inhg' ? 28.00 : 948;
    const maximumValue = unitsMode === 'inhg' ? 32.01 : 1084;

    const result = await this.props.uiService
      .openMfdPopup<BaroPressureDialog>(UiViewStackLayer.Overlay, UiViewKeys.BaroPressureDialog)
      .ref.request({
        initialValue: this.props.dataProvider.baroSetting.get(),
        initialUnit: UnitType.IN_HG,
        unitsMode,
        minimumValue,
        maximumValue,
        title: 'Baro Setting',
        showSetToButton: true
      });

    if (!result.wasCancelled) {
      const valueToSet = Math.round(result.payload.unit.convertTo(result.payload.value, UnitType.HPA) * 16);
      this.keyEventManager?.triggerKey('KOHLSMAN_SET', true, valueToSet, this.props.index);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} data-checklist="checklist-altimeter">
        <AltimeterTape
          dataProvider={this.props.dataProvider}
        />
        <G3XFailureBox
          show={this.props.dataProvider.isDataFailed}
          label={
            <>
              <div class='altimeter-tape-failure-box-label-word-1'>A<br />L<br />T<br />I<br />T<br />U<br />D<br />E</div>
              <div class='altimeter-tape-failure-box-label-word-2'>F<br />A<br />I<br />L</div>
            </>
          }
          class='altimeter-tape-failure-box'
        />

        <div class='altimeter-top-container' data-checklist="checklist-altimeter-top">
          <TouchButton
            isVisible={this.showTopBottomDisplays}
            label={
              <SelectedAltitudeDisplay
                show={this.showTopBottomDisplays}
                selectedAlt={this.props.dataProvider.selectedAlt}
                altitudeAlertState={this.props.altitudeAlertState}
              />
            }
            onPressed={this.onSelectedAltitudePressed.bind(this)}
            class='pfd-touch-button altimeter-button altimeter-selectedalt-button'
          />
        </div>

        <div class='altimeter-bottom-container' data-checklist="checklist-altimeter-bottom">
          <TouchButton
            isVisible={this.showTopBottomDisplays}
            label={
              <BaroSettingDisplay
                show={this.showTopBottomDisplays}
                baroSetting={this.props.dataProvider.baroSetting}
                isStdActive={this.props.dataProvider.baroIsStdActive}
                displayUnit={this.props.baroDisplayUnit}
              />
            }
            onPressed={this.onBaroSettingPressed.bind(this)}
            class='pfd-touch-button altimeter-button altimeter-baro-button'
          />
        </div>
        <div class='failed-box' />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.showTopBottomDisplays.destroy();

    this.minimumsAlertSub?.destroy();
    this.isDataFailedSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for AltimeterTape.
 */
interface AltimeterTapeProps extends ComponentProps {
  /** A provider of altimeter data. */
  dataProvider: AltimeterDataProvider;
}

/**
 * A G3X Touch altimeter tape.
 */
class AltimeterTape extends DisplayComponent<AltimeterTapeProps> {
  private readonly indicatedAltBoxRef = FSComponent.createRef<IndicatedAltDisplayBox>();
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
  private readonly minimum = SubscribableUtils.toSubscribable(-9999, true);
  private readonly maximum = SubscribableUtils.toSubscribable(99999, true);
  private readonly window = SubscribableUtils.toSubscribable(400, true);
  private readonly majorTickInterval = SubscribableUtils.toSubscribable(100, true);
  private readonly minorTickFactor = SubscribableUtils.toSubscribable(5, true);

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
  ).pause();

  private readonly indicatedAltBoxValue = MappedSubject.create(
    ([indicatedAlt, isIndicatedAltOffScale]): number => {
      return isIndicatedAltOffScale ? NaN : indicatedAlt;
    },
    this.props.dataProvider.indicatedAlt,
    this.isIndicatedAltOffScale
  ).pause();

  private readonly updateTapeEvent = new SubEvent<this, void>();
  private readonly updateTapeWindowEvent = new SubEvent<this, void>();

  private readonly showIndicatedAltData = this.props.dataProvider.isDataFailed.map(SubscribableMapFunctions.not());

  /** @inheritDoc */
  public onAfterRender(): void {
    this.indicatedAltTapeValue.resume();
    this.indicatedAltBoxValue.resume();

    this.indicatedAltTapeValue.sub(this.updateTape.bind(this));

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
          <div class='altimeter-tape-label' style={`position: absolute; left: 0%; top: ${y}%; transform: translateY(-50%)`}>
            <div class='altimeter-tape-label-thousands'>
              {altitude.map(alt => {
                if (alt === 0) {
                  return '0';
                } else {
                  return Math.abs(alt) < 1000 ? '' : Math.trunc(alt / 1000).toString();
                }
              })}
            </div>
            <div class='altimeter-tape-label-hundreds'>
              {altitude.map(alt => {
                if (alt === 0) {
                  return '';
                } else if (Math.abs(alt) < 1000) {
                  return alt.toFixed(0);
                } else {
                  return (Math.abs(alt) % 1000).toFixed(0).padStart(3, '0');
                }
              })}
            </div>
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

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} data-checklist="checklist-altimeter-tape">

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
                style='position: absolute; top: 0; height: 100%; text-align: left;'
              />
            </div>
            <div class='altimeter-tape-overflow' style={this.tapeOverflowTopStyle}></div>
            <div class='altimeter-tape-overflow' style='position: absolute; left: 0; top: 100%; width: 100%; height: 50%;'></div>
          </div>
        </div>

        <IndicatedAltDisplayBox
          ref={this.indicatedAltBoxRef}
          show={this.showIndicatedAltData}
          indicatedAlt={this.indicatedAltBoxValue}
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

  /** @inheritDoc */
  public destroy(): void {
    this.indicatedAltBoxRef.getOrDefault()?.destroy();

    this.selectedAltBugRef.getOrDefault()?.destroy();
    this.minimumsBugRef.getOrDefault()?.destroy();

    this.options.destroy();
    this.isIndicatedAltBelowScale.destroy();
    this.isIndicatedAltAboveScale.destroy();
    this.isIndicatedAltOffScale.destroy();
    this.indicatedAltTapeValue.destroy();
    this.indicatedAltBoxValue.destroy();
    this.showIndicatedAltData.destroy();

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

  private readonly indicatedAlt = this.props.indicatedAlt.map(SubscribableMapFunctions.identity()).pause();

  private readonly negativeSignHidden = ArrayUtils.create(3, index => {
    const topThreshold = index === 0 ? 0 : Math.pow(10, index + 1) - 20;
    const bottomThreshold = Math.pow(10, index + 2) - 20;

    return this.indicatedAlt.map(indicatedAlt => {
      return indicatedAlt >= -topThreshold || indicatedAlt < -bottomThreshold;
    });
  });

  private showSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
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

  /** @inheritDoc */
  public render(): VNode {
    const tensScrollerRef = FSComponent.createRef<DigitScroller>();
    const hundredsScrollerRef = FSComponent.createRef<DigitScroller>();
    const thousandsScrollerRef = FSComponent.createRef<DigitScroller>();
    const tenThousandsScrollerRef = FSComponent.createRef<DigitScroller>();

    this.scrollerRefs.push(tensScrollerRef, tensScrollerRef, hundredsScrollerRef, tenThousandsScrollerRef);

    return (
      <div class='altimeter-indicatedalt-box' style={this.rootStyle}>
        <svg viewBox="0 0 88 60" class='altimeter-indicatedalt-box-bg' preserveAspectRatio='none'>
          <path
            vector-effect='non-scaling-stroke'
            d='M 0 30 l 7 -7 v -6 c 0 -2.21 1.79 -4 4 -4 h 47 v -9 c 0 -2.21 1.79 -4 4 -4 h 22 c 2.21 0 4 1.79 4 4 v 52 c 0 2.21 -1.79 4 -4 4 h -22 c -2.21 0 -4 -1.79 -4 -4 v -8 h -47 c -2.21 0 -4 -1.79 -4 -4 v -7 l -7 -7 Z'
          />
        </svg>
        <div class='altimeter-indicatedalt-box-scrollers'>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-ten-thousands'>
            <DigitScroller
              ref={tenThousandsScrollerRef}
              value={this.indicatedAlt}
              base={10}
              factor={10000}
              scrollThreshold={9980}
              renderDigit={(digit): string => digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
            />
            <div class={{ 'altimeter-indicatedalt-box-negative-sign': true, 'hidden': this.negativeSignHidden[2] }}>-</div>
          </div>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-thousands'>
            <DigitScroller
              ref={thousandsScrollerRef}
              value={this.indicatedAlt}
              base={10}
              factor={1000}
              scrollThreshold={980}
              renderDigit={(digit): string => digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
            />
            <div class={{ 'altimeter-indicatedalt-box-negative-sign': true, 'hidden': this.negativeSignHidden[1] }}>-</div>
          </div>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-hundreds'>
            <DigitScroller
              ref={hundredsScrollerRef}
              value={this.indicatedAlt}
              base={10}
              factor={100}
              scrollThreshold={80}
              renderDigit={(digit): string => digit === 0 ? ' ' : (Math.abs(digit) % 10).toString()}
            />
            <div class={{ 'altimeter-indicatedalt-box-negative-sign': true, 'hidden': this.negativeSignHidden[0] }}>-</div>
          </div>
          <div class='altimeter-indicatedalt-box-digit-container altimeter-indicatedalt-box-tens'>
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

  /** @inheritDoc */
  public destroy(): void {
    for (const hidden of this.negativeSignHidden) {
      hidden.destroy();
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
 * An altitude bug for a G3X Touch altimeter tape.
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

  /** @inheritDoc */
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

  /** @inheritDoc */
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

  /** @inheritDoc */
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

  /** @inheritDoc */
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

  /** @inheritDoc */
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
        <svg viewBox='0 0 8 29' preserveAspectRatio='none' class='altimeter-selectedalt-bug-icon'>
          <path d='M 0 0 l 8 0 l 0 8 l -6.5 6.5 l 6.5 6.5 l 0 8 l -8 0 Z' vector-effect='non-scaling-stroke' />
        </svg>
      </AltitudeBug>
    );
  }

  /** @inheritDoc */
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

  /** @inheritDoc */
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

  /** @inheritDoc */
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
        <svg viewBox='0 0 11 37' preserveAspectRatio='none' class='altimeter-minimums-bug-icon'>
          <path d='M 8 9.76 c 0 0.28 -0.12 0.54 -0.32 0.73 l -5.69 5.31 l -1.57 1.46 c -0.42 0.4 -0.42 1.07 0 1.46 l 1.57 1.46 l 5.7 5.32 c 0.2 0.19 0.32 0.45 0.32 0.73 v 10.76 h 3 v -12.5 l -6.97 -6.5 l 6.97 -6.5 v -11.49 h -3 v 9.76 Z' vector-effect='non-scaling-stroke' />
        </svg>
      </AltitudeBug>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    this.visibilityState.destroy();

    super.destroy();
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

  /** Whether to display values in metric units (hectopascals). */
  displayUnit: Subscribable<Unit<UnitFamily.Pressure>>;
}

/**
 * A display for altimeter barometric pressure setting.
 */
class BaroSettingDisplay extends DisplayComponent<BaroSettingDisplayProps> {
  private static readonly IN_HG_FORMATTER = NumberFormatter.create({ precision: 0.01 });
  private static readonly HPA_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly valueRef = FSComponent.createRef<G3XNumberUnitDisplay<any>>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly baroSettingValueStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly baroStdStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly cssClassSet = SetSubject.create(['altimeter-baro-container']);

  private readonly baroSetting = NumberUnitSubject.create(UnitType.IN_HG.createNumber(29.92));

  private readonly animationDebounceTimer = new DebounceTimer();

  private showSub?: Subscription;
  private baroSettingPipe?: Subscription;
  private isStdActiveSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    const baroSettingPipe = this.baroSettingPipe = this.props.baroSetting.pipe(this.baroSetting, true);

    const isStdActiveSub = this.isStdActiveSub = this.props.isStdActive.sub(isStdActive => {
      if (isStdActive) {
        this.baroSettingValueStyle.set('display', 'none');
        this.baroStdStyle.set('display', '');
      } else {
        this.baroSettingValueStyle.set('display', '');
        this.baroStdStyle.set('display', 'none');
      }
    }, false, true);

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.rootStyle.set('display', '');

        baroSettingPipe.resume(true);
        isStdActiveSub.resume(true);
      } else {
        this.rootStyle.set('display', 'none');

        this.animationDebounceTimer.clear();

        baroSettingPipe.pause();
        isStdActiveSub.pause();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet} style={this.rootStyle}>
        <div class='altimeter-baro-setting-value' style={this.baroSettingValueStyle}>
          <G3XNumberUnitDisplay
            ref={this.valueRef}
            value={this.baroSetting}
            displayUnit={this.props.displayUnit}
            formatter={(number): string => {
              return (this.props.displayUnit.get().equals(UnitType.IN_HG) ? BaroSettingDisplay.IN_HG_FORMATTER : BaroSettingDisplay.HPA_FORMATTER)(number);
            }}
            useBasicUnitFormat
          />
        </div>
        <div class='altimeter-baro-std' style={this.baroStdStyle}>STD BARO</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.valueRef.getOrDefault()?.destroy();

    this.showSub?.destroy();
    this.baroSettingPipe?.destroy();
    this.isStdActiveSub?.destroy();

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
    display: ''
  });

  private readonly cssClassSet = SetSubject.create(['altimeter-selectedalt-container']);

  private readonly selectedAlt = Subject.create(0);

  private readonly animationDebounceTimer = new DebounceTimer();

  private lastAlertState: AltitudeAlertState | undefined = undefined;

  private showSub?: Subscription;
  private selectedAltSub?: Subscription;
  private alertStateSub?: Subscription;

  /** @inheritDoc */
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
    }, false, false);

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

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet} style={this.rootStyle}>
        <svg class='altimeter-selectedalt-icon' viewBox='0 0 8 18' preserveAspectRatio='none'>
          <path d='M 0 0 l 8 0 l 0 4 l -5 5 l 5 5 l 0 4 l -8 0 Z' vector-effect='non-scaling-stroke' />
        </svg>
        <div class='altimeter-selectedalt-text' style={this.textStyle}>
          <span class='altimeter-selectedalt-text-thousands'>
            {this.selectedAlt.map(alt => {
              return Math.abs(alt) < 1000
                ? alt < 0 ? '-' : ''
                : Math.trunc(alt / 1000).toString();
            })}
          </span>
          <span class='altimeter-selectedalt-text-hundreds'>
            {this.selectedAlt.map(alt => {
              const abs = Math.abs(alt);
              return abs < 1000 ? abs.toString() : (abs % 1000).toString().padStart(3, '0');
            })}
          </span>
          <span class='altimeter-selectedalt-text-units'>FT</span>
        </div>
        <div class='altimeter-selectedalt-text' style={this.defaultStyle}>
          <span class='altimeter-selectedalt-text-hundreds'>____</span>
          <span class='altimeter-selectedalt-text-units'>FT</span>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.selectedAltSub?.destroy();
    this.alertStateSub?.destroy();

    super.destroy();
  }
}
