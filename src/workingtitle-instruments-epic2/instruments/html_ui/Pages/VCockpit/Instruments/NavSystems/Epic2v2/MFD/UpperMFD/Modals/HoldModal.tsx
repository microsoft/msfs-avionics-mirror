import {
  FacilityType, FlightPathUtils, FlightPlan, FSComponent, ICAO, LegDefinition, LegTurnDirection, LegType, MagVar, MappedSubject, MathUtils, NavMath, SetSubject,
  Subject, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  BearingInputFormat, CheckBox, Epic2Fms, FlightPlanStore, InputField, KeyboardInputButton, Modal, ModalProps, NumberInputFormat, RadioButton, TouchButton
} from '@microsoft/msfs-epic2-shared';

import './HoldModal.css';

/** Properties for the {@link HoldModal} class */
interface HoldModalProps extends ModalProps {
  /** fms */
  readonly fms: Epic2Fms
  /** The active flight plan store.  */
  readonly store: FlightPlanStore;
}

/** Modal used for the join airway menu */
export class HoldModal extends Modal<HoldModalProps> {
  protected readonly cssClassSet = SetSubject.create(['hold-modal']);

  private readonly radial = Subject.create<number | null>(null);
  private readonly course = Subject.create<number | null>(null);
  private readonly magneticType = Subject.create<'mag' | 'true'>('mag');
  private readonly legDist = Subject.create<number | null>(null);
  private readonly legTime = Subject.create<number | null>(null);
  private useLegDistance = false;
  private readonly turnDirection = Subject.create<LegTurnDirection>(LegTurnDirection.Right);
  private readonly speed = Subject.create<number | null>(null);

  private segmentIndex?: number;
  private localLegIndex?: number;
  private readonly leg = Subject.create<LegDefinition | null>(null);
  private readonly nextLeg = Subject.create<LegDefinition | null>(null);

  private readonly magVar = Subject.create<number>(0);
  private readonly isVOR = Subject.create<boolean>(false);
  private readonly holdType = Subject.create<'Default' | 'As Published' | 'Pilot Modified'>('Default');

  /**
   * Sets the leg time based on the leg distance and speed
   * @param dist the leg distance
   */
  private setLegTimeFromDist(dist: number | null): void {
    const speed = this.speed.get();
    this.legTime.set(speed && dist ? MathUtils.round((dist / speed) * 60, 1) : null);
  }

  /**
   * Sets the leg distance based on the leg time and speed
   * @param time the leg time
   */
  private setLegDistFromTime(time: number | null): void {
    const speed = this.speed.get();
    this.legDist.set(speed && time ? MathUtils.round((time / 60) * speed) : null);
  }

  /**
   * Gets the final magnetic course of a leg
   * @param leg Gets the course of a leg
   * @returns the final magnetic course or null
   */
  private getLegMagneticCourse(leg: LegDefinition): number | null {
    const trueCourse = leg && this.getLegTrueCourse(leg);
    return trueCourse && leg.calculated ? MagVar.trueToMagnetic(trueCourse, leg.calculated.courseMagVar) : null;
  }

  /**
   * Gets the final course of a leg
   * @param leg Gets the true course of a leg
   * @returns the final true course or null
   */
  private getLegTrueCourse(leg: LegDefinition): number | null {
    return (leg?.calculated && FlightPathUtils.getLegFinalCourse(leg.calculated)) ?? null;
  }

  /**
   * Sets the leg index
   * @param legIndex the global index of the hold leg
   */
  public async setLeg(legIndex: number): Promise<void> {
    const plan = this.props.fms.getPlanForFmcRender();
    this.segmentIndex = plan.getSegmentIndex(legIndex);
    this.localLegIndex = plan.getSegmentLegIndex(legIndex);
    const leg = plan.tryGetLeg(this.segmentIndex, this.localLegIndex);

    this.leg.set(leg);
    this.nextLeg.set(plan.getNextLeg(this.segmentIndex, this.localLegIndex));

    const inboundCourse = leg && this.getLegMagneticCourse(leg);

    const facility = leg && await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(leg.leg.fixIcao), leg.leg.fixIcao);
    this.isVOR.set(leg ? ICAO.getFacilityType(leg.leg.fixIcao) === FacilityType.VOR : false);
    this.magVar.set(facility ? Math.round(MagVar.get(facility.lat, facility.lon)) : 0);
    this.course.set(inboundCourse);
    inboundCourse && this.isVOR.get() && this.radial.set(NavMath.reciprocateHeading(inboundCourse));
  }

  /**
   * Creates and inserts a hold into the pending plan
   */
  private createHold(): void {
    if (this.segmentIndex !== undefined && this.localLegIndex !== undefined) {
      const holdLeg = FlightPlan.createLeg({
        fixIcaoStruct: this.leg.get()?.leg.fixIcaoStruct,
        type: LegType.HM,
        course: this.course.get() ?? undefined,
        turnDirection: this.turnDirection.get(),
        distance: this.useLegDistance ? UnitType.NMILE.convertTo(this.legDist.get() ?? NaN, UnitType.METER) : this.legTime.get() ?? NaN,
        distanceMinutes: !this.useLegDistance,
        speedRestriction: this.speed.get() ?? undefined
      });

      this.props.fms.insertHold(this.segmentIndex, this.localLegIndex, holdLeg);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.fms.planInMod.sub((inMod) => {
      if (!inMod) {
        this.close();
      }
    });

    this.turnDirection.sub(() => this.holdType.set('Pilot Modified'));
    this.course.sub((crs) => crs !== null && this.isVOR.get() && this.radial.set(NavMath.reciprocateHeading(crs)));
    this.magneticType.sub((magneticType) => {
      const course = this.course.get();
      if (magneticType === 'mag') {
        this.course.set(course !== null ? NavMath.normalizeHeading(course - (this.leg.get()?.calculated?.courseMagVar ?? 0)) : null);
      } else {
        this.course.set(course !== null ? NavMath.normalizeHeading(course + (this.leg.get()?.calculated?.courseMagVar ?? 0)) : null);
      }
    });
  }

  /** @inheritdoc */
  public onResume(): void {
    const altitude = SimVar.GetSimVarValue('INDICATED ALTITUDE:1', 'feet');

    this.radial.set(null);
    this.course.set(null);
    this.magneticType.set('mag');
    this.speed.set(150);
    this.legTime.set(altitude >= 14000 ? 1.5 : 1);
    this.setLegDistFromTime(altitude >= 14000 ? 1.5 : 1);
    this.turnDirection.set(LegTurnDirection.Right);
    this.holdType.set('Default');
  }

  // Input Formatters
  private readonly bearingInputFormat = new BearingInputFormat('---');
  private readonly timeInputFormat = new NumberInputFormat('---', 0, undefined, 1);
  private readonly distInputFormat = new NumberInputFormat('---', 0, undefined, 1);
  private readonly speedInputFormat = new NumberInputFormat('---', 0, 300, 0);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Hold {this.leg.map((leg) => leg?.name)}</p>
          <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
          <TouchButton variant="bar" label="X" class="close-button" onPressed={() => this.close()} />
        </div>
        <p class="hold-type">{this.holdType}</p>
        <div class="upper-container">
          <div class="inputs">
            <InputField bus={this.props.bus} onModified={async (rad) => { this.holdType.set('Pilot Modified'); this.radial.set(rad); this.course.set(NavMath.reciprocateHeading(rad)); return true; }} class={'side-text'} prefix={'RAD: '} suffix={'°'} bind={this.radial} formatter={this.bearingInputFormat} textAlign='right' maxLength={3} isEnabled={this.isVOR} tscConnected tscDisplayLabel={'Radial'} blurOnEnter />
            <InputField bus={this.props.bus} onModified={async (crs) => { this.holdType.set('Pilot Modified'); this.course.set(crs); this.radial.set(this.isVOR.get() ? NavMath.reciprocateHeading(crs) : null); return true; }} class={'side-text'} prefix={'CRS: '} suffix={'°'} bind={this.course} formatter={this.bearingInputFormat} textAlign='right' maxLength={3} tscConnected tscDisplayLabel={'Course'} blurOnEnter />

            <div class="radio-row">
              <RadioButton selectedValue={this.magneticType} value={'mag'} label={'Mag'} />
              <RadioButton selectedValue={this.magneticType} value={'true'} label={'True'} />
            </div>
            <div class="line" />
            <InputField bus={this.props.bus} onModified={async (time) => { this.holdType.set('Pilot Modified'); this.useLegDistance = false; this.legTime.set(time); this.setLegDistFromTime(time); return true; }} topLabel={'Leg Time'} suffix={'Min'} bind={this.legTime} formatter={this.timeInputFormat} textAlign='right' maxLength={3} tscConnected blurOnEnter />
            <InputField bus={this.props.bus} onModified={async (dist) => { this.holdType.set('Pilot Modified'); this.useLegDistance = true; this.legDist.set(dist); this.setLegTimeFromDist(dist); return true; }} topLabel={'Leg Distance'} suffix={'NM '} bind={this.legDist} formatter={this.distInputFormat} textAlign='right' maxLength={3} tscConnected blurOnEnter />
          </div>

          <div class="display">
            {/* <p>QUAD:NE   Direct</p> */}
            <div class="hold-container" style={{ 'transform': MappedSubject.create(([magneticType, magvar]) => `rotateZ(${magneticType === 'mag' ? magvar : 0}deg)`, this.magneticType, this.magVar) }}>
              <svg width="180" height="180" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
                <defs>
                  <marker id="arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                    <path d="M0,0 L5,2.5 L0,5" fill="white"></path>
                  </marker>
                  <marker id="invert-arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                    <path d="M5,0 L0,2.5 L5,5" fill="white"></path>
                  </marker>
                </defs>

                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.9987 6.54934C23.9999 3.65599 29.8066 2 36 2C41.658 2 46.9931 3.38202 51.6863 5.82691L48.4319 11.4638C48.8787 11.6907 49.3184 11.9293 49.7507 12.1794L53.0013 6.54934C57.7271 9.28337 61.7338 13.1223 64.6682 17.7128L59.0313 20.9673C59.3048 21.3854 59.5672 21.8115 59.8181 22.245L65.4482 18.9945C68.3431 23.9967 70 29.8048 70 36C70 42.193 68.3443 47.9992 65.4513 53.0002L59.8212 49.7496C59.5704 50.1832 59.3081 50.6093 59.0347 51.0276L64.6715 54.282C61.7375 58.8738 57.7307 62.7139 53.0044 65.4489L49.7538 59.8188C49.3215 60.0689 48.8818 60.3077 48.435 60.5346L51.6895 66.1714C46.9955 68.6174 41.6592 70 36 70C29.8053 70 23.9976 68.3433 18.9956 65.4489L22.2462 59.8188C21.8126 59.5679 21.3865 59.3055 20.9684 59.032L17.7139 64.6689C13.1225 61.7343 9.28298 57.7269 6.54868 53.0002L12.1788 49.7496C11.9287 49.3173 11.69 48.8775 11.4632 48.4307L5.8263 51.6852C3.3818 46.9922 2 41.6575 2 36C2 30.3403 3.38287 25.0036 5.82916 20.3094L11.466 23.5638C11.6929 23.1171 11.9317 22.6773 12.1819 22.245L6.55177 18.9945C9.28647 14.2691 13.1259 10.2629 17.7169 7.32917L20.9713 12.966C21.3895 12.6926 21.8157 12.4303 22.2493 12.1794L18.9987 6.54934ZM36 0C16.1177 0 0 16.1177 0 36C0 55.8823 16.1177 72 36 72C55.8823 72 72 55.8823 72 36C72 16.1177 55.8823 0 36 0Z" fill="white" style="transform: scale(1.25) translate(36px, 36px);" />
                <text font-size="13" x="89" fill="white" y="60" text-anchor="middle">0</text>
                <text font-size="13" x="50" fill="white" y="95" text-anchor="start">27</text>
                <text font-size="13" x="89" fill="white" y="130" text-anchor="middle">18</text>
                <text font-size="13" x="130" fill="white" y="95" text-anchor="end">9</text>
                <path d="M90 90.5, L90 32, L90 0" x1="90" y1="90.5" x2="90" y2="0" stroke="white" stroke-width="2" style={{ 'display': this.leg.map((leg) => leg?.calculated?.initialDtk === undefined ? 'none' : undefined), 'transform': MappedSubject.create(([magneticType, leg]) => `rotateZ(${(leg ? ((magneticType === 'mag' ? this.getLegMagneticCourse(leg) : this.getLegTrueCourse(leg)) ?? 0) - 180 : 0)}deg)`, this.magneticType, this.leg), 'transform-origin': '90px 90px' }} marker-mid="url(#invert-arrow)"></path>
                <path d="M90 90.5, L90 32, L90 0" x1="90" y1="90.5" x2="90" y2="0" stroke="white" stroke-width="2" style={{ 'display': this.nextLeg.map((leg) => leg?.calculated?.initialDtk === undefined ? 'none' : undefined), 'transform': MappedSubject.create(([magneticType, leg]) => `rotateZ(${(leg ? (magneticType === 'mag' ? this.getLegMagneticCourse(leg) : this.getLegTrueCourse(leg)) ?? 0 : 0)}deg)`, this.magneticType, this.nextLeg), 'transform-origin': '90px 90px' }} marker-mid="url(#arrow)"></path>
                <path d="M49.3 25c0-1.7-8.1-4.7-18.8-5.5C29.6 8.7 26.5.6 25 .6c-1.7 0-4.6 8.1-5.5 18.9C8.8 20.2.7 22.9.7 25c0 1.8 8 4.7 18.8 5.5.7 10.8 3.5 18.9 5.5 18.9 1.8 0 4.7-8.1 5.5-18.9 10.7-.9 18.8-4.1 18.8-5.5z" fill="#fff" style="transform: translate(77px, 78px) scale(0.5);"></path>
                <g style={{ 'transform-origin': '90px 90px', 'transform': MappedSubject.create(([crs, turnDir]) => `rotateZ(${(crs ?? 0) + 90}deg) scaleY(${turnDir === LegTurnDirection.Right ? 1 : -1})`, this.course, this.turnDirection) }}>
                  <rect x="80" y="74" width="65" height="16" rx="8" stroke="var(--epic2-color-cyan)" />
                  <path d="M6,0 L0,2 L6,6" fill="var(--epic2-color-cyan)" style="transform: translate(100px, 87.5px)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div class="line container-border" />
        <div class="lower-container">
          <div class="left">
            <p class="turn-title">Turn</p>
            <div class="radio-row">
              <RadioButton selectedValue={this.turnDirection} value={LegTurnDirection.Right} label={'Right'} />
              <RadioButton selectedValue={this.turnDirection} value={LegTurnDirection.Left} label={'Left'} />
            </div>
          </div>
          <div class="vertical-border" />
          <div class="right">
            <InputField bus={this.props.bus} onModified={async (speed) => {
              if (this.useLegDistance) {
                this.setLegTimeFromDist(this.legDist.get());
              } else {
                this.setLegDistFromTime(this.legTime.get());
              }

              this.speed.set(speed);
              return true;
            }}
              class={'side-text'}
              prefix={'Speed'}
              suffix={'Kt'}
              bind={this.speed}
              formatter={this.speedInputFormat}
              textAlign='right'
              maxLength={3}
              tscConnected tscDisplayLabel={'Speed'} blurOnEnter
            />
            <CheckBox isEnabled={false} label='Max Endurance' isChecked={Subject.create(false)} />
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
          label={'As Published'}
          isEnabled={false}
        />
        <TouchButton
          class={'insert-button'}
          variant={'bar-menu'}
          label={'Apply'}
          onPressed={() => { this.createHold(); }}
        />
      </div >
    );
  }
}
