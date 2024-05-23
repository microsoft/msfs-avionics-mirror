import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { GnsCdiMode } from '../Instruments/CDINavSource';


import './SelectedCDIDisplaySource.css';

/**
 * Props on the SelectedCDIDisplaySource component.
 */
interface SelectedCDIDisplaySourceProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;

  /** Subject containing the current instrulment-level CDI source */
  gnsCdiMode: Subscribable<GnsCdiMode>;
}

/**
 * A component that displays and manages the currently selected CDI display source.
 */
export class SelectedCDIDisplaySource extends DisplayComponent<SelectedCDIDisplaySourceProps> {
  private readonly cdiLabel = Subject.create<'GPS' | 'VLOC'>('GPS');
  private readonly el = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.el.instance.classList.add('green');

    this.props.gnsCdiMode.sub(v => {
      this.setCdiDisplaySource(v === GnsCdiMode.GPS);
    });
  }

  /**
   * Sets the currently selected CDI display source.
   *
   * @param isGps value
   */
  public setCdiDisplaySource(isGps: boolean): void {
    this.cdiLabel.set(isGps ? 'GPS' : 'VLOC');

    if (isGps) {
      this.el.instance.classList.add('green');
    } else {
      this.el.instance.classList.remove('green');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='cdi-label' ref={this.el}>{this.cdiLabel}</div>
    );
  }
}