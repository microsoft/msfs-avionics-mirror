import { ComponentProps, DisplayComponent, FSComponent, EventBus, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';
import { GnsCdiMode } from '../Instruments/CDINavSource';

import { GNSType } from '../UITypes';

import './SelectedCDIDisplaySource.css';

/**
 * Props on the SelectedCDIDisplaySource component.
 */
interface SelectedCDIDisplaySourceProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;

  /** The type of GNS, 430 or 530. */
  gnsType: GNSType;

  /** Subject containing the current instrulment-level CDI source */
  gnsCdiMode: Subject<GnsCdiMode>;

  /** The instrument tag index in panel.xml. */
  instrumentIndex: number;
}

/**
 * A component that displays and manages the currently selected CDI display source.
 */
export class SelectedCDIDisplaySource extends DisplayComponent<SelectedCDIDisplaySourceProps> {
  private readonly cdiLabel = Subject.create<'GPS' | 'VLOC'>('GPS');
  private readonly el = FSComponent.createRef<HTMLElement>();

  /**
   * Returns the instrument index of the owning instrument
   *
   * @returns a number, 1-indexed
   */
  private get instrumentIndex(): number {
    // const instrumentIndex = this.props.instrumentIndex + 1;
    // ^-- FIXME the instrumentIndex should be the order of appearance of our <Instrument /> tag
    // in panel.xml (relative to all other tags with the same instrument name). However this is currently always 1,
    // since our code (and the panel.cfg files invoking it) do not specify which index of a dual-530 (or dual-430) we are.

    return this.props.instrumentIndex;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    const gnsType = this.props.gnsType === 'wt430' ? '430' : '530';

    SimVar.SetSimVarValue(`L:AS${gnsType}_CDI_Source_${this.instrumentIndex}`, SimVarValueType.Bool, true);
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

    const gnsType = this.props.gnsType === 'wt430' ? '430' : '530';
    SimVar.SetSimVarValue(`L:AS${gnsType}_CDI_Source_${this.instrumentIndex}`, SimVarValueType.Bool, isGps);

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