import { Warning } from '../../components/Warnings/Warning';
import { CompositeLogicXMLHost } from '../../data/CompositeLogicXMLHost';
import { EventBus } from '../../data/EventBus';
import { UUID } from '../uuid/UUID';
import { AuralAlertRegistrationManager } from './AuralAlertRegistrationManager';
import { AuralAlertControlEvents } from './AuralAlertSystem';

/**
 * Adapts {@link Warning} to {@link AuralAlertSystem}. Given a list of warnings, the adapter will register one aural
 * alert for each warning that defines a `soundId`. Alerts are set to repeat while active unless the warning is defined
 * to play only once. The adapter also manages activation/deactivation of the alerts using the condition logic of their
 * associated warnings. All alerts are assigned to the same queue.
 */
export class AuralAlertSystemWarningAdapter {
  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly auralRegistrationManager: AuralAlertRegistrationManager;

  /**
   * Creates a new instance of AuralAlertSystemWarningAdapter.
   * @param bus The event bus.
   * @param logicHost The XML logic host used to run this adapter's warning condition logic.
   * @param warnings This adapter's warnings, in order of decreasing priority.
   * @param queue The aural alert queue to assign this adapter's alerts.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly logicHost: CompositeLogicXMLHost,
    private readonly warnings: readonly Warning[],
    private readonly queue: string
  ) {
    this.auralRegistrationManager = new AuralAlertRegistrationManager(bus);
  }

  /**
   * Registers this adapter's alerts with {@link AuralAlertSystem} and starts automatically managing alert states.
   */
  public start(): void {
    for (let i = 0; i < this.warnings.length; i++) {
      const warning = this.warnings[i];

      if (warning.soundId === undefined) {
        continue;
      }

      const uuid = UUID.GenerateUuid();

      this.auralRegistrationManager.register({
        uuid,
        queue: this.queue,
        priority: -i,
        sequence: warning.soundId,
        continuous: false,
        repeat: !(warning.once ?? false)
      });

      this.logicHost.addLogicAsNumber(warning.condition, value => {
        if (value === 0) {
          this.publisher.pub('aural_alert_deactivate', uuid, true, false);
        } else {
          this.publisher.pub('aural_alert_activate', uuid, true, false);
        }
      }, 0);
    }
  }
}