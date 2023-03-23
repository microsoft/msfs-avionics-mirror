import { AdsbOperatingMode, FocusPosition, FSComponent, NavMath, SimVarValueType, Subject, TcasOperatingMode, Vec2Math, Vec2Subject, VNode } from '@microsoft/msfs-sdk';

import { MapTrafficAltitudeRestrictionMode, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { Page, PageProps } from '../Pages';
import { TrafficDisplay } from './TrafficDisplay';

import './TrafficMap.css';
import { GNSAdsbPublisherEvents, GNSAdsbSimVars } from '../../../Instruments/GNSAdsbPublisher';

/**
 * Props for the traffic map page.
 */
interface TrafficMapProps extends PageProps {
  /** An instance of the Garmin traffic system. */
  trafficSystem: TrafficSystem;
}

/**
 * A page that displays the traffic map.
 */
export class TrafficMap extends Page<TrafficMapProps> {
  private readonly trafficDisplay = FSComponent.createRef<TrafficDisplay>();
  private readonly rootControl = FSComponent.createRef<GNSUiControl>();
  private readonly standbyEl = FSComponent.createRef<HTMLDivElement>();
  private readonly adsbEl = FSComponent.createRef<TrafficMapToggle>();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.onTrafficSettingChanged('NRM');
    this.props.bus.getSubscriber<GNSAdsbPublisherEvents>().on('gns_adsb_oper').whenChanged().handle(this.handleAdsbModeChanged.bind(this));
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.RangeIncrease) {
      this.trafficDisplay.instance.changeRange('inc');
      return true;
    }

    if (evt === InteractionEvent.RangeDecrease) {
      this.trafficDisplay.instance.changeRange('dec');
      return true;
    }

    if (evt === InteractionEvent.RightKnobPush) {
      if (this.rootControl.instance.isFocused) {
        this.rootControl.instance.blur();
      } else {
        this.rootControl.instance.focus(FocusPosition.Last);
      }

      return true;
    }

    let handled = false;
    if (this.rootControl.instance.isFocused) {
      if (evt === InteractionEvent.CLR) {
        this.rootControl.instance.blur();
        return true;
      }

      handled = this.rootControl.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return handled;
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.trafficDisplay.instance.sleep();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.trafficDisplay.instance.wake();
  }

  /**
   * Handles when the traffic altitude restriction setting changes.
   * @param value The new value.
   */
  private onTrafficSettingChanged(value: string): void {
    switch (value) {
      case 'NRM':
        this.trafficDisplay.instance.setAltitudeRestrictionMode(MapTrafficAltitudeRestrictionMode.Normal);
        break;
      case 'ABV':
        this.trafficDisplay.instance.setAltitudeRestrictionMode(MapTrafficAltitudeRestrictionMode.Above);
        break;
      case 'BLW':
        this.trafficDisplay.instance.setAltitudeRestrictionMode(MapTrafficAltitudeRestrictionMode.Below);
        break;
      case 'UNR':
        this.trafficDisplay.instance.setAltitudeRestrictionMode(MapTrafficAltitudeRestrictionMode.Unrestricted);
        break;
    }
  }

  /**
   * Handles when the ADS-B mode control is toggled.
   * @param value The value that it was toggled to.
   */
  private onAdsbModeToggled(value: string): void {
    if (value === 'ADS ON') {
      SimVar.SetSimVarValue(GNSAdsbSimVars.WTGNS_ADSB_OPER, SimVarValueType.Bool, true);
    } else {
      SimVar.SetSimVarValue(GNSAdsbSimVars.WTGNS_ADSB_OPER, SimVarValueType.Bool, false);
    }
  }

  /**
   * Handles when the ADS-B mode is changed.
   * @param oper The new mode setting.
   */
  private handleAdsbModeChanged(oper: boolean): void {
    if (oper) {
      this.props.trafficSystem.adsb?.setOperatingMode(AdsbOperatingMode.Airborne);
      this.props.trafficSystem.setOperatingMode(TcasOperatingMode.TAOnly);

      this.standbyEl.instance.classList.add('hide-element');
      this.adsbEl.instance.set(1);
    } else {
      this.props.trafficSystem.adsb?.setOperatingMode(AdsbOperatingMode.Standby);
      this.props.trafficSystem.setOperatingMode(TcasOperatingMode.Standby);

      this.standbyEl.instance.classList.remove('hide-element');
      this.adsbEl.instance.set(0);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page tfc-map hide-element' ref={this.el}>
        <TrafficDisplay bus={this.props.bus} gnsType={this.props.gnsType} trafficSystem={this.props.trafficSystem} ref={this.trafficDisplay}
          size={Vec2Subject.create(this.props.gnsType === 'wt430' ? Vec2Math.create(272, 174) : Vec2Math.create(255, 217))} />
        <GNSUiControl ref={this.rootControl} isolateScroll>
          <TrafficMapToggle class='tfc-map-toggle-traffic' label='TRAFFIC' options={['NRM', 'ABV', 'BLW', 'UNR']} onOptionSelected={this.onTrafficSettingChanged.bind(this)} />
          <TrafficMapToggle class='tfc-map-toggle-mode' options={['ADS OFF', 'ADS ON']} requireConfirmation onOptionSelected={this.onAdsbModeToggled.bind(this)} ref={this.adsbEl} />
        </GNSUiControl>
        <div class='tfc-map-standby' ref={this.standbyEl}>STANDBY</div>
      </div>
    );
  }
}

/**
 * Props on the TrafficMapToggle control.
 */
interface TrafficMapToggleProps extends GNSUiControlProps {
  /** The options available for this toggle control. */
  options: string[];

  /** A callback called when an item is selected. */
  onOptionSelected: (value: string) => void;

  /** The label for this toggle. */
  label?: string;

  /** The CSS class to apply to this control. */
  class?: string;

  /** Whether or not this toggle required confirmation via the ENT key. */
  requireConfirmation?: boolean;
}

/**
 * A control that selects between traffic map options.
 */
class TrafficMapToggle extends GNSUiControl<TrafficMapToggleProps> {

  private readonly selectionEl = FSComponent.createRef<HTMLDivElement>();
  private readonly selection = Subject.create(this.props.options[0] ?? '');
  private currentSelectedIndex = 0;
  private currentConfirmedIndex = 0;

  /** @inheritdoc */
  public onEnt(): boolean {
    this.currentConfirmedIndex = this.currentSelectedIndex;
    const selection = this.props.options[this.currentSelectedIndex];
    this.props.onOptionSelected(selection);

    this.selection.set(selection);
    return true;
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    this.changeSelection(1);
    return true;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    this.changeSelection(-1);
    return true;
  }

  /**
   * Sets the selection.
   * @param index The index to se.
   */
  public set(index: number): void {
    index = NavMath.clamp(index, 0, this.props.options.length - 1);
    this.currentSelectedIndex = index;
    this.currentConfirmedIndex = index;

    this.selection.set(this.props.options[index]);
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.selectionEl.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.selectionEl.instance.classList.remove('selected');
  }

  /**
   * Changes the toggle selection.
   * @param offset The amount to change the selection index by.
   */
  private changeSelection(offset: number): void {
    this.currentSelectedIndex = Math.max(0, Math.min(this.currentSelectedIndex + offset, this.props.options.length - 1));

    let selection = this.props.options[this.currentSelectedIndex];
    if (this.props.requireConfirmation && this.currentConfirmedIndex !== this.currentSelectedIndex) {
      selection += '?';
    }

    this.selection.set(selection);

    if (!this.props.requireConfirmation) {
      this.currentConfirmedIndex = this.currentSelectedIndex;
      this.props.onOptionSelected(selection);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`tfc-map-toggle ${this.props.class ?? ''}`}>
        {this.props.label && <label>{this.props.label}</label>}
        <div class='tfc-map-toggle-selection' ref={this.selectionEl}>{this.selection}</div>
      </div>
    );
  }
}