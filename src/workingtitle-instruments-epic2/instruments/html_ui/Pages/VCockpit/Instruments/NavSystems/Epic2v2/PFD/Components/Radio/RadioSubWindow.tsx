import {
  ComponentProps, ComSpacing, ControlEvents, DisplayComponent, ElectricalEvents, EventBus, FSComponent, HEvent, NavComEvents, SetSubject, Subscribable,
  XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { AdfSystemEvents, Epic2BezelButtonEvents, Epic2DmeStateEvents, Epic2DuControlEvents, Epic2PfdControlRadioEvents, XpdrSystemEvents } from '@microsoft/msfs-epic2-shared';

import { DetailPagesController } from './DetailPages';

import './RadioSubWindow.css';

/** Topics that can be sent to a radio sub-window's control event handler. */
export type RadioSubWindowControlEventTopics = keyof Epic2PfdControlRadioEvents | 'BEZEL_BUTTON' | keyof Epic2DuControlEvents;

/** Common radio sub-window props. */
export interface RadioSubWindowProps extends ComponentProps {
  /** An EventBus. */
  bus: EventBus,
  /** Whether the sub-window is currently selected. */
  isSelected: Subscribable<boolean>,
  /** Whether to draw the bottom separator the full width. */
  fullWidthSeparator?: boolean,
  /** Controls which Radio Management Detail Page to show in the subwindow and its display data. */
  detailPagesController: DetailPagesController;
  /** The HEvent string of the LSK allocated to this subwindow. */
  lskString: Epic2BezelButtonEvents;
}

/** A base class for radio sub-window classes. */
export abstract class RadioSubWindow<P extends RadioSubWindowProps = RadioSubWindowProps> extends DisplayComponent<P> {
  protected readonly subWindowRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly separatorRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly radioSub = this.props.bus.getSubscriber<AdfSystemEvents & ElectricalEvents & Epic2DmeStateEvents & NavComEvents & XPDRSimVarEvents & XpdrSystemEvents>();

  protected readonly hEventPublisher = this.props.bus.getPublisher<HEvent>();

  protected readonly softKeyClass = SetSubject.create<string>(['soft-key-ident']);

  /**
   * Formats COM frequencies to strings.
   * @param root0 Inputs
   * @param root0."0" The frequency.
   * @param root0."1" The channel spacing.
   * @param root0."2" Whether the radio is powered
   * @returns A formatted string.
   */
  protected static FrequencyFormatter([freq, spacing, powered]: readonly [number, ComSpacing, boolean]): string {
    // Convert to kHz so that all potentially significant digits lie to the left of the decimal point.
    // This prevents floating point rounding errors.
    if (powered === false) { return '---.---'; }
    const freqKhz: number = Math.round(freq * 1e3);
    return spacing === ComSpacing.Spacing833Khz ?
      (freqKhz / 1000).toFixed(3) :
      // Truncate to 10 kHz
      (Math.trunc(freqKhz / 10) / 100).toFixed(2);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    if (this.props.fullWidthSeparator) {
      this.separatorRef.instance.classList.add('full-width');
    }

    this.props.isSelected.sub((isSelected: boolean): void => {
      this.subWindowRef.instance.classList.toggle('sub-window-selected', isSelected);
      this.softKeyClass.toggle('soft-key-selected', isSelected);
    }, true);
  }

  /**
   * Publishes an HEvent when the soft key of this subwindow is pressed,
   * to create the same effect as when the bezel button corresponding to this subwindow is pressed.
   */
  protected publishHEventOnSoftKeyPressed(): void {
    this.hEventPublisher.pub('hEvent', this.props.lskString, true, false);
  }

  /**
   * Handles {@link Epic2PfdControlRadioEvents}s.
   * @param topic The event topic.
   * @returns void
   * */
  public handleRadioControlEvents(topic: RadioSubWindowControlEventTopics): void {
    switch (topic) {
      case 'pfd_control_vfr_push':
        return this.props.detailPagesController.handleVfrButtonPress();
      case 'pfd_control_dme_push':
        return this.props.detailPagesController.handleDmeButtonPressed();
      case 'pfd_control_ident_push':
        return this.props.bus.getPublisher<ControlEvents>().pub('xpdr_send_ident_1', true);
    }
  }
}
