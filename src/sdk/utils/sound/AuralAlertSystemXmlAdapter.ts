import { CasSystem } from '../../cas/CasSystem';
import { AnnunciationType } from '../../components/Annunciatons/Annunciaton';
import { CompositeLogicXMLHost } from '../../data/CompositeLogicXMLHost';
import { EventBus } from '../../data/EventBus';
import { AuralAlertRegistrationManager } from './AuralAlertRegistrationManager';
import { AuralAlertControlEvents } from './AuralAlertSystem';
import { CasAuralAlertTransporter } from './CasAuralAlertTransporter';

/**
 * The base properties for an XML-defined aural alert.
 */
type XmlAuralAlertBaseDefinition = {
  /** The ID of the alert. */
  uuid: string;

  /** The queue to which the alert belongs. */
  queue: string;

  /** The priority of the alert within its queue. */
  priority: number;

  /** The name of the track on which to play the alert. */
  track?: string;

  /** The sequence of sound atoms to play for the alert. */
  sequence: string[];

  /** Whether the alert is continuous. */
  continuous: boolean;

  /** Whether the alert should repeat while active. */
  repeat: boolean;

  /**
   * The amount of time, in milliseconds, that the alert can remain in the queue before it is automatically removed
   * from the queue.
   */
  queuedLifetime?: number;
};

/**
 * An XML-defined aural alert whose state is bound to XML logic.
 */
export type XmlAuralAlertLogicDefinition = XmlAuralAlertBaseDefinition & {
  /** The type of this alert definition. */
  type: 'logic';

  /**
   * The logic controlling state of the alert. If the logic returns 0, the alert is deactivated. If the logic returns
   * any other number, the alert is activated.
   */
  logic: CompositeLogicXMLElement;
};

/**
 * An XML-defined aural alert whose state is bound to whether a {@link CasSystem} alert is displayed.
 */
export type XmlAuralAlertCasDefinition = XmlAuralAlertBaseDefinition & {
  /** The type of this aural alert definition. */
  type: 'cas';

  /** The ID of the CAS alert to which to bind the aural alert state. */
  casUuid: string;

  /** The priority of the CAS alert to which to bind the aural alert state. */
  casPriority: AnnunciationType;

  /** The suffix of the CAS alert to which to bind the aural alert state. */
  casSuffix?: string;

  /** Whether to activate the aural alert when the bound CAS alert is acknowledged. */
  casIncludeAcknowledged: boolean;
};

/**
 * An XML-defined aural alert.
 */
export type XmlAuralAlertDefinition = XmlAuralAlertLogicDefinition | XmlAuralAlertCasDefinition;

/**
 * A parser of XML-defined aural alerts.
 */
export interface XmlAuralAlertParser {
  /**
   * Parses alert definitions from an XML document.
   * @param root The root XML document element containing the alert definitions.
   */
  parse(root: Element): XmlAuralAlertDefinition[];
}

/**
 * A default implementation of {@link XmlAuralAlertParser}.
 */
export class DefaultXmlAuralAlertParser implements XmlAuralAlertParser {
  /**
   * Creates a new instance of DefaultXmlAuralAlertParser.
   * @param baseInstrument The BaseInstrument.
   * @param defaultQueue The default queue to assign alerts if they do not explicitly define one themselves.
   */
  constructor(private readonly baseInstrument: BaseInstrument, private readonly defaultQueue: string) {
  }

  /** @inheritdoc */
  public parse(root: Element): XmlAuralAlertDefinition[] {
    const results: XmlAuralAlertDefinition[] = [];

    for (const defElement of root.querySelectorAll(':scope>Alert')) {
      const def = this.parseAlertDefinition(this.baseInstrument, defElement);
      if (def) {
        results.push(def);
      }
    }

    return results;
  }

  /**
   * Parses a single alert definition.
   * @param baseInstrument The BaseInstrument.
   * @param element The element defining the alert.
   * @returns The definition specified by the element, or `undefined` if one could not be parsed.
   */
  private parseAlertDefinition(baseInstrument: BaseInstrument, element: Element): XmlAuralAlertDefinition | undefined {
    const uuid = element.getAttribute('uuid');
    if (uuid === null || uuid.length === 0) {
      console.warn('AuralAlertSystemXmlAdapter: alert is missing "uuid" attribute. Discarding alert.');
      return undefined;
    }

    let queue = element.getAttribute('queue');
    if (queue === null || queue.length === 0) {
      queue = this.defaultQueue;
    }

    let priority: number;
    const priorityText = element.getAttribute('priority');
    if (priorityText) {
      priority = Number(priorityText);
      if (isNaN(priority)) {
        console.warn('AuralAlertSystemXmlAdapter: unrecognized alert "priority" attribute (must be a number). Defaulting to 0.');
        priority = 0;
      }
    } else {
      priority = 0;
    }

    const track = element.getAttribute('track') ?? '';

    const sequence = this.parseSequence(element.querySelector(':scope>Sequence'));
    if (!sequence || sequence.length === 0) {
      return undefined;
    }

    let continuous: boolean;
    const continuousText = element.getAttribute('continuous');
    switch (continuousText?.toLowerCase()) {
      case 'true':
        continuous = true;
        break;
      case 'false':
      case undefined:
        continuous = false;
        break;
      default:
        console.warn('AuralAlertSystemXmlAdapter: unrecognized alert "continuous" attribute (must be a boolean). Defaulting to false.');
        continuous = false;
    }

    let repeat: boolean;
    const repeatText = element.getAttribute('requeue');
    switch (repeatText?.toLowerCase()) {
      case 'true':
        repeat = true;
        break;
      case 'false':
      case undefined:
        repeat = false;
        break;
      default:
        console.warn('AuralAlertSystemXmlAdapter: unrecognized alert "repeat" attribute (must be a boolean). Defaulting to false.');
        repeat = false;
    }

    let queuedLifetime: number | undefined;
    const queuedLifetimeText = element.getAttribute('queued-lifetime');
    if (queuedLifetimeText) {
      queuedLifetime = Number(queuedLifetimeText);
      if (isNaN(queuedLifetime)) {
        console.warn('AuralAlertSystemXmlAdapter: unrecognized alert "queued-lifetime" attribute (must be a number). Defaulting to Infinity.');
        queuedLifetime = undefined;
      }
    } else {
      queuedLifetime = undefined;
    }

    let logic: CompositeLogicXMLElement | undefined = undefined;

    const conditionElement = element.querySelector(':scope>Condition');
    if (conditionElement) {
      logic = new CompositeLogicXMLElement(baseInstrument, conditionElement);
    }

    if (logic) {
      return {
        type: 'logic',
        uuid,
        queue,
        priority,
        track,
        sequence,
        continuous,
        repeat,
        queuedLifetime,
        logic
      };
    } else {
      const casElement = element.querySelector(':scope>CAS');

      if (casElement) {
        const casUuid = casElement.getAttribute('uuid');
        if (casUuid === null || casUuid.length === 0) {
          console.warn('AuralAlertSystemXmlAdapter: alert CAS tag is missing "uuid" attribute. Discarding alert.');
          return undefined;
        }

        let casPriority: AnnunciationType;
        switch (casElement.getAttribute('type')?.toLowerCase()) {
          case 'warning':
            casPriority = AnnunciationType.Warning;
            break;
          case 'caution':
            casPriority = AnnunciationType.Caution;
            break;
          case 'advisory':
            casPriority = AnnunciationType.Advisory;
            break;
          case 'safeop':
            casPriority = AnnunciationType.SafeOp;
            break;
          default:
            console.warn('AuralAlertSystemXmlAdapter: alert CAS tag has missing or unrecognized "type" attribute. Discarding alert.');
            return undefined;
        }

        let casSuffix = casElement.getAttribute('suffix') ?? undefined;
        if (casSuffix && casSuffix.length === 0) {
          casSuffix = undefined;
        }

        let casIncludeAcknowledged: boolean;
        switch (casElement.getAttribute('acknowledged')?.toLowerCase()) {
          case 'true':
            casIncludeAcknowledged = true;
            break;
          case 'false':
            casIncludeAcknowledged = false;
            break;
          default:
            console.warn('AuralAlertSystemXmlAdapter: alert CAS tag has missing or unrecognized "acknowledged" attribute. Discarding alert.');
            return undefined;
        }

        return {
          type: 'cas',
          uuid,
          queue,
          priority,
          track,
          sequence,
          continuous,
          repeat,
          queuedLifetime,
          casUuid,
          casPriority,
          casSuffix,
          casIncludeAcknowledged
        };
      } else {
        console.warn('AuralAlertSystemXmlAdapter: alert is missing both Condition and CAS child tags. Discarding alert.');
        return undefined;
      }
    }
  }

  /**
   * Parses a sound atom sequence.
   * @param element The element defining the sequence.
   * @returns The sound atom sequence defined by the element, or `undefined` if one could not be parsed.
   */
  private parseSequence(element: Element | null): string[] | undefined {
    return element?.textContent?.split(',').map(str => str.trim()).filter(str => str.length > 0);
  }
}

/**
 * Adapts XML-defined aural alerts to {@link AuralAlertSystem}. Handles the registration of the alerts and management
 * of alert state.
 */
export class AuralAlertSystemXmlAdapter {
  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly auralRegistrationManager?: AuralAlertRegistrationManager;

  private readonly alertDefinitions?: XmlAuralAlertDefinition[];

  /**
   * Creates a new instance of AuralAlertSystemXmlAdapter.
   * @param bus The event bus.
   * @param logicHost The XML logic host used to run this adapter's XML logic.
   * @param casSystem The CAS system.
   * @param alertDefsRoot The root XML document element containing the aural alert definitions to use.
   * @param parser The parser to use to parse alert definitions from the XML document.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly logicHost: CompositeLogicXMLHost,
    private readonly casSystem: CasSystem,
    alertDefsRoot: Element | null,
    parser: XmlAuralAlertParser
  ) {
    if (alertDefsRoot === null) {
      return;
    }

    const defs = parser.parse(alertDefsRoot);

    if (defs.length === 0) {
      return;
    }

    this.alertDefinitions = defs;
    this.auralRegistrationManager = new AuralAlertRegistrationManager(bus);
  }

  /**
   * Registers this adapter's alerts with {@link AuralAlertSystem} and starts automatically managing alert states.
   */
  public start(): void {
    if (!this.auralRegistrationManager || !this.alertDefinitions) {
      return;
    }

    for (const def of this.alertDefinitions) {
      this.auralRegistrationManager.register({
        uuid: def.uuid,
        queue: def.queue,
        priority: def.priority,
        track: def.track,
        sequence: def.sequence,
        continuous: def.continuous,
        repeat: def.repeat,
        queuedLifetime: def.queuedLifetime
      });

      if (def.type === 'logic') {
        this.logicHost.addLogicAsNumber(def.logic, value => {
          if (value === 0) {
            this.publisher.pub('aural_alert_deactivate', def.uuid, true, false);
          } else {
            this.publisher.pub('aural_alert_activate', def.uuid, true, false);
          }
        }, 0);
      } else {
        CasAuralAlertTransporter.create(
          this.bus,
          {
            auralUuid: def.uuid,
            auralAction: 'activate',
            casUuid: def.casUuid,
            casPriority: def.casPriority,
            casSuffix: def.casSuffix,
            includeAcknowledged: def.casIncludeAcknowledged,
          },
          this.casSystem
        );
      }
    }
  }
}