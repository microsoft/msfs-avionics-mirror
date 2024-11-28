/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FSComponent, MappedSubject, PerformancePlanRepository, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  AirspeedCasInputFormat, AltitudeFeetInputFormat, Epic2Fms, Epic2PerformancePlan, Epic2VSpeedController, Epic2VSpeedEvents, FlightPlanStore, InputField,
  InputFieldColor, ModalKey, ModalService, TabContent, TabContentProps, TouchButton, VSpeedType
} from '@microsoft/msfs-epic2-shared';

import { DepartureArrivalModal } from '../DepartureArrivalOverlay/DepartureArrivalModal';
import { VSpeedInputTabDefinition } from '../FlightPlanTabTypes';

import './SidTakeoffTab.css';

/** Props for SidTakeoffTab. */
interface SidTakeoffTabProps extends TabContentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The modal service. */
  readonly modalService: ModalService;
  /** The flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
  /** The performance plan repository. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  /** The vspeed controller */
  readonly vSpeedController: Epic2VSpeedController
}
/** The SidTakeoffTab component. */
export class SidTakeoffTab extends TabContent<SidTakeoffTabProps> {
  // Procedure data
  private readonly origin = Subject.create('');
  private readonly runway = Subject.create('');
  private readonly sid = Subject.create('');

  private readonly vSpeedDefinitions = [] as VSpeedInputTabDefinition[];

  /** Send Button data */
  private readonly speedsUpdated = Subject.create(true);
  private readonly sendButtonEnabled = Subject.create(true);
  private sendButtonClass = SetSubject.create<string>(['sid-takeoff-tab-button-send']);

  /** Transition Altitude in feet */
  private readonly transAlt = Subject.create<number | null>(null);
  private readonly transAltColor = Subject.create<InputFieldColor>('white');

  // Input formatters
  private readonly airspeedInputFormat = new AirspeedCasInputFormat('---', 30, 240);
  private readonly altitudeFeetInputFormat = new AltitudeFeetInputFormat();

  /** @inheritdoc */
  constructor(props: SidTakeoffTabProps) {
    super(props);

    this.setupVSpeeds();
  }

  /**
   * Sets up all the data for vspeeds
   */
  private setupVSpeeds(): void {
    for (const definition of this.props.vSpeedController.vSpeedDefinitions.filter((def) => def.type === VSpeedType.Takeoff)) {
      const inputColourSubject = Subject.create<InputFieldColor>(definition.speed ? 'green' : 'white');

      this.vSpeedDefinitions.push({
        label: definition.label,
        inputSubject: definition.speed,
        inputColourSubject,
      });

      definition.speed.sub((v) => {
        inputColourSubject.set(v ? 'green' : 'white');
        this.speedsUpdated.set(true);
      });
    }
  }

  /** @inheritdoc */
  public override onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    // Watch for SID changes
    this.props.activeFlightPlanStore.originIdent.sub((ident) => {
      this.origin.set(ident ?? '');
    }, true);
    this.props.activeFlightPlanStore.originRunwayName.sub((rwy) => {
      this.runway.set(rwy ?? '');
    }, true);
    MappedSubject.create(
      ([departureProcedure, departureTransition]): void => {
        const sid = departureProcedure?.name ?? '';
        const dot = departureProcedure && departureTransition ? '.' : '';
        const transition = departureTransition?.name ?? '';
        this.sid.set(sid + dot + transition);
      },
      this.props.activeFlightPlanStore.departureProcedure,
      this.props.activeFlightPlanStore.departureTransition,
    );

    MappedSubject.create(
      ([speedsUpdated, ...speeds]): void => this.sendButtonEnabled.set(speedsUpdated && speeds.filter(speed => !speed).length === 0),
      this.speedsUpdated,
      ...this.vSpeedDefinitions.map((def) => def.inputSubject)
    );


    // Set initial Transition Altitude
    this.transAlt.set(this.props.perfPlanRepository.getActivePlan().transitionAltitude.get());
    this.transAltColor.set('green');
    // Watch for new Transition Altitude
    this.transAlt.sub((alt) => {
      this.transAltColor.set('white');
      if (alt) {
        this.props.perfPlanRepository.getActivePlan().transitionAltitude.set(alt);
        this.props.perfPlanRepository.getActivePlan().transitionLevel.set(alt);
      }
    });
    this.props.perfPlanRepository.getActivePlan().transitionAltitude.sub((alt) => this.transAlt.set(alt));
    this.props.perfPlanRepository.getActivePlan().transitionLevel.sub((alt) => this.transAlt.set(alt));

    this.props.activeFlightPlanStore.flightPlanLegsChanged.on(() => this.sendButtonEnabled.set(true));
    this.sendButtonEnabled.sub((enabled) => enabled ? this.sendButtonClass.toggle('send-button-blue', true) : this.sendButtonClass.toggle('send-button-blue', false));
  }

  /** handles the Send button press */
  private sendButtonPress(): void {
    this.props.bus.getPublisher<Epic2VSpeedEvents>().pub('update_pfd_speed_definition_of_type', VSpeedType.Takeoff, true);
    this.speedsUpdated.set(false);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="sid-takeoff-tab">
        <p class="sid-takeoff-tab-title">SID / Takeoff</p>
        <div class="sid-takeoff-tab-grid">
          <div>
            <p class="sid-takeoff-tab-orig">
              Orig:<span>{this.origin}</span>
            </p>
            <TouchButton
              label="Runway/SID"
              class="sid-takeoff-tab-orig-button"
              variant={'small'}
              onPressed={() => this.props.modalService.open<DepartureArrivalModal>(ModalKey.DepartureArrival)!.modal.setActiveTab('departure')}
              isEnabled={this.props.activeFlightPlanStore.originFacility.map((v) => v !== undefined)}
            />
          </div>
          <div>
            <p class="sid-takeoff-tab-rwy">
              Rwy:<span>{this.runway}</span>
            </p>
            <p class="sid-takeoff-tab-sid">
              SID:<span>{this.sid}</span>
            </p>
          </div>
        </div>
        <div class="sid-takeoff-tab-bottom">
          <div class="sid-takeoff-tab-grid-bottom">
            <div class="sid-takeoff-tab-vspd">
              <div class="sid-takeoff-tab-line"></div>
              <div class="sid-takeoff-tab-vspd-headings">
                <p>Vspd</p>
                <p>Kt</p>
              </div>
              <div class="sid-takeoff-tab-vspd-column">
                <div className="sid-takeoff-tab-vspd-metrics">
                  {this.vSpeedDefinitions.map((def) => <InputField
                    bus={this.props.bus}
                    prefix="V"
                    topLabel={def.label}
                    bind={def.inputSubject}
                    formatter={this.airspeedInputFormat}
                    textAlign={'right'}
                    color={def.inputColourSubject}
                    maxLength={3}
                    tscConnected
                  />)}
                </div>
                <p class="side-takeoff-tab-vspd-pilot-defined">
                  (Pilot Defined)
                </p>
                <TouchButton
                  label="Send"
                  class={this.sendButtonClass}
                  variant={'small'}
                  isEnabled={this.sendButtonEnabled}
                  onPressed={() => this.sendButtonPress()}
                />
              </div>
            </div>
            <div class="sid-takeoff-tab-trans">
              <InputField
                bus={this.props.bus}
                suffix="Ft"
                topLabel="Trans Alt"
                color={this.transAltColor}
                bind={this.transAlt}
                formatter={this.altitudeFeetInputFormat}
                maxLength={5}
                textAlign={'right'}
                tscConnected
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
