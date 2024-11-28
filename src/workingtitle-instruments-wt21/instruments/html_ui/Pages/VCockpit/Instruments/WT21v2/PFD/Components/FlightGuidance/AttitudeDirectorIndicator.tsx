import {
  AvionicsSystemState, AvionicsSystemStateEvent, ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { AhrsSystemEvents, AhrsSystemSelectorEvents } from '@microsoft/msfs-wt21-shared';

import { ArtificialHorizon } from './ArtificialHorizon';
import { AttitudeIndicator } from './AttitudeIndicator';

import './AttitudeDirectorIndicator.css';

/**
 * The properties for the AttitudeDirectorIndicator component.
 */
interface AttitudeDirectorIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * Structure to hold the current roll,pitch,heading and altitude situation of the plane.
 */
export interface FlightGuidancePlaneInfo {
  /** The current roll of the plane. */
  roll: number;
  /** The current pitch of the plane. */
  pitch: number;
  // /** The current heading of the plane. */
  // heading: number;
  // /** The current track of the plane. */
  // track: number;
  // /** The current altitude of the plane in meters. */
  // altitude_m: number;
  // /** The current ground speed of the plane. */
  // gs: number;
  // /** The current vertical speed of the plane. */
  // vs: number;
  // /** The current angle of attack of the plane. */
  // aoa: number;
}

/**
 * The AttitudeDirectorIndicator component.
 */
export class AttitudeDirectorIndicator extends DisplayComponent<AttitudeDirectorIndicatorProps> {
  private shouldUpdate = true;

  private planeInfo: FlightGuidancePlaneInfo = {
    roll: 0,
    pitch: 0,
  };

  private containerRef = FSComponent.createRef<HTMLDivElement>();
  private artHorizonRef = FSComponent.createRef<ArtificialHorizon>();
  private attitudeIndicatorRef = FSComponent.createRef<AttitudeIndicator>();

  private readonly selectedAhrs = ConsumerSubject.create(this.props.bus.getSubscriber<AhrsSystemSelectorEvents>().on('ahrs_selected_source_index'), 1);
  private ahrsSubscriptions = [] as Subscription[];

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const ahrs = this.props.bus.getSubscriber<AhrsSystemEvents>();
    this.selectedAhrs.sub((ahrsIndex) => {
      for (const sub of this.ahrsSubscriptions) {
        sub.destroy();
      }
      this.ahrsSubscriptions = [];

      this.ahrsSubscriptions.push(
        ahrs.on(`ahrs_pitch_deg_${ahrsIndex}`).withPrecision(2).handle(this.onUpdatePitch),
        ahrs.on(`ahrs_roll_deg_${ahrsIndex}`).withPrecision(3).handle(this.onUpdateRoll),
        ahrs.on(`ahrs_state_${ahrsIndex}`).whenChanged().handle(this.onAhrsStateChanged.bind(this)),
        ahrs.on(`ahrs_attitude_data_valid_${ahrsIndex}`).whenChanged().handle(this.onAttitudeValidityChanged.bind(this)),
      );
    }, true);


    const clock = this.props.bus.getSubscriber<ClockEvents>();
    clock.on('realTime').handle(this.onFrameUpdate);
  }

  /**
   * A callback called when the AHRS attitude state changes.
   * @param state The state change event to handle.
   */
  private onAhrsStateChanged(state: AvionicsSystemStateEvent): void {
    this.containerRef.instance.classList.toggle('align', state.current == AvionicsSystemState.Initializing);
  }

  /**
   * A callback called when the AHRS attitude validity changes.
   * @param valid Whether the attitude is now valid
   */
  private onAttitudeValidityChanged(valid: boolean): void {
    this.containerRef.instance.classList.toggle('fail', !valid);
  }

  /**
   * A callback called when the pitch updates from the event bus.
   * @param pitch The current pitch value.
   */
  private onUpdatePitch = (pitch: number): void => {
    this.planeInfo.pitch = pitch;
    this.shouldUpdate = true;
  };

  /**
   * A callback called when the roll updates from the event bus.
   * @param roll The current ADC roll value.
   */
  private onUpdateRoll = (roll: number): void => {
    this.planeInfo.roll = roll;
    this.shouldUpdate = true;
  };

  private onFrameUpdate = (): void => {
    if (this.shouldUpdate) {
      this.shouldUpdate = false;
      this.artHorizonRef.instance.update(this.planeInfo);
      this.attitudeIndicatorRef.instance.update(this.planeInfo);
    }
  };

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="adi-container" ref={this.containerRef}>
        <ArtificialHorizon ref={this.artHorizonRef} bus={this.props.bus} />
        <AttitudeIndicator ref={this.attitudeIndicatorRef} bus={this.props.bus} />
        <div class="fail-box">
          ATT
        </div>
        <div id="alignInfo" class="info-box">
          ATT/HDG ALIGNING
        </div>
        <div id="taxiInfo" class="info-box">
          DO NOT TAXI
        </div>
      </div>
    );
  }
}
