import {
  ComponentProps, DisplayComponent, DisplayField, Facility, FlightPlan, FlightPlanLeg, FmcRenderTemplate, FSComponent, ICAO, LegTurnDirection, LegType,
  MappedSubject, NavMath, Subject, VNode,
} from '@microsoft/msfs-sdk';

import { StoredHold, UnsFlightPlans, UnsFms, UnsFmsUtils } from '../../Fms';
import { FixEntry } from '../../Fms/UnsFmsTypes';
import { UnsDisplayField } from '../Components/UnsDisplayField';
import { UnsTextInputField } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduParsers, UnsBearingFormat } from '../UnsCduIOUtils';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

import './UnsHoldingPage.css';

/**
 * Holding page text line data
 */
interface HoldingPageTextLineData {
  /** A list of items that to check against to display this line (the highlighted field must be in this array) */
  condition: HoldHighlightedElement[],

  /** The text to display, or a function taking the highlighted element and returning the text to display */
  text: string | ((highlighted: HoldHighlightedElement) => string),
}

/**
 * Holding page text line data for both holding pattern turn directions
 */
interface TwoSideHoldingPageTextLineData {
  /** The data when a left-hand hold is being displayed */
  leftTurnData: HoldingPageTextLineData,

  /** The data when a right-hand hold is being displayed */
  rightTurnData: HoldingPageTextLineData,
}

enum HoldHighlightedElement {
  None,
  Fix,
  InboundCourse,
  Direction,
  TurnDirection,
  Time,
  Distance,
}

/**
 * Store for {@link UnsHoldingPage}
 */
class UnsHoldingPageStore {
  /**
   * Constructor
   * @param targetPlan the target flight plan
   */
  constructor(public readonly targetPlan: FlightPlan) {
  }

  public readonly holdFixEntry = Subject.create<FixEntry | null>(null);

  public readonly showDisarm = Subject.create(false);

  public readonly highlightedElement = Subject.create(HoldHighlightedElement.None);

  public readonly holdFixIcao = Subject.create<string | null>(null);

  public readonly holdInboundCourse = Subject.create<number>(0);

  public readonly holdTurnDirection = Subject.create<LegTurnDirection.Left | LegTurnDirection.Right>(LegTurnDirection.Right);

  public readonly holdTime = Subject.create<number | null>(1.0);

  public readonly holdDistance = Subject.create<number | null>(null);

  public readonly holdTurnDirectionBeingEdited = Subject.create(false);
}

/**
 * Controller for {@link UnsHoldingPage}
 */
class UnsHoldingPageController {
  /**
   * Constructor
   * @param store the store
   * @param fms the fmd
   */
  constructor(private readonly store: UnsHoldingPageStore, private readonly fms: UnsFms) {
  }

  /**
   * Initializes the store data from a hold definition entry
   *
   * @param entry the hold definition entry
   * @param existingLeg the existing leg, if applicable
   */
  public async initializeFromEntry(entry: FixEntry, existingLeg?: FlightPlanLeg): Promise<void> {
    this.store.holdFixEntry.set(entry);

    let facility: Facility;
    switch (entry.type) {
      case 'existing': {
        const legSegment = this.store.targetPlan.getSegment(entry.segmentIndex);
        const leg = legSegment.legs[entry.localLegIndex];

        if ('' === leg.leg.fixIcao || ICAO.emptyIcao === leg.leg.fixIcao) {
          throw new Error('Invalid hold target leg: no fixIcao');
        }

        facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(leg.leg.fixIcao), leg.leg.fixIcao);
        break;
      }
      case 'random': {
        facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(entry.facilityIcao), entry.facilityIcao);
        break;
      }
    }

    if (existingLeg) {
      this.store.holdInboundCourse.set(existingLeg.course);
      this.store.holdTurnDirection.set(existingLeg.turnDirection === LegTurnDirection.Left ? LegTurnDirection.Left : LegTurnDirection.Right);
      (existingLeg.distanceMinutes ? this.store.holdTime : this.store.holdDistance).set(existingLeg.distance);
    }

    this.store.holdFixIcao.set(facility.icao);

    this.updateStoredHold();
  }

  /**
   * Creates a {@link FlightPlanLeg} object based on the page's current state
   *
   * @returns a flight plan leg
   */
  private createHoldLeg(): FlightPlanLeg {
    return FlightPlan.createLeg({
      fixIcao: this.store.holdFixIcao.get() ?? ICAO.EMPTY_V1,
      type: LegType.HM,
      course: this.store.holdInboundCourse.get(),
      turnDirection: this.store.holdTurnDirection.get(),
      distance: this.store.holdDistance.get() ?? this.store.holdTime.get() ?? NaN,
      distanceMinutes: this.store.holdDistance.get() === null,
    });
  }

  /**
   * Updates the flight plan stored hold based on the current state of the page
   *
   * @throws if there is no entry in the store
   */
  private updateStoredHold(): void {
    const entry = this.store.holdFixEntry.get();

    if (!entry) {
      throw new Error('[UnsHoldingPageController](updateStoredHold) entry was null');
    }

    const hold: StoredHold = { entry, leg: this.createHoldLeg() };

    this.fms.setFlightPlanStoredHold(UnsFlightPlans.Active, hold);
  }

  /**
   * Removes the flight plan stored hold
   */
  private removeStoredHold(): void {
    this.fms.setFlightPlanStoredHold(UnsFlightPlans.Active, undefined);
  }

  /**
   * Arms the hold currently described by the page, if the fix entry was of 'existing' type
   */
  public async armHold(): Promise<void> {
    this.updateStoredHold();

    const entry = this.store.holdFixEntry.get();

    if (!entry || entry.type !== 'existing') {
      throw new Error('[UnsHoldingPageController](armHold) entry was null or not of \'existing\' type');
    }

    // TODO move to fms

    const holdCreated = this.fms.createHold(this.store.targetPlan.getSegment(entry.segmentIndex).offset + entry.localLegIndex, this.createHoldLeg());

    if (!holdCreated) {
      throw new Error('[UnsHoldingPageController](armHold) UnsFms::createHold returned false');
    }
  }

  /**
   * Disarms the hold currently described by the page, if the fix entry was of 'existing' type
   */
  public async disarmHold(): Promise<void> {
    this.updateStoredHold();

    const entry = this.store.holdFixEntry.get();

    if (!entry || entry.type !== 'existing') {
      throw new Error('[UnsHoldingPageController](disarmHold) entry was null or not of \'existing\' type');
    }

    const holdRemoved = this.fms.removeWaypoint(entry.segmentIndex, entry.localLegIndex);

    if (!holdRemoved) {
      throw new Error('[UnsHoldingPageController](disarmHold) UnsFms::removeWaypoint returned false');
    }

    this.removeStoredHold();
  }

  /**
   * Creates a DTO to the hold described by the page, if the fix entry was of 'random' type
   */
  public async dtoHold(): Promise<void> {
    this.updateStoredHold();

    const entry = this.store.holdFixEntry.get();

    if (!entry || entry.type !== 'random') {
      throw new Error('[UnsHoldingPageController](dtoHold) entry was null or not of \'existing\' type');
    }

    // TODO move to fms

    const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(entry.facilityIcao), entry.facilityIcao);

    this.fms.createDirectTo({ isNewDto: true, facility });

    const segmentIndex = this.store.targetPlan.directToData.segmentIndex;
    const localLegIndex = this.store.targetPlan.directToData.segmentLegIndex + UnsFmsUtils.DTO_LEG_OFFSET;

    if (segmentIndex === -1 || localLegIndex === -1) {
      throw new Error('[UnsHoldingPageController](dtoHold) segmentIndex/localLegIndex was -1');
    }

    const holdCreated = this.fms.createHold(this.store.targetPlan.getSegment(segmentIndex).offset + localLegIndex, this.createHoldLeg());

    if (!holdCreated) {
      throw new Error('[UnsHoldingPageController](dtoHold) UnsFms::createHold returned false');
    }
  }

  /**
   * Callback for when the page is paused
   */
  public onPagePause(): void {
    if (!this.store.showDisarm.get()) {
      this.updateStoredHold();
    }
  }
}

/**
 * UNS HOLDING page
 */
export class UnsHoldingPage extends UnsFmcPage {
  private readonly store = new UnsHoldingPageStore(this.fms.getPrimaryFlightPlan());

  private readonly controller = new UnsHoldingPageController(this.store, this.fms);

  // TODO should be editable (bring up hold fix page)
  private readonly FixField = new DisplayField<string | null>(this, {
    formatter: {
      nullValueString: '-----',
      format: (value) => ICAO.getIdent(value),
    },
  }).bind(this.store.holdFixIcao);

  private readonly InboundCourseField = new UnsTextInputField<number | null, number>(this, {
    maxInputCharacterCount: 3,
    formatter: new UnsBearingFormat(),

    onSelected: async () => {
      const nowFocused = this.screen.toggleFieldFocused(this.InboundCourseField);

      this.store.highlightedElement.set(nowFocused ? HoldHighlightedElement.InboundCourse : HoldHighlightedElement.None);

      return true;
    },

    onModified: async (value) => {
      this.store.holdInboundCourse.set(value);
      return true;
    },
  }).bindWrappedData(this.store.holdInboundCourse);

  private readonly DirectionField = new UnsTextInputField<number | null, number>(this, {
    maxInputCharacterCount: 3,
    formatter: new UnsBearingFormat(),

    onSelected: async () => {
      const nowFocused = this.screen.toggleFieldFocused(this.DirectionField);

      this.store.highlightedElement.set(nowFocused ? HoldHighlightedElement.Direction : HoldHighlightedElement.None);

      return true;
    },

    onModified: async (value) => {
      this.store.holdInboundCourse.set(NavMath.reciprocateHeading(value));
      return true;
    },
  }).bindWrappedData(this.store.holdInboundCourse.map((it) => NavMath.reciprocateHeading(it)));

  private readonly TurnDirectionField = new UnsTextInputField<readonly [LegTurnDirection, boolean], LegTurnDirection>(this, {
    maxInputCharacterCount: 0,
    acceptEmptyInput: true,
    formatter: {
      /** @inheritDoc */
      format([[value, beingEdited], isHighlighted]): string {
        let directionString: string;
        if (beingEdited) {
          directionString = (value === LegTurnDirection.Left ? 'L' : 'R').padEnd(5, ' ');
        } else {
          directionString = (value === LegTurnDirection.Left ? 'LEFT' : 'RIGHT').padEnd(5, ' ');
        }

        return `${directionString}[${isHighlighted ? 'r-white' : 'white'} d-text]`;
      },

      parse: () => this.store.holdTurnDirection.get(),
    },

    onPlusMinusPressed: async () => {
      const currentTurnDirection = this.store.holdTurnDirection.get();

      this.store.holdTurnDirection.set(currentTurnDirection === LegTurnDirection.Left ? LegTurnDirection.Right : LegTurnDirection.Left);
      this.store.holdTurnDirectionBeingEdited.set(true);

      return true;
    },

    onSelected: async () => {
      const nowFocused = this.screen.toggleFieldFocused(this.TurnDirectionField);

      this.store.highlightedElement.set(nowFocused ? HoldHighlightedElement.TurnDirection : HoldHighlightedElement.None);

      return true;
    },

    onModified: async () => {
      this.store.holdTurnDirectionBeingEdited.set(false);
      return false;
    },
  }).bindWrappedData(MappedSubject.create(this.store.holdTurnDirection, this.store.holdTurnDirectionBeingEdited));

  private readonly TimeField = new UnsTextInputField<number | null, number>(this, {
    maxInputCharacterCount: 3,
    interpretPlusMinusAs: '.',
    formatter: {
      /** @inheritDoc */
      format([value, isHighlighted, typedText]): string {
        const valueString = `${value?.toFixed(1).padStart(4, ' ') ?? '----'}`;

        if (isHighlighted) {
          return `${(typedText.length > 0 ? typedText : valueString).padEnd(4, ' ')}[r-white d-text]`;
        } else {
          return valueString;
        }
      },

      parse: UnsCduParsers.NumberDecimalPositive(2, 1),
    },

    onSelected: async () => {
      const nowFocused = this.screen.toggleFieldFocused(this.TimeField);

      this.store.highlightedElement.set(nowFocused ? HoldHighlightedElement.Time : HoldHighlightedElement.None);

      return true;
    },

    onModified: async (time) => {
      this.store.holdTime.set(time);
      this.store.holdDistance.set(null);

      return true;
    },
  }).bindWrappedData(this.store.holdTime);

  private readonly DistanceField = new UnsTextInputField<number | null, number>(this, {
    maxInputCharacterCount: 3,
    interpretPlusMinusAs: '.',
    formatter: {
      /** @inheritDoc */
      format([value, isHighlighted, typedText]): string {
        const valueString = `${value?.toFixed(1).padStart(4, ' ') ?? '----'}`;

        if (isHighlighted) {
          return `${(typedText.length > 0 ? typedText : valueString).padEnd(4, ' ')}[r-white d-text]`;
        } else {
          return valueString;
        }
      },

      parse: UnsCduParsers.NumberDecimalPositive(2, 1),
    },

    onSelected: async () => {
      const nowFocused = this.screen.toggleFieldFocused(this.DistanceField);

      this.store.highlightedElement.set(nowFocused ? HoldHighlightedElement.Distance : HoldHighlightedElement.None);

      return true;
    },

    onModified: async (time) => {
      this.store.holdDistance.set(time);
      this.store.holdTime.set(null);

      return true;
    },
  }).bindWrappedData(this.store.holdDistance);

  private readonly ArmOrDtoHoldLink = new UnsDisplayField<readonly [FixEntry | null, boolean]>(this, {
    formatter: ([[entry, showDisarm], isHighlighted]) => {
      let text: string;
      if (showDisarm) {
        text = `${UnsChars.ArrowLeft}DISARM HOLD`;
      } else if (entry && entry.type === 'existing') {
        text = `${UnsChars.ArrowLeft}ARM HOLD`;
      } else {
        text = `${UnsChars.ArrowLeft}DTO HOLD`;
      }

      return `${text}[${isHighlighted ? 'r-white' : 'white'}]`;
    },

    onSelected: async () => {
      this.screen.toggleFieldFocused(this.ArmOrDtoHoldLink);
      return true;
    },

    onEnterPressed: async () => {
      const doDisarm = this.store.showDisarm.get();
      const holdType = this.store.holdFixEntry.get()?.type ?? 'random';

      if (doDisarm) {
        await this.controller.disarmHold();
      } else if (holdType === 'existing') {
        await this.controller.armHold();
      } else {
        await this.controller.dtoHold();
      }

      this.screen.navigateTo('/maneuver');
      return true;
    },
  }).bindWrappedData(MappedSubject.create(this.store.holdFixEntry, this.store.showDisarm));

  private readonly ReturnLink = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      return true;
    },
  });

  /**
   * Creates a display field for text in the hold graphic
   *
   * @param data the data for both holding pattern turn directions
   *
   * @returns a display field
   */
  private makeHoldGraphicTextLine(data: TwoSideHoldingPageTextLineData): DisplayField<string> {
    const text = MappedSubject.create(([highlightedElement, turnDirection]) => {
      const showAll = highlightedElement === HoldHighlightedElement.None;

      if (turnDirection === LegTurnDirection.Left && (data.leftTurnData.condition.includes(highlightedElement) || showAll)) {
        return typeof data.leftTurnData.text === 'string' ? data.leftTurnData.text : data.leftTurnData.text(highlightedElement);
      } else if (turnDirection === LegTurnDirection.Right && (data.rightTurnData.condition.includes(highlightedElement) || showAll)) {
        return typeof data.rightTurnData.text === 'string' ? data.rightTurnData.text : data.rightTurnData.text(highlightedElement);
      }

      return ` [cyan line-tb s-text]${' '.repeat(12)}[white s-text] [cyan line-tb s-text]`;
    }, this.store.highlightedElement, this.store.holdTurnDirection);

    return new DisplayField<string>(this, {
      formatter: (highlighted) => `${highlighted}`,
    }).bind(text);
  }

  private readonly HoldGraphicTextLines = [
    ' [cyan line-bmr s-text]            [cyan line-rl s-text] [cyan line-lmb s-text]',
    ' [cyan line-tb s-text]            [s-text] [cyan line-tb s-text]',
    ' [cyan line-tb s-text]            [s-text] [cyan line-tb s-text]',
    this.makeHoldGraphicTextLine({
      leftTurnData: { condition: [HoldHighlightedElement.Direction], text: ' [cyan line-tb s-text]    DIR     [s-text] [cyan line-tb s-text]' },
      rightTurnData: { condition: [HoldHighlightedElement.Direction], text: ' [cyan line-tb s-text]    DIR     [s-text] [cyan line-tb s-text]' },
    }),
    this.makeHoldGraphicTextLine({
      leftTurnData: { condition: [HoldHighlightedElement.TurnDirection], text: ' [cyan line-tb s-text]       TURN [s-text] [cyan line-tb s-text]' },
      rightTurnData: { condition: [HoldHighlightedElement.TurnDirection], text: ' [cyan line-tb s-text] TURN       [s-text] [cyan line-tb s-text]' },
    }),
    this.makeHoldGraphicTextLine({
      leftTurnData: {
        condition: [HoldHighlightedElement.Time, HoldHighlightedElement.Distance], text:
          (highlighted) => ` [cyan line-tb s-text]    ${highlighted === HoldHighlightedElement.Time ? 'TIME' : 'DIST'}    [s-text] [cyan line-tb s-text]`,
      },
      rightTurnData: {
        condition: [HoldHighlightedElement.Time, HoldHighlightedElement.Distance], text:
          (highlighted) => ` [cyan line-tb s-text]    ${highlighted === HoldHighlightedElement.Time ? 'TIME' : 'DIST'}    [s-text] [cyan line-tb s-text]`,
      },
    }),
    ' [cyan line-tb s-text]            [s-text] [cyan line-tb s-text]',
    this.makeHoldGraphicTextLine({
      leftTurnData: { condition: [HoldHighlightedElement.InboundCourse], text: ' [cyan line-tb s-text]INBD     FIX[s-text] [cyan line-tb s-text]' },
      rightTurnData: { condition: [HoldHighlightedElement.InboundCourse], text: ' [cyan line-tb s-text] FIX    INBD[s-text] [cyan line-tb s-text]' },
    }),
    ' [cyan line-tmr s-text]            [cyan line-rl s-text] [cyan line-lmt s-text]',
  ];

  protected pageTitle = ' HOLDING';

  public cursorPath: UnsCduCursorPath = {
    initialPosition: () => this.store.showDisarm.get() ? this.ArmOrDtoHoldLink : this.InboundCourseField,
    rules: new Map([
      [this.InboundCourseField, this.DirectionField],
      [this.DirectionField, this.TurnDirectionField],
      [this.TurnDirectionField, this.TimeField],
      [this.TimeField, this.DistanceField],
      [this.ArmOrDtoHoldLink, this.ArmOrDtoHoldLink],
    ] as [UnsTextInputField<any, any>, UnsTextInputField<any, any>][]),
  };

  /** @inheritDoc */
  protected override onResume(): void {
    const hold = this.params.get('hold') as FixEntry | undefined;

    if (!hold) {
      throw new Error('UnsHoldingPage loaded without hold param');
    }

    const leg = this.params.get('leg') as FlightPlanLeg | undefined;

    const disarm = (this.params.get('disarm')) as boolean | undefined ?? false;

    this.store.showDisarm.set(disarm);

    this.controller.initializeFromEntry(hold, leg).then();
  }

  /** @inheritDoc */
  protected override onPause(): void {
    this.controller.onPagePause();
  }

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['FIX[cyan s-text]', 'TIME[cyan s-text]', this.HoldGraphicTextLines[0]],
        [this.FixField, this.TimeField, this.HoldGraphicTextLines[1]],
        ['INBD[cyan s-text]', 'DIST[cyan s-text]', this.HoldGraphicTextLines[2]],
        [this.InboundCourseField, this.DistanceField, this.HoldGraphicTextLines[3]],
        ['DIR[cyan s-text]', 'ETA[cyan s-text]', this.HoldGraphicTextLines[4]],
        [this.DirectionField, '--:--', this.HoldGraphicTextLines[5]],
        ['TURN[cyan s-text]', 'ENTRY[cyan s-text]', this.HoldGraphicTextLines[6]],
        [this.TurnDirectionField, 'DRECT', this.HoldGraphicTextLines[7]],
        ['', '', this.HoldGraphicTextLines[8]],
        [this.ArmOrDtoHoldLink, this.ReturnLink],
      ],
    ];
  }

  /** @inheritDoc */
  public override renderJsxOverlay(): VNode {
    return (
      <UnsHoldingPageOverlay store={this.store} />
    );
  }
}

/**
 * Props for {@link UnsHoldingPageOverlay}
 */
interface UnsHoldingPageOverlayProps extends ComponentProps {
  /** The store */
  store: UnsHoldingPageStore,
}

/**
 * Holding page JSX overlay graphic
 */
class UnsHoldingPageOverlay extends DisplayComponent<UnsHoldingPageOverlayProps> {
  private static readonly TURN_DIR_TO_HOLD_OUTLINE = {
    [LegTurnDirection.Left]: 'M 230 260 l 170 0 a 8 8 90 0 0 0 -142 l -170 0 a 8 8 90 0 0 0 142 M 220 260 l -58 0',
    [LegTurnDirection.Right]: 'M 230 260 l 170 0 a 8 8 90 0 0 0 -142 l -170 0 a 8 8 90 0 0 0 142 M 390 260 l 78 0',
  };

  private readonly highlightedElementToVisibilityFn = (
    direction: LegTurnDirection.Left | LegTurnDirection.Right,
    ...elements: HoldHighlightedElement[]
  ): MappedSubject<[HoldHighlightedElement, LegTurnDirection.Left | LegTurnDirection.Right], 'visible' | 'hidden'> =>
    MappedSubject.create(([highlighted, turnDirection]) => {
      const visible = elements.includes(highlighted) || HoldHighlightedElement.None === highlighted;
      const correctTurnDirection = turnDirection === direction;

      return (visible && correctTurnDirection) ? 'visible' : 'hidden';
    }, this.props.store.highlightedElement, this.props.store.holdTurnDirection);

  /** @inheritDoc */
  public override render(): VNode | null {
    return (
      <svg class="uns-hold-overlay" viewBox="0 0 630 396">
        <defs>
          <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="0" refY="2" orient="auto">
            <polygon points="0 0, 2 2, 0 4" fill="white" />
          </marker>

          <marker id="arrowhead-line" markerWidth="3.5" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 1.75, 1.625 3.375, 0 5.25" fill="white" />

            <line x1="2" x2="2" y1="0" y2="7" stroke="white" stroke-width="1" fill="none" />
          </marker>
        </defs>

        <path d={this.props.store.holdTurnDirection.map((it) => UnsHoldingPageOverlay.TURN_DIR_TO_HOLD_OUTLINE[it])} stroke="white" fill="none" stroke-width={8} />

        {/* Right-hand hold INBD arrow */}
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Right, HoldHighlightedElement.InboundCourse)}
          x1="468"
          y1="275"
          x2="380"
          y2="275"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead)"
        />

        {/* Left-hand hold INBD arrow */}
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Left, HoldHighlightedElement.InboundCourse)}
          x1="162"
          y1="275"
          x2="250"
          y2="275"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead)"
        />

        {/* Right-hand hold TIME/DIST arrows */}
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Right, HoldHighlightedElement.Time, HoldHighlightedElement.Distance)}
          x1="367"
          y1="235"
          x2="389"
          y2="235"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead-line)"
        />
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Right, HoldHighlightedElement.Time, HoldHighlightedElement.Distance)}
          x1="260"
          y1="235"
          x2="238"
          y2="235"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead-line)"
        />

        {/* Left-hand hold TIME/DIST arrows */}
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Left, HoldHighlightedElement.Time, HoldHighlightedElement.Distance)}
          x1="366"
          y1="235"
          x2="388"
          y2="235"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead-line)"
        />
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Left, HoldHighlightedElement.Time, HoldHighlightedElement.Distance)}
          x1="260"
          y1="235"
          x2="238"
          y2="235"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead-line)"
        />

        {/* Right-hand hold TURN arrow */}
        <path
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Right, HoldHighlightedElement.TurnDirection)}
          d="M 225 235 a 48 48 0 0 1 -48 -50"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead)"
        />

        {/* Left-hand hold TURN arrow TODO this needs to be adjusted a little, it needs to start more to the left */}
        <path
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Left, HoldHighlightedElement.TurnDirection)}
          d="M 405 235 a 48 48 0 0 0 48 -50"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead)"
        />

        {/* Right-hand hold DIR arrow */}
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Right, HoldHighlightedElement.Direction)}
          x1="265"
          y1="134"
          x2="368"
          y2="134"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead)"
        />
        {/* Right-hand hold DIR arrow */}
        <line
          visibility={this.highlightedElementToVisibilityFn(LegTurnDirection.Left, HoldHighlightedElement.Direction)}
          x1="362"
          y1="134"
          x2="275"
          y2="134"
          stroke="#fff"
          fill="none"
          stroke-width="5"
          marker-end="url(#arrowhead)"
        />
      </svg>
    );
  }
}
