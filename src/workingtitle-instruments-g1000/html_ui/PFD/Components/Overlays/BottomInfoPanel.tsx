import {
  AdcEvents, AhrsEvents, BearingDirection, BearingDistance, BearingIdent, BearingSource, ClockEvents, ConsumerSubject, ControlPublisher, DisplayComponent,
  ElectricalEvents,
  EventBus, FSComponent, InstrumentEvents, NavEvents, NavMath, NavSourceId, NavSourceType, NodeReference, NumberFormatter, NumberUnitSubject, Subject, Subscription, UnitType,
  VNode
} from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettings } from '@microsoft/msfs-garminsdk';

import { G1000ControlEvents } from '../../../Shared/G1000Events';
import { ADCSystemEvents, AvionicsSystemState } from '../../../Shared/Systems';
import { NumberUnitDisplay } from '../../../Shared/UI/Common/NumberUnitDisplay';
import { TimeDisplay, TimeDisplayFormat } from '../../../Shared/UI/Common/TimeDisplay';
import { UnitsUserSettingManager } from '../../../Shared/Units/UnitsUserSettings';
import { Transponder } from './Transponder';

import './BottomInfoPanel.css';

/**
 * The properties on the Attitude component.
 */
interface BottomInfoPanelProps {

  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the control publisher. */
  controlPublisher: ControlPublisher;

  /** A user setting manager. */
  unitsSettingManager: UnitsUserSettingManager
}

/**
 * The PFD attitude indicator.
 */
export class BottomInfoPanel extends DisplayComponent<BottomInfoPanelProps> {
  private static readonly FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };

  private oatValue = NumberUnitSubject.createFromNumberUnit(UnitType.CELSIUS.createNumber(13));
  private bearing1DistSubject = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(13));
  private bearing2DistSubject = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(13));
  private timerStr = Subject.create('0:00:00');
  private hdg = 0;
  private bearingPointerAdf = [false, false];
  private bearingPointerDirection: (number | null)[] = [null, null];
  private av1StateOn = false;
  private av2StateOn = false;
  private isMfdPowered = false;

  private bearing1Container = FSComponent.createRef<HTMLElement>();
  private bearing2Container = FSComponent.createRef<HTMLElement>();
  private bearing1SrcElement = FSComponent.createRef<HTMLElement>();
  private bearing2SrcElement = FSComponent.createRef<HTMLElement>();
  private bearing1DistElement = FSComponent.createRef<HTMLElement>();
  private bearing1DistUnits = FSComponent.createRef<HTMLElement>();
  private bearing2DistElement = FSComponent.createRef<HTMLElement>();
  private bearing2DistUnits = FSComponent.createRef<HTMLElement>();
  private bearing1DirElement = FSComponent.createRef<HTMLElement>();
  private bearing2DirElement = FSComponent.createRef<HTMLElement>();
  private bearing1IdentElement = FSComponent.createRef<HTMLElement>();
  private bearing2IdentElement = FSComponent.createRef<HTMLElement>();
  private tempBox = FSComponent.createRef<HTMLDivElement>();
  private oatHide = FSComponent.createRef<HTMLDivElement>();

  //failed boxes for bearings 1 and 2
  //1st bearing boxes
  // private bearing1IdentFailed = FSComponent.createRef<FailedBox>();
  // private bearing1DirFailed = FSComponent.createRef<FailedBox>();
  // private bearing1DistFailed = FSComponent.createRef<FailedBox>();

  // //2nd bearing boxes
  // private bearing2IdentFailed = FSComponent.createRef<FailedBox>();
  // private bearing2DirFailed = FSComponent.createRef<FailedBox>();
  // private bearing2DistFailed = FSComponent.createRef<FailedBox>();

  private currentBearing1Source: NavSourceId | null = null;
  private currentBearing2Source: NavSourceId | null = null;

  private mfdPowerOnSub?: Subscription;

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const adahrs = this.props.bus.getSubscriber<AdcEvents & AhrsEvents>();
    const g1000 = this.props.bus.getSubscriber<G1000ControlEvents>();

    adahrs.on('ambient_temp_c')
      .withPrecision(0)
      .handle(this.onUpdateOAT);
    adahrs.on('hdg_deg')
      .withPrecision(0)
      .handle((h) => { this.hdg = h; });
    g1000.on('timer_value')
      .whenChangedBy(1)
      .handle((time) => {
        this.timerStr.set(Utils.SecondsToDisplayDuration(time, true, true, true));
      });

    const nav = this.props.bus.getSubscriber<NavEvents>();
    nav.on('brg_source').handle(this.onUpdateBearingSrc);
    nav.on('brg_distance').handle(this.onUpdateBearingDist);
    nav.on('brg_direction').handle(this.onUpdateBearingDir);
    nav.on('brg_ident').handle(this.onUpdateBearingIdent);

    if (this.bearing1Container.instance !== null && this.bearing2Container.instance !== null) {
      this.bearing1Container.instance.style.display = 'none';
      this.bearing2Container.instance.style.display = 'none';
    }

    this.mfdPowerOnSub = this.props.bus.on('mfd_power_on', this.onMfdPowerOn, true);

    this.props.bus.on('mfd_power_on', isPowered => this.isMfdPowered = isPowered);
    this.props.bus.getSubscriber<InstrumentEvents>().on('vc_screen_state').handle(state => {
      if (state.current === ScreenState.REVERSIONARY) {
        setTimeout(() => {
          this.tempBox.instance.classList.add('reversionary');

          if (!this.isMfdPowered) {
            this.mfdPowerOnSub!.resume(true);
          }
        }, 1000);
      } else if (this.isMfdPowered) {
        setTimeout(() => {
          this.tempBox.instance.classList.remove('reversionary');
        }, 1000);
      }
    });

    this.props.bus.getSubscriber<ADCSystemEvents>()
      .on('adc_state')
      .handle(state => {
        if (state.current === AvionicsSystemState.On) {
          this.tempBox.instance.classList.remove('failed-instr');
        } else {
          this.tempBox.instance.classList.add('failed-instr');
        }
      });

    const electrical = this.props.bus.getSubscriber<ElectricalEvents>();
    electrical.on('elec_circuit_nav_on_1').handle(on => this.onNavPowerChange(on, 1));
    electrical.on('elec_circuit_nav_on_2').handle(on => this.onNavPowerChange(on, 2));
  }

  /**
   *
   * Handles when the MFD has powered on.
   * @param isPowered Whether or not the MFD is finished powering on.
   */
  private onMfdPowerOn = (isPowered: boolean): void => {
    if (isPowered) {
      setTimeout(() => {
        this.tempBox.instance.classList.remove('reversionary');
        this.mfdPowerOnSub!.pause();
      }, 1000);
    }
  };

  /**
   * A callback called when the pitch updates from the event bus.
   * @param temp The current pitch value.
   */
  private onUpdateOAT = (temp: number): void => {
    this.oatValue.set(temp);
  };

  /**
   * Handle an updated bearing source.
   * @param data The new bearing source info.
   */
  private onUpdateBearingSrc = (data: BearingSource): void => {
    let newLabel = '';
    let updateFailedFunc: ((x: boolean) => void) | undefined;
    let updateFailedState: boolean | undefined;
    let updateItem: NodeReference<HTMLElement> | null;

    switch (data.index) {
      case 0:
        this.currentBearing1Source = data.source;
        updateItem = this.bearing1SrcElement;
        break;
      case 1:
        this.currentBearing2Source = data.source;
        updateItem = this.bearing2SrcElement;
        break;
      default:
        updateItem = null;
    }

    switch (data.source?.type) {
      case NavSourceType.Nav:
        // Process nav source failed boxes.  First, determine which nav computer is relevant.
        if (data.source.index == 1) {
          updateFailedState = this.av1StateOn;
        } else if (data.source.index == 2) {
          updateFailedState = this.av2StateOn;
        }

        // Then determine which bearing pointer has been updated.
        if (data.index == 0) {
          updateFailedFunc = this.updateBearing1FailedBoxes;
        } else if (data.index == 1) {
          updateFailedFunc = this.updateBearing2FailedBoxes;
        }

        // If we have relevant failed boxes, update them.
        if (updateFailedFunc !== undefined && updateFailedState !== undefined) {
          updateFailedFunc(updateFailedState);
        }

        // Then do the rest.
        this.bearingPointerAdf[data.index] = false;
        newLabel = `NAV${data.source?.index}`;
        break;
      case NavSourceType.Gps:
        this.dontShowFailedBoxesAndShowNavTypeSpecifics(data.index);
        this.bearingPointerAdf[data.index] = false;
        newLabel = 'GPS';
        break;
      case NavSourceType.Adf:
        this.dontShowFailedBoxesAndShowNavTypeSpecifics(data.index);
        this.bearingPointerAdf[data.index] = true;
        newLabel = 'ADF';
        break;
      default:
        this.bearingPointerAdf[data.index] = false;
        newLabel = '';
    }

    const direction = this.bearingPointerDirection[data.index];
    if (direction !== null) {
      this.onUpdateBearingDir({ index: data.index, direction: direction });
    }


    if (updateItem && updateItem.instance !== null) {
      updateItem.instance.textContent = newLabel;
    }

    if (newLabel == '' && updateItem?.instance !== null) {
      this.onShowBearingDataElement(false, data.index);
    } else if (newLabel != '' && updateItem?.instance !== null) {
      this.onShowBearingDataElement(true, data.index);
    }
  };

  private onNavPowerChange = (on: boolean, index: number): void => {
    if (this.currentBearing1Source?.type == NavSourceType.Nav && this.currentBearing1Source.index == index) {
      this.updateBearing1FailedBoxes(on);
    }

    if (this.currentBearing2Source?.type == NavSourceType.Nav && this.currentBearing2Source.index == index) {
      this.updateBearing2FailedBoxes(on);
    }
  };

  /**
   * updates the bearing 1 boxes
   * @param passed The new bearing source info.
   */
  private updateBearing1FailedBoxes = (passed: boolean): void => {
    this.bearing1Container.instance.classList.toggle('failed-instr', !passed);
  };

  /**
   * updates the bearing 2 boxes
   * @param passed The new bearing source info.
   */
  private updateBearing2FailedBoxes = (passed: boolean): void => {
    this.bearing2Container.instance.classList.toggle('failed-instr', !passed);
  };

  /**
   * will make sure that error boxes to not occure on GPS and Adf settings
   * while also showing the information needed if data is present
   * @param bearingSource The new bearing source info.
   */
  private dontShowFailedBoxesAndShowNavTypeSpecifics = (bearingSource: number): void => {
    switch (bearingSource) {
      case 0:
        this.updateBearing1FailedBoxes(true);
        break;
      case 1:
        this.updateBearing2FailedBoxes(true);
        break;
    }
  };

  /**
   * Handle hiding or showing the entire bearing needle data element.
   * @param display Whether to show thhe bearing needle data element or not.
   * @param index is the index of the bearing source
   */
  private onShowBearingDataElement = (display: boolean, index: number): void => {
    const instance = index == 0 ? this.bearing1Container.instance : index == 1 ? this.bearing2Container.instance : null;
    if (instance !== null && display) {
      instance.style.display = '';
    } else if (instance !== null && !display) {
      instance.style.display = 'none';
    }
  };

  /**
   * Handle an updated bearing distance.
   * @param data The BearingDistance message.
   */
  private onUpdateBearingDist = (data: BearingDistance): void => {
    let element: NodeReference<HTMLElement> | undefined = undefined;
    switch (data.index) {
      case 0:
        element = this.bearing1DistElement; break;
      case 1:
        element = this.bearing2DistElement; break;
    }
    if (data.distance == null) {
      element?.instance.classList.add('hidden-element');
    } else {
      element?.instance.classList.remove('hidden-element');
      switch (data.index) {
        case 0:
          this.bearing1DistSubject.set(data.distance); break;
        case 1:
          this.bearing2DistSubject.set(data.distance); break;
      }
    }
  };

  /**
   * Handle an updated bearing heading..
   * @param data The BearingDirection message.
   */
  private onUpdateBearingDir = (data: BearingDirection): void => {
    this.bearingPointerDirection[data.index] = data.direction;

    let element: NodeReference<HTMLElement> | undefined = undefined;
    switch (data.index) {
      case 0:
        element = this.bearing1DirElement; break;
      case 1:
        element = this.bearing2DirElement; break;
    }
    if (element !== undefined && element.instance !== null) {
      let direction = data.direction;
      if (this.bearingPointerAdf[data.index] && data.direction !== null) {
        direction = NavMath.normalizeHeading(data.direction + this.hdg);
      }
      element.instance.textContent = direction == null ? '' : direction.toFixed(0).padStart(3, '0') + '°';
    }
  };


  /**
   * Handle an updated bearing ident.
   * @param data The BearingIdent message.
   */
  private onUpdateBearingIdent = (data: BearingIdent): void => {
    let element: NodeReference<HTMLElement> | undefined = undefined;
    switch (data.index) {
      case 0:
        element = this.bearing1IdentElement; break;
      case 1:
        element = this.bearing2IdentElement; break;
    }
    if (element !== undefined && element.instance !== null) {
      element.instance.textContent = data.isLoc ? 'ILS' : data.ident == null ? ' _ _ _ _ _ _' : '' + data.ident + '';
    }
  };

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    const dateTimeSettingManager = DateTimeUserSettings.getManager(this.props.bus);
    const dateTimeFormatSub = ConsumerSubject.create(dateTimeSettingManager.whenSettingChanged('dateTimeFormat'), dateTimeSettingManager.getSetting('dateTimeFormat').value);

    return (

      <div class="bottom-info-panel">
        <div class="bip-temp-box" ref={this.tempBox}>
          <div class="bip-oat">
            <div class="bip-oat-label"><span class='size16'>OAT</span></div>
            <div class="bip-oat-value">
              <div class="failed-box" />
              <NumberUnitDisplay value={this.oatValue}
                formatter={NumberFormatter.create({ precision: 1 })}
                displayUnit={this.props.unitsSettingManager.temperatureUnits}
                class="bip-oat-nud"
              />
            </div>
          </div>
        </div>

        <div class="bip-middle">
          <svg viewBox="0 0 721 55">
            <defs>
              <linearGradient id="gradientBottom" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(24,24,24);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M 0 0 l 258 0 a 147 147 0 0 0 204 0 l 260 0 l 0 55 l -722 0 l 0 -55 z" fill="url(#gradientBottom)" />
          </svg>
          <div class="left-brg-ptr-container" ref={this.bearing1Container}>
            <div ref={this.bearing1DistElement}>
              <NumberUnitDisplay
                value={this.bearing1DistSubject}
                formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3 })}
                displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                class="left-brg-ptr-dist"
              />
            </div>
            <div class="failed-box left-brg-ptr-dist-failed" />
            <div class="left-brg-ptr-crs-ident">
              <div class="failed-box left-brg-ptr-dir-failed" />
              <div class="failed-box left-brg-ptr-ident-failed" />
              <div class="left-brg-ptr-crs" ref={this.bearing1DirElement} />
              <div class="left-brg-ptr-ident" ref={this.bearing1IdentElement} />
              <div class="left-brg-ptr-src" ref={this.bearing1SrcElement} />
              <div class="left-brg-ptr-svg">
                <svg width="19" height="10">
                  <path d="M 0 4 l 18 0 m -10 -4 l -4 4 l 4 4" fill="none" stroke="cyan" stroke-width="1.0px" />
                </svg>
              </div>
            </div>

          </div>
          <div class="right-brg-ptr-container" ref={this.bearing2Container}>
            <div ref={this.bearing2DistElement}>
              <NumberUnitDisplay
                value={this.bearing2DistSubject}
                formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3 })}
                displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                class="right-brg-ptr-dist"
              />
            </div>
            <div class="failed-box right-brg-ptr-dist-failed" />
            <div class="right-brg-ptr-crs-ident">
              <div class="right-brg-ptr-svg">
                <svg width="19" height="10">
                  <path d="M 0 4 l 3 0 m 12 0 l 4 0 m -8 -4 l 4 4 l -4 4 m 2 -6 l -10 0 l 0 4 l 10 0" fill="none" stroke="cyan" stroke-width="1.0px" />
                </svg>
              </div>
              <div class="right-brg-ptr-src" ref={this.bearing2SrcElement} />
              <div class="right-brg-ptr-ident" ref={this.bearing2IdentElement} />
              <div class="right-brg-ptr-crs" ref={this.bearing2DirElement} />
              <div class="failed-box right-brg-ptr-ident-failed" />
              <div class="failed-box right-brg-ptr-dir-failed" />
            </div>
          </div>
        </div>
        <Transponder bus={this.props.bus} controlPublisher={this.props.controlPublisher} />
        <div class="bip-time">
          <div class='bip-time-label size16'>TMR</div>
          <div class='size20'>{this.timerStr}</div>
          <div class='bip-time-label size16'>{dateTimeFormatSub.map(setting => setting === DateTimeFormatSettingMode.UTC ? 'UTC' : 'LCL')}</div>
          <TimeDisplay
            time={ConsumerSubject.create(this.props.bus.getSubscriber<ClockEvents>().on('simTime'), 0)}
            format={
              dateTimeFormatSub.map(setting => {
                return BottomInfoPanel.FORMAT_SETTING_MAP[setting];
              })
            }
            localOffset={ConsumerSubject.create(dateTimeSettingManager.whenSettingChanged('dateTimeLocalOffset'), dateTimeSettingManager.getSetting('dateTimeLocalOffset').value)}
            class='utc-time-display size20'
          />
        </div>
      </div >
    );
  }
}
