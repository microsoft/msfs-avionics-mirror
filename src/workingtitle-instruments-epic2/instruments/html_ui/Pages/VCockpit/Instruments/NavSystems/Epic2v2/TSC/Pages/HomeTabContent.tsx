import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Epic2CockpitEvents } from '@microsoft/msfs-epic2-shared';

import { TscButton, TscButtonStyles } from '../Shared';
import { TSC_ICONS } from '../Shared/Icons';
import { TscService } from '../TscService';

import './HomeTabContent.css';

const TSC_LARGE_MENU_BUTTON_STYLE: TscButtonStyles = {
  height: '120px',
  width: '154px',
  fontSize: '22px',
  backgroundColor: 'var(--epic2-color-darker-grey)',
  color: 'var(--epic2-color-white)',
  border: '2px solid var(--epic2-color-light-grey)',
  margin: '0px 14px 33px 0px'
};

/** The Home Tab Content props. */
interface HomeTabContentProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The TSC service */
  tscService: TscService
}
/** The Home Tab Content. */
export class HomeTabContent extends DisplayComponent<HomeTabContentProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly subscriber = this.props.bus.getSubscriber<Epic2CockpitEvents>();
  private readonly publisher = this.props.bus.getPublisher<Epic2CockpitEvents>();

  private subs: Subscription[] = [];

  /** Home Button Info */
  private homeButtonInfo = [
    { label: 'Direct-To', icon: TSC_ICONS.directTo, isDisabled: false },
    { label: 'Inhibits', icon: TSC_ICONS.inhibits, isDisabled: true },
    { label: 'MFD Format', icon: TSC_ICONS.mfdFormat, isDisabled: true },
    { label: 'Show Info', icon: TSC_ICONS.showInfo, isDisabled: true },
    { label: 'Timers', icon: TSC_ICONS.timers, isDisabled: true },
    { label: 'Settings', name: 'settings', isDisabled: true },
    { label: 'WX LX TAWS', name: 'wxLxTaws', isDisabled: false },
    { label: 'Datalink', icon: TSC_ICONS.dataLink, isDisabled: true },
    { label: 'Checklist', icon: TSC_ICONS.checklist, isDisabled: true }
  ];


  /**
   * Function called when any home tab button is called
   * @param buttonLabel the label of the button pressed
   */
  private onButtonPress(buttonLabel: string): void {
    switch (buttonLabel) {
      case 'Direct-To':
        this.publisher.pub('epic2_mfd_direct_to_entry_shown', undefined, true);
        break;
      case 'WX LX TAWS':
        this.props.tscService.activeTab.set(this.props.tscService.tabs.tawsPage);
        break;
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs = [
      this.subscriber.on('tsc_keyboard_active_input_id').handle((id) => {
        this.rootRef.instance.classList.toggle('hidden', id !== undefined);
      }),
    ];
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="home-container" ref={this.rootRef}>
      <div class="home-buttons">
        {this.homeButtonInfo.map((buttonInfo) => {
          return <TscButton class={'home-button'} variant='base' label={buttonInfo.label} onPressed={() => this.onButtonPress(buttonInfo.label)} styles={TSC_LARGE_MENU_BUTTON_STYLE} isEnabled={!buttonInfo.isDisabled}>
            <div class='home-button-icon'>
              {buttonInfo.icon ? buttonInfo.icon : <img src={`/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Images/${buttonInfo.name}.png`} alt="" />}
            </div>
          </TscButton>;
        })}
      </div>
      {/* Temporary Dark Grey Masks that can be removed one-by-one as functionality is implemented */}
      <div class='temp-dark-grey-mask temp-dark-grey-mask-2'></div>
      <div class='temp-dark-grey-mask temp-dark-grey-mask-3'></div>
      <div class='temp-dark-grey-mask temp-dark-grey-mask-4'></div>
      <div class='temp-dark-grey-mask temp-dark-grey-mask-5'></div>
      <div class='temp-dark-grey-mask temp-dark-grey-mask-6'></div>
      <div class='temp-dark-grey-mask temp-dark-grey-mask-8'></div>
      <div class='temp-dark-grey-mask temp-dark-grey-mask-9'></div>
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.map((sub) => sub.destroy());
  }
}
