import { DisplayComponent, EventBus, FSComponent, InstrumentEvents, Subscription, VNode } from '@microsoft/msfs-sdk';

import { G1000FilePaths } from './G1000FilePaths';
import { G1000Version } from './G1000Version';

import './StartupLogo.css';

/**
 * Props on the StartupLogo component.
 */
interface StartupLogoProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An event fired when the screen is confirmed. */
  onConfirmation?: () => void;

  /** The prefix for H events to process. */
  eventPrefix: 'AS1000_PFD' | 'AS1000_MFD';
}

/**
 * A component that displays the Garmin startup logo.
 */
export class StartupLogo extends DisplayComponent<StartupLogoProps> {

  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly mainLogo = FSComponent.createRef<HTMLDivElement>();
  private readonly mfdScreen = FSComponent.createRef<HTMLDivElement>();

  private screenState: ScreenState | undefined;

  private hEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.hEventSub = this.props.bus.on('hEvent', this.handleHEvent, true);

    this.props.bus.getSubscriber<InstrumentEvents>().on('vc_screen_state').handle(state => {
      if (this.screenState === undefined) {
        if (state.current !== ScreenState.OFF) {
          this.el.instance.classList.add('hidden');
        }
      }

      this.screenState = state.current;

      switch (state.current) {
        case ScreenState.INIT:
          this.el.instance.classList.remove('hidden');
          this.mainLogo.instance.classList.remove('hidden');
          this.mfdScreen.instance.classList.add('hidden');
          break;
        case ScreenState.WAITING_VALIDATION:
          this.hEventSub!.resume();
          this.el.instance.classList.remove('hidden');
          this.mainLogo.instance.classList.add('hidden');
          this.mfdScreen.instance.classList.remove('hidden');
          break;
        default:
          this.el.instance.classList.add('hidden');
          break;
      }
    });


  }

  /**
   * Handles when an H event arrives to check for startup screen confirmation.
   * @param evt The event that arrived.
   */
  private handleHEvent = (evt: string): void => {
    if (evt === `${this.props.eventPrefix}_ENT_Push` || evt === `${this.props.eventPrefix}_SOFTKEYS_12` || evt === 'AS1000_CONTROL_PAD_ENT_Push') {
      this.props.onConfirmation && this.props.onConfirmation();
      this.hEventSub!.pause();
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.el} style='background-color: black; position: absolute; width: 100%; height: 100%; top: 0px; left: 0px; z-index: 9999'>
        <div class='startup-logo' ref={this.mainLogo}>
          <img src={`${G1000FilePaths.ASSETS_PATH}/garmin_logo_new.svg`} />
        </div>
        <div class='startup-confirm-screen' ref={this.mfdScreen}>
          <div class='startup-confirm-screen-left'>
            <img src={`${G1000FilePaths.ASSETS_PATH}/garmin_logo_new.svg`} />
          </div>
          <div class='startup-confirm-screen-right'>
            <h3>
              <svg width='24' height='24' viewBox='0 0 32 32'>
                <path d='M 14.1 1.2 A 2.2 2.2 180 0 1 17.9 1.2 L 31.8 29 A 2.1 2.1 0 0 1 29.8 32 L 2.2 32 A 2.1 2.1 0 0 1 0.2 29 Z' fill='steelblue' />
              </svg>
              G1000 NXi
            </h3>
            <div>
              <svg width='24' height='24' viewBox='0 0 16 16'>
                <path d='M 2 3 L 2 8 L 13 8' stroke='gray' stroke-width='1px' />
              </svg>
              {`System ${G1000Version.VERSION}`}
            </div>
            <h3>
              <svg width='24' height='24' viewBox='0 0 32 32'>
                <path d='M 14.1 1.2 A 2.2 2.2 180 0 1 17.9 1.2 L 31.8 29 A 2.1 2.1 0 0 1 29.8 32 L 2.2 32 A 2.1 2.1 0 0 1 0.2 29 Z' fill='steelblue' />
              </svg>
              Navigation Data
            </h3>
            <div>
              <svg width='24' height='24' viewBox='0 0 16 16'>
                <path d='M 2 3 L 2 8 L 13 8' stroke='gray' stroke-width='1px' />
              </svg>
              {SimVar.GetGameVarValue('FLIGHT_NAVDATA_DATE_RANGE', 'string')}
            </div>
            <div class='startup-confirmation'>
              Press ENT or rightmost softkey to continue
            </div>
          </div>
        </div>
      </div>
    );
  }
}
