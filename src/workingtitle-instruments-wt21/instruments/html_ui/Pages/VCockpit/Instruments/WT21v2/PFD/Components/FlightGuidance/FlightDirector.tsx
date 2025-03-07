import {
  AhrsEvents, APEvents, ClockEvents, DefaultUserSettingManager, DisplayComponent, EventBus, FSComponent, LinearServo, MathUtils, Subscription, VNode,
} from '@microsoft/msfs-sdk';

import { PFDSettings, PFDUserSettings, WT21ControlEvents } from '@microsoft/msfs-wt21-shared';

import { AdiProjectionUtils } from '../../Utils/AdiProjectionUtils';

import './FlightDirector.css';

/**
 * The properties for the flight director component.
 */
interface FlightDirectorProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The PFD flight directors.
 */
export class FlightDirector extends DisplayComponent<FlightDirectorProps> {
  private vBarVisRef = FSComponent.createRef<HTMLDivElement>();
  private vBarRef = FSComponent.createRef<HTMLDivElement>();
  private crossPtrVisRef = FSComponent.createRef<HTMLDivElement>();
  private crossPtrPitchRef = FSComponent.createRef<HTMLDivElement>();
  private crossPtrBankRef = FSComponent.createRef<HTMLDivElement>();
  private minimumsFlagRef = FSComponent.createRef<HTMLDivElement>();
  private currentBank = 0;
  private fdRawBank = 0;
  private fdServoBank = 0;
  private fdServoPitch = 0;
  private currentPitch = 0;
  private fdRawPitch = 0;
  private bankServo = new LinearServo(3);
  private pitchServo = new LinearServo(3);
  private needUpdate = false;
  private readonly pxPerDegY = AdiProjectionUtils.getPxPerDegY();

  private fdVisible = false;
  private pfdSettingsManager!: DefaultUserSettingManager<PFDSettings>;

  private readonly fdPitchHandler = (fdPitch: number): void => {
    this.fdRawPitch = fdPitch;
    this.needUpdate = true;
  };
  private readonly fdBankHandler = (fdBank: number): void => {
    this.fdRawBank = fdBank;
    this.needUpdate = true;
  };
  private readonly pitchHandler = (pitch: number): void => {
    this.currentPitch = pitch;
    this.needUpdate = true;
  };
  private readonly bankHandler = (bank: number): void => {
    this.currentBank = bank;
    this.needUpdate = true;
  };

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  constructor(props: FlightDirectorProps) {
    super(props);
    const sub = this.props.bus.getSubscriber<APEvents & AhrsEvents>();

    this.subs.push(
      sub.on('flight_director_pitch').withPrecision(2).handle(this.fdPitchHandler).pause(),
      sub.on('flight_director_bank').withPrecision(2).handle(this.fdBankHandler).pause(),
      sub.on('pitch_deg').withPrecision(2).handle(this.pitchHandler).pause(),
      sub.on('roll_deg').withPrecision(2).handle(this.bankHandler).pause(),
    );
  }

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<ClockEvents>().on('realTime').handle(this.updateFD.bind(this));

    this.pfdSettingsManager = PFDUserSettings.getManager(this.props.bus);
    this.pfdSettingsManager.whenSettingChanged('fltDirStyle').handle(this.toggleFltDir);
    this.toggleFltDir();

    this.props.bus.getSubscriber<APEvents>().on('flight_director_is_active_1').whenChanged().handle((x) => {
      this.fdVisible = x;
      this.toggleFltDir();
    });

    const cp = this.props.bus.getSubscriber<WT21ControlEvents>();
    cp.on('minimums_alert').whenChanged().handle(isAlerting => {
      this.minimumsFlagRef.instance.classList.toggle('hidden', !isAlerting);
      this.minimumsFlagRef.instance.classList.toggle('mins-flash', isAlerting);
    });
  }

  /**
   * A callback called when the Flight Director vis or style is changed.
   */
  private toggleFltDir = (): void => {
    const style = (this.pfdSettingsManager.getSetting('fltDirStyle').value);
    this.vBarVisRef.instance.style.display = !style ? '' : 'none';
    this.crossPtrVisRef.instance.style.display = style ? '' : 'none';

    if (this.fdVisible) {
      this.vBarRef.instance.style.display = !style ? '' : 'none';
      this.crossPtrPitchRef.instance.style.display = style ? '' : 'none';
      this.crossPtrBankRef.instance.style.display = style ? '' : 'none';
    } else {
      this.vBarRef.instance.style.display = !style ? 'none' : '';
      this.crossPtrPitchRef.instance.style.display = style ? 'none' : '';
      this.crossPtrBankRef.instance.style.display = style ? 'none' : '';
    }

    for (const sub of this.subs) {
      if (this.fdVisible) {
        sub.resume();
      } else {
        sub.pause;
      }
    }

    this.needUpdate = true;
  };


  /**
   * Updates the flight director.
   */
  private updateFD(): void {
    if (!this.needUpdate) {
      return;
    }
    this.fdServoBank = this.bankServo.drive(this.fdServoBank, this.fdRawBank);
    this.fdServoPitch = this.pitchServo.drive(this.fdServoPitch, this.fdRawPitch);
    const correctedBank = this.fdServoBank - this.currentBank;
    // const averagedPitch = this.pitchAverage.getAverage(this.fdRawPitch);
    const correctedPitch = MathUtils.clamp(this.fdServoPitch - this.currentPitch, -15, 17);
    const translationPitch = correctedPitch * this.pxPerDegY;
    const translationBank = correctedBank * 2;
    if (this.pfdSettingsManager.getSetting('fltDirStyle').value) {
      this.crossPtrPitchRef.instance.style.transform = `translate3d(0px, ${-translationPitch}px, 0px)`;
      this.crossPtrBankRef.instance.style.transform = `translate3d(${-translationBank}px, 0px, 0px)`;
    } else {
      this.vBarRef.instance.style.transform = `translate3d(0px, ${-translationPitch}px, 0px) rotate3d(0, 0, 1, ${-correctedBank}deg)`;
    }
    this.needUpdate = false;
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div>
        <div ref={this.vBarVisRef}>
          <div class="flight-director flight-director-absolute" ref={this.vBarRef}>
            <svg width="408" height="360px">
              {/* VBAR FLIGHT DIRECTOR */}
              <path d="M 87 239 l 113.6 -36 l 0 -1 l -132.6 27 l 19 10" fill="var(--wt21-colors-magenta)" stroke="black" stroke-width="1px" />
              <path d="M 87 239 l -19 6 l 0 -16 z" fill="var(--wt21-colors-magenta)" stroke="black" stroke-width="1px" />
              <path d="M 327 239 l -113.6 -36 l 0 -1 l 132.6 27 z" fill="var(--wt21-colors-magenta)" stroke="black" stroke-width="1px" />
              <path d="M 327 239 l 19 6 l 0 -16 z" fill="var(--wt21-colors-magenta)" stroke="black" stroke-width="1px" />
            </svg>
          </div>
          <div class="flight-director-absolute">
            <svg width="408" height="360px">
              {/* VBAR PLANE SYMBOL */}
              <rect x="34" y="56%" width="30" height="6" fill="var(--wt21-colors-black)" stroke="var(--wt21-colors-white)" stroke-width="2px"></rect>
              <rect x="348" y="56%" width="30" height="6" fill="var(--wt21-colors-black)" stroke="var(--wt21-colors-white)" stroke-width="2px"></rect>
              <path d="M 207 204 l 0 -1 l -120 38 l 56 0 Z" fill="var(--wt21-colors-black)" stroke="var(--wt21-colors-white)" stroke-width="2px"></path>
              <path d="M 207 204 l 0 -1 l 120 38 l -56 0 Z" fill="var(--wt21-colors-black)" stroke="var(--wt21-colors-white)" stroke-width="2px" />
            </svg>
          </div>
        </div>
        <div ref={this.crossPtrVisRef}>
          <div class="flight-director-absolute">
            <svg width="408" height="360px">
              {/* CROSS POINTER PLANE SYMBOL */}
              <path d="M 143 198 l -75 0 l 0 10 l 65 0 l 0 33 l 10 0 z " fill="var(--wt21-colors-black)" stroke="var(--wt21-colors-white)" stroke-width="2px"></path>
              <path d="M 271 198 l 75 0 l 0 10 l -65 0 l 0 33 l -10 0 z" fill="var(--wt21-colors-black)" stroke="var(--wt21-colors-white)" stroke-width="2px" />
              <path d="M 202 198 l 10 0 l 0 10 l -10 0 z" fill="black" />
            </svg>
          </div>
          <div class="flight-director flight-director-absolute" ref={this.crossPtrPitchRef}>
            <svg width="408" height="360px">
              {/* CROSS POINTER FLIGHT DIRECTOR PITCH */}
              <path d="M 207 200 l 125 0 c 3 0 3 6 0 6 l -250 0 c -3 0 -3 -6 0 -6 z" fill="var(--wt21-colors-magenta)" stroke="var(--wt21-colors-black)" stroke-width="1px" />
            </svg>
          </div>
          <div class="flight-director flight-director-absolute" ref={this.crossPtrBankRef}>
            <svg width="408" height="360px">
              {/* CROSS POINTER FLIGHT DIRECTOR BANK */}
              <path d="M 204 203 l 0 -125 c 0 -3 6 -3 6 0 l 0 250 c 0 3 -6 3 -6 0 l 0 -122 z" fill="var(--wt21-colors-magenta)" stroke="var(--wt21-colors-black)" stroke-width="1px" />
            </svg>
          </div>
          <div class="flight-director-absolute">
            <svg width="408" height="360px">
              {/* CROSS POINTER PLANE SYMBOL CENTER SQUARE */}
              <path d="M 202 198 l 10 0 l 0 10 l -10 0 z" fill="none" stroke="var(--wt21-colors-white)" stroke-width="2px" />
            </svg>
          </div>
        </div>
        <div class="minimums-flag hidden" ref={this.minimumsFlagRef}>MIN</div>
      </div>
    );
  }
}
