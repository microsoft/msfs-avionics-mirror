import {
  AirportClass, AirportFacility, FacilityType, FSComponent, ICAO, MappedSubject, NearestContext, SetSubject, Subject, Subscription, UnitType, VNode, Wait
} from '@microsoft/msfs-sdk';

import {
  AirportIcaoInputFormat, ButtonBoxArrow, ButtonMenu, Epic2FlightPlans, Epic2Fms, FlightPlanStore, InputField, TabContent, TabContentProps, TextInputFormat,
  TouchButton
} from '@microsoft/msfs-epic2-shared';

import './FplnTab.css';

/** Props for FplnTab. */
interface FplnTabProps extends TabContentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The flight plan store for the active tab */
  readonly activePlanStore: FlightPlanStore;
  /** The flight plan store for the pending plan */
  readonly pendingPlanStore: FlightPlanStore;
}

/** The FplnTab component. */
export class FplnTab extends TabContent<FplnTabProps> {
  /** The maximum distance to consider for automatic origin airport insertion in great-arc radians. */
  private static readonly MAX_ORIGIN_AIRPORT_DIST = UnitType.GA_RADIAN.convertFrom(3, UnitType.NMILE);

  private readonly originRef = FSComponent.createRef<InputField<string>>();
  private readonly destRef = FSComponent.createRef<InputField<string>>();

  private readonly originValue = Subject.create<string | null>(null);
  private readonly destinationValue = Subject.create<string | null>(null);

  private readonly originFac = Subject.create<AirportFacility | undefined>(undefined);
  private readonly destinationFac = Subject.create<AirportFacility | undefined>(undefined);

  private readonly airportFormat = new AirportIcaoInputFormat();

  private readonly insertButtonEnabled = MappedSubject.create(([originFac, destFac]) => {
    return (originFac !== undefined && destFac !== undefined);
  }, this.originFac, this.destinationFac);

  private insertButtonClass = SetSubject.create<string>(['fpln-insert-button']);

  private subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public override onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.subscriptions = [
      this.originValue.sub(this.handleOriginValueChange.bind(this)),
      this.destinationValue.sub(this.handleDestinationValueChange.bind(this)),
      this.insertButtonEnabled.sub((v) => this.insertButtonClass.toggle('fpln-insert-button-blue', v))
    ];

    this.setNearestOrigin();
  }

  private _originFac: AirportFacility | undefined;
  /**
   * Handles the change of the origin input field value.
   * @param value The value of the origin input field.
   */
  private async handleOriginValueChange(value: string | null): Promise<void> {
    if (!value) {
      this.originFac.set(undefined);
      return;
    }
    this._originFac = await this.loadAirportFac(value);
    this.originFac.set(this._originFac);
    if (!this._originFac) {
      this.originValue.set(null);
      this.originRef.getOrDefault()?.inputBoxRef.getOrDefault()?.handleError();
    }
  }

  private _destFac: AirportFacility | undefined;
  /**
   * Handles the change of the destination input field value.
   * @param value The value of the destination input field.
   */
  private async handleDestinationValueChange(value: string | null): Promise<void> {
    if (!value) {
      this.destinationFac.set(undefined);
      return;
    }
    this._destFac = await this.loadAirportFac(value);
    this.destinationFac.set(this._destFac);
    if (!this._destFac) {
      this.destinationValue.set(null);
      this.destRef.getOrDefault()?.inputBoxRef.getOrDefault()?.handleError();
    }
  }

  /**
   * Loads an airport facility.
   * @param airportIdent The airport ident to load.
   * @returns Airport fac if found, else undefined.
   */
  private async loadAirportFac(airportIdent: string): Promise<AirportFacility | undefined> {
    const airportIcao = ICAO.value('A', '', '', airportIdent);
    const airportFac = await this.props.fms.facLoader.tryGetFacility(FacilityType.Airport, airportIcao);
    if (airportFac && airportFac.airportClass !== AirportClass.HeliportOnly && airportFac.airportClass !== AirportClass.None) {
      return airportFac;
    }
  }

  private readonly handleInsertPressed = (): void => {
    const plan = this.props.fms.getModFlightPlan();
    const originFac = this.originFac.get();
    const destFac = this.destinationFac.get();

    this.props.fms.emptyFlightPlan(Epic2FlightPlans.Pending);

    if (originFac) {
      this.props.fms.setOrigin(originFac);

      const originLeg = plan.tryGetLeg(0, 0);
      originLeg && this.props.pendingPlanStore.amendWaypointForDisplay.set(this.props.pendingPlanStore.legMap.get(originLeg));
    }

    if (destFac) {
      this.props.fms.setDestination(destFac);
    }

    this.originValue.set(null);
    this.destinationValue.set(null);
  };

  /**
   * Sets the nearest airport as the origin facility to be entered
   */
  private setNearestOrigin(): void {
    // When the nearest context is initialized, wait for nearest airport to be available and then insert it into the plan
    // if it's less than 3NM away
    NearestContext.onInitialized(async (instance) => {
      await Wait.awaitCondition(() => instance.airports.length !== 0, 500, 15_000).catch(() => {
        console.error('[Epic2] Wait for nearest airports took longer than 15s and timed out');
      });

      // ...but if by that time an airport was manually selected, don't bother
      // or if the user already has the box focused to enter something, don't bother.
      if (
        this.props.fms.getFlightPlan(Epic2FlightPlans.Active).destinationAirport !== undefined
        || this.originRef.instance.inputBoxRef.instance.isActive.get()
      ) {
        return;
      }

      let nearestAirport: AirportFacility | undefined;
      let nearestDistance = Infinity;

      for (const airport of instance.airports.getArray()) {
        // FIXME support helicopters one day
        if (airport.runways.length === 0 || airport.icaoStruct.ident.length !== 4) {
          continue;
        }

        const distance = this.props.fms.ppos.distance(airport);
        if (distance < nearestDistance && distance <= FplnTab.MAX_ORIGIN_AIRPORT_DIST) {
          nearestDistance = distance;
          nearestAirport = airport;
        }
      }

      if (nearestAirport) {
        this.originValue.set(nearestAirport.icaoStruct.ident.toUpperCase());
      }
    });
    this.insertButtonClass.toggle('fpln-insert-button', true);
  }

  /** @inheritdoc */
  public render(): VNode {

    return (
      <div class="fpln-tab">
        <div class="fpln-columns">
          <div class="origin-dest-column">
            <div class="fpln-column-border"></div>
            <div class="fpln-source-menu">
              <ButtonMenu
                buttons={[
                  <TouchButton variant="bar" label="Pilot" />
                ]}
                position="bottom"
                isEnabled={false}
              >
                <ButtonBoxArrow label="Pilot" title="FPLN Source" isEnabled={false} />
              </ButtonMenu>
            </div>
            <InputField
              bus={this.props.bus}
              topLabel="Origin"
              bind={this.originValue}
              maxLength={5}
              formatter={this.airportFormat}
              ref={this.originRef}
              tscConnected
            />
            <InputField
              bus={this.props.bus}
              topLabel="Destination"
              bind={this.destinationValue}
              maxLength={5}
              formatter={this.airportFormat}
              ref={this.destRef}
              tscConnected
            />
            <InputField
              bus={this.props.bus}
              topLabel="Alternate"
              bind={Subject.create<string | null>(null)}
              maxLength={5}
              formatter={this.airportFormat}
              isEnabled={false}
            />
            <TouchButton
              label="Insert"
              class={this.insertButtonClass}
              variant="small"
              isEnabled={this.insertButtonEnabled}
              onPressed={this.handleInsertPressed}
            />
          </div>
          <div className="name-column">
            <InputField
              bus={this.props.bus}
              class="fpln-name-input"
              topLabel="FPLN Name"
              bind={Subject.create('')}
              formatter={new TextInputFormat('', 10)}
              maxLength={10}
              isEnabled={false}
            />
            <div class="fpln-button-group">
              <TouchButton label="Save" isEnabled={false} variant="small" />
              <TouchButton label="Delete" isEnabled={false} variant="small" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subscriptions.map((sub) => sub.destroy());
    super.destroy();
  }
}
