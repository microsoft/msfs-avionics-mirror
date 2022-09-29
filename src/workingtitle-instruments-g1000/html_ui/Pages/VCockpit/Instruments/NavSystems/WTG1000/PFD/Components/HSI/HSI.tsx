import {
  AdcEvents, APEvents, ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, EventBus, FlightPlanner, FSComponent, MinimumsEvents, MinimumsMode,
  NavEvents, NavSourceType, NodeReference, NumberUnitSubject, Subject, Unit, UnitFamily, UnitType, VNode
} from 'msfssdk';

import { NavIndicatorController, ObsSuspModes, TrafficAdvisorySystem, UnitsUserSettingManager } from 'garminsdk';

import { AvionicsComputerSystemEvents, AvionicsSystemState } from '../../../Shared/Systems';
import { PfdMapLayoutSettingMode, PFDUserSettings } from '../../PFDUserSettings';
import { HSIMap } from './HSIMap';
import { HSIRose } from './HSIRose';

import './HSI.css';

/**
 * Properties on the HSI component.
 */
interface HSIProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** An instance of the nav indicator controller. */
  navIndicatorController: NavIndicatorController;

  /** The G1000 traffic advisory system. */
  tas: TrafficAdvisorySystem;

  /** A user setting manager for distance units. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * The HSI component of the PFD.
 */
export class HSI extends DisplayComponent<HSIProps> {
  private readonly roseRef = new NodeReference<HSIRose>();
  private readonly mapRef = new NodeReference<HSIMap>();
  private readonly minimumsContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly gpsMessage = FSComponent.createRef<HTMLDivElement>();

  public readonly hsiController = this.props.navIndicatorController;
  private readonly dtkBoxLabelSubj = Subject.create<string>('');
  private readonly dtkBoxValue = FSComponent.createRef<HTMLElement>();
  private readonly dtkBoxValueSubj = ComputedSubject.create<number, string>(0, (value) => {
    return `${value}°`.padStart(4, '0');
  });

  private readonly minsValueRef = FSComponent.createRef<HTMLDivElement>();
  private readonly minimumsValue = Subject.create(0);
  private readonly minimumsUnit = ComputedSubject.create<Unit<UnitFamily.Distance>, string>(this.props.unitsSettingManager.altitudeUnits.get(), u => {
    return u === UnitType.METER ? 'M' : 'FT';
  });

  private readonly headingSelectValue = ComputedSubject.create(0, (v): string => {
    const hdg = v == 0 ? 360 : v;
    return `${hdg}°`.padStart(4, '0');
  });

  private readonly minimumsMode = ConsumerSubject.create(this.props.bus.getSubscriber<MinimumsEvents>().on('minimums_mode'), MinimumsMode.OFF);
  private readonly minimumsModeDisplay = ComputedSubject.create<MinimumsMode, string>(this.minimumsMode.get(), u => {
    return u === MinimumsMode.RA ? ' RA' : 'BARO';
  });
  private readonly decisionHeight = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly decisionAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  private altitude = 0;
  private radioAltitude = 0;

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.registerComponents();

    const ap = this.props.bus.getSubscriber<APEvents>();

    ap.on('ap_heading_selected')
      .withPrecision(0)
      .handle(this.updateSelectedHeadingDisplay.bind(this));

    const minimums = this.props.bus.getSubscriber<MinimumsEvents>();

    this.minimumsMode.sub(() => { this.updateMinimumsShown(); });

    minimums.on('set_da_distance_unit').handle((unit) => {
      // Since the G1000 sets both DA and DH units the same, we can always rely on just this event for our units.
      this.minimumsUnit.set(unit === 'meters' ? UnitType.METER : UnitType.FOOT);
    });

    minimums.on('decision_altitude_feet').handle((da) => {
      this.decisionAltitude.set(da, UnitType.FOOT);
    });

    minimums.on('decision_height_feet').handle((dh) => {
      this.decisionHeight.set(dh, UnitType.FOOT);
    });

    this.decisionAltitude.sub(v => {
      if (this.minimumsMode.get() === MinimumsMode.BARO) {
        this.minimumsValue.set(v.asUnit(this.minimumsUnit.getRaw()));
        this.updateMinimumsShown();
      }
    });

    this.decisionHeight.sub(v => {
      if (this.minimumsMode.get() === MinimumsMode.RA) {
        this.minimumsValue.set(v.asUnit(this.minimumsUnit.getRaw()));
        this.updateMinimumsShown();
      }
    });


    this.props.bus.getSubscriber<AdcEvents>().on('indicated_alt').withPrecision(0).handle(alt => {
      this.altitude = alt;
      if (this.minimumsMode.get() === MinimumsMode.BARO) {
        this.updateMinimumsShown();
      }
    });

    this.props.bus.getSubscriber<AdcEvents>().on('radio_alt').withPrecision(0).handle(alt => {
      this.radioAltitude = alt;
      if (this.minimumsMode.get() === MinimumsMode.RA) {
        this.updateMinimumsShown();
      }
    });

    // HINT: The AS1000 Modelbehavior for the CRS knob is looking for an lvar called PFD_CDI_Source
    // GPS = 3 or CDI indexes 1/2 for NAV
    this.props.bus.getSubscriber<NavEvents>().on('cdi_select').whenChanged().handle(cdi => {
      const lvarSource = cdi.type === NavSourceType.Gps ? 3 : cdi.index;
      SimVar.SetSimVarValue('L:PFD_CDI_Source', 'number', lvarSource);
    });

    this.props.bus.getSubscriber<AvionicsComputerSystemEvents>()
      .on('avionicscomputer_state_1')
      .handle(state => {
        if (state.index === 1) {
          if (state.current === AvionicsSystemState.On) {
            this.gpsMessage.instance.style.color = 'white';
            this.gpsMessage.instance.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
            this.gpsMessage.instance.textContent = 'GPS INTEG OK';

            setTimeout(() => this.gpsMessage.instance.classList.add('hidden'), 4000);
          } else {
            this.gpsMessage.instance.style.color = 'black';
            this.gpsMessage.instance.style.backgroundColor = 'yellow';
            this.gpsMessage.instance.textContent = 'GPS LOI';

            this.gpsMessage.instance.classList.remove('hidden');
          }
        }
      });

    //init mins to display = none
    this.minimumsContainerRef.instance.classList.add('hidden');

    PFDUserSettings.getManager(this.props.bus).whenSettingChanged('mapLayout').handle((mode) => {
      this.hsiController.onFormatChange(mode === PfdMapLayoutSettingMode.HSI);
      this.mapRef.instance.setVisible(mode === PfdMapLayoutSettingMode.HSI);
    });
  }


  /**
   * Updates the heading indicator when the heading changes.
   * @param selHdg deg The new heading value.
   */
  private updateSelectedHeadingDisplay(selHdg: number): void {
    this.headingSelectValue.set(selHdg);
  }

  /**
   * Updates whether or not the minimums box should be shown.
   */
  private updateMinimumsShown(): void {
    const minsMode = this.minimumsMode.get();
    this.minimumsModeDisplay.set(minsMode);
    let distanceFromMins = Number.MAX_SAFE_INTEGER;
    switch (minsMode) {
      case MinimumsMode.BARO:
        distanceFromMins = this.altitude - this.decisionAltitude.get().asUnit(UnitType.FOOT);
        this.minimumsValue.set(Math.round(this.decisionAltitude.get().asUnit(this.minimumsUnit.getRaw())));
        break;
      case MinimumsMode.RA:
        distanceFromMins = this.radioAltitude - this.decisionHeight.get().asUnit(UnitType.FOOT);
        this.minimumsValue.set(Math.round(this.decisionHeight.get().asUnit(this.minimumsUnit.getRaw())));
        break;
    }
    if (distanceFromMins <= 2500) {
      this.setMinsColor(distanceFromMins);
      this.minimumsContainerRef.instance.classList.remove('hidden');
    } else {
      this.minimumsContainerRef.instance.classList.add('hidden');
    }
  }

  /**
   * Sets the minimums color based on altitude distance from minimums.
   * @param distanceFromMins The distance, in feet, from the minimums target.
   */
  private setMinsColor(distanceFromMins: number): void {
    if (distanceFromMins <= 0) {
      this.minsValueRef.instance.classList.remove('cyan');
      this.minsValueRef.instance.classList.remove('white');
      this.minsValueRef.instance.classList.add('yellow');
    } else if (distanceFromMins <= 100) {
      this.minsValueRef.instance.classList.remove('cyan');
      this.minsValueRef.instance.classList.remove('yellow');
      this.minsValueRef.instance.classList.add('white');
    } else {
      this.minsValueRef.instance.classList.remove('white');
      this.minsValueRef.instance.classList.remove('yellow');
      this.minsValueRef.instance.classList.add('cyan');
    }
  }

  /**
   * Updates the dtk/obs-crs ref box.
   */
  public updateDtkBox = (): void => {
    switch (this.hsiController.navStates[this.hsiController.activeSourceIndex].source.type) {
      case NavSourceType.Nav:
        this.dtkBoxLabelSubj.set('CRS');
        this.dtkBoxValue.instance.style.color = '#00ff00';
        break;
      case NavSourceType.Gps:
        if (this.hsiController.obsSuspMode === ObsSuspModes.OBS) {
          this.dtkBoxLabelSubj.set('OBS');
        } else {
          this.dtkBoxLabelSubj.set('DTK');
        }
        this.dtkBoxValue.instance.style.color = 'magenta';
        break;
    }
    const dtk = this.hsiController.navStates[this.hsiController.activeSourceIndex].dtk_obs;
    if (dtk !== null) {
      const disDtk = Math.round(dtk) == 0 ? 360 : Math.round(dtk);
      this.dtkBoxValueSubj.set(disDtk);
    }
  };

  /**
   * Registers relevant components with the HSI Controller.
   */
  private registerComponents(): void {
    this.hsiController.onUpdateDtkBox = this.updateDtkBox;
    this.hsiController.hsiRefs.hsiRose = this.roseRef;
    this.hsiController.hsiRefs.hsiMap = this.mapRef;
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div id="HSI" class='Compass' data-checklist='Compass'>
        <div class="hdgcrs-container hdg-box">HDG <span class="cyan size20">{this.headingSelectValue}</span></div>
        <div class="hdgcrs-container dtk-box">
          <span>{this.dtkBoxLabelSubj}</span>&nbsp;
          <span ref={this.dtkBoxValue} class="size20">{this.dtkBoxValueSubj}</span>
        </div>
        <div class="mins-temp-comp-container" ref={this.minimumsContainerRef}>
          <div class="mins-temp-comp-upper-text size10">{this.minimumsModeDisplay}</div>
          <div class="mins-temp-comp-lower-text size14">MIN</div>
          <div class="mins-temp-comp-value size18" ref={this.minsValueRef}>{this.minimumsValue}<span class="size12">{this.minimumsUnit}</span></div>
        </div>
        <div class='hsi-gps-msg' ref={this.gpsMessage}>GPS LOI</div>
        <HSIRose ref={this.roseRef} bus={this.props.bus} controller={this.hsiController} unitsSettingManager={this.props.unitsSettingManager} />
        <HSIMap ref={this.mapRef} bus={this.props.bus} flightPlanner={this.props.flightPlanner} controller={this.hsiController} tas={this.props.tas} />
      </div >
    );
  }
}
