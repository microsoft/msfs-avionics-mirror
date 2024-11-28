import { ComponentProps, ConsumerSubject, EventBus, FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Epic2CockpitEvents, GpwsEvents, Tab, TabbedContentContainer, TabContent, TouchButton } from '@microsoft/msfs-epic2-shared';

import { TscButton, TscButtonStyles } from '../Shared';

import './TawsWxLightning.css';

/** Type for the tabs contained within this page */
type ContainerTabs = 'wx' | 'taws' | 'lx'

const LARGE_MENU_BUTTON_STYLE: TscButtonStyles = {
  height: '120px',
  width: '154px',
  fontSize: '22px',
  backgroundColor: 'var(--epic2-color-darker-grey)',
  color: 'var(--epic2-color-white)',
  border: '2px solid var(--epic2-color-light-grey)',
  margin: '0px 0px 23px 0px'
};

/** The Home Tab Content props. */
interface TawsWxLightningContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}
/** The Home Tab Content. */
export class TawsWxLightningContainer extends TabContent<TawsWxLightningContainerProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly tabContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly subscriber = this.props.bus.getSubscriber<Epic2CockpitEvents>();
  private readonly publisher = this.props.bus.getPublisher<Epic2CockpitEvents>();

  private subs: Subscription[] = [];

  private readonly tabs: Readonly<Record<ContainerTabs, Tab>> = {
    'wx': {
      renderLabel: () => 'WX',
      renderContent: () => <WxContainer bus={this.props.bus} />,
    },
    'taws': {
      renderLabel: () => 'TAWS',
      renderContent: () => <TawsContainer bus={this.props.bus} />,
    },
    'lx': {
      renderLabel: () => 'LX',
      renderContent: () => <LxContainer bus={this.props.bus} />,
    },
  };
  private readonly activeTab = Subject.create<Tab>(this.tabs.wx);

  /** @inheritdoc */
  public onAfterRender(): void {
    for (const tabIndex in this.tabs) {
      const tab = this.tabs[tabIndex as ContainerTabs];
      FSComponent.render(<TouchButton
        variant='base'
        label={tab.renderLabel()}
        onPressed={() => this.activeTab.set(tab)}
        isActive={this.activeTab.map((x) => x === tab)}
      />, this.tabContainerRef.instance);
    }

    this.subs = [
      this.subscriber.on('tsc_keyboard_active_input_id').handle((id) => {
        this.rootRef.instance.classList.toggle('hidden', id !== undefined);
      }),
    ];
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="taws-wx-lightning-container" ref={this.rootRef}>
      <div class="tab-container" ref={this.tabContainerRef}>
      </div>
      <TabbedContentContainer
        bus={this.props.bus}
        tabs={Object.values(this.tabs)}
        activeTab={this.activeTab}
        className="tsc-tabbed-content-container"
      />
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.map((sub) => sub.destroy());
  }
}

/** Weather Container */
class WxContainer extends TabContent {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>WX</div>
    );
  }
}

/** Taws Container */
class TawsContainer extends TabContent {
  private readonly steepApproachActive = ConsumerSubject.create(this.props.bus.getSubscriber<GpwsEvents>().on('gpws_steep_approach_mode'), false);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <TscButton class={'taws-steep-appr'} label={'Steep<br />Approach'} variant='base' styles={LARGE_MENU_BUTTON_STYLE}
          onPressed={() => this.props.bus.getPublisher<GpwsEvents>().pub('gpws_steep_approach_mode', !this.steepApproachActive.get(), true)}>
          <div class={{ 'taws-button-active': true, 'active': this.steepApproachActive }}></div>
        </TscButton>
      </div>
    );
  }
}

/** Lightning Container */
class LxContainer extends TabContent {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>LX</div>
    );
  }
}
