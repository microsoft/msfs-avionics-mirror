import {
  AdcEvents, APEvents, ApproachGuidanceMode, APVerticalModes, AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, ConsumerSubject, DisplayComponent,
  EventBus, FSComponent, Subject, VNavEvents, VNavState, VNode
} from '@microsoft/msfs-sdk';

import { ADCSystemEvents, WT21ControlEvents, WT21NavigationUserSettings } from '@microsoft/msfs-wt21-shared';

import './VSI.css';

/**
 * The properties for the VSI component.
 */
interface VSIProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The VSI component.
 */
export class VSI extends DisplayComponent<VSIProps> {

  private vsiContainerRef = FSComponent.createRef<HTMLDivElement>();
  private verticalSpeedTopRef = FSComponent.createRef<HTMLDivElement>();
  private verticalSpeedBottomRef = FSComponent.createRef<HTMLDivElement>();
  private verticalSpeedPointerRef = FSComponent.createRef<SVGLineElement>();
  private verticalSpeedColumnRef = FSComponent.createRef<SVGLineElement>();
  private verticalSpeedDonutRef = FSComponent.createRef<SVGCircleElement>();
  private selectedVerticalSpeedBugRef = FSComponent.createRef<HTMLDivElement>();

  private donutVisible = Subject.create(false);
  private selectorVisible = Subject.create(false);
  private topTextVisible = Subject.create(false);
  private bottomTextVisible = Subject.create(false);
  private svgCenter = 199;
  private previousVerticalSpeed = 0;

  private readonly vnavSub = this.props.bus.getSubscriber<VNavEvents>();
  private readonly vnavState = ConsumerSubject.create(this.vnavSub.on('vnav_state').whenChanged(), VNavState.Disabled);
  private readonly vnavApproachMode = ConsumerSubject.create(this.vnavSub.on('gp_approach_mode').whenChanged(), ApproachGuidanceMode.None);
  private readonly advisoryVnavSetting = WT21NavigationUserSettings.getManager(this.props.bus).getSetting('advisoryVnavEnabled');

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const adc = this.props.bus.getSubscriber<AdcEvents>();
    const ap = this.props.bus.getSubscriber<APEvents>();

    this.props.bus.getSubscriber<WT21ControlEvents>().on('fma_modes').handle((v) => {
      this.selectorVisible.set(v.verticalActive == APVerticalModes.VS);
    });

    adc.on('vertical_speed')
      .withPrecision(1)
      .handle(this.updateVerticalSpeed.bind(this));

    ap.on('ap_vs_selected')
      .withPrecision(0)
      .handle(this.updateSelectedVerticalSpeed.bind(this));

    this.props.bus.getSubscriber<VNavEvents>().on('vnav_required_vs').whenChanged().handle(vs => {
      const isVNavModeDisabled = this.vnavState.get() <= VNavState.Enabled_Inactive;
      const isGpActiveApproachMode = this.vnavApproachMode.get() === ApproachGuidanceMode.GPActive;
      const showDonut = vs !== 0 && (this.advisoryVnavSetting.value || !isVNavModeDisabled || isGpActiveApproachMode);
      this.updateDonutVerticalSpeed(vs, showDonut);
    });

    this.donutVisible.sub(x => {
      this.verticalSpeedDonutRef.instance.style.visibility = x ? 'visible' : 'hidden';
    });

    this.selectorVisible.sub(x => {
      this.selectedVerticalSpeedBugRef.instance.style.visibility = x ? 'visible' : 'hidden';
    });

    this.topTextVisible.sub(x => {
      this.verticalSpeedTopRef.instance.classList.toggle('hidden', !x);
    });

    this.bottomTextVisible.sub(x => {
      this.verticalSpeedBottomRef.instance.classList.toggle('hidden', !x);
    });

    this.props.bus.getSubscriber<ADCSystemEvents>()
      .on('adc_state').whenChanged()
      .handle(this.onAdcStateChanged.bind(this));
  }

  /**
   * A callback called when the ADC system state changes.
   * @param state The state change event to handle.
   */
  private onAdcStateChanged(state: AvionicsSystemStateEvent): void {
    this.vsiContainerRef.instance.classList.toggle('fail', (state.current == AvionicsSystemState.Off || state.current == AvionicsSystemState.Failed || state.current == AvionicsSystemState.Initializing));
  }

  /**
   * Updates the vertical speed indicator when the vertical speed changes.
   * @param verticalSpeed The new vertical speed value.
   */
  private updateVerticalSpeed(verticalSpeed: number): void {
    if (verticalSpeed >= 300 || (verticalSpeed >= 100 && this.previousVerticalSpeed > verticalSpeed)) {
      this.topTextVisible.set(true);
      this.verticalSpeedTopRef.instance.textContent = (Math.floor(Math.abs(verticalSpeed) / 100) * 100).toString();
    } else {
      this.topTextVisible.set(false);
    }

    if (verticalSpeed <= -300 || (verticalSpeed <= -100 && this.previousVerticalSpeed < verticalSpeed)) {
      this.bottomTextVisible.set(true);
      this.verticalSpeedBottomRef.instance.textContent = (Math.floor(Math.abs(verticalSpeed) / 100) * 100).toString();
    } else {
      this.bottomTextVisible.set(false);
    }

    const pointerTranslation = this.svgCenter - this.calculatePointerPosition(verticalSpeed, 5)[0];
    this.verticalSpeedPointerRef.instance.setAttribute('y1', pointerTranslation.toString());

    const columnTranslation = this.svgCenter - this.calculatePointerPosition(verticalSpeed, 22.5)[0];
    this.verticalSpeedColumnRef.instance.setAttribute('y1', columnTranslation.toString());

    this.previousVerticalSpeed = verticalSpeed;
  }

  /**
   * Returns the vertical deviation of the VSI pointer depending on vertical speed and pointer length.
   * @param verticalSpeed The vertical speed value.
   * @param xOffset The horizontal offset at which the deviation should be returned.
   * @returns the calculated deviation value.
   */
  private calculatePointerPosition(verticalSpeed: number, xOffset?: number): number[] {
    const absoluteVerticalSpeed = Math.abs(verticalSpeed);

    let deviation = 0;
    if (absoluteVerticalSpeed < 500) {
      deviation = absoluteVerticalSpeed * 0.046;
    } else if (absoluteVerticalSpeed < 1000) {
      deviation = 23 + (absoluteVerticalSpeed - 500) * 0.049;
    } else if (absoluteVerticalSpeed < 2000) {
      deviation = 47.5 + (absoluteVerticalSpeed - 1000) * 0.0575;
    } else if (absoluteVerticalSpeed < 4000) {
      deviation = 105 + (absoluteVerticalSpeed - 2000) * 0.0195;
    } else {
      deviation = 144;
    }

    const slope = deviation / 155;
    if (xOffset) {
      deviation = deviation - slope * xOffset;
    }

    return verticalSpeed > 0 ? [deviation, slope] : [-deviation, -slope];
  }

  /**
   * Updates the vertical speed indicator when the selected vertical speed changes.
   * @param selectedVerticalSpeed The new selected vertical speed value.
   */
  private updateSelectedVerticalSpeed(selectedVerticalSpeed: number): void {
    const pointerPosition = this.calculatePointerPosition(selectedVerticalSpeed, 5);
    const translation = this.svgCenter - pointerPosition[0];
    const rotation = Math.sin(pointerPosition[1]) * 180 / Math.PI;
    this.selectedVerticalSpeedBugRef.instance.setAttribute('transform', 'translate(23.5,' + translation.toString() + ') rotate(' + rotation.toString() + ')');
  }

  /**
   * Updates the donut when its associated vertical speed changes.
   * @param donutVerticalSpeed The new donut vs value.
   * @param visible Toggles donut visibility.
   */
  private updateDonutVerticalSpeed(donutVerticalSpeed: number, visible = true): void {
    if (visible) {
      const translation = this.svgCenter - this.calculatePointerPosition(donutVerticalSpeed, 5)[0];
      this.verticalSpeedDonutRef.instance.setAttribute('cy', translation.toString());
    }
    this.donutVisible.set(visible);
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="translucent-box vertical-speed-box" ref={this.vsiContainerRef}>
        <div class="vsi">
          <div ref={this.verticalSpeedTopRef} class="vs-readout-top"></div>
          <svg height="395px">
            <line x1="40.5" y1="199" x2="40.5" y2="199" stroke="var(--wt21-colors-green)" stroke-width="2" ref={this.verticalSpeedColumnRef}></line>

            <text x="16.5" y="61.5" fill="var(--wt21-colors-white)" font-size="21" text-anchor="end">4</text>
            <line x1="18.5" y1="55" x2="40.5" y2="77.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            <text x="16.5" y="100.5" fill="var(--wt21-colors-white)" font-size="21" text-anchor="end">2</text>
            <line x1="18.5" y1="94" x2="40.5" y2="111" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            <text x="16.5" y="158" fill="var(--wt21-colors-white)" font-size="21" text-anchor="end">1</text>
            <line x1="18.5" y1="151.5" x2="40.5" y2="158.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            <line x1="18.5" y1="176" x2="30.5" y2="178.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>

            <line x1="8" y1="199" x2="41.5" y2="199" stroke="var(--wt21-colors-white)" stroke-width="4"></line>

            <line x1="18.5" y1="222" x2="30.5" y2="219.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            <line x1="18.5" y1="246.5" x2="40.5" y2="239.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            <text x="16.5" y="253" fill="var(--wt21-colors-white)" font-size="21" text-anchor="end">1</text>
            <line x1="18.5" y1="304" x2="40.5" y2="287" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            <text x="16.5" y="310.5" fill="var(--wt21-colors-white)" font-size="21" text-anchor="end">2</text>
            <line x1="18.5" y1="343" x2="40.5" y2="320.5" stroke="var(--wt21-colors-dark-gray)" stroke-width="1.5"></line>
            <text x="16.5" y="349.5" fill="var(--wt21-colors-white)" font-size="21" text-anchor="end">4</text>

            <circle ref={this.verticalSpeedDonutRef} cx="23.5" cy="20" r="7" fill="none" stroke="var(--wt21-colors-magenta)" stroke-width="2" visibility="hidden"></circle>
            <line x1="23.5" y1="199" x2="155" y2="199" stroke="var(--wt21-colors-green)" stroke-width="4" ref={this.verticalSpeedPointerRef}></line>
            <path ref={this.selectedVerticalSpeedBugRef} d="M -3 -10 L 9 0 L -3 10 L -3 3 L -6 3 L -6 -3 L -3 -3 L -3 -10 Z" fill="var(--wt21-colors-cyan)" visibility="hidden" transform="translate(23.5, 199)"></path>
          </svg>
          <div ref={this.verticalSpeedBottomRef} class="vs-readout-bottom"></div>
        </div>
        <div class="fail-box">
          VS
        </div>
      </div>
    );
  }
}
