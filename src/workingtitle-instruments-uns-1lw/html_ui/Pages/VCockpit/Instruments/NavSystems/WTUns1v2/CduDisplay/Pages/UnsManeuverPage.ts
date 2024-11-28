import {
  ConsumerSubject, DisplayField, EventBus, FlightPlanUtils, FmcRenderTemplate, FmcRenderTemplateColumn, LegDefinition,
  LegType, LNavEvents, PageLinkField, Subject, Subscription,
} from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';
import { UnsChars } from '../UnsCduDisplay';
import { UnsFmsConfigInterface } from '../../Config/FmsConfigBuilder';
import { UnsFlightPlans, UnsFms } from '../../Fms';

/**
 * Store for {@link UnsManeuverPage}
 */
class UnsManeuverPageStore {
  /**
   * Constructor
   * @param bus the event bus
   * @param fms the fms
   * @param fmsConfig the fms config
   */
  constructor(
    private readonly bus: EventBus,
    private readonly fms: UnsFms,
    private readonly fmsConfig: UnsFmsConfigInterface,
  ) {
  }

  /**
   * Creates and returns subscriptions that should be bound to the page
   *
   * @returns an array of subscriptions
   */
  public createSubscriptions(): Subscription[] {
    this.fms.flightPlanner.onEvent('fplLegChange').handle(() => this.updateActiveLeg(this.activeLegIndex.get()));
    this.fms.flightPlanner.onEvent('fplSegmentChange').handle(() => this.updateActiveLeg(this.activeLegIndex.get()));

    return [
      this.activeLegIndex,
      this.activeLegIndex.sub((index) => this.updateActiveLeg(index)),
    ];
  }

  public readonly activeLegIndex = ConsumerSubject.create(
    this.bus.getSubscriber<LNavEvents>().on(`lnav_tracked_leg_index_${this.fmsConfig.lnav.index}`),
    -1,
  );

  public readonly activeLeg = Subject.create<LegDefinition | null>(null);

  public readonly isHolding = this.activeLeg.map((it) => it !== null && FlightPlanUtils.isHoldLeg(it.leg.type));

  /**
   * Updates the stored active leg object with a given index
   *
   * @param index the active leg index
   */
  private updateActiveLeg(index: number): void {
    if (index === -1) {
      this.activeLeg.set(null);
      return;
    }

    this.activeLeg.set(this.fms.getPrimaryFlightPlan().getLeg(index));
  }
}

/**
 * Controller for {@link UnsManeuverPage}
 */
class UnsManeuverPageController {
  /**
   * Constructor
   *
   * @param fms the fms
   */
  constructor(private readonly fms: UnsFms) {
  }

  /**
   * Proceeds from the active holding pattern
   *
   * @throws if the operation is invalid
   */
  public proceedFromHold(): void {
    const plan = this.fms.getPrimaryFlightPlan();
    const activeLegIndex = plan.activeLateralLeg;

    const previousLegIndex = activeLegIndex - 1;
    const previousLeg = plan.getLeg(previousLegIndex);
    const previousActiveLegSegment = plan.getSegmentFromLeg(previousLeg);

    if (!previousActiveLegSegment) {
      throw new Error('[UnsManeuverPageController](proceedFromHold) Segment not found for previous active leg');
    }
    const didProceed = this.fms.proceedFromHold(previousActiveLegSegment.segmentIndex, previousLegIndex - previousActiveLegSegment.offset);

    if (!didProceed) {
      throw new Error('[UnsManeuverPageController](proceedFromHold) UnsFms::proceedFromHold returned false');
    }
  }

  /**
   * Continues the active holding pattern, if it is an HF leg
   *
   * @throws if the operation is invalid
   */
  public continueHold(): void {
    const plan = this.fms.getPrimaryFlightPlan();
    const activeLegIndex = plan.activeLateralLeg;

    const previousLegIndex = activeLegIndex - 1;
    const previousLeg = plan.getLeg(previousLegIndex);
    const previousActiveLegSegment = plan.getSegmentFromLeg(previousLeg);

    if (!previousActiveLegSegment) {
      throw new Error('[UnsManeuverPageController](proceedFromHold) Segment not found for previous active leg');
    }

    const didProceed = this.fms.continueHold(previousActiveLegSegment.segmentIndex, (activeLegIndex - 1) - previousActiveLegSegment.offset);

    if (!didProceed) {
      throw new Error('[UnsManeuverPageController](proceedFromHold) UnsFms::proceedFromHold returned false');
    }
  }
}

/**
 * UNS MANEUVER page
 */
export class UnsManeuverPage extends UnsFmcPage {
  private readonly store = new UnsManeuverPageStore(this.bus, this.fms, this.fmsConfig);

  private readonly controller = new UnsManeuverPageController(this.fms);

  private readonly HoldingMessage = new DisplayField<boolean>(this, {
    formatter: (holding) => holding ? '        HOLDING[cyan s-text]' : '',
  }).bind(this.store.isHolding);

  private readonly HoldingDefinitionLink = new DisplayField(this, {
    formatter: () => `${UnsChars.ArrowLeft}HOLDING DEFN`,
    onSelected: async () => {
      const storedHold = this.fms.getFlightPlanStoredHold(UnsFlightPlans.Active);

      if (storedHold) {
        this.screen.navigateTo('/hold-definition', { hold: storedHold.entry, leg: storedHold.leg });
      } else {
        this.screen.navigateTo('/hold-fix');
      }

      return true;
    },
  });

  private readonly ProceedPrompt = new DisplayField(this, {
    formatter: () => `${UnsChars.ArrowLeft}PROCEED`,
    onSelected: async () => {
      this.controller.proceedFromHold();
      return true;
    },
  });

  private readonly DisarmHoldPrompt = new DisplayField(this, {
    formatter: () => `${UnsChars.ArrowLeft}DISARM HOLD`,
    onSelected: async () => {
      const storedHold = this.fms.getFlightPlanStoredHold(UnsFlightPlans.Active);
      const isHoldActive = this.store.isHolding.get();

      if (!isHoldActive && storedHold && storedHold.entry.type === 'existing') {
        this.screen.navigateTo('/hold-definition', { hold: storedHold.entry, leg: storedHold.leg, disarm: true });
        return true;
      }

      return false;
    },
  });

  private readonly ContinueHoldPrompt = new DisplayField(this, {
    formatter: () => `${UnsChars.ArrowLeft}CONTINUE HOLD`,
    onSelected: async () => {
      this.controller.continueHold();
      return true;
    },
  });

  private readonly PVorLink = PageLinkField.createLink(this, `PVOR${UnsChars.ArrowRight}`, '/pvor');

  private readonly ReturnLink = PageLinkField.createLink(this, `RETURN${UnsChars.ArrowRight}`, '/nav');

  protected pageTitle = '   MANEUVER';

  protected doShowSubpage = false;

  /** @inheritDoc */
  protected override onInit(): void {
    for (const subscription of this.store.createSubscriptions()) {
      this.addBinding(subscription);
    }

    this.addBinding(this.store.isHolding.sub(() => this.invalidate()));
  }

  /** @inheritDoc */
  public override render(): FmcRenderTemplate[] {
    const storedHoldExists = !!this.fms.getFlightPlanStoredHold(UnsFlightPlans.Active);
    const isHoldActive = this.store.isHolding.get();
    const isHFHoldActive = isHoldActive && (this.store.activeLeg.get()?.leg.type === LegType.HF);

    let L2: FmcRenderTemplateColumn = '';
    if (isHoldActive) {
      L2 = this.ProceedPrompt;
    } else if (storedHoldExists) {
      L2 = `${UnsChars.ArrowLeft}DTO HOLD[disabled]`;
    }

    return [
      [
        [this.TitleField],
        [this.HoldingMessage],
        [this.HoldingDefinitionLink, `HDG${UnsChars.ArrowRight}[disabled]`],
        [''],
        [L2, this.PVorLink],
        [''],
        [storedHoldExists ? this.DisarmHoldPrompt : '', `SXTK${UnsChars.ArrowRight}[disabled]`],
        [''],
        [isHFHoldActive ? this.ContinueHoldPrompt : ''],
        [''],
        [`${UnsChars.ArrowLeft}PPOS HOLD[disabled]`, this.ReturnLink],
      ],
    ];
  }
}
