import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, HEvent, Subject, Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2ApPanelEvents, Epic2BezelButtonEvents, FmsMessageControlEvents, FmsMessageEvents, MapDisplayMode, MfdAliasedUserSettingTypes, ModalKey, ModalService,
  TouchButton, TouchButtonCheckbox
} from '@microsoft/msfs-epic2-shared';

import { NearestFunctionModal } from '../NearestFunctionModal';
import { PlanMapEvents } from '../PlanFormatController';

import './MfdMapSideButtons.css';

/** Props for MfdMapSideButtons. */
interface MfdMapSideButtonProps extends ComponentProps {
  /** The event bus */
  readonly bus: EventBus,
  /** The settings. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The modal service */
  readonly modalService: ModalService
}

/** The Map Side Buttons component. */
export class MfdMapSideButtons extends DisplayComponent<MfdMapSideButtonProps> {
  private readonly mapModeButtonLabel = this.props.settings.getSetting('mapDisplayMode').map((format): string => {
    switch (format) {
      case MapDisplayMode.NorthUp: return 'North';
      case MapDisplayMode.HeadingUp: return 'Hdg';
      default: return 'Trk';
    }
  });

  private readonly isTrackSelected = ConsumerSubject.create(this.props.bus.getSubscriber<Epic2ApPanelEvents>().on('epic2_ap_hdg_trk_selector'), false);

  private readonly fmsMessageCount = ConsumerSubject.create(this.props.bus.getSubscriber<FmsMessageEvents>().on('fms_message_count'), 0);

  private hEventSubscription: Subscription | undefined;
  private readonly hEventSubscriber = this.props.bus.getSubscriber<HEvent>();
  private readonly lskNameStrings: Epic2BezelButtonEvents[] = [
    Epic2BezelButtonEvents.LSK_R1,
    Epic2BezelButtonEvents.LSK_R2,
    Epic2BezelButtonEvents.LSK_R3,
    Epic2BezelButtonEvents.LSK_R4,
    Epic2BezelButtonEvents.LSK_R5,
    Epic2BezelButtonEvents.LSK_R6,
    Epic2BezelButtonEvents.LSK_R7,
  ];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.hEventSubscription = this.hEventSubscriber.on('hEvent').handle(this.handleLskHEvent.bind(this));

    this.isTrackSelected.sub((trkSelected) => {
      const mapMode = this.props.settings.getSetting('mapDisplayMode');
      if (mapMode.get() !== MapDisplayMode.NorthUp) {
        mapMode.set(trkSelected ? MapDisplayMode.TrackUp : MapDisplayMode.HeadingUp);
      }
    });
  }

  /**
   * Connects LSK HEvents to their corresponding MFD side soft keys.
   * @param event The HEvent string.
   */
  private handleLskHEvent(event: string): void {
    switch (event) {
      case this.lskNameStrings[0]:
        this.onMapModeButtonPressed();
        break;
      case this.lskNameStrings[1]:
        this.onCenterByAcButtonPressed();
        break;
      case this.lskNameStrings[2]:
        this.onCenterToWptButtonPressed();
        break;
      case this.lskNameStrings[3]:
        this.onSkipWptButtonPressed();
        break;
      case this.lskNameStrings[4]:
        this.onRecallWptButtonPressed();
        break;
      case this.lskNameStrings[5]:
        this.onMsgClearButtonPressed();
        break;
      case this.lskNameStrings[6]:
        this.onNrstButtonPressed();
        break;
      default:
        break;
    }
  }

  /** Callback when Map Mode button is pressed. */
  private onMapModeButtonPressed(): void {
    const mapFormat = this.props.settings.getSetting('mapDisplayMode');
    if (mapFormat.get() === MapDisplayMode.NorthUp) {
      mapFormat.set(this.isTrackSelected.get() ? MapDisplayMode.TrackUp : MapDisplayMode.HeadingUp);
    } else {
      mapFormat.set(MapDisplayMode.NorthUp);
    }
  }

  /** Callback when Center By A/C button is pressed. */
  private onCenterByAcButtonPressed(): void {
    const mapFormat = this.props.settings.getSetting('mapDisplayMode');
    mapFormat.set(MapDisplayMode.NorthUp);
    this.props.bus.getPublisher<PlanMapEvents>().pub('plan_map_center_ac', undefined, false, false);
  }

  /** Callback when Center To Waypoint button is pressed. */
  private onCenterToWptButtonPressed(): void {
    this.props.bus.getPublisher<PlanMapEvents>().pub('plan_map_to', undefined, false, false);
  }

  /** Callback when Skip Waypoint button is pressed. */
  private onSkipWptButtonPressed(): void {
    this.props.bus.getPublisher<PlanMapEvents>().pub('plan_map_next', undefined, false, false);
  }

  /** Callback when Recall Waypoint button is pressed. */
  private onRecallWptButtonPressed(): void {
    this.props.bus.getPublisher<PlanMapEvents>().pub('plan_map_prev', undefined, false, false);
    const mapFormat = this.props.settings.getSetting('mapDisplayMode');
    mapFormat.set(MapDisplayMode.NorthUp);
  }

  /** Callback when Msg Clear button is pressed. */
  private onMsgClearButtonPressed(): void {
    if (this.fmsMessageCount.map(count => count > 0)) {
      this.props.bus.getPublisher<FmsMessageControlEvents>().pub('clear_message', undefined);
    }
  }

  /** Callback when Nearest Waypoint button is pressed. */
  private onNrstButtonPressed(): void {
    this.props.modalService.open<NearestFunctionModal>(ModalKey.NearestAirports);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="mfd-map-side-buttons">
        <div class="mdf-map-side-button-upper">
          <TouchButton
            label={
              <div>
                <div class="touch-button-label-boxed">{this.mapModeButtonLabel}</div>
                <div>Up</div>
              </div>
            }
            variant="base"
            onPressed={() => this.onMapModeButtonPressed()}
          />
          <TouchButton
            label="Center<br/>A/C"
            variant="base"
            onPressed={() => this.onCenterByAcButtonPressed()}
          />
          <TouchButton
            label="Center<br/>TO Wpt"
            variant="base"
            onPressed={() => this.onCenterToWptButtonPressed()}
          />
          <TouchButton
            label="Skip<br/>Wpt"
            variant="base"
            onPressed={() => this.onSkipWptButtonPressed()}
          />
          <TouchButton
            label="Recall<br/>Wpt"
            variant="base"
            onPressed={() => this.onRecallWptButtonPressed()}
          />
          <TouchButton
            label="Msg<br/>Clear"
            variant="base"
            onPressed={() => this.onMsgClearButtonPressed()}
            isEnabled={this.fmsMessageCount.map(count => count > 0)}
          />
        </div>
        <TouchButton label="Nrst" variant="base" onPressed={() => this.onNrstButtonPressed()} />
        <TouchButton label="Charts" variant="base" />
        <TouchButtonCheckbox label="VSD" class="mfd-side-button-vsd" isChecked={Subject.create<boolean>(false)} isEnabled={false} variant="base" />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.hEventSubscription?.destroy();
    super.destroy();
  }
}
