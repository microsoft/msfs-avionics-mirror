import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { SystemsPageComponent } from '@microsoft/msfs-wt21-mfd';

import { EisElectricsData, EisEngineData, EisInstrument } from '../EngineIndication/EisData';
import { Battery } from './SystemsComponents/Battery';
import { DCElec } from './SystemsComponents/DCElec';
import { HydraulicsAndFuel } from './SystemsComponents/HydraulicsAndFuel';
import { OxygenPressure } from './SystemsComponents/OxygenPressure';

/**
 * The properties for the Systems1 component.
 */
interface Systems1Props extends ComponentProps {
  /** The engine data instrument */
  eis: EisInstrument;
}

/**
 * The Systems1 component.
 */
export class Systems1 extends DisplayComponent<Systems1Props> implements SystemsPageComponent {
  private readonly systems1Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly dcElecRef = FSComponent.createRef<DCElec>();
  private readonly batteryRef = FSComponent.createRef<Battery>();
  private readonly hydFuelRef = FSComponent.createRef<HydraulicsAndFuel>();

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.props.eis.elecData.sub(this.onElecDataUpdate.bind(this), true);
    this.props.eis.engineData.sub(this.onEngineDataUpdate.bind(this), true);
  }

  /**
   * Sets the visibility of this display.
   * @param isVisible Whether this display is visible.
   */
  public setVisibility(isVisible: boolean): void {
    this.systems1Ref.instance.classList.toggle('hidden', !isVisible);
  }

  /**
   * Called when the engine data updates.
   * @param data The engine data.
   * @param prop The engine property that changed.
   * @param newValue The new value of the property.
   */
  private onEngineDataUpdate(data: EisEngineData, prop: keyof EisEngineData, newValue: any): void {
    switch (prop) {
      case 'fuel_flow_1':
        this.hydFuelRef.instance.updateFuelFlowLeft(newValue);
        break;
      case 'fuel_flow_2':
        this.hydFuelRef.instance.updateFuelFlowRight(newValue);
        break;
      case 'fuel_temp_1':
        this.hydFuelRef.instance.updateFuelTempLeft(newValue);
        break;
      case 'fuel_temp_2':
        this.hydFuelRef.instance.updateFuelTempRight(newValue);
        break;
      case 'eng_hyd_press_1':
        this.hydFuelRef.instance.updateHydPressLeft(newValue);
        break;
      case 'eng_hyd_press_2':
        this.hydFuelRef.instance.updateHydPressRight(newValue);
        break;
    }
  }

  /**
   * Called when the electrics data updates.
   * @param data The electrics data.
   * @param prop The electrics property that changed.
   * @param newValue The new value of the property.
   */
  private onElecDataUpdate(data: EisElectricsData, prop: keyof EisElectricsData, newValue: number): void {
    switch (prop) {
      case 'elec_bus_main_v_3':
        this.batteryRef.instance.updateVoltage(newValue);
        break;
      case 'elec_bat_a_1':
        this.batteryRef.instance.updateCurrent(newValue);
        break;
      case 'elec_bus_genalt_1_v':
        this.dcElecRef.instance.updateVoltageBus1(newValue);
        break;
      case 'elec_bus_genalt_1_a':
        this.dcElecRef.instance.updateAmpBus1(newValue);
        break;
      case 'elec_bus_genalt_2_v':
        this.dcElecRef.instance.updateVoltageBus2(newValue);
        break;
      case 'elec_bus_genalt_2_a':
        this.dcElecRef.instance.updateAmpBus2(newValue);
        break;
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="systems1-data-container hidden" ref={this.systems1Ref}>
        <DCElec ref={this.dcElecRef} />
        <Battery ref={this.batteryRef} />
        <OxygenPressure />
        <HydraulicsAndFuel ref={this.hydFuelRef} />
      </div>
    );
  }
}
