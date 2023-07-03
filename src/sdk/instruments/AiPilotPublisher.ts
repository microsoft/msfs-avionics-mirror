import { EventBus } from '../data/EventBus';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Events related to the sim's AI piloting feature.
 */
export interface AiPilotEvents {
  /**
   * Whether the sim's AI pilot control system is active. AI pilot control is active when the AI PILOTING setting
   * is enabled on the FLIGHT ASSISTANCE panel and during the pre-flight cutscene when spawning on a runway before
   * the user selects 'READY TO FLY'.
   */
  ai_delegate_controls_active: boolean;

  /**
   * Whether or not the user has enabled auto-rudder in the flight assistance panel.
   */
  ai_auto_rudder_active: boolean;
}

/**
 * A publisher for events related to the sim's AI piloting feature.
 */
export class AiPilotPublisher extends SimVarPublisher<AiPilotEvents> {
  /**
   * Creates a new instance of AiPilotPublisher.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    super(new Map<keyof AiPilotEvents, SimVarPublisherEntry<any>>([
      ['ai_delegate_controls_active', { name: 'DELEGATE CONTROLS TO AI', type: SimVarValueType.Bool }],
      ['ai_auto_rudder_active', { name: 'AUTO COORDINATION', type: SimVarValueType.Bool }]
    ]), bus);
  }
}