import { ComponentProps, ConsumerSubject, ControlEvents, DisplayComponent, FSComponent, MappedSubject, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import {
  DisplayPaneControlEvents, DisplayPaneControlGtcIndex, DisplayPaneEvents, DisplayPaneIndex, DisplayPanesUserSettings, DisplayPaneUtils
} from '@microsoft/msfs-wtg3000-common';

import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcControlMode, GtcService } from '../../GtcService/GtcService';
import { GtcSidebar } from '../../GtcService/Sidebar';
import { ImgTouchButton } from '../TouchButton/ImgTouchButton';
import { TouchButton } from '../TouchButton/TouchButton';

import './ButtonBar.css';

/** The properties for the ButtonBar component. */
interface ButtonBarProps extends ComponentProps {
  /** The GtcService. */
  gtcService: GtcService;
}

/** Possible states for the Full/Half/Split button. */
type Slot4ButtonState = 'Full' | 'Split' | 'Half' | 'Invisible' | 'XPDR\nIDENT';

/** The ButtonBar component. */
export class ButtonBar extends DisplayComponent<ButtonBarProps> {
  private readonly sidebarState = GtcSidebar.createSidebarState();
  private subs = [] as Subscription[];
  private readonly slot4ButtonState = Subject.create<Slot4ButtonState>('Invisible');
  private readonly pfdDisplayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(
    this.props.gtcService.bus,
    this.props.gtcService.pfdControlIndex === 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd
  );
  private readonly mfdLeftDisplayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.props.gtcService.bus, DisplayPaneIndex.LeftMfd);
  private readonly mfdRightDisplayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.props.gtcService.bus, DisplayPaneIndex.RightMfd);
  private readonly selectedPane = ConsumerSubject.create(
    this.props.gtcService.displayPaneControlIndex === DisplayPaneControlGtcIndex.LeftGtc
      ? this.props.gtcService.bus.getSubscriber<DisplayPaneEvents>().on('left_gtc_selected_display_pane')
      : this.props.gtcService.bus.getSubscriber<DisplayPaneEvents>().on('right_gtc_selected_display_pane'),
    -1
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    // Handles syncing the button bar state with the active gtc view
    this.props.gtcService.activeView.sub(view => {
      this.subs.forEach(sub => sub?.destroy());
      this.subs = GtcSidebar.pipeObjectOfSubs(view.ref.sidebarState, this.sidebarState);
    }, true);

    this.updateDisplayModeButtonState();

    this.selectedPane.sub(this.updateDisplayModeButtonState);
    this.props.gtcService.activeControlMode.sub(this.updateDisplayModeButtonState);
    this.pfdDisplayPaneSettings.getSetting('displayPaneVisible').sub(this.updateDisplayModeButtonState);
    this.mfdLeftDisplayPaneSettings.getSetting('displayPaneVisible').sub(this.updateDisplayModeButtonState);
    this.mfdRightDisplayPaneSettings.getSetting('displayPaneVisible').sub(this.updateDisplayModeButtonState);
    this.mfdLeftDisplayPaneSettings.getSetting('displayPaneHalfSizeOnly').sub(this.updateDisplayModeButtonState);
    this.mfdRightDisplayPaneSettings.getSetting('displayPaneHalfSizeOnly').sub(this.updateDisplayModeButtonState);
  }

  private readonly updateDisplayModeButtonState = (): void => {
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
  };

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

  /** @inheritdoc */
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
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_back.png"
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
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_cancel.png"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarCancelPressed)}
          isVisible={this.sidebarState.slot1.map(x => x === 'cancel')}
        />
        <ImgTouchButton
          label="Home"
          class="slot-2 high-res home-button"
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_home.png"
          isVisible={this.props.gtcService.activeViewIsNotAHomePage}
          onPressed={() => this.props.gtcService.goToHomePage()}
        />
        <ImgTouchButton
          label="MSG"
          class="slot-3 high-res message-button"
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_ntfy_sys.png"
          onPressed={() => { }}
          isEnabled={false}
        />
        <TouchButton
          label={'XPDR\nIDENT'}
          class="slot-4 high-res"
          onPressed={this.onSlot4ButtonPressed}
          isVisible={this.slot4ButtonState.map(x => x === 'XPDR\nIDENT')}
        />
        <ImgTouchButton
          label="Full"
          class="slot-4 high-res full-button"
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_full.png"
          onPressed={this.onSlot4ButtonPressed}
          isVisible={this.slot4ButtonState.map(x => x === 'Full')}
        />
        <ImgTouchButton
          label={this.slot4ButtonState}
          class="slot-4 high-res half-button"
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_half.png"
          onPressed={this.onSlot4ButtonPressed}
          isVisible={this.slot4ButtonState.map(x => x === 'Half' || x === 'Split')}
        />
        <ImgTouchButton
          class="up-button slot-5"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarUpPressed)}
          isVisible={normalArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsUp'].includes(x))}
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_up.png"
        >
          <div class="label">Up</div>
          {this.props.gtcService.orientation === 'horizontal' && <div class="bottom-line" />}
        </ImgTouchButton>
        <ImgTouchButton
          class="down-button slot-5"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarDownPressed)}
          isVisible={normalArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsDown'].includes(x))}
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_down.png"
        >
          <div class="label">Down</div>
        </ImgTouchButton>
        <ImgTouchButton
          class="up-button slot-5 waypoint-arrow-button"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarUpPressed)}
          isVisible={waypointArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsUp'].includes(x))}
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_prev_wpt.png"
        >
          <div class="label">Prev</div>
          {this.props.gtcService.orientation === 'horizontal' && <div class="bottom-line" />}
        </ImgTouchButton>
        <ImgTouchButton
          class="down-button slot-5 waypoint-arrow-button"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarDownPressed)}
          isVisible={waypointArrowsVisible}
          isEnabled={this.sidebarState.slot5.map(x => x === null ? false : ['arrowsBoth', 'arrowsDown'].includes(x))}
          imgSrc="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_buttonbar_next_wpt.png"
        >
          <div class="label">Next</div>
        </ImgTouchButton>
        <ImgTouchButton
          label={this.sidebarState.enterButtonLabel}
          class="enter-button slot-5 touch-button-special"
          onPressed={() => this.props.gtcService.onInteractionEvent(GtcInteractionEvent.ButtonBarEnterPressed)}
          isVisible={this.sidebarState.slot5.map(x => x === 'enterEnabled' || x === 'enterDisabled')}
          isEnabled={this.sidebarState.slot5.map(x => x === 'enterEnabled')}
          imgSrc={this.props.gtcService.isHorizontal
            ? 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_grad_enter.png'
            : 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_grad_enter_qwerty.png'}
        />
      </div>
    );
  }
}