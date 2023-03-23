import { AdcEvents, ComponentProps, DisplayComponent, ElectricalEvents, EventBus, FSComponent, ObjectSubject, VNode } from '@microsoft/msfs-sdk';

import { CcpControlEvents, EngineIndicationDisplayMode } from '../../CCP/CcpControlEvents';
import { CompressedEngineIndicationDisplay } from './CompressedEngineIndicationDisplay';
import { EisEngineData, EisFadecData, EisInstrument, EisSurfacesData } from './EisData';
import { ExpandedEngineIndicationDisplay } from './ExpandedEngineIndicationDisplay';

/**
 * The properties for the EngineIndicationDisplayContainer component.
 */
interface EngineIndicationDisplayContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The engine data instrument */
  eis: EisInstrument;
}

/**
 * The EngineIndicationDisplayContainer component.
 */
export class EngineIndicationDisplayContainer extends DisplayComponent<EngineIndicationDisplayContainerProps> {
  private mode = EngineIndicationDisplayMode.Compressed;

  private readonly compressedEisRef = FSComponent.createRef<CompressedEngineIndicationDisplay>();
  private readonly expandedEisRef = FSComponent.createRef<ExpandedEngineIndicationDisplay>();

  private readonly engineDataHandler = this.onEngineDataUpdate.bind(this);
  private readonly surfaceDataHandler = this.onSurfacesDataUpdate.bind(this);

  public readonly fakeEngineData = ObjectSubject.create<EisEngineData>({
    n1_1: -1,
    n1_2: -1,
    n2_1: -1,
    n2_2: -1,
    itt_1: 0,
    itt_2: 0,
    oil_press_1: -1,
    oil_press_2: -1,
    oil_temp_1: -999,
    oil_temp_2: -999,
    fuel_flow_1: -1,
    fuel_flow_2: -1,
    fuel_temp_1: -999,
    fuel_temp_2: -999,
    fuel_left: -1,
    fuel_right: -1,
    eng_hyd_press_1: 0,
    eng_hyd_press_2: 0,
    eng_starter_on_1: false,
    eng_starter_on_2: false,
    eng_combustion_1: false,
    eng_combustion_2: false,
    eng_ignition_switch_state_1: 0,
    eng_ignition_switch_state_2: 0,
  });

  public readonly fakeSurfacesData = ObjectSubject.create<EisSurfacesData>({
    flaps_left_angle: -1,
    elevator_trim_pct: 0,
    elevator_trim_neutral_pct: 0,
    aileron_trim_pct: 0,
    rudder_trim_pct: 0,
    gear_position: 0,
  });

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.eis.fadecData.sub(this.onFadecDataUpdate.bind(this), true);
    this.updateEisFormat();

    this.props.bus.getSubscriber<AdcEvents>().on('on_ground').whenChanged().handle((v: boolean) => {
      this.compressedEisRef.instance.updateOnGround(v);
      this.expandedEisRef.instance.updateOnGround(v);
    });

    this.props.bus.getSubscriber<CcpControlEvents>().on('ccp_eng_state').handle(x => {
      this.mode = x;
      this.updateEisFormat();
    });

    // Faking some of the boot up sequence
    const elecSub = this.props.bus.getSubscriber<ElectricalEvents>();
    elecSub.on('elec_av2_bus').whenChanged().handle((status: boolean): void => {
      if (status === true) {
        this.wireUpRealEisData();
      } else {
        this.wireUpInvalidEisData();
      }
    });
  }

  /**
   * Unhooks the fake EIS data and wires up the real data providers.
   */
  private wireUpRealEisData(): void {
    this.fakeEngineData.unsub(this.engineDataHandler);
    this.fakeSurfacesData.unsub(this.surfaceDataHandler);
    setTimeout(() => {
      this.compressedEisRef.instance.updateOnGround(true);
      this.expandedEisRef.instance.updateOnGround(true);
    }, 750);
    setTimeout(() => {
      this.props.eis.surfacesData.sub(this.surfaceDataHandler, true);
    }, 1100);
    setTimeout(() => {
      this.props.eis.engineData.sub(this.engineDataHandler, true);
    }, 1500);
  }

  /**
   * Unhooks the real EIS data and wires up the fake data providers.
   */
  private wireUpInvalidEisData(): void {
    this.compressedEisRef.instance.updateOnGround(false);
    this.expandedEisRef.instance.updateOnGround(false);
    this.props.eis.engineData.unsub(this.engineDataHandler);
    this.props.eis.surfacesData.unsub(this.surfaceDataHandler);
    this.fakeEngineData.sub(this.engineDataHandler, true);
    this.fakeSurfacesData.sub(this.surfaceDataHandler, true);
  }

  /**
   * Switches the displayed EIS format.
   */
  private updateEisFormat(): void {
    if (this.mode === EngineIndicationDisplayMode.Compressed) {
      this.expandedEisRef.getOrDefault()?.pause();
      this.compressedEisRef.getOrDefault()?.resume();
    } else {
      this.expandedEisRef.getOrDefault()?.resume();
      this.compressedEisRef.getOrDefault()?.pause();
    }
  }

  /**
   * Called when the engine data updates.
   * @param data The engine data.
   * @param prop The engine property that changed.
   * @param newValue The new value of the property.
   */
  private onEngineDataUpdate(data: EisEngineData, prop: keyof EisEngineData, newValue: any): void {
    this.compressedEisRef.instance.updateEngineData(prop, newValue);
    this.expandedEisRef.instance.updateEngineData(prop, newValue);
  }

  /**
   * Called when the surfaces data updates.
   * @param data The surfaces data.
   * @param prop The surfaces property that changed.
   * @param newValue The new value of the property.
   */
  private onSurfacesDataUpdate(data: EisSurfacesData, prop: keyof EisSurfacesData, newValue: number): void {
    this.compressedEisRef.instance.updateSurfacesData(prop, newValue);
    this.expandedEisRef.instance.updateSurfacesData(prop, newValue);
  }

  /**
   * Called when the FADEC data updates.
   * @param data The FADEC data.
   * @param prop The FADEC property that changed.
   * @param newValue The new value of the property.
   */
  private onFadecDataUpdate(data: EisFadecData, prop: keyof EisFadecData, newValue: EisFadecData[keyof EisFadecData]): void {
    this.compressedEisRef.instance.updateFadecData(prop, newValue);
    this.expandedEisRef.instance.updateFadecData(prop, newValue);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <CompressedEngineIndicationDisplay ref={this.compressedEisRef} />
        <ExpandedEngineIndicationDisplay ref={this.expandedEisRef} />
      </>
    );
  }
}