import { AdcEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { CcpControlEvents } from '../../CCP/CcpControlEvents';
import { EisInstrument } from '../EngineIndication/EisData';
import { Systems1 } from './Systems1';
import { Systems2 } from './Systems2';

import './SystemsOverlayContainer.css';

/** The properties for the SystemsOverlayContainer component. */
interface SystemsOverlayContainerProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  bus: EventBus;
  /** The engine data instrument */
  eis: EisInstrument;
}

/** The SystemsOverlayContainer component. */
export class SystemsOverlayContainer extends DisplayComponent<SystemsOverlayContainerProps> {
  private readonly systemsOverlayRef = FSComponent.createRef<HTMLDivElement>();
  private readonly systems1Ref = FSComponent.createRef<Systems1>();
  private readonly systems2Ref = FSComponent.createRef<Systems2>();
  private readonly title = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<CcpControlEvents>().on('ccp_sys_state').whenChanged().handle(state => {
      this.systemsOverlayRef.instance.classList.toggle('hidden', state === 'off');
      this.systems1Ref.instance.setVisibility(state === '1');
      this.systems2Ref.instance.setVisibility(state === '2');
      state !== 'off' && this.title.set(`SYSTEMS ${state}/2`);
    });
    this.props.bus.getSubscriber<AdcEvents>().on('on_ground').whenChanged().handle((v: boolean) => {
      this.systems2Ref.instance.updateOnGround(v);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="systems-overlay-container hidden" ref={this.systemsOverlayRef}>
        <div class="systems-overlay-title">{this.title}</div>
        <Systems1 eis={this.props.eis} ref={this.systems1Ref} />
        <Systems2 eis={this.props.eis} ref={this.systems2Ref} />
      </div>
    );
  }
}