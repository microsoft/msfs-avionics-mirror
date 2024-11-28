import { AhrsEvents, APEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { AdiProjectionUtils } from '../../Utils/AdiProjectionUtils';
import { FlightGuidancePlaneInfo } from './AttitudeDirectorIndicator';
import { FlightDirector } from './FlightDirector';

import './AttitudeIndicator.css';

/**
 * The properties on the Attitude component.
 */
interface AttitudeIndicatorProps extends ComponentProps {

  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The PFD attitude indicator.
 */
export class AttitudeIndicator extends DisplayComponent<AttitudeIndicatorProps> {

  private readonly scrollIncrement = 20;
  private readonly pxPerDegY = AdiProjectionUtils.getPxPerDegY();
  private readonly pitchIncrements = 2.5;
  private readonly numberIncrements = 4;
  private readonly pitchIncrementsDistance = this.pxPerDegY * this.pitchIncrements;

  private readonly pitchLinesGroup = FSComponent.createRef<SVGElement>();
  private readonly bankElement = FSComponent.createRef<HTMLDivElement>();
  private readonly turnCoordinatorElement = FSComponent.createRef<SVGElement>();
  private readonly halfBankArcEl = FSComponent.createRef<HTMLDivElement>();

  private pitchNumbersRight: NodeReference<SVGTextElement>[] = [];

  private currentPitch = 0;
  private lastPitchOffset = 0;

  /**
   * Builds pitch tick marks on the attitude indicator.
   */
  private buildPitchLines(): void {
    for (let i = -this.scrollIncrement; i < (this.scrollIncrement + 1); i++) {
      const length = i % 4 == 0 ? 62 : i % 2 == 0 ? 32 : 12;
      const startX = 0 - (length / 2);
      const posY = 0 - (i * this.pitchIncrementsDistance);
      const endX = startX + length;
      const lineEl = <line x1={startX} y1={posY} x2={endX} y2={posY} stroke="var(--wt21-colors-white)" stroke-width="2">.</line>;
      FSComponent.render(lineEl, this.pitchLinesGroup.instance);
    }
  }

  /**
   * Builds the pitch value numbers for the attitude indicator.
   */
  private buildPitchNumbers(): void {
    this.pitchNumbersRight = [];
    for (let i = -this.scrollIncrement; i < (this.scrollIncrement + 1); i++) {
      const startX = 36;
      const startY = 8 - (i * this.pitchIncrementsDistance);
      if (i % this.numberIncrements == 0) {
        const number = Math.abs(i * this.pitchIncrements);
        const numberText = number !== 0 ? number.toFixed(0) : '';
        const textElementRight = FSComponent.createRef<SVGTextElement>();
        const rightEl = <text x={startX} y={startY} fill="var(--wt21-colors-white)" font-family="WT21" text-anchor="left" font-size="26px" stroke="var(--wt21-colors-black)" stroke-width="1px" paint-order="stroke" ref={textElementRight}>{numberText}</text>;
        this.pitchNumbersRight.push(textElementRight);
        FSComponent.render(rightEl, this.pitchLinesGroup.instance);
      }
    }
  }

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const adc = this.props.bus.getSubscriber<AhrsEvents>();
    adc.on('turn_coordinator_ball')
      .withPrecision(2)
      .handle(this.onUpdateTurnCoordinator);
    this.buildPitchLines();
    this.buildPitchNumbers();
    this.onUpdatePitch(this.currentPitch, true);

    this.props.bus.getSubscriber<APEvents>().on('ap_max_bank_id').whenChanged().handle(this.onMaxBankSet);

  }

  /**
   * Updates attitude indicator.
   * @param planeState The plane state information.
   */
  public update(planeState: FlightGuidancePlaneInfo): void {
    this.onUpdatePitch(planeState.pitch, false);
    this.onUpdateRoll(planeState.roll);
  }

  private onMaxBankSet = (maxBankIndex: number): void => {
    const halfBankOnIndex = 1;
    if (maxBankIndex === halfBankOnIndex) {
      this.halfBankArcEl.instance.classList.remove('hidden');
    } else {
      this.halfBankArcEl.instance.classList.add('hidden');
    }
  };

  /**
   * A callback called when the pitch updates from the event bus.
   * @param pitch The current pitch value.
   * @param forceRedraw An override for the redraw.
   */
  private onUpdatePitch = (pitch: number, forceRedraw = false): void => {
    this.currentPitch = pitch;
    const pitchOffset = Math.trunc((pitch / this.scrollIncrement));
    if (pitchOffset !== this.lastPitchOffset || forceRedraw) {
      this.lastPitchOffset = pitchOffset;
      this.updatePitchNumbers(pitch, pitchOffset);
    }
    this.updateLinesPos(pitch);
  };

  /**
   * A callback called when the ADC updates from the event bus.
   * @param roll The current ADC roll value.
   */
  private onUpdateRoll = (roll: number): void => {
    this.bankElement.instance.style.transform = `rotate3d(0,0,1,${roll}deg)`;
  };

  /**
   * Updates pitch lines position.
   * @param pitch The current pitch value.
   */
  private updateLinesPos(pitch: number): void {
    pitch = pitch % this.scrollIncrement;
    this.pitchLinesGroup.instance.style.transform = `translate3d(0px, ${pitch * this.pxPerDegY}px, 0px)`;
  }

  /**
   * Updates pitch number positions.
   * @param pitch The current pitch value.
   * @param offset The current scroll increment offset.
   */
  private updatePitchNumbers(pitch: number, offset: number): void {
    const initNumber = (this.scrollIncrement * this.pitchIncrements) - (offset * this.scrollIncrement);
    for (let i = 0; i < this.pitchNumbersRight.length; i++) {
      const number = Math.abs(initNumber - (i * (this.pitchIncrements * this.numberIncrements)));
      const numberText = number !== 0 ? number.toFixed(0) : '';

      this.pitchNumbersRight[i].instance.textContent = numberText;
    }
  }


  /**
   * A callback called when the ADC updates from the event bus.
   * @param turnCoordinator The current ADC turn_coordinator_ball value.
   */
  private onUpdateTurnCoordinator = (turnCoordinator: number): void => {
    if (this.turnCoordinatorElement.instance !== null) {
      const translation = turnCoordinator * 32;
      this.turnCoordinatorElement.instance.style.transform = `translate3d(${translation}px, 0px, 0px)`;
    }
  };

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="attitude-container">
        <div class="attitude-arc">
          <svg viewBox="-212 -190 414 316" width="414" height="316">
            <path d="M 0 -180 l -5 -10 l 10 0 Z" stroke="var(--wt21-colors-white)" fill="none" stroke-width="2px"></path>
            <path d="M 0 -180 l -5 -10 l 10 0 Z" stroke="var(--wt21-colors-white)" fill="none" stroke-width="2px" transform="rotate(45,0,0)" />
            <path d="M 0 -180 l -5 -10 l 10 0 Z" stroke="var(--wt21-colors-white)" fill="none" stroke-width="2px" transform="rotate(-45,0,0)" />
            <line x1="0" y1="-178" x2="0" y2="-198" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(-60,0,0)"></line>
            <line x1="0" y1="-178" x2="0" y2="-198" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(-30,0,0)"></line>
            <line x1="0" y1="-178" x2="0" y2="-191" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(-20,0,0)"></line>
            <line x1="0" y1="-178" x2="0" y2="-191" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(-10,0,0)"></line>
            <line x1="0" y1="-178" x2="0" y2="-191" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(10,0,0)"></line>
            <line x1="0" y1="-178" x2="0" y2="-191" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(20,0,0)"></line>
            <line x1="0" y1="-178" x2="0" y2="-198" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(30,0,0)"></line>
            <line x1="0" y1="-178" x2="0" y2="-198" stroke="var(--wt21-colors-white)" stroke-width="2" transform="rotate(60,0,0)"></line>
          </svg>
          <div class="attitude-half-bank-arc hidden" ref={this.halfBankArcEl}>
            <svg viewBox="-212 -190 414 316" width="414" height="316">
              <path d="M -48 -178 A 120 90 0 0 1 48 -178" stroke="var(--wt21-colors-white)" fill="none" stroke-width="2px" />
            </svg>
          </div>
        </div>
        <div class="attitude-bank" ref={this.bankElement} style="transform: rotate3d(0,0,1,0deg)">
          <div class="attitude-arrow">
            <svg viewBox="-15 0 30 20" width="100%">
              <path d="M 0 0 l -13 20 l 26 0 Z" fill="var(--wt21-colors-white)" stroke="var(--wt21-colors-black)" stroke-width=".2px" />
            </svg>
          </div>
          <div class="turn-coordinator" ref={this.turnCoordinatorElement}>
            <svg>
              <rect width="24" height="8" fill="var(--wt21-colors-white)" stroke="var(--wt21-colors-black)" stroke-width=".2" />
            </svg>
          </div>
          <div class="attitude-cutout">
            <div class="attitude-pitchlines">
              <svg width="414px" height="350px" viewBox="-207 -175 414 350">
                <g class="pitchLines" ref={this.pitchLinesGroup}>
                </g>
              </svg>
              {/* <div id="dev-center"
                style="position: absolute; width: 100%; height: 100%; border-left:1px solid orange; top:0%; left:50%">
              </div>
              <div id="dev-centerh"
                style="position: absolute; width: 100%; height: 100%; border-top:1px solid orange; top:50%; left:0%">
              </div> */}
            </div>
          </div>
        </div>
        {/* PLANE */}
        <div class="attitude-plane">
          <FlightDirector bus={this.props.bus} />
        </div>
      </div>
    );
  }
}