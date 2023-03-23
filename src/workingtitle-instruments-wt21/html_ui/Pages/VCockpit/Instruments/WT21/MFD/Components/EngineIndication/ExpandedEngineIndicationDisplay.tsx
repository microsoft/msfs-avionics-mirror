import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { N2Display } from './DisplayComponents/N2Display';
import { AileronRudderTrimDisplay } from './DisplayComponents/AileronRudderTrimDisplay';
import { ElevatorTrimDisplay } from './DisplayComponents/ElevatorTrimDisplay';
import { FlapPositionDisplay } from './DisplayComponents/FlapPositionDisplay';
import { IgnitionIndicator } from './DisplayComponents/IgnitionIndicator';
import { EisEngineData, EisFadecData, EisSurfacesData } from './EisData';
import { EngineIndicationDisplayBase } from './EngineIndicationDisplayBase';
import { ExpandedFuelDisplay } from './ExpandedFormat/ExpandedFuelDisplay';
import { ExpandedITTDisplay } from './ExpandedFormat/ExpandedITTDisplay';
import { ExpandedN1Display } from './ExpandedFormat/ExpandedN1Display';
import { ExpandedOilPressTempDisplay } from './ExpandedFormat/ExpandedOilPressTempDisplay';

import './ExpandedEngineIndicationDisplay.css';

/**
 * The ExpandedEngineIndicationDisplay component.
 */
export class ExpandedEngineIndicationDisplay extends EngineIndicationDisplayBase {
  private readonly n1Ref = FSComponent.createRef<ExpandedN1Display>();
  private readonly ittRef = FSComponent.createRef<ExpandedITTDisplay>();
  private readonly n2Ref = FSComponent.createRef<N2Display>();
  private readonly oilRef = FSComponent.createRef<ExpandedOilPressTempDisplay>();
  private readonly fuelRef = FSComponent.createRef<ExpandedFuelDisplay>();
  private readonly ailRudTrimRef = FSComponent.createRef<AileronRudderTrimDisplay>();
  private readonly elevTrimRef = FSComponent.createRef<ElevatorTrimDisplay>();
  private readonly flapsRef = FSComponent.createRef<FlapPositionDisplay>();
  private readonly ignLeftRef = FSComponent.createRef<IgnitionIndicator>();
  private readonly ignRightRef = FSComponent.createRef<IgnitionIndicator>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isOnGround.sub((v: boolean) => {
      this.elevTrimRef.instance.setGreenboxVisibility(v);
      this.ailRudTrimRef.instance.setGreenboxVisibility(v);
      this.ignLeftRef.instance.updateOnGround(v);
      this.ignRightRef.instance.updateOnGround(v);
    }, true);
  }

  /** @inheritdoc */
  public updateEngineData(prop: keyof EisEngineData, value: any): void {
    switch (prop) {
      case 'n1_1':
        this.n1Ref.instance.updateN1Left(value);
        break;
      case 'n1_2':
        this.n1Ref.instance.updateN1Right(value);
        break;
      case 'itt_1':
        this.ittRef.instance.updateIttLeft(value);
        break;
      case 'itt_2':
        this.ittRef.instance.updateIttRight(value);
        break;
      case 'n2_1':
        this.n2Ref.instance.updateN2Left(value);
        break;
      case 'n2_2':
        this.n2Ref.instance.updateN2Right(value);
        break;
      case 'oil_temp_1':
        this.oilRef.instance.updateOilTempLeft(value);
        break;
      case 'oil_temp_2':
        this.oilRef.instance.updateOilTempRight(value);
        break;
      case 'oil_press_1':
        this.oilRef.instance.updateOilPressureLeft(value);
        break;
      case 'oil_press_2':
        this.oilRef.instance.updateOilPressureRight(value);
        break;
      case 'fuel_flow_1':
        this.fuelRef.instance.updateFuelFlowLeft(value);
        break;
      case 'fuel_flow_2':
        this.fuelRef.instance.updateFuelFlowRight(value);
        break;
      case 'fuel_temp_1':
        this.fuelRef.instance.updateFuelTempLeft(value);
        break;
      case 'fuel_temp_2':
        this.fuelRef.instance.updateFuelTempRight(value);
        break;
      case 'fuel_left':
        this.fuelRef.instance.updateFuelQuantityLeft(value);
        break;
      case 'fuel_right':
        this.fuelRef.instance.updateFuelQuantityRight(value);
        break;
      case 'eng_starter_on_1':
        this.ignLeftRef.instance.updateStarter(value);
        this.ittRef.instance.updateStarter(value, 1);
        break;
      case 'eng_starter_on_2':
        this.ignRightRef.instance.updateStarter(value);
        this.ittRef.instance.updateStarter(value, 2);
        break;
      case 'eng_combustion_1':
        this.ignLeftRef.instance.updateCombustion(value);
        this.ittRef.instance.updateCombustion(value, 1);
        break;
      case 'eng_combustion_2':
        this.ignRightRef.instance.updateCombustion(value);
        this.ittRef.instance.updateCombustion(value, 2);
        break;
      case 'eng_ignition_switch_state_1':
        this.ignLeftRef.instance.updateIgnitionOn(value);
        break;
      case 'eng_ignition_switch_state_2':
        this.ignRightRef.instance.updateIgnitionOn(value);
        break;

    }
  }

  /** @inheritdoc */
  public updateSurfacesData(prop: keyof EisSurfacesData, value: number): void {
    switch (prop) {
      case 'flaps_left_angle':
        this.flapsRef.instance.update(value);
        break;
      case 'elevator_trim_pct':
        this.elevTrimRef.instance.update(value);
        break;
      case 'aileron_trim_pct':
        this.ailRudTrimRef.instance.updateAileronTrim(value);
        break;
      case 'rudder_trim_pct':
        this.ailRudTrimRef.instance.updateRudderTrim(value);
        break;
      case 'gear_position':
        this.ignLeftRef.instance.updateGearDown(value);
        this.ignRightRef.instance.updateGearDown(value);
        break;
    }
  }

  /** @inheritdoc */
  public updateFadecData<K extends keyof EisFadecData>(prop: K, value: EisFadecData[K]): void {
    switch (prop) {
      case 'fadec_mode_1':
        this.n1Ref.instance.updateFadecModeLeft(value as string);
        break;
      case 'fadec_mode_2':
        this.n1Ref.instance.updateFadecModeRight(value as string);
        break;
      case 'fadec_tgt_n1_1':
        this.n1Ref.instance.updateN1TargetLeft(value as number);
        break;
      case 'fadec_tgt_n1_2':
        this.n1Ref.instance.updateN1TargetRight(value as number);
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="eis-expanded-container" ref={this.containerRef}>
        <div class="eis-expanded-primary-group">
          <ExpandedN1Display ref={this.n1Ref} />
          <IgnitionIndicator class="eis-expanded-ign-left" ref={this.ignLeftRef} />
          <ExpandedITTDisplay ref={this.ittRef} />
          <IgnitionIndicator class="eis-expanded-ign-right" ref={this.ignRightRef} />
        </div>
        <div class="eis-expanded-secondary-group">
          <N2Display ref={this.n2Ref} />
          <ExpandedOilPressTempDisplay ref={this.oilRef} />
          <ExpandedFuelDisplay ref={this.fuelRef} />
        </div>
        <div class="eis-expanded-flight-control-group">
          <svg height="225" width="190" class="eis-expanded-trim-label">
            <line x1="10" y1="14" x2="70" y2="14" stroke="var(--wt21-colors-white)" stroke-width="1" />
            <text x="75" y="20" fill="var(--wt21-colors-white)" font-size="20">TRIM</text>
            <line x1="125" y1="14" x2="185" y2="14" stroke="var(--wt21-colors-white)" stroke-width="1" />
            <text x="60" y="190" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">ELEV</text>
          </svg>
          <div class="eis-expanded-ailrud-trim">
            <AileronRudderTrimDisplay ref={this.ailRudTrimRef} />
          </div>
          <div class="eis-expanded-elevator-trim">
            <ElevatorTrimDisplay ref={this.elevTrimRef} />
          </div>
          <div class="eis-expanded-flap-position">
            <FlapPositionDisplay ref={this.flapsRef} />
          </div>
        </div>
      </div>
    );
  }
}