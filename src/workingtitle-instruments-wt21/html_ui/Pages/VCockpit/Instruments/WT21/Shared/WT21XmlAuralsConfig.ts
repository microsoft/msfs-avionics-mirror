import { CompositeLogicXMLHost, EventBus, SoundServerController, Warning, WarningManager, XMLWarningFactory } from '@microsoft/msfs-sdk';

/**
 * A class that handles aurals coming from panel.xml.
 */
export class WT21XmlAuralsConfig {
  private readonly soundController: SoundServerController;

  private readonly warningsManager: WarningManager;

  /**
   * Ctor
   * @param inst The instrument this manager is on.
   * @param logicHost The xml logic host.
   * @param bus The event bus.
   */
  constructor(inst: BaseInstrument, logicHost: CompositeLogicXMLHost, bus: EventBus) {
    this.soundController = new SoundServerController(bus);
    const warnFactory = new XMLWarningFactory(inst);
    const warnings = warnFactory.parseConfig(inst.xmlConfig);
    this.warningsManager = new WarningManager(warnings, logicHost, () => { }, this.onWarningSound.bind(this));
  }

  /**
   * Start or stop playing a continuour warning sound.
   * @param warning The warning.
   * @param active Whether the warning is turning on or off.
   */
  private onWarningSound(warning: Warning, active: boolean): void {
    if (warning.soundId) {
      if (active) {
        this.soundController.startSound(warning.soundId);
      } else {
        this.soundController.stop(warning.soundId);
      }
    }
  }
}