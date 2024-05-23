import { Annunciation, AnnunciationType } from '../components/Annunciatons';
import { CompositeLogicXMLHost } from '../data/CompositeLogicXMLHost';
import { EventBus, Publisher } from '../data/EventBus';
import { CasRegistrationManager } from './CasRegistrationManager';
import { CasAlertDefinition, CasEvents } from './CasSystem';

/**
 * An adapter to convert legacy panel.xml annunciations into the new CasSystem.
 */
export class CasSystemLegacyAdapter {
  private readonly pub: Publisher<CasEvents>;
  private readonly regManager: CasRegistrationManager;

  /** A map of logic elements for non-suffixed events. */
  private readonly nonSuffixLogic = new Map<string, CompositeLogicXMLElement>();

  /** A map of logic elements for suffixed events, mapped by suffix. */
  private readonly suffixLogic = new Map<string, Map<string, CompositeLogicXMLElement>>();

  /** Alert definitions and priorities based on the legacy configuration for feeding into the new system. */
  private readonly annunciations = new Map<string, {
    /** The alert def */
    def: CasAlertDefinition,
    /** The alert type */
    priority: AnnunciationType
  }>();

  /**
   * Create a CasSystemLegacyAdapter
   * @param bus The event bus.
   * @param logicHost A CompositeLogicXMLHost for running the events.
   * @param annunciationDefs An array of system annunciations to monitor.
   */
  public constructor(bus: EventBus, private readonly logicHost: CompositeLogicXMLHost, annunciationDefs: readonly Annunciation[]) {
    this.regManager = new CasRegistrationManager(bus);

    this.pub = bus.getPublisher<CasEvents>();

    // Go through the legacy annunciation definitions and create a bunch of definitions suitable
    // for the new CAS system, each tied to an XML logic element for managind the alert state.
    for (let i = 0; i < annunciationDefs.length; i++) {
      const legacy = annunciationDefs[i];
      const annunciation = this.annunciations.get(legacy.uuid);

      if (annunciation === undefined) {
        // No annunciation with this UUID has been encountered, so create a new one.
        this.annunciations.set(legacy.uuid,
          {
            def: {
              uuid: legacy.uuid,
              message: legacy.text,
              suffixes: legacy.suffix !== undefined ? [legacy.suffix] : undefined
            },
            priority: legacy.type
          });
        if (legacy.suffix === undefined) {
          this.nonSuffixLogic.set(legacy.uuid, legacy.condition);
        } else {
          this.suffixLogic.set(legacy.uuid, new Map<string, CompositeLogicXMLElement>([[legacy.suffix, legacy.condition]]));
        }
      } else {
        // We've already seen the UUID for this message, so we need to do some suffix management.
        if (legacy.suffix !== undefined) {
          annunciation.def.suffixes?.push(legacy.suffix);
          const suffixLogicMap = this.suffixLogic.get(legacy.uuid);
          if (suffixLogicMap === undefined) {
            console.warn(`Trying to add logic to a UUID that doesn't exist: ${legacy.uuid}`);
          } else {
            suffixLogicMap.set(legacy.suffix, legacy.condition);
          }
        }
      }
    }
  }

  /** Register all the alerts and begin monitoring. */
  public start(): void {
    for (const [uuid, info] of this.annunciations) {
      this.regManager.register({
        uuid: uuid,
        message: info.def.message,
        suffixes: info.def.suffixes
      });

      if (info.def.suffixes === undefined) {
        const logic = this.nonSuffixLogic.get(uuid);
        if (logic === undefined) {
          console.warn(`Logic missing for non-suffixed UUID ${uuid}`);
        } else {
          this.logicHost.addLogicAsNumber(logic, (v: number): void => {
            if (v == 1) {
              this.pub.pub('cas_activate_alert', { key: { uuid: uuid }, priority: info.priority }, true, false);
            } else {
              this.pub.pub('cas_deactivate_alert', { key: { uuid: uuid }, priority: info.priority }, true, false);
            }
          }, 0);
        }
      } else {
        // We have something with suffixes, so we have to deal with that with some extra logic.
        const suffixMap = this.suffixLogic.get(uuid);
        if (suffixMap === undefined) {
          console.warn(`Cannot find suffix logic for UUID ${uuid}`);
        } else {
          for (const suffix of info.def.suffixes) {
            const logic = suffixMap.get(suffix);
            if (logic === undefined) {
              console.warn(`Could not find suffix lock '${suffix}' for UUID ${uuid}`);
            } else {
              this.logicHost.addLogicAsNumber(logic, (v: number): void => {
                if (v == 1) {
                  this.pub.pub('cas_activate_alert', { key: { uuid: uuid, suffix: suffix }, priority: info.priority }, true, false);
                } else {
                  this.pub.pub('cas_deactivate_alert', { key: { uuid: uuid, suffix: suffix }, priority: info.priority }, true, false);
                }
              }, 0);
            }
          }
        }
      }
    }
  }
}