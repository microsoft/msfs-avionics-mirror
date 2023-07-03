/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AltitudeRestrictionType, ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, NumberFormatter,
  ObjectSubject, SetSubject, SubEvent, Subject, Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

import { VNavTargetAltitudeRestriction, VNavTargetAltitudeRestrictionType } from '../../../navigation/VNavDataProvider';
import { VsiDataProvider } from './VsiDataProvider';
import { TcasRaCommandDataProvider } from '../../../traffic/TcasRaCommandDataProvider';

/**
 * Scale options for a vertical speed indicator.
 */
export type VsiScaleOptions = {
  /** The maximum absolute vertical speed representable on the indicator, in feet per minute. */
  maximum: number | Subscribable<number>;

  /** The interval between major ticks, in feet per minute. */
  majorTickInterval: number | Subscribable<number>;

  /** The number of minor ticks for each major tick. */
  minorTickFactor: number | Subscribable<number>;
};

/**
 * Component props for VerticalSpeedIndicator.
 */
export interface VerticalSpeedIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A data provider for the indicator. */
  dataProvider: VsiDataProvider;

  /**
   * A provider of TCAS-II resolution advisory vertical speed command data. If not defined, then the indicator will
   * not display resolution advisory commands.
   */
  tcasRaCommandDataProvider?: TcasRaCommandDataProvider;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;

  /** Scale options for the indicator. */
  scaleOptions: VsiScaleOptions;

  /** Whether advanced vnav is enabled or not. */
  isAdvancedVnav: boolean;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD vertical speed indicator.
 */
export class VerticalSpeedIndicator extends DisplayComponent<VerticalSpeedIndicatorProps> {
  /** The amount of overdraw on the upper and lower ends of the scale, as a factor of the scale maximum. */
  private static readonly SCALE_OVERDRAW = 0.125;

  /**
   * The amount of overdraw available for the vertical speed pointer on the upper and lower ends of the scale, as a
   * factor of the scale maximum.
   */
  private static readonly POINTER_OVERDRAW = 0.05;
  private static readonly POINTER_POS_MIN = 0.5 - ((1 + VerticalSpeedIndicator.POINTER_OVERDRAW) / (1 + VerticalSpeedIndicator.SCALE_OVERDRAW)) / 2;
  private static readonly POINTER_POS_MAX = 0.5 + ((1 + VerticalSpeedIndicator.POINTER_OVERDRAW) / (1 + VerticalSpeedIndicator.SCALE_OVERDRAW)) / 2;

  private readonly minorTickContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly majorTickContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly labelContainerRef = FSComponent.createRef<HTMLElement>();
  private readonly vsPointerBugRef = FSComponent.createRef<VsPointerBug>();
  private readonly selectedVsBugRef = FSComponent.createRef<SelectedVsBug>();
  private readonly vsRequiredBugRef = FSComponent.createRef<VsRequiredBug>();
  private readonly vnavAltDisplayRef = FSComponent.createRef<VNavTargetAltitudeDisplay>();
  private readonly selectedVsDisplayRef = FSComponent.createRef<SelectedVsDisplay>();

  private readonly raColorRangeMaxStyle = ObjectSubject.create({
    position: 'absolute',
    top: '0px',
    height: '100%',
    transform: 'scaleY(0)',
    'transform-origin': 'top center'
  });
  private readonly raColorRangeMinStyle = ObjectSubject.create({
    position: 'absolute',
    top: '0px',
    height: '100%',
    transform: 'scaleY(0)',
    'transform-origin': 'bottom center'
  });
  private readonly raColorRangeFlyToStyle = ObjectSubject.create({
    position: 'absolute',
    top: '0px',
    height: '100%',
    transform: 'translate(0px, 0px) scaleY(0)',
    'transform-origin': 'top center'
  });

  private readonly rootCssClass = SetSubject.create(['vsi']);

  private readonly maximum = SubscribableUtils.toSubscribable(this.props.scaleOptions.maximum, true);
  private readonly majorTickInterval = SubscribableUtils.toSubscribable(this.props.scaleOptions.majorTickInterval, true);
  private readonly minorTickFactor = SubscribableUtils.toSubscribable(this.props.scaleOptions.minorTickFactor, true);

  private readonly options = MappedSubject.create(
    this.maximum,
    this.majorTickInterval,
    this.minorTickFactor
  );

  private readonly updateTapeEvent = new SubEvent<this, void>();

  private readonly raFlyToState = this.props.tcasRaCommandDataProvider
    ? MappedSubject.create(this.props.tcasRaCommandDataProvider.raFlyToMinVs, this.props.tcasRaCommandDataProvider.raFlyToMaxVs)
    : undefined;

  private readonly raVsAvoidanceState = this.props.tcasRaCommandDataProvider
    ? MappedSubject.create(
      this.props.dataProvider.verticalSpeed,
      this.props.tcasRaCommandDataProvider.raMaxVs,
      this.props.tcasRaCommandDataProvider.raMinVs
    ).pause()
    : undefined;

  private readonly showBugs = this.props.dataProvider.isDataFailed.map(SubscribableMapFunctions.not());
  private readonly showDisplays = MappedSubject.create(
    ([declutter, isDataFailed]): boolean => !declutter && !isDataFailed,
    this.props.declutter,
    this.props.dataProvider.isDataFailed
  );

  private isDataFailedSub?: Subscription;
  private raMaxVsSub?: Subscription;
  private raMinVsSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.options.sub(this.rebuildScale.bind(this), true);

    if (this.props.tcasRaCommandDataProvider) {
      this.raFlyToState!.sub(([minVs, maxVs]) => {
        this.updateRaFlyToVsColorRange(minVs, maxVs);
      }, true);

      this.raMaxVsSub = this.props.tcasRaCommandDataProvider.raMaxVs.sub(this.updateRaMaxVsColorRange.bind(this), true);
      this.raMinVsSub = this.props.tcasRaCommandDataProvider.raMinVs.sub(this.updateRaMinVsColorRange.bind(this), true);

      const raVsAvoidanceStateSub = this.raVsAvoidanceState!.sub(([vs, maxVs, minVs]) => {
        maxVs ??= Infinity;
        minVs ??= -Infinity;

        this.rootCssClass.toggle('vsi-ra-warn', vs > maxVs || vs < minVs);
      }, false, true);

      this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isDataFailed => {
        if (isDataFailed) {
          this.rootCssClass.add('data-failed');
          this.rootCssClass.delete('vsi-ra-warn');

          raVsAvoidanceStateSub.pause();
          this.raVsAvoidanceState!.pause();
        } else {
          this.rootCssClass.delete('data-failed');

          this.raVsAvoidanceState!.resume();
          raVsAvoidanceStateSub.resume(true);
        }
      }, true);
    }

    this.rootCssClass.toggle('advanced-vnav', this.props.isAdvancedVnav);
  }

  /**
   * Rebuilds this tape's ticks and labels.
   * @param options Scale options for this tape, as `[minimum, maximum, window, majorTickInterval, minorTickFactor]`.
   */
  private rebuildScale(options: readonly [number, number, number]): void {
    const [maximum, majorTickInterval, minorTickFactor] = options;

    this.minorTickContainerRef.instance.innerHTML = '';
    this.majorTickContainerRef.instance.innerHTML = '';
    this.labelContainerRef.instance.innerHTML = '';

    const majorTickCount = Math.floor(maximum / majorTickInterval);

    const halfMaxScaleLength = (1 - VerticalSpeedIndicator.SCALE_OVERDRAW) * 50;

    const len = majorTickCount * minorTickFactor;
    const minorTickInterval = majorTickInterval / minorTickFactor;
    for (let i = 1; i <= len; i++) {
      const yOffset = i / len * halfMaxScaleLength;
      if (i % minorTickFactor === 0) {
        // major tick
        FSComponent.render(
          <path d={`M 0 ${50 - yOffset} L 100 ${50 - yOffset}`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-major'>.</path>,
          this.majorTickContainerRef.instance
        );
        FSComponent.render(
          <path d={`M 0 ${50 + yOffset} L 100 ${50 + yOffset}`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-major'>.</path>,
          this.majorTickContainerRef.instance
        );

        const vs = i * minorTickInterval;

        FSComponent.render(
          <div class='vsi-scale-label' style={`position: absolute; left: 0%; top: ${50 - yOffset}%; transform: translateY(-50%)`}>
            {(vs / 1000).toFixed(0)}
          </div>,
          this.labelContainerRef.instance
        );
        FSComponent.render(
          <div class='vsi-scale-label' style={`position: absolute; left: 0%; top: ${50 + yOffset}%; transform: translateY(-50%)`}>
            {(vs / 1000).toFixed(0)}
          </div>,
          this.labelContainerRef.instance
        );
      } else {
        // minor tick
        FSComponent.render(
          <path d={`M 0 ${50 - yOffset} L 100 ${50 - yOffset}`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-minor'>.</path>,
          this.minorTickContainerRef.instance
        );
        FSComponent.render(
          <path d={`M 0 ${50 + yOffset} L 100 ${50 + yOffset}`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-minor'>.</path>,
          this.minorTickContainerRef.instance
        );
      }
    }

    this.updateTapeEvent.notify(this);

    if (this.props.tcasRaCommandDataProvider) {
      this.updateRaMaxVsColorRange(this.props.tcasRaCommandDataProvider.raMaxVs.get());
      this.updateRaMinVsColorRange(this.props.tcasRaCommandDataProvider.raMinVs.get());
      this.updateRaFlyToVsColorRange(this.props.tcasRaCommandDataProvider.raFlyToMinVs.get(), this.props.tcasRaCommandDataProvider.raFlyToMaxVs.get());
    }
  }

  /**
   * Updates the color range depicting the maximum allowed vertical speed commanded by the current resolution
   * advisory.
   * @param maxVs The maximum allowed vertical speed, in feet per minute, commanded by the current resolution
   * advisory, or `null` if there is no such value.
   */
  private updateRaMaxVsColorRange(maxVs: number | null): void {
    if (maxVs === null) {
      this.raColorRangeMaxStyle.set('transform', 'scaleY(0)');
    } else {
      const vsPosition = this.calculateScalePosition(maxVs);
      this.raColorRangeMaxStyle.set('transform', `scaleY(${vsPosition})`);
    }
  }

  /**
   * Updates the color range depicting the minimum allowed vertical speed commanded by the current resolution
   * advisory.
   * @param minVs The minimum allowed vertical speed, in feet per minute, commanded by the current resolution
   * advisory, or `null` if there is no such value.
   */
  private updateRaMinVsColorRange(minVs: number | null): void {
    if (minVs === null) {
      this.raColorRangeMinStyle.set('transform', 'scaleY(0)');
    } else {
      const vsPosition = this.calculateScalePosition(minVs);
      this.raColorRangeMinStyle.set('transform', `scaleY(${1 - vsPosition})`);
    }
  }

  /**
   * Updates the color range depicting the fly-to command issued by the current resolution advisory.
   * @param minVs The lower bound, in feet per minute, of the current fly-to command, or `null` if there is no such
   * value.
   * @param maxVs The upper bound, in feet per minute, of the current fly-to command, or `null` if there is no such
   * value.
   */
  private updateRaFlyToVsColorRange(minVs: number | null, maxVs: number | null): void {
    if (minVs === null || maxVs === null) {
      this.raColorRangeFlyToStyle.set('transform', 'translate(0px, 0px) scaleY(0)');
    } else {
      const maxVsPosition = this.calculateScalePosition(maxVs);
      const minVsPosition = this.calculateScalePosition(minVs);
      const height = minVsPosition - maxVsPosition;

      this.raColorRangeFlyToStyle.set('transform', `translate(0px, ${maxVsPosition * 100}%) scaleY(${height})`);
    }
  }

  /**
   * Calculates the vertical position on this indicator's scale at which a particular vertical speed is located, with
   * `0` at the top of the scale and `1` at the bottom.
   * @param verticalSpeed A vertical speed, in feet per minute.
   * @returns The vertical position on this indicator's scale at which the specified vertical speed is located, with
   * `0` at the top of the scale and `1` at the bottom.
   */
  private calculateScalePosition(verticalSpeed: number): number {
    const max = this.maximum.get() * (1 + VerticalSpeedIndicator.SCALE_OVERDRAW);

    return 1 - (verticalSpeed + max) / (2 * max);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='vsi-scale' data-checklist="checklist-vsi">
          <div class='vsi-scale-ra-color-range-container' style='position: absolute; top: 0; height: 100%;'>
            <div
              class='vsi-scale-ra-color-range vsi-scale-ra-color-range-max'
              style={this.raColorRangeMaxStyle}
            />
            <div
              class='vsi-scale-ra-color-range vsi-scale-ra-color-range-min'
              style={this.raColorRangeMinStyle}
            />
            <div
              class='vsi-scale-ra-color-range vsi-scale-ra-color-range-flyto'
              style={this.raColorRangeFlyToStyle}
            />
          </div>
          <svg
            ref={this.minorTickContainerRef}
            class='vsi-scale-tick-minor-container'
            viewBox='0 0 100 100' preserveAspectRatio='none'
            style='position: absolute; top: 0; height: 100%;'
          />
          <svg
            ref={this.majorTickContainerRef}
            class='vsi-scale-tick-major-container'
            viewBox='0 0 100 100' preserveAspectRatio='none'
            style='position: absolute; top: 0; height: 100%;'
          />
          <div
            ref={this.labelContainerRef}
            class='vsi-scale-label-container'
            style='position: absolute; top: 0; height: 100%;'
          />

          <div class='vsi-bug-container' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>
            <div class='vsi-bug-container-clip' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden;'>
              <SelectedVsBug
                ref={this.selectedVsBugRef}
                show={this.showBugs}
                selectedVs={this.props.dataProvider.selectedVs}
                updateEvent={this.updateTapeEvent}
                getPosition={this.calculateScalePosition.bind(this)}
              />
              <VsRequiredBug
                ref={this.vsRequiredBugRef}
                show={this.showBugs}
                vsRequired={this.props.dataProvider.vsRequired}
                updateEvent={this.updateTapeEvent}
                getPosition={this.calculateScalePosition.bind(this)}
              />
            </div>

            <VsPointerBug
              ref={this.vsPointerBugRef}
              show={this.showBugs}
              verticalSpeed={this.props.dataProvider.verticalSpeed}
              updateEvent={this.updateTapeEvent}
              getPosition={(verticalSpeed: number): number => {
                return MathUtils.clamp(this.calculateScalePosition(verticalSpeed), VerticalSpeedIndicator.POINTER_POS_MIN, VerticalSpeedIndicator.POINTER_POS_MAX);
              }}
            />
          </div>
        </div>

        <VNavTargetAltitudeDisplay
          ref={this.vnavAltDisplayRef}
          show={this.showDisplays}
          targetRestriction={this.props.dataProvider.targetRestriction}
        />

        <SelectedVsDisplay
          ref={this.selectedVsDisplayRef}
          show={this.showDisplays}
          selectedVs={this.props.dataProvider.selectedVs}
        />

        <div class='failed-box' />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.vsPointerBugRef.getOrDefault()?.destroy();
    this.selectedVsBugRef.getOrDefault()?.destroy();
    this.vsRequiredBugRef.getOrDefault()?.destroy();
    this.vnavAltDisplayRef.getOrDefault()?.destroy();
    this.selectedVsDisplayRef.getOrDefault()?.destroy();

    this.options.destroy();
    this.raFlyToState?.destroy();
    this.raVsAvoidanceState?.destroy();
    this.showBugs.destroy();
    this.showDisplays.destroy();

    this.isDataFailedSub?.destroy();
    this.raMaxVsSub?.destroy();
    this.raMinVsSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for VerticalSpeedBug.
 */
interface VerticalSpeedBugProps extends ComponentProps {
  /** Whether the bug should be visible. */
  show: Subscribable<boolean>;

  /** The reference vertical speed of the bug, in feet per minute. */
  verticalSpeedFpm: Subscribable<number>;

  /** An event which signals that the bug needs to be updated with a new scale position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the bug's parent scale at which a particular vertical speed is located. */
  getPosition: (verticalSpeed: number) => number;

  /** CSS class(es) to apply to the bug's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A vertical speed bug for a next-generation (NXi, G3000, etc) Garmin vertical speed indicator.
 */
class VerticalSpeedBug extends DisplayComponent<VerticalSpeedBugProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    position: 'absolute',
    top: '50%',
    transform: 'translate3d(0, -50%, 0)'
  });

  private readonly position = Subject.create(0);

  private readonly vsFpmRounded = this.props.verticalSpeedFpm.map(SubscribableMapFunctions.withPrecision(1)).pause();

  private cssClassSub?: Subscription;
  private showSub?: Subscription;
  private updateEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const updateHandler = this.updatePosition.bind(this);

    this.vsFpmRounded.sub(updateHandler);

    const updateEventSub = this.updateEventSub = this.props.updateEvent.on(updateHandler, true);

    this.position.sub(translate => {
      this.style.set('top', `${translate}%`);
    });

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.vsFpmRounded.resume();
        updateEventSub.resume();

        this.style.set('display', '');
      } else {
        this.vsFpmRounded.pause();
        updateEventSub.pause();

        this.style.set('display', 'none');
      }
    }, true);
  }

  /**
   * Updates this bug's position on its parent vertical speed indicator.
   */
  private updatePosition(): void {
    const pos = this.props.getPosition(this.vsFpmRounded.get());
    this.position.set(MathUtils.round(pos * 100, 0.1));
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      const baseClass = ['vsi-bug'];
      cssClass = SetSubject.create(baseClass);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, baseClass);
    } else {
      const classesToAdd = this.props.class === undefined
        ? ''
        : FSComponent.parseCssClassesFromString(this.props.class, classToAdd => classToAdd !== 'vsi-bug').join(' ');

      cssClass = `vsi-bug ${classesToAdd}`;
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

    this.vsFpmRounded?.destroy();

    this.cssClassSub?.destroy();
    this.showSub?.destroy();
    this.updateEventSub?.destroy();
  }
}

/**
 * Component props for VsPointerBug.
 */
interface VsPointerBugProps extends ComponentProps {
  /** Whether the bug should be visible. */
  show: Subscribable<boolean>;

  /** The vertical speed, in feet per minute. */
  verticalSpeed: Subscribable<number>;

  /** An event which signals that the bug needs to be updated with a new scale position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the bug's parent scale at which a particular vertical speed is located. */
  getPosition: (verticalSpeed: number) => number;
}

/**
 * A vertical speed pointer bug.
 */
class VsPointerBug extends DisplayComponent<VsPointerBugProps> {
  private static readonly FORMATTER_NORMAL = NumberFormatter.create({ useMinusSign: true });
  private static readonly FORMATTER_THOUSANDS = NumberFormatter.create({ precision: 0.1, useMinusSign: true });

  private readonly bugRef = FSComponent.createRef<VerticalSpeedBug>();

  private readonly roundedVs = this.props.verticalSpeed.map(SubscribableMapFunctions.withPrecision(50)).pause();
  private readonly text = this.roundedVs.map(vs => {
    const abs = Math.abs(vs);
    if (abs < 100) {
      return '';
    } else {
      if (abs < 10000) {
        return VsPointerBug.FORMATTER_NORMAL(vs);
      } else {
        return `${VsPointerBug.FORMATTER_THOUSANDS(vs / 1000)}K`;
      }
    }
  });

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.roundedVs.resume();
      } else {
        this.roundedVs.pause();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <VerticalSpeedBug
        ref={this.bugRef}
        verticalSpeedFpm={this.props.verticalSpeed}
        show={this.props.show}
        updateEvent={this.props.updateEvent}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt), 0, 1)}
        class='vsi-pointer-bug'
      >
        <svg viewBox='0 0 68 24' preserveAspectRatio='none' class='vsi-pointer-bug-background'>
          <path d='M 1 12 l 19 -11 l 44 0 c 2 0 3 1 3 3 l 0 16 c 0 2 -1 3 -3 3 l -44 0 z' vector-effect='non-scaling-stroke' />
        </svg>
        <div class='vsi-pointer-bug-text'>{this.text}</div>
      </VerticalSpeedBug>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    this.roundedVs.destroy();

    this.showSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for SelectedVsBug.
 */
interface SelectedVsBugProps extends ComponentProps {
  /** Whether the bug should be visible. */
  show: Subscribable<boolean>;

  /** The selected vertical speed, in feet per minute, or `null` if there is no such value. */
  selectedVs: Subscribable<number | null>;

  /** An event which signals that the bug needs to be updated with a new scale position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the bug's parent scale at which a particular vertical speed is located. */
  getPosition: (verticalSpeed: number) => number;
}

/**
 * A selected vertical speed bug.
 */
class SelectedVsBug extends DisplayComponent<SelectedVsBugProps> {
  private readonly bugRef = FSComponent.createRef<VerticalSpeedBug>();

  private readonly visibilityState = MappedSubject.create(
    this.props.show,
    this.props.selectedVs
  ).pause();

  private readonly show = Subject.create(false);
  private readonly verticalSpeedFpm = Subject.create(0);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.visibilityState.resume();

    this.visibilityState.sub(([show, selectedVs]) => {
      if (show && selectedVs !== null) {
        this.show.set(true);
        this.verticalSpeedFpm.set(selectedVs);
      } else {
        this.show.set(false);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <VerticalSpeedBug
        ref={this.bugRef}
        verticalSpeedFpm={this.verticalSpeedFpm}
        show={this.show}
        updateEvent={this.props.updateEvent}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt), 0, 1)}
        class='vsi-selectedvs-bug'
      >
        <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='vsi-selectedvs-bug-icon'>
          <path d='M 95 5 h -90 v 90 h 90 v -30 L 45 50 L 95 30 Z' vector-effect='non-scaling-stroke' />
        </svg>
      </VerticalSpeedBug>
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
 * Component props for VsRequiredBug.
 */
interface VsRequiredBugProps extends ComponentProps {
  /** Whether the bug should be visible. */
  show: Subscribable<boolean>;

  /** The required vertical speed, in feet per minute, or `null` if there is no such value. */
  vsRequired: Subscribable<number | null>;

  /** An event which signals that the bug needs to be updated with a new scale position. */
  updateEvent: SubEvent<any, void>;

  /** A function which gets the position on the bug's parent scale at which a particular vertical speed is located. */
  getPosition: (verticalSpeed: number) => number;
}

/**
 * A required vertical speed bug.
 */
class VsRequiredBug extends DisplayComponent<VsRequiredBugProps> {
  private readonly bugRef = FSComponent.createRef<VerticalSpeedBug>();

  private readonly visibilityState = MappedSubject.create(
    this.props.show,
    this.props.vsRequired
  ).pause();

  private readonly show = Subject.create(false);
  private readonly verticalSpeedFpm = Subject.create(0);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.visibilityState.resume();

    this.visibilityState.sub(([show, selectedVs]) => {
      if (show && selectedVs !== null) {
        this.show.set(true);
        this.verticalSpeedFpm.set(selectedVs);
      } else {
        this.show.set(false);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <VerticalSpeedBug
        ref={this.bugRef}
        verticalSpeedFpm={this.verticalSpeedFpm}
        show={this.show}
        updateEvent={this.props.updateEvent}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt), 0, 1)}
        class='vsi-requiredvs-bug'
      >
        <svg viewBox='0 0 16 28' preserveAspectRatio='none' class='vsi-requiredvs-bug-icon'>
          <path d='M -5.5 14 l 19.5 -12 l 0 4 l -13 8 l 13 8 l 0 4 z' vector-effect='non-scaling-stroke' />
        </svg>
      </VerticalSpeedBug>
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
 * Component props for SelectedVsDisplay.
 */
interface SelectedVsDisplayProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** The selected vertical speed, in feet per minute, or `null` if there is no such value. */
  selectedVs: Subscribable<number | null>;
}

/**
 * A selected vertical speed display for a next-generation (NXi, G3000, etc) Garmin vertical speed indicator.
 */
class SelectedVsDisplay extends DisplayComponent<SelectedVsDisplayProps> {
  private static readonly FORMATTER = NumberFormatter.create({ useMinusSign: true });

  private readonly rootStyle = ObjectSubject.create({
    display: ''
  });

  private readonly visibilityState = MappedSubject.create(
    this.props.show,
    this.props.selectedVs
  ).pause();

  private readonly text = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.visibilityState.resume();

    this.visibilityState.sub(([show, selectedVs]) => {
      if (show && selectedVs !== null) {
        this.rootStyle.set('display', '');
        this.text.set(SelectedVsDisplay.FORMATTER(selectedVs));
      } else {
        this.rootStyle.set('display', 'none');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='vsi-selectedvs-display' style={this.rootStyle}>
        <div class='vsi-selectedvs-display-text'>
          {this.text}
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.visibilityState.destroy();

    super.destroy();
  }
}

/**
 * Component props for VNavTargetAltitudeDisplay.
 */
interface VNavTargetAltitudeDisplayProps extends ComponentProps {
  /** Whether the display should be visible. */
  show: Subscribable<boolean>;

  /** The target altitude restriction, or `null` if there is no such value. */
  targetRestriction: Subscribable<VNavTargetAltitudeRestriction | null>;
}

/**
 * A VNAV target altitude restriction display for a next-generation (NXi, G3000, etc) Garmin vertical speed indicator.
 */
class VNavTargetAltitudeDisplay extends DisplayComponent<VNavTargetAltitudeDisplayProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: ''
  });

  private readonly rootCssClass = SetSubject.create(['vsi-vnavalt-display']);

  private readonly visibilityState = MappedSubject.create(
    this.props.show,
    this.props.targetRestriction
  ).pause();

  private readonly restrictionType = Subject.create<VNavTargetAltitudeRestrictionType>(AltitudeRestrictionType.At);
  private readonly text = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.visibilityState.resume();

    this.restrictionType.sub(type => {
      this.rootCssClass.delete('vsi-vnavalt-display-at');
      this.rootCssClass.delete('vsi-vnavalt-display-atorabove');
      this.rootCssClass.delete('vsi-vnavalt-display-atorbelow');

      switch (type) {
        case AltitudeRestrictionType.At:
          this.rootCssClass.add('vsi-vnavalt-display-at');
          break;
        case AltitudeRestrictionType.AtOrAbove:
          this.rootCssClass.add('vsi-vnavalt-display-atorabove');
          break;
        case AltitudeRestrictionType.AtOrBelow:
          this.rootCssClass.add('vsi-vnavalt-display-atorbelow');
          break;
      }
    }, true);

    this.visibilityState.sub(([show, targetRestriction]) => {
      if (show && targetRestriction !== null) {
        this.rootStyle.set('display', '');
        this.restrictionType.set(targetRestriction.type);
        this.text.set(targetRestriction.altitude.toFixed(0));
      } else {
        this.rootStyle.set('display', 'none');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='vsi-vnavalt-display-text-container'>
          <div class='vsi-vnavalt-display-bar' />
          <div class='vsi-vnavalt-display-text'>
            {this.text}
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.visibilityState.destroy();

    super.destroy();
  }
}