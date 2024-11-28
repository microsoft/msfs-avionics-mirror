import {
  AnnunciationType, CasEvents, CasStateEvents, ClockEvents, ComponentProps, ConsumerSubject, ControlEvents,
  DisplayComponent, FSComponent, MappedSubject, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import {
  DisplayPaneControlEvents, DisplayPaneControlGtcIndex, DisplayPaneEvents, DisplayPaneIndex, DisplayPanesUserSettings,
  DisplayPaneUtils, G3000FilePaths
} from '@microsoft/msfs-wtg3000-common';

import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcControlMode, GtcService, GtcViewEntry } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcSidebar } from '../../GtcService/Sidebar';
import { ImgTouchButton } from '../TouchButton/ImgTouchButton';
import { TouchButton } from '../TouchButton/TouchButton';

import './ButtonBar.css';

/**
 * Component props for {@link ButtonBar}.
 */
export interface ButtonBarProps extends ComponentProps {
  /** The GtcService. */
  gtcService: GtcService;

  /**
   * Whether the button bar should include support for the CAS master caution and warning acknowledge buttons. If
   * `true`, then a master caution (CAUT) and/or master warning (WARN) acknowledge button will be displayed in place of
   * the MSG button whenever there are unacknowledged CAS caution and warning alerts, respectively.
   */
  supportCasAcknowledge: boolean;
}

/**
 * Possible states for the slot 2 button.
 */
type Slot2ButtonState = 'Home' | 'Init' | 'NextInitTask' | 'Invisible';

/**
 * Possible states for the slot 3 button.
 */
type Slot3ButtonState = 'Message' | 'CasCaution' | 'CasWarning' | 'Invisible';

/**
 * Possible states for the slot 4 button.
 */
type Slot4ButtonState = 'Full' | 'Split' | 'Half' | 'Invisible' | 'XPDR\nIDENT';

/** The ButtonBar component. */
export class ButtonBar extends DisplayComponent<ButtonBarProps> {
  private readonly publisher = this.props.gtcService.bus.getPublisher<CasEvents>();

  private readonly sidebarState = GtcSidebar.createSidebarState();

  private activeViewSidebarStateSubs = [] as Subscription[];

  private readonly slot2ButtonState = MappedSubject.create(
    ([activeControlMode, activeView, activeViewIsNotAHomePage, isInitEnabled, isInitAccepted, currentInitializationTask, nextInitializationTask]): Slot2ButtonState => {
      if (isInitEnabled && currentInitializationTask) {
        if (activeView.key === currentInitializationTask.gtcPageKey && nextInitializationTask) {
          return 'NextInitTask';
        } else {
          return 'Init';
        }
      } else if (activeViewIsNotAHomePage) {
        return 'Home';
      } else {
        if (activeControlMode === 'MFD' && isInitEnabled && !isInitAccepted) {
          return 'Init';
        } else {
          return 'Invisible';
        }
      }
    },
    this.props.gtcService.activeControlMode,
    this.props.gtcService.activeView,
    this.props.gtcService.activeViewIsNotAHomePage,
    this.props.gtcService.initializationDataProvider.isEnabled,
    this.props.gtcService.initializationDataProvider.isAccepted,
    this.props.gtcService.currentInitializationTask,
    this.props.gtcService.nextInitializationTask
  );
  private readonly slot3ButtonState = Subject.create<Slot3ButtonState>('Invisible');
  private readonly slot4ButtonState = Subject.create<Slot4ButtonState>('Invisible');

  private readonly pfdDisplayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(
    this.props.gtcService.bus,
    this.props.gtcService.pfdControlIndex === 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd
  );
  private readonly mfdLeftDisplayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.props.gtcService.bus, DisplayPaneIndex.LeftMfd);
  private readonly mfdRightDisplayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.props.gtcService.bus, DisplayPaneIndex.RightMfd);
  private readonly selectedPane = ConsumerSubject.create(null, -1);

  private readonly casMasterCautionActive = ConsumerSubject.create(null, false);
  private readonly casMasterWarningActive = ConsumerSubject.create(null, false);
  private readonly casMasterAlertState = MappedSubject.create(
    ([caution, warning]) => warning ? 'Warning' : caution ? 'Caution' : 'None',
    this.casMasterCautionActive,
    this.casMasterWarningActive
  );

  private isMessageButtonFlashing = false;

  private readonly slot3ButtonHighlight = Subject.create(false);
  private lastSlot3ButtonTransitionTime: number | undefined = undefined;

  /** @inheritDoc */
  public onAfterRender(): void {
    const sub = this.props.gtcService.bus.getSubscriber<ClockEvents & DisplayPaneEvents & CasStateEvents>();

    this.selectedPane.setConsumer(sub.on(
      this.props.gtcService.displayPaneControlIndex === DisplayPaneControlGtcIndex.LeftGtc
        ? 'left_gtc_selected_display_pane'
        : 'right_gtc_selected_display_pane'
    ));

    if (this.props.supportCasAcknowledge) {
      this.casMasterCautionActive.setConsumer(sub.on('cas_master_caution_active'));
      this.casMasterWarningActive.setConsumer(sub.on('cas_master_warning_active'));
    }

    this.props.gtcService.activeView.sub(this.onActiveViewChanged.bind(this), true);

    const updateSlot3ButtonState = this.updateSlot3ButtonState.bind(this);
    this.casMasterAlertState.sub(updateSlot3ButtonState);

    const updateSlot4ButtonState = this.updateSlot4ButtonState.bind(this);
    this.selectedPane.sub(updateSlot4ButtonState);
    this.props.gtcService.activeControlMode.sub(updateSlot4ButtonState);
    this.pfdDisplayPaneSettings.getSetting('displayPaneVisible').sub(updateSlot4ButtonState);
    this.mfdLeftDisplayPaneSettings.getSetting('displayPaneVisible').sub(updateSlot4ButtonState);
    this.mfdRightDisplayPaneSettings.getSetting('displayPaneVisible').sub(updateSlot4ButtonState);
    this.mfdLeftDisplayPaneSettings.getSetting('displayPaneHalfSizeOnly').sub(updateSlot4ButtonState);
    this.mfdRightDisplayPaneSettings.getSetting('displayPaneHalfSizeOnly').sub(updateSlot4ButtonState);

    this.updateSlot3ButtonState();
    this.updateSlot4ButtonState();

    sub.on('realTime').handle(this.update.bind(this));
  }

  /**
   * Responds to when the active view changes.
   * @param view The new active view.
   */
  private onActiveViewChanged(view: GtcViewEntry): void {
    for (const subscription of this.activeViewSidebarStateSubs) {
      subscription.destroy();
    }
    this.activeViewSidebarStateSubs = GtcSidebar.pipeObjectOfSubs(view.ref.sidebarState, this.sidebarState);
  }

  /**
   * Updates the state of this button bar's slot 3 button.
   */
  private updateSlot3ButtonState(): void {
    switch (this.casMasterAlertState.get()) {
      case 'Warning':
        this.slot3ButtonState.set('CasWarning');
        return;
      case 'Caution':
        this.slot3ButtonState.set('CasCaution');
        return;
    }

    this.slot3ButtonState.set('Invisible');
  }

  /**
   * Updates the state of this button bar's slot 4 button.
   */
  private updateSlot4ButtonState(): void {
    const controlMode = this.props.gtcService.activeControlMode.get();

    switch (controlMode) {
      case 'PFD': {
        const isPaneVisible = this.pfdDisplayPaneSettings.getSetting('displayPaneVisible').get();
        this.slot4ButtonState.set(isPaneVisible ? 'Full' : 'Split');
        break;
      }
      case 'MFD': {
        const leftMfdDisplayPaneIsVisible: boolean = this.mfdLeftDisplayPaneSettings.getSetting('displayPaneVisible').get();
        const rightMfdDisplayPaneIsVisible: boolean = this.mfdRightDisplayPaneSettings.getSetting('displayPaneVisible').get();
        const selectedPaneIndex = this.selectedPane.get();

        if (DisplayPaneUtils.isMfdDisplayPaneIndex(selectedPaneIndex)) {
          let isPaneHalfSizeMode: boolean;
          let isViewHalfOnly: boolean;

          if (selectedPaneIndex === DisplayPaneIndex.LeftMfd) {
            isPaneHalfSizeMode = rightMfdDisplayPaneIsVisible;
            isViewHalfOnly = this.mfdLeftDisplayPaneSettings.getSetting('displayPaneHalfSizeOnly').value;
          } else {
            isPaneHalfSizeMode = leftMfdDisplayPaneIsVisible;
            isViewHalfOnly = this.mfdRightDisplayPaneSettings.getSetting('displayPaneHalfSizeOnly').value;
          }

          this.slot4ButtonState.set(
            isPaneHalfSizeMode
              ? isViewHalfOnly ? 'Invisible' : 'Full'
              : 'Half'
          );
        } else if (selectedPaneIndex === -1) {
          this.slot4ButtonState.set(rightMfdDisplayPaneIsVisible !== leftMfdDisplayPaneIsVisible ? 'Half' : 'Invisible');
        } else {
          this.slot4ButtonState.set('Invisible');
        }
        break;
      }
      case 'NAV_COM':
        this.slot4ButtonState.set('XPDR\nIDENT');
        break;
    }
  }

  /**
   * Updates this button bar.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  private update(time: number): void {
    this.updateSlot3ButtonFlash(time);
  }

  /**
   * Updates the flashing animation of this button bar's slot 3 button.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  private updateSlot3ButtonFlash(time: number): void {
    const slot3ButtonState = this.slot3ButtonState.get();

    if (
      (slot3ButtonState === 'Message' && this.isMessageButtonFlashing)
      || slot3ButtonState === 'CasCaution'
      || slot3ButtonState === 'CasWarning'
    ) {
      if (this.lastSlot3ButtonTransitionTime === undefined) {
        this.slot3ButtonHighlight.set(true);
        this.lastSlot3ButtonTransitionTime = time;
      } else {
        if (time < this.lastSlot3ButtonTransitionTime) {
          this.lastSlot3ButtonTransitionTime = time;
        } else {
          const isHighlighted = this.slot3ButtonHighlight.get();
          const timeToTransition = isHighlighted ? 750 : 250;
          if (time - this.lastSlot3ButtonTransitionTime >= timeToTransition) {
            this.slot3ButtonHighlight.set(!isHighlighted);
            this.lastSlot3ButtonTransitionTime = time;
          }
        }
      }
    } else {
      this.slot3ButtonHighlight.set(false);
      this.lastSlot3ButtonTransitionTime = undefined;
    }
  }

  private onSlot4ButtonPressed = (): void => {
    const controlMode: GtcControlMode = this.props.gtcService.activeControlMode.get();
    switch (controlMode) {
      case 'PFD':
        this.props.gtcService.bus.getPublisher<DisplayPaneControlEvents>()
          .pub('toggle_pfd_split', this.props.gtcService.pfdControlIndex, true, false);
        break;
      case 'MFD':
        this.props.gtcService.bus.getPublisher<DisplayPaneControlEvents>()
          .pub('toggle_mfd_split', this.props.gtcService.displayPaneControlIndex, true, false);
        break;
      case 'NAV_COM':
        this.props.gtcService.bus.getPublisher<ControlEvents>()
          .pub('xpdr_send_ident_1', true, true, false);
        break;
    }
  };

  /** @inheritDoc */
  public render(): VNode {
    const anyArrowVisible = this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsUp', 'arrowsDown', 'arrowsDisabled'].includes(x));
    const normalArrowsVisible = MappedSubject.create(([useWaypointButtons, showArrows]) => {
      return !useWaypointButtons && showArrows;
    }, this.sidebarState.useWaypointArrowButtons, anyArrowVisible);
    const waypointArrowsVisible = MappedSubject.create(([useWaypointButtons, showArrows]) => {
      return useWaypointButtons && showArrows;
    }, this.sidebarState.useWaypointArrowButtons, anyArrowVisible);

    return (
      <div class='button-bar'>

        <ImgTouchButton
          label="Back"
          class="slot-1 high-res back-button"
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_back.png`}
          onPressed={(): any => this.props.gtcService.goBack()}
          isVisible={MappedSubject.create(([currentPage, slot1State, activeViewIsNotAHomePage]): boolean =>
            slot1State !== 'cancel' && currentPage !== null && activeViewIsNotAHomePage,
            this.props.gtcService.currentPage,
            this.sidebarState.slot1,
            this.props.gtcService.activeViewIsNotAHomePage,
          )}
        />
        <ImgTouchButton
          label="Cancel"
          class="slot-1 cancel-button"
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_cancel.png`}
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarCancelPressed)}
          isVisible={this.sidebarState.slot1.map(x => x === 'cancel')}
        />

        <ImgTouchButton
          label='Home'
          class='slot-2 high-res home-button'
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_home.png`}
          isVisible={this.slot2ButtonState.map(x => x === 'Home')}
          onPressed={() => { this.props.gtcService.goToHomePage(); }}
        />
        <ImgTouchButton
          label={this.slot2ButtonState.map(x => x === 'NextInitTask' ? 'Next' : 'INIT')}
          class='slot-2 init-button'
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_init.png`}
          isVisible={this.slot2ButtonState.map(x => x === 'Init' || x === 'NextInitTask')}
          onPressed={() => {
            if (this.slot2ButtonState.get() === 'NextInitTask') {
              const task = this.props.gtcService.nextInitializationTask.get();
              if (task) {
                this.props.gtcService.loadInitializationTask(task.uid);
              }
            } else {
              if (!this.props.gtcService.goBackToInitializationPage()) {
                this.props.gtcService.changePageTo(GtcViewKeys.Initialization);
              }
            }
          }}
        />

        <ImgTouchButton
          label='MSG'
          class='slot-3 high-res message-button'
          isVisible={this.slot3ButtonState.map(x => x === 'Message')}
          isHighlighted={this.slot3ButtonHighlight}
        >
          <div class='touch-button-img-img'>
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_ntfy_sys.png`}
              class='message-button-icon'
            />
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_ntfy_sys_blink.png`}
              class='message-button-icon message-button-icon-highlight'
            />
          </div>
        </ImgTouchButton>
        <ImgTouchButton
          label='CAUT'
          class='slot-3 high-res cas-button cas-button-caution'
          isVisible={this.slot3ButtonState.map(x => x === 'CasCaution')}
          isHighlighted={this.slot3ButtonHighlight}
          onPressed={() => { this.publisher.pub('cas_master_acknowledge', AnnunciationType.Caution, true, false); }}
        >
          <div class='touch-button-img-img'>
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_ntfy_cas_caut_blink.png`}
              class='cas-button-icon'
            />
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_ntfy_cas_caut.png`}
              class='cas-button-icon cas-button-icon-highlight'
            />
          </div>
        </ImgTouchButton>
        <ImgTouchButton
          label='WARN'
          class='slot-3 high-res cas-button cas-button-warning'
          isVisible={this.slot3ButtonState.map(x => x === 'CasWarning')}
          isHighlighted={this.slot3ButtonHighlight}
          onPressed={() => { this.publisher.pub('cas_master_acknowledge', AnnunciationType.Warning, true, false); }}
        >
          <div class='touch-button-img-img'>
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_ntfy_cas_warn_blink.png`}
              class='cas-button-icon'
            />
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_ntfy_cas_warn.png`}
              class='cas-button-icon cas-button-icon-highlight'
            />
          </div>
        </ImgTouchButton>

        <TouchButton
          label={'XPDR\nIDENT'}
          class="slot-4 high-res"
          onPressed={this.onSlot4ButtonPressed}
          isVisible={this.slot4ButtonState.map(x => x === 'XPDR\nIDENT')}
        />
        <ImgTouchButton
          label="Full"
          class="slot-4 high-res full-button"
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_full.png`}
          onPressed={this.onSlot4ButtonPressed}
          isVisible={this.slot4ButtonState.map(x => x === 'Full')}
        />
        <ImgTouchButton
          label={this.slot4ButtonState}
          class="slot-4 high-res half-button"
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_half.png`}
          onPressed={this.onSlot4ButtonPressed}
          isVisible={this.slot4ButtonState.map(x => x === 'Half' || x === 'Split')}
        />

        <ImgTouchButton
          class="up-button slot-5"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarUpPressed)}
          isVisible={normalArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsUp'].includes(x))}
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_up.png`}
        >
          <div class="label">Up</div>
          {this.props.gtcService.orientation === 'horizontal' && <div class="bottom-line" />}
        </ImgTouchButton>
        <ImgTouchButton
          class="down-button slot-5"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarDownPressed)}
          isVisible={normalArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsDown'].includes(x))}
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_down.png`}
        >
          <div class="label">Down</div>
        </ImgTouchButton>
        <ImgTouchButton
          class="up-button slot-5 waypoint-arrow-button"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarUpPressed)}
          isVisible={waypointArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsUp'].includes(x))}
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_prev_wpt.png`}
        >
          <div class="label">Prev</div>
          {this.props.gtcService.orientation === 'horizontal' && <div class="bottom-line" />}
        </ImgTouchButton>
        <ImgTouchButton
          class="down-button slot-5 waypoint-arrow-button"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarDownPressed)}
          isVisible={waypointArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsDown'].includes(x))}
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_buttonbar_next_wpt.png`}
        >
          <div class="label">Next</div>
        </ImgTouchButton>
        <ImgTouchButton
          label={this.sidebarState.enterButtonLabel}
          class="enter-button slot-5 touch-button-special"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarEnterPressed)}
          isVisible={this.sidebarState.slot5.map(x => x === 'enterEnabled' || x === 'enterDisabled')}
          isEnabled={this.sidebarState.slot5.map(x => x === 'enterEnabled')}
          imgSrc={
            this.props.gtcService.isHorizontal
              ? `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_grad_enter.png`
              : `${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_grad_enter_qwerty.png`
          }
        />

      </div>
    );
  }
}
