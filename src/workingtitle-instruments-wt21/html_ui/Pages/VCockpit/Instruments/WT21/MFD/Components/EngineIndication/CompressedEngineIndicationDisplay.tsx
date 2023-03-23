import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { FuelDisplay } from './CompressedFormat/FuelDisplay';
import { ITTDisplay } from './CompressedFormat/ITTDisplay';
import { N1Display } from './CompressedFormat/N1Display';
import { N2Display } from './DisplayComponents/N2Display';
import { OilDisplay } from './CompressedFormat/OilDisplay';
import { AileronRudderTrimDisplay } from './DisplayComponents/AileronRudderTrimDisplay';
import { ElevatorTrimDisplay } from './DisplayComponents/ElevatorTrimDisplay';
import { FlapPositionDisplay } from './DisplayComponents/FlapPositionDisplay';
import { IgnitionIndicator } from './DisplayComponents/IgnitionIndicator';
import { EisEngineData, EisFadecData, EisSurfacesData } from './EisData';
import { EngineIndicationDisplayBase } from './EngineIndicationDisplayBase';

import './CompressedEngineIndicationDisplay.css';

/**
 * The EngineIndicationDisplay component.
 */
export class CompressedEngineIndicationDisplay extends EngineIndicationDisplayBase {

  private readonly n1Ref = FSComponent.createRef<N1Display>();
  private readonly ittRef = FSComponent.createRef<ITTDisplay>();
  private readonly n2Ref = FSComponent.createRef<N2Display>();
  private readonly oilRef = FSComponent.createRef<OilDisplay>();
  private readonly fuelRef = FSComponent.createRef<FuelDisplay>();
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
      case 'fuel_left':
        this.fuelRef.instance.updateFuelLeft(value);
        break;
      case 'fuel_right':
        this.fuelRef.instance.updateFuelRight(value);
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
      <div class="eis-compressed-container" ref={this.containerRef}>
        <div class="eis-compressed-primary-group">
          <N1Display ref={this.n1Ref} />
          <IgnitionIndicator class="eis-compressed-ign-left" ref={this.ignLeftRef} />
          <ITTDisplay ref={this.ittRef} />
          <IgnitionIndicator class="eis-compressed-ign-right" ref={this.ignRightRef} />
          <div class="eis-compressed-secondary-group">
            <N2Display ref={this.n2Ref} />
            <OilDisplay ref={this.oilRef} />
            <FuelDisplay ref={this.fuelRef} />
          </div>
          <div class="eis-compressed-trim-group">
            <svg height="125" width="190" class="eis-compressed-trim-label">
              <line x1="10" y1="30" x2="10" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1" />
              <line x1="10" y1="10" x2="20" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1" />
              <text x="10" y="30" style="writing-mode: tb; glyph-orientation-vertical: 0; letter-spacing:-4" fill="var(--wt21-colors-white)" font-size="20">TRIM</text>
              <line x1="10" y1="100" x2="10" y2="120" stroke="var(--wt21-colors-white)" stroke-width="1" />
              <line x1="10" y1="120" x2="20" y2="120" stroke="var(--wt21-colors-white)" stroke-width="1" />
              <text x="165" y="25" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">ELEV</text>
            </svg>
            <AileronRudderTrimDisplay ref={this.ailRudTrimRef} />
            <ElevatorTrimDisplay ref={this.elevTrimRef} />
          </div>
        </div>
        <div class="eis-compressed-flap-position">
          <FlapPositionDisplay ref={this.flapsRef} />
        </div>
      </div>
    );
  }
}