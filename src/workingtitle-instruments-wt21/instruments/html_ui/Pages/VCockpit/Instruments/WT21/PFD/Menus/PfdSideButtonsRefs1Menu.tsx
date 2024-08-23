import {
  ClockEvents, EventBus, FlightPlanner, FocusPosition, FSComponent, MinimumsEvents, MinimumsMode, MutableSubscribable, NodeReference, Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  CheckBoxNumeric, CheckBoxNumericStyle, GuiDialog, GuiDialogProps, GuiHEvent, PopupSubMenu, RefsUserSettings, VSpeedType, VSpeedUserSettings
} from '@microsoft/msfs-wt21-shared';

import './PfdSideButtonsRefsMenu.css';

/**
 * Props for {@link PfdSideButtonsRefs1Menu}
 */
export interface PfdSideButtonsRefs1MenuProps extends GuiDialogProps {
  /** The event bus */
  bus: EventBus,

  /** An instance of the flight planner. */
  planner: FlightPlanner;
}

/**
 * PFD (side button layout) REFS menu
 */
export class PfdSideButtonsRefs1Menu extends GuiDialog<PfdSideButtonsRefs1MenuProps> {
  private readonly vSpeedSettings = new VSpeedUserSettings(this.props.bus);

  private readonly VSpeedUiRefs = new Map<VSpeedType, NodeReference<CheckBoxNumeric>>([
    [VSpeedType.V1, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.V2, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Vr, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Venr, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Vapp, new NodeReference<CheckBoxNumeric>()],
    [VSpeedType.Vref, new NodeReference<CheckBoxNumeric>()],
  ]);

  private readonly raMinRef = FSComponent.createRef<CheckBoxNumeric>();

  private readonly baroMinRef = FSComponent.createRef<CheckBoxNumeric>();

  private readonly VSpeedValues: Record<VSpeedType, MutableSubscribable<number>> = {
    [VSpeedType.V1]: this.vSpeedSettings.getSettings(VSpeedType.V1).value,
    [VSpeedType.V2]: this.vSpeedSettings.getSettings(VSpeedType.V2).value,
    [VSpeedType.Vr]: this.vSpeedSettings.getSettings(VSpeedType.Vr).value,
    [VSpeedType.Venr]: this.vSpeedSettings.getSettings(VSpeedType.Venr).value,
    [VSpeedType.Vapp]: this.vSpeedSettings.getSettings(VSpeedType.Vapp).value,
    [VSpeedType.Vref]: this.vSpeedSettings.getSettings(VSpeedType.Vref).value,
  };

  private readonly VSpeedStates: Record<VSpeedType, MutableSubscribable<boolean>> = {
    [VSpeedType.V1]: this.vSpeedSettings.getSettings(VSpeedType.V1).show,
    [VSpeedType.V2]: this.vSpeedSettings.getSettings(VSpeedType.V2).show,
    [VSpeedType.Vr]: this.vSpeedSettings.getSettings(VSpeedType.Vr).show,
    [VSpeedType.Venr]: this.vSpeedSettings.getSettings(VSpeedType.Venr).show,
    [VSpeedType.Vapp]: this.vSpeedSettings.getSettings(VSpeedType.Vapp).show,
    [VSpeedType.Vref]: this.vSpeedSettings.getSettings(VSpeedType.Vref).show,
  };

  private readonly VSpeedCssClasses = new Map<VSpeedType, Subject<string>>([
    [VSpeedType.V1, Subject.create('')],
    [VSpeedType.Vr, Subject.create('')],
    [VSpeedType.V2, Subject.create('')],
    [VSpeedType.Venr, Subject.create('')],
    [VSpeedType.Vapp, Subject.create('')],
    [VSpeedType.Vref, Subject.create('')]
  ]);

  private readonly rs = RefsUserSettings.getManager(this.props.bus);

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
        settings.manual.set(true);
      };
      settings.manual.sub((v) => {
        this.VSpeedCssClasses.get(type)?.set((v as boolean) ? '' : 'magenta');
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
  }

  /** @inheritDoc */
  public onInteractionEvent(evt: GuiHEvent): boolean {
    switch (evt) {
      case GuiHEvent.SOFTKEY_1L: return this.VSpeedUiRefs.get(VSpeedType.Venr)?.instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_2L: return this.VSpeedUiRefs.get(VSpeedType.V2)?.instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_3L: return this.VSpeedUiRefs.get(VSpeedType.Vr)?.instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_4L: return this.VSpeedUiRefs.get(VSpeedType.V1)?.instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_1R: return this.raMinRef.instance.focus(FocusPosition.None);
      case GuiHEvent.SOFTKEY_2R: return this.baroMinRef.instance.focus(FocusPosition.None);
      case GuiHEvent.SOFTKEY_3R: return this.VSpeedUiRefs.get(VSpeedType.Vapp)?.instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_4R: return this.VSpeedUiRefs.get(VSpeedType.Vref)?.instance.focus(FocusPosition.None) ?? false;
    }

    return super.onInteractionEvent(evt);
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <PopupSubMenu label="REFS 1/2" class="pfd-popup-refs-1" showBorder={false}>
          <CheckBoxNumeric
            ref={this.VSpeedUiRefs.get(VSpeedType.Venr)}
            label="VT"
            checkedDataRef={this.VSpeedStates[VSpeedType.Venr]}
            dataRef={this.VSpeedValues[VSpeedType.Venr]}
            min={this.VSpeedValues[VSpeedType.V2]}
            max={200}
            style={CheckBoxNumericStyle.SideButtonBound}
            cssClasses={this.VSpeedCssClasses.get(VSpeedType.Venr)}
          />
          <CheckBoxNumeric
            ref={this.VSpeedUiRefs.get(VSpeedType.V2)}
            label="V2"
            checkedDataRef={this.VSpeedStates[VSpeedType.V2]}
            dataRef={this.VSpeedValues[VSpeedType.V2]}
            min={this.VSpeedValues[VSpeedType.Vr]}
            max={200}
            style={CheckBoxNumericStyle.SideButtonBound}
            cssClasses={this.VSpeedCssClasses.get(VSpeedType.V2)}
          />
          <CheckBoxNumeric
            ref={this.VSpeedUiRefs.get(VSpeedType.Vr)}
            label="VR"
            checkedDataRef={this.VSpeedStates[VSpeedType.Vr]}
            dataRef={this.VSpeedValues[VSpeedType.Vr]}
            min={this.VSpeedValues[VSpeedType.V1]}
            max={200}
            style={CheckBoxNumericStyle.SideButtonBound}
            cssClasses={this.VSpeedCssClasses.get(VSpeedType.Vr)}
          />
          <CheckBoxNumeric
            ref={this.VSpeedUiRefs.get(VSpeedType.V1)}
            label="V1"
            checkedDataRef={this.VSpeedStates[VSpeedType.V1]}
            dataRef={this.VSpeedValues[VSpeedType.V1]}
            min={40}
            max={200}
            style={CheckBoxNumericStyle.SideButtonBound}
            cssClasses={this.VSpeedCssClasses.get(VSpeedType.V1)}
          />
        </PopupSubMenu>

        <PopupSubMenu label="REFS 1/2" class="pfd-popup-refs-2" showBorder={false}>
          <CheckBoxNumeric
            ref={this.raMinRef}
            label="RA MIN"
            checkedDataRef={this.minimumsSelectedIndex.map((index) => index === MinimumsMode.RA)}
            onCheckedChanged={(newValue) => this.minimumsSelectedIndex.set(newValue ? MinimumsMode.RA : MinimumsMode.OFF)}
            dataRef={this.raMinimums}
            max={2500}
            style={CheckBoxNumericStyle.SideButtonBound}
            orientation="right"
          />

          <CheckBoxNumeric
            ref={this.baroMinRef}
            label="BARO MIN"
            checkedDataRef={this.minimumsSelectedIndex.map((index) => index === MinimumsMode.BARO)}
            onCheckedChanged={(newValue) => this.minimumsSelectedIndex.set(newValue ? MinimumsMode.BARO : MinimumsMode.OFF)}
            dataRef={this.baroMinimums}
            increments={10}
            style={CheckBoxNumericStyle.SideButtonBound}
            orientation="right"
          />

          <CheckBoxNumeric
            ref={this.VSpeedUiRefs.get(VSpeedType.Vapp)}
            label="VAP"
            checkedDataRef={this.VSpeedStates[VSpeedType.Vapp]}
            dataRef={this.VSpeedValues[VSpeedType.Vapp]}
            min={40}
            max={200}
            style={CheckBoxNumericStyle.SideButtonBound}
            orientation="right"
            cssClasses={this.VSpeedCssClasses.get(VSpeedType.Vapp)}
          />

          <CheckBoxNumeric
            ref={this.VSpeedUiRefs.get(VSpeedType.Vref)}
            label="VRF"
            checkedDataRef={this.VSpeedStates[VSpeedType.Vref]}
            dataRef={this.VSpeedValues[VSpeedType.Vref]}
            min={40}
            max={200}
            style={CheckBoxNumericStyle.SideButtonBound}
            orientation="right"
            cssClasses={this.VSpeedCssClasses.get(VSpeedType.Vref)}
          />
        </PopupSubMenu>
      </div>
    );
  }
}
