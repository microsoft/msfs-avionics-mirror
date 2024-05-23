import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, NumberFormatter, ObjectSubject, SetSubject,
  Subject, Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { VsiDataProvider } from '@microsoft/msfs-garminsdk';

import { G3XFailureBox } from '../../../Shared/Components/Common/G3XFailureBox';
import { G3XVsiScaleMaximum } from './G3XVerticalSpeedIndicatorTypes';

import './G3XVerticalSpeedIndicator.css';

/**
 * Component props for {@link G3XVerticalSpeedIndicator}.
 */
export interface G3XVerticalSpeedIndicatorProps extends ComponentProps {
  /** A data provider for the indicator. */
  dataProvider: VsiDataProvider;

  /** Whether the compact version of the indicator should be shown. */
  isCompact: boolean | Subscribable<boolean>;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;

  /** The maximum scale limit of the indicator, in feet per minute. */
  scaleMaximum: G3XVsiScaleMaximum;

  /** Whether advanced vnav is enabled or not. */
  isAdvancedVnav: boolean;
}

/**
 * A G3X PFD vertical speed indicator.
 */
export class G3XVerticalSpeedIndicator extends DisplayComponent<G3XVerticalSpeedIndicatorProps> {
  private thisNode?: VNode;

  private readonly maximum = this.props.scaleMaximum;
  private readonly oneThousandScaleFraction = this.maximum === 3000 ? 0.58 : this.maximum === 4000 ? 0.47 : 0.75;

  private readonly isCompact = SubscribableUtils.isSubscribable(this.props.isCompact)
    ? this.props.isCompact.map(SubscribableMapFunctions.identity())
    : Subject.create(this.props.isCompact);

  private readonly isDataFailed = this.props.dataProvider.isDataFailed.map(SubscribableMapFunctions.identity());
  private readonly showBugs = this.props.dataProvider.isDataFailed.map(SubscribableMapFunctions.not());

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /**
   * Calculates the vertical position on this indicator's scale at which a particular vertical speed is located, with
   * `0` at the top of the scale and `1` at the bottom.
   * @param verticalSpeed A vertical speed, in feet per minute.
   * @returns The vertical position on this indicator's scale at which the specified vertical speed is located, with
   * `0` at the top of the scale and `1` at the bottom.
   */
  private calculateScalePosition(verticalSpeed: number): number {
    const halfOneThousandScaleFraction = this.oneThousandScaleFraction / 2;
    const verticalSpeedAbs = Math.abs(verticalSpeed);
    if (verticalSpeedAbs <= 1000) {
      return MathUtils.lerp(verticalSpeed, -1000, 1000, halfOneThousandScaleFraction, -halfOneThousandScaleFraction, true, true) + 0.5;
    } else {
      return MathUtils.lerp(verticalSpeedAbs - 1000, 0, this.maximum - 1000, halfOneThousandScaleFraction, 0.5, true, true) * Math.sign(-verticalSpeed) + 0.5;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'vsi': true, 'vsi-compact': this.isCompact, 'data-failed': this.isDataFailed }}>
        <div class='vsi-main' data-checklist="checklist-vsi">
          <svg viewBox='0 0 24 256' preserveAspectRatio='none' class='vsi-main-background vsi-main-background-compact'>
            <path
              d='M 16 256 h -16 v -256 h 16 c 4.42 0 8 3.58 8 8 v 103.15 c 0 2.98 -1.66 5.71 -4.3 7.09 l -18.7 9.76 l 18.7 9.76 c 2.64 1.38 4.3 4.11 4.3 7.09 v 103.15 c 0 4.42 -3.58 8 -8 8 Z'
              class='vsi-main-background-transparency'
            />
            <path
              d='M 14.42 121 l -13.42 7 l 13.42 7'
              vector-effect='non-scaling-stroke'
              class='vsi-main-background-pointer'
            />
          </svg>
          <svg viewBox='0 0 38 256' preserveAspectRatio='none' class='vsi-main-background vsi-main-background-full'>
            <path
              d='M 30 256 h -30 v -256 h 30 c 4.42 0 8 3.58 8 8 v 96.11 c 0 3 -1.68 5.75 -4.35 7.12 l -32.65 16.77 l 32.65 16.77 c 2.67 1.37 4.35 4.12 4.35 7.12 v 96.11 c 0 4.42 -3.58 8 -8 8 Z'
              class='vsi-main-background-transparency'
            />
            <path
              d='M 24.37 116 l -23.37 12 l 23.37 12'
              vector-effect='non-scaling-stroke'
              class='vsi-main-background-pointer'
            />
          </svg>

          <div class='vsi-scale'>
            <div class='vsi-scale-left-border' />
            <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='vsi-scale-tick-minor-container'>
              {this.renderScaleMinorTicks()}
            </svg>
            <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='vsi-scale-tick-major-container'>
              {this.renderScaleMajorTicks()}
            </svg>
            <div class='vsi-scale-label-container'>
              {this.renderScaleLabels()}
            </div>

            <div class='vsi-bug-container'>
              <div class='vsi-bug-container-clip'>
                <SelectedVsBug
                  show={this.showBugs}
                  selectedVs={this.props.dataProvider.selectedVs}
                  getPosition={this.calculateScalePosition.bind(this)}
                />
                <VsRequiredBug
                  show={this.showBugs}
                  vsRequired={this.props.dataProvider.vsRequired}
                  getPosition={this.calculateScalePosition.bind(this)}
                />
              </div>

              <VsPointerBug
                show={this.showBugs}
                verticalSpeed={this.props.dataProvider.verticalSpeed}
                getPosition={this.calculateScalePosition.bind(this)}
              />
            </div>
          </div>

          <G3XFailureBox
            show={this.props.dataProvider.isDataFailed}
            class='vsi-failure-box'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders this indicator's minor scale ticks.
   * @returns This indicator's minor scale ticks, as an array of VNodes.
   */
  private renderScaleMinorTicks(): VNode[] {
    const ticks: VNode[] = [];

    for (let vs = 100; vs < 1000; vs += 100) {
      if (vs !== 500) {
        const offset = this.calculateScalePosition(vs) * 100;
        ticks.push(
          <path d={`M 0 ${offset.toFixed(2)} l 100 0`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-minor' />,
          <path d={`M 0 ${(100 - offset).toFixed(2)} l 100 0`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-minor' />
        );
      }
    }

    return ticks;
  }

  /**
   * Renders this indicator's major scale ticks.
   * @returns This indicator's major scale ticks, as an array of VNodes.
   */
  private renderScaleMajorTicks(): VNode[] {
    const ticks: VNode[] = [];

    for (let vs = 500; vs <= this.maximum; vs += 500) {
      const offset = this.calculateScalePosition(vs) * 100;
      ticks.push(
        <path d={`M 0 ${offset.toFixed(2)} l 100 0`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-major' />,
        <path d={`M 0 ${(100 - offset).toFixed(2)} l 100 0`} vector-effect='non-scaling-stroke' class='vsi-scale-tick vsi-scale-tick-major' />
      );
    }

    return ticks;
  }

  /**
   * Renders this indicator's scale labels.
   * @returns This indicator's scale labels, as an array of VNodes.
   */
  private renderScaleLabels(): VNode[] {
    const labels: VNode[] = [];

    // 500 FPM label
    const offset500 = this.calculateScalePosition(500) * 100;
    labels.push(
      (
        <div class='vsi-scale-label vsi-scale-label-minor' style={`position: absolute; left: 0%; top: ${offset500.toFixed(1)}%; transform: translateY(-50%);`}>
          .5
        </div>
      ),
      (
        <div class='vsi-scale-label vsi-scale-label-minor' style={`position: absolute; left: 0%; top: ${(100 - offset500).toFixed(1)}%; transform: translateY(-50%);`}>
          .5
        </div>
      )
    );

    for (let vs = 1000; vs <= this.maximum; vs += 1000) {
      const offset = this.calculateScalePosition(vs) * 100;
      labels.push(
        (
          <div class='vsi-scale-label vsi-scale-label-major' style={`position: absolute; left: 0%; top: ${offset.toFixed(1)}%; transform: translateY(-50%);`}>
            {(vs / 1000).toFixed(0)}
          </div>
        ),
        (
          <div class='vsi-scale-label vsi-scale-label-major' style={`position: absolute; left: 0%; top: ${(100 - offset).toFixed(1)}%; transform: translateY(-50%);`}>
            {(vs / 1000).toFixed(0)}
          </div>
        )
      );
    }

    return labels;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.isDataFailed.destroy();
    this.showBugs.destroy();
    'destroy' in this.isCompact && this.isCompact.destroy();

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

  /** @inheritDoc */
  public onAfterRender(): void {
    this.vsFpmRounded.sub(this.updatePosition.bind(this), true);

    this.position.sub(translate => {
      this.style.set('top', `${translate}%`);
    });

    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.vsFpmRounded.resume();

        this.style.set('display', '');
      } else {
        this.vsFpmRounded.pause();

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

  /** @inheritDoc */
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

  /** inheritDoc */
  public destroy(): void {
    super.destroy();

    this.vsFpmRounded?.destroy();

    this.cssClassSub?.destroy();
    this.showSub?.destroy();
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

  /** A function which gets the position on the bug's parent scale at which a particular vertical speed is located. */
  getPosition: (verticalSpeed: number) => number;
}

/**
 * A vertical speed pointer bug.
 */
class VsPointerBug extends DisplayComponent<VsPointerBugProps> {
  private static readonly FORMATTER_NORMAL = NumberFormatter.create({ precision: 1 });
  private static readonly FORMATTER_THOUSANDS = NumberFormatter.create({ precision: 0.1 });

  private readonly bugRef = FSComponent.createRef<VerticalSpeedBug>();

  private readonly roundedVs = this.props.verticalSpeed.map(SubscribableMapFunctions.withPrecision(5)).pause();
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

  /** inheritDoc */
  public onAfterRender(): void {
    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.roundedVs.resume();
      } else {
        this.roundedVs.pause();
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <VerticalSpeedBug
        ref={this.bugRef}
        verticalSpeedFpm={this.props.verticalSpeed}
        show={this.props.show}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt), 0, 1)}
        class='vsi-pointer-bug-container'
      >
        <div class='vsi-pointer-bug vsi-pointer-bug-compact'>
          <svg viewBox='0 0 68 24' preserveAspectRatio='none' class='vsi-pointer-bug-background'>
            <path d='M 1 12 l 20 -9 l 0 18 L 21 21 z' vector-effect='non-scaling-stroke' />
          </svg>
        </div>
        <div class='vsi-pointer-bug vsi-pointer-bug-full'>
          <svg viewBox='0 0 68 24' preserveAspectRatio='none' class='vsi-pointer-bug-background'>
            <path d='M 1 12 l 19 -11 l 44 0 c 2 0 3 1 3 3 l 0 16 c 0 2 -1 3 -3 3 l -44 0 z' vector-effect='non-scaling-stroke' />
          </svg>
          <div class='vsi-pointer-bug-text'>{this.text}</div>
        </div>
      </VerticalSpeedBug>
    );
  }

  /** inheritDoc */
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

  /** inheritDoc */
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

  /** @inheritDoc */
  public render(): VNode {
    return (
      <VerticalSpeedBug
        ref={this.bugRef}
        verticalSpeedFpm={this.verticalSpeedFpm}
        show={this.show}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt), 0, 1)}
        class='vsi-selectedvs-bug'
      >
        <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='vsi-selectedvs-bug-icon'>
          <path d='M 95 5 h -90 v 90 h 90 v -30 L 45 50 L 95 30 Z' vector-effect='non-scaling-stroke' />
        </svg>
      </VerticalSpeedBug>
    );
  }

  /** inheritDoc */
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

  /** inheritDoc */
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

  /** @inheritDoc */
  public render(): VNode {
    return (
      <VerticalSpeedBug
        ref={this.bugRef}
        verticalSpeedFpm={this.verticalSpeedFpm}
        show={this.show}
        getPosition={(indicatedAlt: number): number => MathUtils.clamp(this.props.getPosition(indicatedAlt), 0, 1)}
        class='vsi-requiredvs-bug'
      >
        <svg viewBox='0 0 16 28' preserveAspectRatio='none' class='vsi-requiredvs-bug-icon'>
          <path d='M -5.5 14 l 19.5 -12 l 0 4 l -13 8 l 13 8 l 0 4 z' vector-effect='non-scaling-stroke' />
        </svg>
      </VerticalSpeedBug>
    );
  }

  /** inheritDoc */
  public destroy(): void {
    this.bugRef.getOrDefault()?.destroy();

    this.visibilityState.destroy();

    super.destroy();
  }
}
