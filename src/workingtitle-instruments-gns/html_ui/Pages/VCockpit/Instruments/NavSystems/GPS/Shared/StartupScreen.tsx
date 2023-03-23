import { ComponentProps, DisplayComponent, EventBus, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { PowerEvents, PowerState } from './Instruments/Power';
import { InteractionEvent } from './UI/InteractionEvent';
import { GNSType } from './UITypes';

import './StartupScreen.css';

/**
 * Props on the StartupScreen component.
 */
interface StartupScreenProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The type of GNS, 430 or 530 */
  gnsType: GNSType;

  /**
   * A callback called when the boot screen is confirmed.
   * @param bypassTest Whether or not to bypass the self-test.
   */
  onConfirmed(bypassTest: boolean): void
}

/**
 * A component that display the GNS startup boot screen.
 */
export class StartupScreen extends DisplayComponent<StartupScreenProps> {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly logoEl = FSComponent.createRef<HTMLImageElement>();
  private readonly okButtonEl = FSComponent.createRef<HTMLElement>();
  private readonly screenRefs: NodeReference<HTMLElement>[] = [
    FSComponent.createRef<HTMLElement>(), FSComponent.createRef<HTMLElement>(), FSComponent.createRef<HTMLElement>(),
    FSComponent.createRef<HTMLElement>(), FSComponent.createRef<HTMLElement>(), FSComponent.createRef<HTMLElement>()
  ];

  private bootComplete = false;
  private phaseTimeout?: number;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.resetState();

    this.props.bus.getSubscriber<PowerEvents>().on('instrument_powered').handle(state => {
      switch (state) {
        case PowerState.Booting:
          this.setVisible(true);
          this.runSequence();
          break;
        case PowerState.SelfTest:
        case PowerState.On:
        case PowerState.OnSkipInit:
          this.setVisible(false);
          this.bootComplete = true;
          break;
        default:
          this.setVisible(false);
          this.resetState();
      }
    });
  }

  /**
   * Runs the boot screen sequence.
   */
  private runSequence(): void {
    this.phaseTimeout = window.setTimeout(() => {
      this.setVisible(true, this.screenRefs[0]);
      this.phaseTimeout = window.setTimeout(() => {
        this.setVisible(false, this.screenRefs[0]);
        this.setVisible(true, this.screenRefs[1]);
        this.phaseTimeout = window.setTimeout(() => {
          this.setVisible(false, this.screenRefs[1]);
          this.setVisible(true, this.screenRefs[2]);
          this.phaseTimeout = window.setTimeout(() => {
            this.setVisible(false, this.screenRefs[2]);
            this.setVisible(true, this.screenRefs[3]);
            this.phaseTimeout = window.setTimeout(() => {
              this.setVisible(false, this.screenRefs[3]);
              this.setVisible(true, this.screenRefs[4]);
              this.phaseTimeout = window.setTimeout(() => {
                this.setVisible(false, this.logoEl);
                this.setVisible(false, this.screenRefs[4]);
                this.setVisible(true, this.screenRefs[5]);
              }, 5000);
            }, 5000);
          }, 5000);
        }, 5000);
      }, 10000);
    }, 5000);
  }

  /**
   * Resets the state of the startup screen.
   */
  private resetState(): void {
    this.screenRefs.forEach((v) => this.setVisible(false, v));
    this.setVisible(true, this.logoEl);
    this.bootComplete = false;

    clearTimeout(this.phaseTimeout);
  }

  /**
   * Checks if the boot sequence has completed.
   * @returns True if complete, false otherwise.
   */
  public isBooted(): boolean {
    return this.bootComplete;
  }

  /**
   * Sets the screen to be visible or not.
   * @param isVisible Whether or not the screen is visible.
   * @param element The element to set visible.
   */
  private setVisible(isVisible: boolean, element?: NodeReference<HTMLElement>): void {
    if (element === undefined) {
      element = this.el;
    }

    if (isVisible) {
      element.instance.classList.remove('hide-element');
    } else {
      element.instance.classList.add('hide-element');
    }
  }

  /**
   * Handles when an interaction event is received by the main screen.
   * @param evt The event that was received.
   */
  public onInteractionEvent(evt: InteractionEvent): void {
    if (!this.screenRefs[5].instance.classList.contains('hide-element')) {
      switch (evt) {
        case InteractionEvent.ENT:
        case InteractionEvent.RightKnobPush:
          this.bootComplete = true;
          this.props.bus.getPublisher<PowerEvents>().pub('instrument_powered', PowerState.SelfTest, false, true);
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`startup-screen ${this.props.gnsType}`} ref={this.el}>
        <img class='startup-screen-logo' src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/garmin_logo_new.svg' ref={this.logoEl} />
        <div class='startup-screen-cptext' ref={this.screenRefs[0]}>
          GNS {`${this.props.gnsType === 'wt430' ? '430W' : '530W'}`}<br />
          Copyright 1998-2017<br />
          Garmin Ltd. or its subs<br />
        </div>
        <div class='startup-screen-cptext' ref={this.screenRefs[1]}>
          Main SW Version 5.40 - WT 1.1.2<br />
          GPS SW Version 5.0<br />
        </div>
        <div class='startup-screen-cptext' ref={this.screenRefs[2]}>
          Land and Terrain Databases<br />
          Via Microsoft Flight Simulator<br />
        </div>
        <div class='startup-screen-cptext' ref={this.screenRefs[3]}>
          Aviation Database<br />
          Via Microsoft Flight Simulator<br />
        </div>
        <div class='startup-screen-cptext' ref={this.screenRefs[4]}>
          All map and terrain data provided<br />
          is only to be used as a general<br />
          reference to your surrounding and<br />
          as an aid to situational awareness
        </div>
        <div class='startup-screen-confirm' ref={this.screenRefs[5]}>
          <div>
            <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/basemap_icon.png' />
            Basemap Land Database via MSFS
          </div>
          <div>
            <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/terrain_db_icon.png' />
            Terrain Database via MSFS
          </div>
          <div>
            <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/apt_terrain_db_icon.png' />
            Airport Terrain Database via MSFS
          </div>
          <div>
            <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/aviation_db_icon.png' />
            Aviation Database via MSFS
          </div>
          <div class='startup-ok-button selected-white'>
            OK?
          </div>
        </div>
      </div>
    );
  }
}