import {
  ComponentProps, ComSpacing, ControlEvents, DisplayComponent, ElectricalEvents, EventBus, FSComponent, HEvent, MutableSubscribable, NavComEvents, SetSubject,
  Subject, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import {
  AdfSystemEvents, DisplayUnitIndices, Epic2DmeStateEvents, Epic2DuControlEvents, Epic2PfdControlRadioEvents, XpdrSystemEvents
} from '@microsoft/msfs-epic2-shared';

import { DetailPagesController } from './DetailPages';

import './RadioSubWindow.css';

/** Topics that can be sent to a radio sub-window's control event handler. */
export type RadioSubWindowControlEventTopics = keyof Epic2PfdControlRadioEvents | 'BEZEL_BUTTON' | keyof Epic2DuControlEvents;

/** Common radio sub-window props. */
export interface RadioSubWindowProps extends ComponentProps {
  /** An EventBus. */
  bus: EventBus,
  /** The host display unit index. */
  duIndex: DisplayUnitIndices;
  /** Whether to draw the bottom separator the full width. */
  fullWidthSeparator?: boolean,
  /** Controls which Radio Management Detail Page to show in the subwindow and its display data. */
  detailPagesController: DetailPagesController;
  /** A function that will set this subwindow as selected. */
  setSelected: () => void;
}

/** A base class for radio sub-window classes. */
export abstract class RadioSubWindow<P extends RadioSubWindowProps = RadioSubWindowProps> extends DisplayComponent<P> {
  protected readonly subWindowRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly separatorRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly radioSub = this.props.bus.getSubscriber<AdfSystemEvents & ElectricalEvents & Epic2DmeStateEvents & NavComEvents & XPDRSimVarEvents & XpdrSystemEvents>();

  protected readonly hEventPublisher = this.props.bus.getPublisher<HEvent>();

  protected readonly softKeyClass = SetSubject.create<string>(['soft-key-ident']);

  public readonly isSelected = Subject.create(false) as MutableSubscribable<boolean>;

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

    this.isSelected.sub((isSelected: boolean): void => {
      this.subWindowRef.instance.classList.toggle('sub-window-selected', isSelected);
      this.softKeyClass.toggle('soft-key-selected', isSelected);
    }, true);
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

  /**
   * Handles the softkey for this subwindow being pressed.
   */
  private handleSoftKey(): void {
    if (this.isSelected.get()) {
      this.handleRadioControlEvents('BEZEL_BUTTON');
    } else {
      this.props.setSelected();
    }
  }

  /**
   * Handles the softkey for this subwindow being pressed.
   */
  protected softKeyHandler = this.handleSoftKey.bind(this);
}
