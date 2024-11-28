/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, FSComponent, MappedSubject, PerformancePlanRepository, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  AirspeedCasInputFormat, AltitudeFeetInputFormat, ButtonBoxArrow, ButtonMenu, Epic2Fms, Epic2FmsUtils, Epic2PerformancePlan, Epic2VSpeedController,
  Epic2VSpeedEvents, FlightPlanStore, InputField, InputFieldColor, ModalKey, ModalService, RnavMinima, TabContent, TabContentProps, TouchButton, VSpeedType
} from '@microsoft/msfs-epic2-shared';

import { DepartureArrivalModal } from '../DepartureArrivalOverlay/DepartureArrivalModal';
import { VSpeedInputTabDefinition } from '../FlightPlanTabTypes';

import './StarLdgTab.css';

/** The properties for the {@link StarLdgTab} component. */
interface StarLdgTabProps extends TabContentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The modal service. */
  readonly modalService: ModalService;
  /** The flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The performance plan repository. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  /** The vspeed controller */
  readonly vSpeedController: Epic2VSpeedController
}

const RNAV_MINIMA_LABELS = {
  [RnavMinima.None]: 'LNAV/(VNAV)',
  [RnavMinima.LNAV]: 'LNAV/(VNAV)',
  [RnavMinima.LP]: 'LP',
  [RnavMinima.LPV]: 'LPV'
};

/** The StarLdgTab component. */
export class StarLdgTab extends TabContent<StarLdgTabProps> {

  // Procedure data
  private readonly destination = Subject.create('');
  private readonly runway = Subject.create('');
  private readonly approach = Subject.create('');
  private readonly arrival = Subject.create('');
  private readonly highestRnavMinima = Subject.create(RnavMinima.None);
  private readonly activeRnavMinima = this.props.activeFlightPlanStore.selectedRnavMinima;
  private readonly isRnavMinimaEnabled = this.highestRnavMinima.map((minima) => minima !== RnavMinima.None);

  private readonly vSpeedDefinitions = [] as VSpeedInputTabDefinition[];

  /** Send Button data */
  private readonly speedsUpdated = Subject.create(true);
  private readonly sendButtonEnabled = Subject.create(true);

  /** Transition level in feet. */
  private readonly transLvl = Subject.create<number | null>(null);

  // Input Formatters
  private readonly airspeedInputFormat = new AirspeedCasInputFormat('---', 30, 240);
  private readonly altitudeFeetFormatter = new AltitudeFeetInputFormat();

  /** @inheritdoc */
  constructor(props: StarLdgTabProps) {
    super(props);

    this.setupVSpeeds();
  }

  /**
   * Sets up all the data for vspeeds
   */
  private setupVSpeeds(): void {
    for (const definition of this.props.vSpeedController.vSpeedDefinitions.filter((def) => def.type === VSpeedType.Landing)) {
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
    // Watch for STAR changes
    this.props.activeFlightPlanStore.destinationIdent.sub((ident) => {
      this.destination.set(ident ?? '');
    }, true);
    this.props.activeFlightPlanStore.destinationRunwayName.sub((rwy) => {
      this.runway.set(rwy ?? '');
    }, true);
    this.props.activeFlightPlanStore.approachProcedure.sub((appr) => this.highestRnavMinima.set(Epic2FmsUtils.getHighestRnavMinimaFromRnavType(appr?.rnavTypeFlags ?? 0)), true);
    MappedSubject.create(
      ([approachProcedure, approachTransition]): void => {
        const appr = approachProcedure?.name ?? '';
        const dot = approachProcedure && approachTransition ? '.' : '';
        const transition = approachTransition?.name ?? '';
        this.approach.set(appr + dot + transition);
      },
      this.props.activeFlightPlanStore.approachProcedure,
      this.props.activeFlightPlanStore.approachTransition,
    );
    MappedSubject.create(
      ([arrivalProcedure, arrivalTransition]): void => {
        const star = arrivalProcedure?.name ?? '';
        const dot = arrivalProcedure && arrivalTransition ? '.' : '';
        const transition = arrivalTransition?.name ?? '';
        this.arrival.set(star + dot + transition);
      },
      this.props.activeFlightPlanStore.arrivalProcedure,
      this.props.activeFlightPlanStore.arrivalTransition,
    );
    MappedSubject.create(
      ([speedsUpdated, ...speeds]): void => this.sendButtonEnabled.set(speedsUpdated && speeds.filter(speed => !speed).length === 0),
      this.speedsUpdated,
      ...this.vSpeedDefinitions.map((def) => def.inputSubject)
    );

    // Set initial Transition Level
    this.transLvl.set(this.props.perfPlanRepository.getActivePlan().transitionAltitude.get());
    // Watch for new Transition Level
    this.transLvl.sub((v) => {
      if (v) {
        this.props.perfPlanRepository.getActivePlan().transitionAltitude.set(v);
        this.props.perfPlanRepository.getActivePlan().transitionLevel.set(v);
      }
    });
    this.props.perfPlanRepository.getActivePlan().transitionAltitude.sub((alt) => this.transLvl.set(alt));
    this.props.perfPlanRepository.getActivePlan().transitionLevel.sub((alt) => this.transLvl.set(alt));

    this.props.activeFlightPlanStore.flightPlanLegsChanged.on(() => this.sendButtonEnabled.set(true));
  }

  /** handles the Send button press */
  private sendButtonPress(): void {
    this.props.bus.getPublisher<Epic2VSpeedEvents>().pub('update_pfd_speed_definition_of_type', VSpeedType.Landing, true);
    this.speedsUpdated.set(false);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="star-ldg-tab">
        <div class="star-ldg-top">
          <section>
            <p class="star-ldg-dest-label">Dest: <span>{this.destination}</span></p>
            <TouchButton
              label="Rwy/App/STAR"
              class="star-ldg-dest-button"
              variant={'small'}
              onPressed={() => this.props.modalService.open<DepartureArrivalModal>(ModalKey.DepartureArrival)!.modal.setActiveTab('arrival')}
              isEnabled={this.props.activeFlightPlanStore.destinationFacility.map((v) => v !== undefined)}
            />
            <div class="star-ldg-nav-menu">
              <ButtonMenu buttons={[
                <TouchButton variant={'bar'} isEnabled={this.highestRnavMinima.map((minima) => minima === RnavMinima.LPV)} label={RNAV_MINIMA_LABELS[RnavMinima.LPV]} onPressed={() => this.props.fms.setRnavMinima(RnavMinima.LPV)} />,
                <TouchButton variant={'bar'} isEnabled={this.highestRnavMinima.map((minima) => minima === RnavMinima.LP || minima === RnavMinima.LPV)} label={RNAV_MINIMA_LABELS[RnavMinima.LP]} onPressed={() => this.props.fms.setRnavMinima(RnavMinima.LP)} />,
                <TouchButton variant={'bar'} label={RNAV_MINIMA_LABELS[RnavMinima.LNAV]} onPressed={() => this.props.fms.setRnavMinima(RnavMinima.LNAV)} />,
              ]} position={'bottom'} isEnabled={this.isRnavMinimaEnabled}>
                <ButtonBoxArrow label={this.activeRnavMinima.map((minima) => RNAV_MINIMA_LABELS[minima])} title={'RNAV Minima'} isEnabled={this.isRnavMinimaEnabled} />
              </ButtonMenu>
            </div>
          </section>
          <section>
            <div class='one-line'>Rwy:<span>{this.runway}</span></div>
            <div class='one-line'>App:<span>{this.approach}</span></div>
            <div class='one-line'>STAR:<span>{this.arrival}</span></div>
            <p class="star-ldg-ref-id">Ref Id:</p>
          </section>
        </div >
        <div class="star-ldg-bottom">
          <section class="star-ldg-speeds">
            <div class="star-ldg-speeds-inner">
              <div class="star-ldg-headings"><p><span class="prefix-label">V</span>spd</p><p>Kt</p></div>
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
            <p class="star-ldg-pilot-defined">{'(Pilot Defined)'}</p>
            <TouchButton
              variant={'bar'}
              label={'Send'}
              class={'star-ldg-send-btn'}
              isEnabled={this.sendButtonEnabled}
              onPressed={() => this.sendButtonPress()}
            />
          </section>
          <section class="star-ldg-trans">
            <p>Trans Lvl</p>
            <InputField
              bus={this.props.bus}
              suffix="Ft"
              bind={this.transLvl}
              formatter={this.altitudeFeetFormatter}
              textAlign={'right'}
              color={'green'}
              maxLength={5}
              tscConnected
            />
          </section>
        </div>
      </div >
    );
  }
}
