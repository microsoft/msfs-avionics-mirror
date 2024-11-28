import {
  APLateralModes, ConsumerSubject, DisplayField, EventBus, FmcRenderTemplate, FmcRenderTemplateColumn, LegDefinition, LegType, LNavEvents, LNavUtils, NumberFormatter,
} from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';
import { UnsLnavMode, UnsLnavSteeringStateEvents } from '../../Fms/Navigation/UnsLnavSteeringController';
import { UnsFmsConfigInterface } from '../../Config/FmsConfigBuilder';
import { UnsFms } from '../../Fms/UnsFms';

/**
 * Store for {@link UnsLNavDebugPage}
 */
class UnsLNavDebugPageStore {
  /**
   * Constructor
   *
   * @param bus the event bus
   * @param fms the fms
   * @param fmsConfig the fms config
   */
  constructor(private readonly bus: EventBus, private readonly fms: UnsFms, private readonly fmsConfig: UnsFmsConfigInterface) {
  }

  public readonly lnavValid = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_steer_command_valid'),
    false,
  );

  public readonly lnavMode = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_mode'),
    UnsLnavMode.FlightPlanTracking,
  );

  public readonly lnavCommandedHeading = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_commanded_heading'),
    NaN,
  );

  public readonly lnavCommandedTurnDirection = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_commanded_turn_direction'),
    null,
  );

  public readonly lnavXtk = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_xtk'),
    NaN,
  );

  public readonly lnavPhi = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_desired_bank_angle'),
    NaN,
  );

  public readonly lnavTae = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_tae'),
    NaN,
  );

  public readonly lnavDtk = ConsumerSubject.create(
    this.bus.getSubscriber<UnsLnavSteeringStateEvents>().on('uns_lnav_dtk'),
    NaN,
  );

  public readonly activeLegIndex = ConsumerSubject.create(
    this.bus.getSubscriber<LNavEvents>().on(`lnav_tracked_leg_index${LNavUtils.getEventBusTopicSuffix(this.fmsConfig.lnav.index)}`),
    -1,
  );

  public readonly activeLeg = this.activeLegIndex.map((index) => {
    if (index === -1) {
      return null;
    }

    return this.fms.getPrimaryFlightPlan().getLeg(index);
  });

  public readonly suspended = ConsumerSubject.create(
    this.bus.getSubscriber<LNavEvents>().on(`lnav_is_suspended${LNavUtils.getEventBusTopicSuffix(this.fmsConfig.lnav.index)}`),
    false,
  );
}

/**
 * LNAV Debug page
 */
export class UnsLNavDebugPage extends UnsFmcPage {
  private static readonly NUMBER_FORMATTER = NumberFormatter.create({ maxDigits: 4, precision: 0.1, nanString: '--.-' });

  private readonly store = new UnsLNavDebugPageStore(this.bus, this.fms, this.fmsConfig);

  private readonly LnavValidField = new DisplayField<boolean>(this, {
    formatter: (status) => status ? 'VALID[green d-text]' : 'INVALID[amber d-text]',
  }).bind(this.store.lnavValid);

  private readonly LnavModeField = new DisplayField<UnsLnavMode>(this, {
    formatter: (mode) => `${mode}[d-text]`,
  }).bind(this.store.lnavMode);

  // Flight plan tracking mode only fields

  private readonly ActiveLegHeader = new DisplayField<number>(this, {
    formatter: (index) => `ACTIVE LEG[cyan s-text] (${index.toFixed(0).padStart(2, ' ')})[white s-text]`,
  }).bind(this.store.activeLegIndex);

  private readonly ActiveLegField = new DisplayField<LegDefinition | null>(this, {
    formatter: (leg) => `${leg?.name ?? '(NONE)'}[magenta d-text] - ${leg ? LegType[leg.leg.type] : '??'}[white d-text]`,
  }).bind(this.store.activeLeg);

  private readonly SuspendStateField = new DisplayField<boolean>(this, {
    formatter: (suspended) => suspended ? 'SUSPENDED[amber d-text]' : 'UNSUSPENDED[green d-text]',
  }).bind(this.store.suspended);

  // Heading mode only fields

  private readonly LnavHeadingModeValueField = new DisplayField<number | null>(this, {
    formatter: (heading) => `${UnsLNavDebugPage.NUMBER_FORMATTER(heading ?? NaN)}[magenta d-text]`,
  }).bind(this.store.lnavCommandedHeading);

  private readonly LnavHeadingModeTurnDirectionField = new DisplayField<'left' | 'right' | null>(this, {
    formatter: (mode) => mode === null ? 'EITHER' : `${mode === 'left' ? 'LEFT' : 'RIGHT'}[magenta d-text]`,
  }).bind(this.store.lnavCommandedTurnDirection);

  private readonly LnavXtkField = new DisplayField<APLateralModes>(this, {
    formatter: UnsLNavDebugPage.NUMBER_FORMATTER,
  }).bind(this.store.lnavXtk);

  private readonly LnavTaeField = new DisplayField<APLateralModes>(this, {
    formatter: UnsLNavDebugPage.NUMBER_FORMATTER,
  }).bind(this.store.lnavTae);

  private readonly LnavPhiField = new DisplayField<APLateralModes>(this, {
    formatter: UnsLNavDebugPage.NUMBER_FORMATTER,
  }).bind(this.store.lnavPhi);

  /** @inheritDoc */
  protected override onInit(): void {
    this.addBinding(this.store.lnavMode);
    this.addBinding(this.store.lnavCommandedHeading);
    this.addBinding(this.store.lnavCommandedTurnDirection);
    this.addBinding(this.store.lnavValid);
    this.addBinding(this.store.lnavXtk);
    this.addBinding(this.store.lnavTae);
    this.addBinding(this.store.lnavPhi);
    this.addBinding(this.store.lnavDtk);
    this.addBinding(this.store.lnavMode.sub(() => this.invalidate(), true));
  }

  protected readonly pageTitle = 'LNAV DEBUG';

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    const isFpTrackingMode = this.store.lnavMode.get() === UnsLnavMode.FlightPlanTracking;
    const isHeadingMode = this.store.lnavMode.get() === UnsLnavMode.Heading;

    let rightColLine4: FmcRenderTemplateColumn = '';
    if (isFpTrackingMode) {
      rightColLine4 = this.ActiveLegHeader;
    } else if (isHeadingMode) {
      rightColLine4 = 'HDG SEL[cyan s-text]';
    }

    let rightColLine5: FmcRenderTemplateColumn = '';
    if (isFpTrackingMode) {
      rightColLine5 = this.ActiveLegField;
    } else if (isHeadingMode) {
      rightColLine5 = this.LnavHeadingModeValueField;
    }

    let rightColLine6: FmcRenderTemplateColumn = '';
    if (isFpTrackingMode) {
      rightColLine6 = 'SUSPEND STATE[cyan s-text]';
    } else if (isHeadingMode) {
      rightColLine6 = 'HDG SEL TURN DIR[cyan s-text]';
    }

    let rightColLine7: FmcRenderTemplateColumn = '';
    if (isFpTrackingMode) {
      rightColLine7 = this.SuspendStateField;
    } else if (isHeadingMode) {
      rightColLine7 = this.LnavHeadingModeTurnDirectionField;
    }

    return [
      [
        [this.TitleField],
        ['CMD VALID[cyan s-text]', 'MODE[cyan s-text]'],
        [this.LnavValidField, this.LnavModeField],
        ['XTK[cyan s-text]', rightColLine4],
        [this.LnavXtkField, rightColLine5],
        ['TAE[cyan s-text]', rightColLine6],
        [this.LnavTaeField, rightColLine7],
        ['PHI[cyan s-text]'],
        [this.LnavPhiField],
      ],
    ];
  }
}
