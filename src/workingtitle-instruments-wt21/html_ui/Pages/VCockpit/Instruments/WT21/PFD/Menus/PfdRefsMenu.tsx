/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ClockEvents, EventBus, FacilityLoader, FacilityRepository, FacilityType, FlightPlanner, FlightPlannerEvents, FSComponent, MinimumsEvents, MinimumsMode,
  MutableSubscribable,
  NodeReference,
  Subject, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { CheckBoxNumeric } from '../../Shared/Menus/Components/CheckboxNumeric';
import { PopupMenuSection } from '../../Shared/Menus/Components/PopupMenuSection';
import { PopupSubMenu } from '../../Shared/Menus/Components/PopupSubMenu';
import { RadioBoxNumeric } from '../../Shared/Menus/Components/RadioboxNumeric';
import { RefsUserSettings } from '../../Shared/Profiles/RefsUserSettings';
import { VSpeedUserSettings } from '../../Shared/Profiles/VSpeedUserSettings';
import { VSpeedType } from '../../Shared/ReferenceSpeeds';
import { GuiDialog, GuiDialogProps } from '../../Shared/UI/GuiDialog';

import './PfdRefsMenu.css';

/** @inheritdoc */
interface PfdRefsMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  planner: FlightPlanner;
}

/**
 * The PfdMenu component.
 */
export class PfdRefsMenu extends GuiDialog<PfdRefsMenuProps> {
  private readonly vSpeedSettings = new VSpeedUserSettings(this.props.bus);

  private readonly VSpeedUiRefs = new Map<VSpeedType, NodeReference<CheckBoxNumeric>>([
    [VSpeedType.V1, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.V2, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Vr, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Venr, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Vapp, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Vref, new NodeReference<CheckBoxNumeric>()],
  ]);

  private readonly VSpeedValues = new Map<VSpeedType, MutableSubscribable<number>>([
    [VSpeedType.V1, this.vSpeedSettings.getSettings(VSpeedType.V1).get('value')! as MutableSubscribable<number>],
    [VSpeedType.V2, this.vSpeedSettings.getSettings(VSpeedType.V2).get('value')! as MutableSubscribable<number>],
    [VSpeedType.Vr, this.vSpeedSettings.getSettings(VSpeedType.Vr).get('value')! as MutableSubscribable<number>],
    [VSpeedType.Venr, this.vSpeedSettings.getSettings(VSpeedType.Venr).get('value')! as MutableSubscribable<number>],
    [VSpeedType.Vapp, this.vSpeedSettings.getSettings(VSpeedType.Vapp).get('value')! as MutableSubscribable<number>],
    [VSpeedType.Vref, this.vSpeedSettings.getSettings(VSpeedType.Vref).get('value')! as MutableSubscribable<number>],
  ]);

  private readonly VSpeedStates = new Map<VSpeedType, MutableSubscribable<boolean>>([
    [VSpeedType.V1, this.vSpeedSettings.getSettings(VSpeedType.V1).get('show')! as MutableSubscribable<boolean>],
    [VSpeedType.V2, this.vSpeedSettings.getSettings(VSpeedType.V2).get('show')! as MutableSubscribable<boolean>],
    [VSpeedType.Vr, this.vSpeedSettings.getSettings(VSpeedType.Vr).get('show')! as MutableSubscribable<boolean>],
    [VSpeedType.Venr, this.vSpeedSettings.getSettings(VSpeedType.Venr).get('show')! as MutableSubscribable<boolean>],
    [VSpeedType.Vapp, this.vSpeedSettings.getSettings(VSpeedType.Vapp).get('show')! as MutableSubscribable<boolean>],
    [VSpeedType.Vref, this.vSpeedSettings.getSettings(VSpeedType.Vref).get('show')! as MutableSubscribable<boolean>],
  ]);

  private readonly VSpeedCssClasses = new Map<VSpeedType, Subject<string>>([
    [VSpeedType.V1, Subject.create('')],
    [VSpeedType.Vr, Subject.create('')],
    [VSpeedType.V2, Subject.create('')],
    [VSpeedType.Venr, Subject.create('')],
    [VSpeedType.Vapp, Subject.create('')],
    [VSpeedType.Vref, Subject.create('')]
  ]);

  // private readonly VSpeedStateSubscriptions = new Map<VSpeedType, (s: boolean) => void>();

  private readonly rs = RefsUserSettings.getManager(this.props.bus);


  private readonly destElevSubject = Subject.create<number | string>('--');
  private readonly destElevRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly minimumsSelectedIndex = Subject.create(MinimumsMode.OFF);
  private readonly baroMinimums = Subject.create(-1);
  private readonly raMinimums = Subject.create(-1);
  private _now = 0;
  private debounceTimer = 0;
  private isBusy = false;

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    for (const [type, uiRef] of this.VSpeedUiRefs.entries()) {
      const settings = this.vSpeedSettings.getSettings(type);
      uiRef.instance.props.onValueChanged = () => {
        settings.get('manual')?.set(true);
      };
      settings.get('manual')?.sub((v) => {
        this.VSpeedCssClasses.get(type)?.set((v as boolean) === true ? '' : 'magenta');
      }, true);
    }

    this.props.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(100).handle(this.onClock.bind(this));

    const mins = this.props.bus.getSubscriber<MinimumsEvents>();
    mins.on('minimums_mode').handle((v) => {
      if (this.isBusy) { return; }
      this.minimumsSelectedIndex.set(v);
      this.rs.getSetting('minsmode').value = v;
    });
    mins.on('decision_altitude_feet').handle((v) => {
      if (this.isBusy) { return; }
      this.baroMinimums.set(v);
      if (v > 0) {
        this.rs.getSetting('baromins').value = v;
      }
    });
    mins.on('decision_height_feet').handle((v) => {
      if (this.isBusy) { return; }
      this.raMinimums.set(v);
      if (v > 0) {
        this.rs.getSetting('radiomins').value = v;
      }
    });

    const minsPub = this.props.bus.getPublisher<MinimumsEvents>();
    this.minimumsSelectedIndex.sub(v => {
      this.isBusy = true;
      this.debounceTimer = this._now;
      minsPub.pub('set_minimums_mode', v, false, true);
    });
    this.baroMinimums.sub(v => {
      this.isBusy = true;
      this.debounceTimer = this._now;
      minsPub.pub('set_decision_altitude_feet', v, true, true);
    });
    this.raMinimums.sub(v => {
      this.isBusy = true;
      this.debounceTimer = this._now;
      minsPub.pub('set_decision_height_feet', v, true, true);
    });

    // set saved setting values on load
    this.minimumsSelectedIndex.set(this.rs.getSetting('minsmode').value);
    this.baroMinimums.set(this.rs.getSetting('baromins').value);
    this.raMinimums.set(this.rs.getSetting('radiomins').value);

    const planEvents = this.props.bus.getSubscriber<FlightPlannerEvents>();
    planEvents.on('fplCopied').handle(async () => {
      this.handleDestinationElevation();
    });

    this.handleDestinationElevation();
  }

  /**
   * Updates the time; resets the isBusy flag.
   * @param time The real time.
   */
  private onClock(time: number): void {
    this._now = time;
    if (this._now - this.debounceTimer > 500) {
      this.isBusy = false;
    }
  }


  /**
   * A callback called when the destination elevation is updated
   */
  private async handleDestinationElevation(): Promise<void> {
    const plan = this.props.planner.getActiveFlightPlan();
    const facilityLoader = new FacilityLoader(FacilityRepository.getRepository(this.props.bus));
    if (plan.destinationAirport !== undefined) {
      const airport = await facilityLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
      const elevation = airport.runways[0].elevation;
      this.destElevSubject.set(elevation !== undefined ? Math.round(UnitType.METER.convertTo(elevation, UnitType.FOOT)) : '--');
      this.destElevRef.instance?.classList.toggle('magenta-text', elevation !== undefined);
    } else {
      this.destElevSubject.set('--');
      this.destElevRef.instance?.classList.remove('magenta-text');
    }
  }


  /**
   * A callback called when a VSpeed value needs to be published
   * @param type The VSpeed type.
   * @param value The VSpeed value.
   * @param enabled The VSpeed state.
   */
  private publishVSpeed = (type: VSpeedType, value: number, enabled: boolean): void => {
    // const publisher = this.props.bus.getPublisher<ReferenceSpeedEvents>();
    // publisher.pub('vspeed', { type: type, value: value, enabled: enabled, modified: true }, true, true);
    const setting = this.vSpeedSettings.getSettings(type);
    setting.get('value')?.set(value);
    setting.get('manual')?.set(value);
    setting.get('show')?.set(enabled);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupSubMenu label="PFD MENU" sublabel="REFS" class="pfd-popup-menu-refs">
          <PopupMenuSection label="SPEEDS">
            <CheckBoxNumeric ref={this.VSpeedUiRefs.get(VSpeedType.V1)} label="V1" checkedDataRef={this.VSpeedStates.get(VSpeedType.V1)!} dataRef={this.VSpeedValues.get(VSpeedType.V1)!} min={40} max={200} cssClasses={this.VSpeedCssClasses.get(VSpeedType.V1)} />
            <CheckBoxNumeric ref={this.VSpeedUiRefs.get(VSpeedType.Vr)} label="VR" checkedDataRef={this.VSpeedStates.get(VSpeedType.Vr)!} dataRef={this.VSpeedValues.get(VSpeedType.Vr)!} min={this.VSpeedValues.get(VSpeedType.V1)} max={200} cssClasses={this.VSpeedCssClasses.get(VSpeedType.Vr)} />
            <CheckBoxNumeric ref={this.VSpeedUiRefs.get(VSpeedType.V2)} label="V2" checkedDataRef={this.VSpeedStates.get(VSpeedType.V2)!} dataRef={this.VSpeedValues.get(VSpeedType.V2)!} min={this.VSpeedValues.get(VSpeedType.Vr)} max={200} cssClasses={this.VSpeedCssClasses.get(VSpeedType.V2)} />
            <CheckBoxNumeric ref={this.VSpeedUiRefs.get(VSpeedType.Venr)} label="VT" checkedDataRef={this.VSpeedStates.get(VSpeedType.Venr)!} dataRef={this.VSpeedValues.get(VSpeedType.Venr)!} min={this.VSpeedValues.get(VSpeedType.V2)} max={200} cssClasses={this.VSpeedCssClasses.get(VSpeedType.Venr)} />
          </PopupMenuSection>
          <PopupMenuSection>
            <CheckBoxNumeric ref={this.VSpeedUiRefs.get(VSpeedType.Vapp)} label="VAP" checkedDataRef={this.VSpeedStates.get(VSpeedType.Vapp)!} dataRef={this.VSpeedValues.get(VSpeedType.Vapp)!} min={40} max={200} cssClasses={this.VSpeedCssClasses.get(VSpeedType.Vapp)} />
            <CheckBoxNumeric ref={this.VSpeedUiRefs.get(VSpeedType.Vref)} label="VRF" checkedDataRef={this.VSpeedStates.get(VSpeedType.Vref)!} dataRef={this.VSpeedValues.get(VSpeedType.Vref)!} min={40} max={200} cssClasses={this.VSpeedCssClasses.get(VSpeedType.Vref)} />
          </PopupMenuSection>
          <PopupMenuSection label="MINIMUMS">
            <RadioBoxNumeric label="OFF" index={MinimumsMode.OFF} selectedIndex={this.minimumsSelectedIndex} />
            <RadioBoxNumeric label="BARO" index={MinimumsMode.BARO} selectedIndex={this.minimumsSelectedIndex} dataRef={this.baroMinimums} increments={10} />
            <RadioBoxNumeric label="RA" index={MinimumsMode.RA} selectedIndex={this.minimumsSelectedIndex} dataRef={this.raMinimums} max={2500} />
          </PopupMenuSection>
          <PopupMenuSection>
            <div class="refs-menu-dest-elv">DEST ELV <span class="magenta-text">FMS</span></div>
            <div class="refs-menu-dest-elv-value"><span ref={this.destElevRef}>{this.destElevSubject}</span> FT</div>
          </PopupMenuSection>
        </PopupSubMenu>
      </>
    );
  }
}