import { FlightPathUtils, FSComponent, ICAO, LegDefinition, MagVar, MappedSubject, NavMath, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  BearingInputFormat, Epic2Fms, FlightPlanStore, InputField, KeyboardInputButton, Modal, ModalProps, RadioButton, TouchButton
} from '@microsoft/msfs-epic2-shared';

import './InterceptModal.css';

/** Properties for the {@link InterceptModal} class */
interface InterceptModalProps extends ModalProps {
  /** fms */
  readonly fms: Epic2Fms
  /** The active flight plan store.  */
  readonly store: FlightPlanStore;
}

/** Modal used for the join airway menu */
export class InterceptModal extends Modal<InterceptModalProps> {
  protected readonly cssClassSet = SetSubject.create(['intercept-modal']);

  private readonly course = Subject.create<number | null>(null);
  private readonly magneticType = Subject.create<'mag' | 'true'>('mag');

  private segmentIndex?: number;
  private localLegIndex?: number;
  private readonly leg = Subject.create<LegDefinition | null>(null);
  private readonly nextLeg = Subject.create<LegDefinition | null>(null);

  private readonly magVar = Subject.create<number>(0);

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
   * @param legIndex the global index of the intercept leg
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
    this.magVar.set(facility ? Math.round(MagVar.get(facility.lat, facility.lon)) : 0);
    this.course.set(inboundCourse);
  }

  /**
   * Creates and inserts a intercept into the pending plan
   */
  private createIntercept(): void {
    const course = this.course.get();
    if (this.segmentIndex !== undefined && this.localLegIndex !== undefined && course !== null) {
      this.props.fms.interceptLeg(this.segmentIndex, this.localLegIndex, course);
    }
    this.close();
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.fms.planInMod.sub((inMod) => {
      if (!inMod) {
        this.close();
      }
    });

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
    this.course.set(null);
    this.magneticType.set('mag');
  }

  // Input Formatters
  private readonly bearingInputFormat = new BearingInputFormat('---');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Intercept {this.leg.map((leg) => leg?.name)} Via</p>
          <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
          <TouchButton variant="bar" label="X" class="close-button" onPressed={() => this.close()} />
        </div>
        <div class="display">
          <div class="intercept-container" style={{ 'transform': MappedSubject.create(([magneticType, magvar]) => `rotateZ(${magneticType === 'mag' ? magvar : 0}deg)`, this.magneticType, this.magVar) }}>
            <svg width="320" height="230" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
              <defs>
                <marker id="arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                  <path d="M0,0 L5,2.5 L0,5" fill="white"></path>
                </marker>
                <marker id="hold-arrow" refX="2.5" refY="2.5" orient="auto" markerWidth="5" markerHeight="5">
                  <path d="M1,0.5 L3,2.5 L1,4.5" fill="var(--epic2-color-cyan)"></path>
                </marker>
                <marker id="invert-arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                  <path d="M5,0 L0,2.5 L5,5" fill="white"></path>
                </marker>
              </defs>

              <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M45.9926 6.67126C42.6971 7.95326 39.5245 9.48119 36.4973 11.2325L40.9981 19.028C40.565 19.2786 40.1353 19.5344 39.7091 19.7954L35.2071 11.9978C32.1958 13.8285 29.3358 15.8832 26.6501 18.1388L29.2213 21.203C28.8383 21.5247 28.4591 21.8507 28.0837 22.1809L25.5119 19.1159C22.87 21.434 20.4067 23.9506 18.1452 26.6425L21.2094 29.2137C20.8879 29.5965 20.5706 29.983 20.2578 30.3732L17.1928 27.8014C14.996 30.5341 13.0032 33.4376 11.2374 36.489L19.0329 40.9897C18.7826 41.4222 18.5375 41.8581 18.2978 42.2974L10.5002 37.7954C9.05376 40.4252 7.77383 43.1595 6.67457 45.9841L10.4353 47.3529C10.2535 47.8181 10.077 48.286 9.90565 48.7563L6.14586 47.3879C4.95367 50.6616 4.0023 54.051 3.31317 57.5347L7.25406 58.2296C7.15653 58.7192 7.0645 59.2107 6.97804 59.7041L3.03816 59.0094C2.35581 62.9036 2 66.9103 2 71C2 74.5686 2.2709 78.0738 2.79326 81.4964L6.73415 80.8015C6.80907 81.2969 6.88959 81.7904 6.97563 82.2821L3.03574 82.9768C3.64833 86.4771 4.52474 89.8867 5.64371 93.1843L9.40446 91.8156C9.5647 92.2899 9.73025 92.7617 9.90107 93.2311L6.14127 94.5995C7.35136 97.9244 8.80984 101.13 10.4943 104.194L18.2919 99.6919C18.5316 100.131 18.7765 100.567 19.0267 101L11.2312 105.5C12.9968 108.552 14.9894 111.457 17.186 114.19L20.251 111.618C20.5638 112.009 20.881 112.395 21.2025 112.778L18.1382 115.349C20.3997 118.042 22.8631 120.559 25.5051 122.878L28.077 119.813C28.4523 120.143 28.8315 120.469 29.2144 120.791L26.6432 123.855C29.329 126.112 32.1894 128.167 35.201 129.999L39.703 122.201C40.1292 122.462 40.5588 122.718 40.9919 122.968L36.4912 130.764C39.5188 132.516 42.692 134.044 45.9881 135.327L47.3569 131.566C47.8221 131.748 48.29 131.925 48.7604 132.096L47.392 135.856C50.6662 137.048 54.0562 137.999 57.5404 138.688L58.2353 134.747C58.7248 134.845 59.2164 134.937 59.7098 135.023L59.0151 138.963C62.9076 139.645 66.9123 140 71 140C74.5714 140 78.0794 139.729 81.5046 139.205L80.8097 135.265C81.3051 135.19 81.7986 135.109 82.2902 135.023L82.985 138.963C86.4855 138.35 89.8953 137.473 93.193 136.353L91.8242 132.593C92.2985 132.432 92.7703 132.267 93.2396 132.096L94.6081 135.856C97.933 134.645 101.139 133.186 104.202 131.501L99.7004 123.703C100.14 123.464 100.576 123.219 101.008 122.968L105.509 130.764C108.561 128.998 111.465 127.005 114.198 124.808L111.626 121.743C112.016 121.43 112.403 121.113 112.786 120.791L115.357 123.855C118.049 121.594 120.566 119.13 122.885 116.487L119.82 113.916C120.15 113.54 120.476 113.161 120.798 112.778L123.862 115.349C126.118 112.663 128.173 109.803 130.004 106.791L122.206 102.289C122.467 101.863 122.723 101.433 122.973 101L130.769 105.5C132.768 102.045 134.475 98.4002 135.859 94.5995L132.099 93.2311C132.27 92.7617 132.435 92.2899 132.596 91.8155L136.356 93.1843C137.475 89.8868 138.352 86.4772 138.964 82.9768L135.024 82.2821C135.11 81.7905 135.191 81.2969 135.266 80.8016L139.207 81.4964C139.729 78.0739 140 74.5686 140 71C140 66.9103 139.644 62.9036 138.962 59.0094L135.022 59.7041C134.936 59.2106 134.843 58.7191 134.746 58.2296L138.687 57.5347C137.998 54.051 137.046 50.6616 135.854 47.3879L132.094 48.7564C131.923 48.286 131.746 47.8181 131.565 47.3529L135.325 45.9841C134.043 42.6886 132.514 39.5161 130.763 36.4889L122.967 40.9897C122.716 40.5566 122.461 40.1269 122.199 39.7008L129.997 35.1988C128.166 32.1877 126.111 29.3279 123.855 26.6425L120.791 29.2137C120.469 28.8308 120.143 28.4516 119.813 28.0763L122.878 25.5044C120.559 22.8629 118.042 20.3999 115.35 18.1388L112.779 21.2031C112.396 20.8815 112.009 20.5643 111.619 20.2516L114.191 17.1865C111.458 14.9903 108.554 12.9979 105.503 11.2325L101.002 19.028C100.569 18.7778 100.133 18.5328 99.6941 18.2932L104.196 10.4955C101.133 8.81124 97.9278 7.35285 94.6036 6.14275L93.2351 9.90254C92.7658 9.7317 92.2939 9.56611 91.8196 9.40585L93.1884 5.6451C89.8914 4.52607 86.4823 3.64954 82.9825 3.03674L82.2878 6.97663C81.7962 6.89055 81.3027 6.80999 80.8073 6.73502L81.5022 2.79414C78.0778 2.27121 74.5706 2 71 2C66.9131 2 62.9092 2.35531 59.0175 3.03673L59.7122 6.97662C59.2188 7.06302 58.7273 7.15498 58.2377 7.25245L57.5428 3.31157C54.0593 4.00023 50.6701 4.95109 47.3965 6.14273L48.7649 9.90252C48.2945 10.0738 47.8266 10.2503 47.3614 10.432L45.9926 6.67126ZM0 71C0 31.7878 31.7878 0 71 0C110.212 0 142 31.7878 142 71C142 110.212 110.212 142 71 142C31.7878 142 0 110.212 0 71Z" fill="white" style="transform: translate(18px, 18px)"></path>
              <text font-size="13" x="89" fill="white" y="33" text-anchor="middle">0</text>
              <text font-size="13" x="22" fill="white" y="95" text-anchor="start">27</text>
              <text font-size="13" x="89" fill="white" y="156" text-anchor="middle">18</text>
              <text font-size="13" x="156" fill="white" y="95" text-anchor="end">9</text>
              <path d="M90 90.5, L90 40, L90 0" x1="90" y1="90.5" x2="90" y2="0" stroke="white" stroke-width="1.5" style={{ 'display': this.leg.map((leg) => leg?.calculated?.initialDtk === undefined ? 'none' : undefined), 'transform': MappedSubject.create(([magneticType, leg]) => `rotateZ(${(leg ? ((magneticType === 'mag' ? this.getLegMagneticCourse(leg) : this.getLegTrueCourse(leg)) ?? 0) - 180 : 0)}deg)`, this.magneticType, this.leg), 'transform-origin': '90px 90px' }} marker-mid="url(#invert-arrow)"></path>
              <path d="M90 90.5, L90 40, L90 0" x1="90" y1="90.5" x2="90" y2="0" stroke="white" stroke-width="1.5" style={{ 'display': this.nextLeg.map((leg) => leg?.calculated?.initialDtk === undefined ? 'none' : undefined), 'transform': MappedSubject.create(([magneticType, leg]) => `rotateZ(${(leg ? (magneticType === 'mag' ? this.getLegMagneticCourse(leg) : this.getLegTrueCourse(leg)) ?? 0 : 0)}deg)`, this.magneticType, this.nextLeg), 'transform-origin': '90px 90px' }} marker-mid="url(#arrow)"></path>
              <path d="M49.3 25c0-1.7-8.1-4.7-18.8-5.5C29.6 8.7 26.5.6 25 .6c-1.7 0-4.6 8.1-5.5 18.9C8.8 20.2.7 22.9.7 25c0 1.8 8 4.7 18.8 5.5.7 10.8 3.5 18.9 5.5 18.9 1.8 0 4.7-8.1 5.5-18.9 10.7-.9 18.8-4.1 18.8-5.5z" fill="#fff" style="transform: translate(77px, 78px) scale(0.5);"></path>
              <g style={{ 'transform-origin': '90px 90px', 'transform': this.course.map((crs) => `rotateZ(${(crs ?? 0) + 180}deg)`) }}>
                <path d="M90 -20, L90 20" x1="90" y1="90.5" x2="90" y2="0" stroke="var(--epic2-color-cyan)" stroke-width="4" marker-end="url(#hold-arrow)"></path>
              </g>
            </svg>
          </div>
        </div>
        <div class="lower-container">
          <div class="crs-input">
            <InputField class={'side-text'} prefix={'CRS: '} suffix={'°'} bind={this.course} formatter={this.bearingInputFormat} textAlign='right' maxLength={3} bus={this.props.bus} />
          </div>
          <div class="radio-row">
            <RadioButton selectedValue={this.magneticType} value={'mag'} label={'Mag'} />
            <RadioButton selectedValue={this.magneticType} value={'true'} label={'True'} />
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
          class={'insert-button'}
          variant={'bar-menu'}
          label={'Apply'}
          onPressed={() => { this.createIntercept(); }}
        />
      </div >
    );
  }
}
