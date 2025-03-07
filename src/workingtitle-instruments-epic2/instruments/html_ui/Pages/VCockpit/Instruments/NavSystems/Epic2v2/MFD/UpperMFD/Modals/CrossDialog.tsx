import {
  AltitudeRestrictionType, FlightPathUtils, FSComponent, ICAO, LegDefinition, MagVar, NavMath, SetSubject, SpeedRestrictionType, SpeedUnit, Subject, UnitType,
  VerticalFlightPhase, VNode
} from '@microsoft/msfs-sdk';

import {
  AltitudeFeetInputFormat, CheckBox, Epic2Fms, FlightPlanStore, InputField, KeyboardInputButton, Modal, ModalProps, NumberInputFormat, RadioButton, TouchButton
} from '@microsoft/msfs-epic2-shared';

import './CrossDialog.css';

/** Properties for the {@link CrossModal} class */
interface CrossModalProps extends ModalProps {
  /** fms */
  readonly fms: Epic2Fms
  /** The active flight plan store.  */
  readonly store: FlightPlanStore;
}

/** Modal used for the join airway menu */
export class CrossModal extends Modal<CrossModalProps> {
  protected readonly cssClassSet = SetSubject.create(['cross-modal']);

  private readonly pastPriorEnabled = Subject.create<boolean>(false);
  private readonly pastPriorState = Subject.create<'past' | 'prior'>('past');
  private readonly pastPriorDist = Subject.create<number | null>(null);
  private readonly isFlyover = Subject.create<boolean>(false);
  private readonly hasAltitudeConstraint = Subject.create<boolean>(false);
  private readonly hasWindowAltitudeConstraint = Subject.create<boolean>(false);
  private readonly altConstraintType = Subject.create<AltitudeRestrictionType>(AltitudeRestrictionType.Unused);
  private readonly altConstraintHeight = Subject.create<number | null>(null);
  private readonly altConstraintLowerHeight = Subject.create<number | null>(null);
  private readonly isVerticalDto = Subject.create<boolean>(false);
  private readonly verticalPhase = Subject.create<VerticalFlightPhase>(VerticalFlightPhase.Descent);
  private readonly hasSpeedConstraint = Subject.create<boolean>(false);
  private readonly speedConstraint = Subject.create<number | null>(null);
  private readonly speedUnit = Subject.create<SpeedUnit>(SpeedUnit.IAS);

  private segmentIndex?: number;
  private localLegIndex?: number;
  private globalLegIndex?: number;
  private readonly leg = Subject.create<LegDefinition | null>(null);
  private lastInsertedLegIndex?: number;

  /**
   * Sets the leg index
   * @param legIndex the global index of the cross leg
   */
  public async setLeg(legIndex: number): Promise<void> {
    const plan = this.props.fms.getPlanForFmcRender();
    this.globalLegIndex = legIndex;
    this.segmentIndex = plan.getSegmentIndex(legIndex);
    this.localLegIndex = plan.getSegmentLegIndex(legIndex);
    const leg = plan.tryGetLeg(this.segmentIndex, this.localLegIndex);

    this.leg.set(leg);

    this.setDefaultData();
  }

  /**
   * Creates and inserts a cross into the pending plan
   */
  private async createCross(): Promise<void> {
    const plan = this.props.fms.getModFlightPlan();
    const leg = this.leg.get();

    if (this.lastInsertedLegIndex !== undefined) {
      const segmentIndex = plan.getSegmentIndex(this.lastInsertedLegIndex);
      const legIndex = plan.getSegmentLegIndex(this.lastInsertedLegIndex);
      this.props.fms.removeWaypoint(segmentIndex, legIndex);
      this.lastInsertedLegIndex = undefined;
    }

    if (leg && leg.calculated && this.segmentIndex !== undefined && this.localLegIndex !== undefined && this.globalLegIndex !== undefined) {
      const pastPriorDistance = this.pastPriorEnabled.get() ? this.pastPriorDist.get() : null;
      if (pastPriorDistance !== null) {
        const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(leg.leg.fixIcao), leg.leg.fixIcao);
        if (this.pastPriorState.get() == 'past') {
          const nextLeg = plan.getNextLeg(this.segmentIndex, this.localLegIndex);
          const course = nextLeg?.calculated?.initialDtk;
          if (course !== undefined) {
            const pbdFacility = this.props.fms.createPBDWaypoint(facility, course, pastPriorDistance);
            this.props.fms.insertWaypoint(pbdFacility, this.segmentIndex, this.localLegIndex + 1, false);
            this.lastInsertedLegIndex = this.globalLegIndex + 1;
          }
        } else {
          const trueCourse = FlightPathUtils.getLegFinalCourse(leg.calculated);
          const course = trueCourse ? MagVar.trueToMagnetic(trueCourse, leg.calculated.endLat ?? 0, leg.calculated.endLon ?? 0) : undefined;
          if (course !== undefined) {
            const pbdFacility = this.props.fms.createPBDWaypoint(facility, NavMath.reciprocateHeading(course), pastPriorDistance);
            this.props.fms.insertWaypoint(pbdFacility, this.segmentIndex, this.localLegIndex, false);
            this.lastInsertedLegIndex = this.globalLegIndex;
          }
        }
      }

      const verticalData = { ...leg.verticalData };
      const hasAltConstraint = this.hasAltitudeConstraint.get();
      const hasSpeedConstraint = this.hasSpeedConstraint.get();
      const speedConstraint = hasSpeedConstraint ? this.speedConstraint.get() ?? 0 : 0;
      const upperAltConstraint = hasAltConstraint && this.altConstraintHeight.get();
      const lowerAltConstraint = hasAltConstraint && this.altConstraintLowerHeight.get();
      // TODO: Set if leg is a flyover
      // TODO: Vertical DTOs

      verticalData.altDesc = hasAltConstraint ? this.altConstraintType.get() : AltitudeRestrictionType.Unused;
      verticalData.altitude1 = upperAltConstraint && upperAltConstraint > 0 ? UnitType.FOOT.convertTo(upperAltConstraint, UnitType.METER) : 0;
      verticalData.altitude2 = lowerAltConstraint && lowerAltConstraint > 0 ? UnitType.FOOT.convertTo(lowerAltConstraint, UnitType.METER) : 0;
      verticalData.speed = speedConstraint;
      verticalData.speedDesc = speedConstraint > 0 ? SpeedRestrictionType.AtOrBelow : SpeedRestrictionType.Unused;
      verticalData.speedUnit = this.speedUnit.get();

      this.props.fms.setUserConstraint(this.lastInsertedLegIndex !== undefined ? this.lastInsertedLegIndex : this.globalLegIndex, verticalData);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.fms.planInMod.sub((inMod) => {
      if (!inMod) {
        this.close();
      }
    });
  }

  /** @inheritdoc */
  public onPause(): void {
    this.lastInsertedLegIndex = undefined;
  }

  /** Sets the default data*/
  private setDefaultData(): void {
    const leg = this.leg.get();
    const speedRestriction = leg?.leg.speedRestriction;
    const altRestriction = leg?.leg.altitude1;

    this.pastPriorEnabled.set(false);
    this.pastPriorDist.set(null);
    this.pastPriorState.set('past');
    this.isFlyover.set(leg?.leg.flyOver ?? false);
    this.hasAltitudeConstraint.set(!(leg?.leg.altDesc === AltitudeRestrictionType.Unused));
    this.altConstraintType.set(leg?.leg.altDesc ?? AltitudeRestrictionType.Unused);
    this.hasWindowAltitudeConstraint.set(leg?.leg.altDesc === AltitudeRestrictionType.Between);
    this.altConstraintHeight.set((altRestriction && altRestriction > 0) ? Math.round(UnitType.FOOT.convertFrom(altRestriction, UnitType.METER)) : null);
    this.altConstraintLowerHeight.set(leg?.leg.altDesc === AltitudeRestrictionType.Between ?
      Math.round(UnitType.FOOT.convertFrom(leg.leg.altitude2, UnitType.METER)) : null);
    this.isVerticalDto.set(false);
    this.verticalPhase.set(leg?.verticalData.phase ?? VerticalFlightPhase.Descent);
    this.hasSpeedConstraint.set((speedRestriction ?? 0) > 0);
    this.speedConstraint.set((speedRestriction && speedRestriction > 0) ? speedRestriction : null);
  }

  // Input Formatters
  private readonly timeInputFormat = new NumberInputFormat('----.-', 0, undefined, 1);
  private readonly distInputFormat = new NumberInputFormat('----.-', 0, undefined, 1);
  private readonly altInputFormat = new AltitudeFeetInputFormat('-----', 0, 50000);
  private readonly speedInputFormat = new NumberInputFormat('---', 0, 300, 0);
  private readonly angleInputFormat = new NumberInputFormat('-.--', 1, 8, 2);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Cross {this.leg.map((leg) => leg?.name)}</p>
          <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
          <TouchButton variant="bar" label="X" class="close-button" onPressed={() => this.close()} />
        </div>
        <div class="container">
          <div class="left">
            <CheckBox isChecked={this.pastPriorEnabled} label='Past/Prior to' />
            <div class="indented-container">
              <RadioButton isDisabled={this.pastPriorEnabled.map(x => !x)} selectedValue={this.pastPriorState} value={'past'} label={this.leg.map((leg) => `Past ${leg?.name ?? ''}`)} />
              <RadioButton isDisabled={this.pastPriorEnabled.map(x => !x)} selectedValue={this.pastPriorState} value={'prior'} label={this.leg.map((leg) => `Prior to ${leg?.name ?? ''}`)} />
              <InputField isEnabled={this.pastPriorEnabled} suffix={'NM'} bind={this.pastPriorDist} formatter={this.distInputFormat} bus={this.props.bus} textAlign='right' maxLength={6} tscConnected tscDisplayLabel={'Distance Past/Prior'} blurOnEnter />
            </div>
            <div class="line" />
            <CheckBox isEnabled={false} isChecked={this.isFlyover} label='Flyover' />
            <div class="line" />
            <CheckBox isChecked={this.hasAltitudeConstraint} label='Altitude' />
            <div class={{ 'indented-container': true, 'hidden': this.hasWindowAltitudeConstraint }}>
              <RadioButton isDisabled={this.hasAltitudeConstraint.map(x => !x)} selectedValue={this.altConstraintType} value={AltitudeRestrictionType.At} label={'At'} />
              <RadioButton isDisabled={this.hasAltitudeConstraint.map(x => !x)} selectedValue={this.altConstraintType} value={AltitudeRestrictionType.AtOrAbove} label={'At Above'} />
              <RadioButton isDisabled={this.hasAltitudeConstraint.map(x => !x)} selectedValue={this.altConstraintType} value={AltitudeRestrictionType.AtOrBelow} label={'At Below'} />
              <InputField isEnabled={this.hasAltitudeConstraint} suffix={'Ft'} bind={this.altConstraintHeight} formatter={this.altInputFormat} bus={this.props.bus} textAlign='right' maxLength={5} tscConnected tscDisplayLabel={'Altitude Constraint'} blurOnEnter />
            </div>
            <div class={{ 'hidden': this.hasWindowAltitudeConstraint.map(x => !x) }}>
              <p>At Below {this.altConstraintHeight}Ft</p>
              <p>At Above {this.altConstraintLowerHeight}Ft</p>
              <TouchButton
                class={'modify-alt-button'}
                variant={'bar-menu'}
                label={'Modify'}
                onPressed={() => {
                  this.hasWindowAltitudeConstraint.set(false);
                  this.altConstraintLowerHeight.set(null);
                  this.altConstraintType.set(AltitudeRestrictionType.AtOrBelow);
                }}
              />
            </div>
            <CheckBox isEnabled={false} /*isEnabled={this.altConstraintType.map((type) => (type !== AltitudeRestrictionType.Unused && type !== AltitudeRestrictionType.Between))}*/ isChecked={this.isVerticalDto} label='Vertical Dir To' />
          </div>
          <div class="vertical-border" />
          <div class="right">
            <CheckBox isChecked={this.hasSpeedConstraint} label='Speed' />
            <div class="indented-container">
              <InputField isEnabled={this.hasSpeedConstraint} bind={this.speedConstraint} formatter={this.speedInputFormat} bus={this.props.bus} textAlign='right' maxLength={4} tscConnected tscDisplayLabel={'Speed'} blurOnEnter />
              <div class="radio-row">
                <RadioButton isDisabled={this.hasSpeedConstraint.map(x => !x)} selectedValue={this.speedUnit} value={SpeedUnit.IAS} label={'CAS'} />
                <RadioButton isDisabled={true} selectedValue={this.speedUnit} value={SpeedUnit.MACH} label={'Mach'} />
              </div>
            </div>
            <div class="line" />
            <CheckBox isEnabled={false} isChecked={Subject.create(false)} label='Time At' />
            <div class="indented-container">
              <InputField suffix={'Z'} isEnabled={false} bind={Subject.create(null)} formatter={this.timeInputFormat} bus={this.props.bus} textAlign='right' maxLength={6} />
            </div>
            <div class="line" />
            <CheckBox isEnabled={false} isChecked={Subject.create(false)} label='Angle' />
            <div class="indented-container">
              <InputField suffix={'°'} isEnabled={false} bind={Subject.create(null)} formatter={this.angleInputFormat} bus={this.props.bus} textAlign='right' maxLength={6} />
            </div>
            <div class="line" />
            <CheckBox isEnabled={false} isChecked={Subject.create(false)} label='Override' />
            <div class="indented-container">
              <RadioButton isDisabled={true} selectedValue={this.verticalPhase} value={VerticalFlightPhase.Climb} label={'Climb'} />
              <RadioButton isDisabled={true} selectedValue={this.verticalPhase} value={VerticalFlightPhase.Descent} label={'Descend'} />
            </div>
          </div>
        </div>

        <TouchButton
          class={'delete-button'}
          variant={'bar-menu'}
          label={'Delete'}
          isEnabled={false}
          onPressed={() => { this.close(); }}
        />
        <TouchButton
          class={'as-published-button'}
          variant={'bar-menu'}
          label={'Default'}
          // isEnabled={false}
          onPressed={() => { this.setDefaultData(); }}
        />
        <TouchButton
          class={'insert-button'}
          variant={'bar-menu'}
          label={'Apply'}
          onPressed={() => { this.createCross(); }}
        />
      </div >
    );
  }
}
