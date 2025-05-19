import { ComponentProps, ConsumerSubject, EventBus, FSComponent, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Epic2CockpitEvents, GpwsControlEvents, TabContent } from '@microsoft/msfs-epic2-shared';

import { TscButton, TscButtonStyles } from '../Shared';

import './GpwsInhibits.css';

const LARGE_MENU_BUTTON_STYLE: TscButtonStyles = {
  height: '100px',
  width: '134px',
  fontSize: '20px',
  backgroundColor: 'var(--epic2-color-darker-grey)',
  color: 'var(--epic2-color-white)',
  border: '2px solid var(--epic2-color-light-grey)',
  margin: '0px 7px 0px 7px'
};

/** The Home Tab Content props. */
interface GpwsInhibitsContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}
/** The Home Tab Content. */
export class GpwsInhibitsContainer extends TabContent<GpwsInhibitsContainerProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly subscriber = this.props.bus.getSubscriber<Epic2CockpitEvents & GpwsControlEvents>();
  private readonly publisher = this.props.bus.getPublisher<GpwsControlEvents>();

  private readonly terrInhibitActive = ConsumerSubject.create(this.subscriber.on('terrain_inhibit_active'), false);
  private readonly gsInhibitActive = ConsumerSubject.create(this.subscriber.on('gs_inhibit_active'), false);
  private readonly flapOverrideActive = ConsumerSubject.create(this.subscriber.on('flap_override_active'), false);

  private subs: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs = [
      this.subscriber.on('tsc_keyboard_active_input_id').handle((id) => {
        this.rootRef.instance.classList.toggle('hidden', id !== undefined);
      }),
    ];
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="gpws-inhibit-container" ref={this.rootRef}>
      <div class="page-container" >
        <p class="title">Inhibits</p>
        <TscButton class={'gpws-inhibit-button'} label={'TERR INHIB'} variant='base' styles={LARGE_MENU_BUTTON_STYLE} onPressed={() => this.publisher.pub('terrain_inhibit_active', !this.terrInhibitActive.get(), true)}>
          <div class={{ 'gpws-inhibit-button-active': true, 'active': this.terrInhibitActive }}></div>
        </TscButton>
        <TscButton class={'gpws-inhibit-button'} label={'G/S INHIB'} variant='base' styles={LARGE_MENU_BUTTON_STYLE} onPressed={() => this.publisher.pub('gs_inhibit_active', !this.gsInhibitActive.get(), true)}>
          <div class={{ 'gpws-inhibit-button-active': true, 'active': this.gsInhibitActive }}></div>
        </TscButton>
        <TscButton class={'gpws-inhibit-button'} label={'FLAP OVRD'} variant='base' styles={LARGE_MENU_BUTTON_STYLE} onPressed={() => this.publisher.pub('flap_override_active', !this.flapOverrideActive.get(), true)}>
          <div class={{ 'gpws-inhibit-button-active': true, 'active': this.flapOverrideActive }}></div>
        </TscButton>
        {/* <TscButton class={'gpws-inhibit-button'} label={'RAAS INHIB'} variant='base' styles={LARGE_MENU_BUTTON_STYLE} onPressed={() => this.flapOverrideActive.set(!this.flapOverrideActive.get())}>
          <div class={{ 'gpws-inhibit-button-active': true, 'active': this.flapOverrideActive }}></div>
        </TscButton> */}
      </div>
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.map((sub) => sub.destroy());
  }
}
