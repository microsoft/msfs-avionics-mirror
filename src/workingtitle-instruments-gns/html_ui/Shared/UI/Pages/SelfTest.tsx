import { BasicNavAngleUnit, FocusPosition, FSComponent, NavComEvents, NumberUnitSubject, UnitType, VNode } from '@microsoft/msfs-sdk';

import { PowerEvents, PowerState } from '../../Instruments/Power';
import { GNSSettingsProvider } from '../../Settings/GNSSettingsProvider';
import { GNSNumberUnitDisplay } from '../Controls/GNSNumberUnitDisplay';
import { GNSDataFieldTypeRenderer } from '../DataFields/GNSDataFieldRenderer';
import { GNSUiControl, GNSUiControlProps } from '../GNSUiControl';
import { InteractionEvent } from '../InteractionEvent';
import { Page, PageProps } from './Pages';

import './SelfTest.css';

/**
 * Props on the SelfTest page.
 */
interface SelfTestProps extends PageProps {
  /** The GNS settings provider. */
  settingsProvider: GNSSettingsProvider;

  /** The assigned nav radio index. */
  navRadioIndex: 1 | 2 | 3 | 4;
}

/**
 * The GNS self-test page.
 */
export class SelfTest extends Page<SelfTestProps> {
  private readonly obs = NumberUnitSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));
  private readonly fuelCapacity = NumberUnitSubject.create(UnitType.GALLON.createNumber(NaN));
  private readonly fuelOnBoard = NumberUnitSubject.create(UnitType.GALLON.createNumber(NaN));
  private readonly fuelFlow = NumberUnitSubject.create(UnitType.GPH_FUEL.createNumber(NaN));

  private readonly root = FSComponent.createRef<GNSUiControl>();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<NavComEvents>().on(`nav_obs_${this.props.navRadioIndex}`).withPrecision(0).handle(obs => this.obs.set(obs));
    this.props.bus.getSubscriber<PowerEvents>().on('instrument_powered').handle(this.onPowerStateChanged.bind(this));
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    return this.root.instance.onInteractionEvent(evt);
  }

  /**
   * Handles when the self-test is confirmed.
   * @returns True that the control was handled.
   */
  private onConfirmed(): boolean {
    this.props.bus.getPublisher<PowerEvents>().pub('instrument_powered', PowerState.On);
    return true;
  }

  /**
   * Handles when the power state of the instrument is changed.
   * @param state The new power state.
   */
  private onPowerStateChanged(state: PowerState): void {
    if (state === PowerState.SelfTest) {
      this.onResume();
      this.root.instance.focus(FocusPosition.Last);
    } else {
      this.onSuspend();
    }
  }

  /**
   * Handles rendering different screens based on which version is being used.
   * @returns The right version of the instrument
   */
  private render430or530(): VNode {
    if (this.props.gnsType === 'wt430') {
      return (<>
        <div class='self-test-left'>
          <div>
            <label>LCDI</label>
            <label>LFLG</label>
            <label>VCDI</label>
            <label>VFLG</label>
            {/* <label>TO/FRM</label>
            <label>ANNUN</label>
            <label>RMI</label>
            <label>OBS</label>
            <label>DTK</label> */}
          </div>
          <div class='self-test-values'>
            <div>Half Left</div>
            <div>Out of View</div>
            <div>Half Up</div>
            <div>Out of View</div>
            {/* <div>To</div>
            <div>On</div>
            <div>135</div>
            <div>
              <GNSNumberUnitDisplay
                formatter={GNSDataFieldTypeRenderer.BEARING_FORMATTER}
                value={this.obs}
                displayUnit={BasicNavAngleUnit.create(true)} />
            </div>
            <div>
              <GNSNumberUnitDisplay
                formatter={GNSDataFieldTypeRenderer.BEARING_FORMATTER}
                value={BasicNavAngleUnit.create(true).createNumber(150)}
                displayUnit={BasicNavAngleUnit.create(true)} />
            </div> */}
          </div>
          <div>
            <div class='self-test-tofrm'>
              <label>TO/FRM</label>
              <div>To</div>
            </div>

            <div class='self-test-annum'>
              <label>ANNUN</label>
              <div>On</div>
            </div>

            <div class='self-test-rmi'>
              <label>RMI</label>
              <div>135</div>
            </div>

            <div class='self-test-dtk'>
              <label>DTK</label>
              <div>
                <GNSNumberUnitDisplay
                  formatter={GNSDataFieldTypeRenderer.BEARING_FORMATTER}
                  value={BasicNavAngleUnit.create(true).createNumber(150)}
                  displayUnit={BasicNavAngleUnit.create(true)} />
              </div>
            </div>

            <div class='self-test-obs'>
              <label>OBS</label>
              <div>
                <GNSNumberUnitDisplay
                  formatter={GNSDataFieldTypeRenderer.BEARING_FORMATTER}
                  value={this.obs}
                  displayUnit={BasicNavAngleUnit.create(true)} />
              </div>
            </div>


          </div>
        </div><div class='self-test-right'>
          <h3 class='self-test-430-right-label'>CAP</h3>
          <h3 class='self-test-430-right-label'>FOB</h3>
          <h3 class='self-test-430-right-label'>FF</h3>
          <div class='self-test-right-cap'>
            <GNSNumberUnitDisplay
              class='self-test-field-cap'
              formatter={GNSDataFieldTypeRenderer.FUEL_FORMATTER}
              value={this.fuelCapacity}
              displayUnit={UnitType.GALLON} />
          </div>
          <div class='self-test-right-fob'>
            <GNSNumberUnitDisplay
              class='self-test-field-fob'
              formatter={GNSDataFieldTypeRenderer.FUEL_FORMATTER}
              value={this.fuelOnBoard}
              displayUnit={UnitType.GALLON} />
          </div>
          <div class='self-test-right-ff'>
            <GNSNumberUnitDisplay
              class='self-test-field-ff'
              formatter={GNSDataFieldTypeRenderer.FUEL_FORMATTER}
              value={this.fuelFlow}
              displayUnit={UnitType.GALLON} />
          </div>
          <GNSUiControl ref={this.root} isolateScroll>
            <SelfTestControl class='self-test-control-sff'>Set Full Fuel?</SelfTestControl>
            <SelfTestControl class='self-test-control'>Go To Chklist?</SelfTestControl>
            <SelfTestControl class='self-test-control ok-button' onEnt={this.onConfirmed.bind(this)}>OK?</SelfTestControl>
          </GNSUiControl>
        </div></>);
    } else {
      return (<>
        <div class='self-test-left'>
          <div>
            <label>LCDI</label>
            <label>LFLG</label>
            <label>VCDI</label>
            <label>VFLG</label>
            <label>TO/FRM</label>
            <label>ANNUN</label>
            <label>RMI</label>
            <label>OBS</label>
            <label>DTK</label>
          </div>
          <div class='self-test-values'>
            <div>Half Left</div>
            <div>Out of View</div>
            <div>Half Up</div>
            <div>Out of View</div>
            <div>To</div>
            <div>On</div>
            <div>135</div>
            <div>
              <GNSNumberUnitDisplay
                formatter={GNSDataFieldTypeRenderer.BEARING_FORMATTER}
                value={this.obs}
                displayUnit={BasicNavAngleUnit.create(true)} />
            </div>
            <div>
              <GNSNumberUnitDisplay
                formatter={GNSDataFieldTypeRenderer.BEARING_FORMATTER}
                value={BasicNavAngleUnit.create(true).createNumber(150)}
                displayUnit={BasicNavAngleUnit.create(true)} />
            </div>
          </div>
        </div><div class='self-test-right'>
          <h3>FUEL CAPACITY</h3>
          <GNSNumberUnitDisplay
            class='self-test-field'
            formatter={GNSDataFieldTypeRenderer.FUEL_FORMATTER}
            value={this.fuelCapacity}
            displayUnit={UnitType.GALLON} />
          <h3>FUEL ON-BOARD</h3>
          <GNSNumberUnitDisplay
            class='self-test-field'
            formatter={GNSDataFieldTypeRenderer.FUEL_FORMATTER}
            value={this.fuelOnBoard}
            displayUnit={UnitType.GALLON} />
          <h3>FUEL FLOW</h3>
          <GNSNumberUnitDisplay
            class='self-test-field'
            formatter={GNSDataFieldTypeRenderer.FUEL_FORMATTER}
            value={this.fuelFlow}
            displayUnit={UnitType.GALLON} />
          <GNSUiControl ref={this.root} isolateScroll>
            <SelfTestControl class='self-test-control'>Set Full Fuel?</SelfTestControl>
            <hr />
            <SelfTestControl class='self-test-control'>Go To Checklists?</SelfTestControl>
            <hr />
            <SelfTestControl class='self-test-control ok-button' onEnt={this.onConfirmed.bind(this)}>OK?</SelfTestControl>
          </GNSUiControl>
        </div></>);

    }

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='self-test hide-element' ref={this.el}>
        <h3>INSTRUMENT PANEL SELF-TEST</h3>
        {this.render430or530()}
      </div>
    );
  }
}

/**
 * Props on the SelfTestControl control.
 */
interface SelfTestControlProps extends GNSUiControlProps {
  /** The class to apply to the control. */
  class?: string;
}

/**
 * A control that is a simple highlightable button.
 */
export class SelfTestControl extends GNSUiControl<SelfTestControlProps> {
  private readonly el = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add('selected-white');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove('selected-white');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`${this.props.class ?? ''}`}><span ref={this.el}>{this.props.children}</span></div>
    );
  }
}