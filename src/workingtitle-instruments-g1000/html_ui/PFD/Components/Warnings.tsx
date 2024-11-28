import { CompositeLogicXMLHost, DisplayComponent, EventBus, FSComponent, SoundServerController, VNode, Warning, WarningManager, WarningType } from '@microsoft/msfs-sdk';

import './Warnings.css';

/** The props for a warning display. */
export interface WarningProps {
  /** The event bus */
  bus: EventBus;
  /** An XML logic handler */
  logicHandler: CompositeLogicXMLHost;
  /** An array of warnings to handle. */
  warnings: Array<Warning>;
}

/**
 * This will display system warnings.
 */
export class WarningDisplay extends DisplayComponent<WarningProps> {
  private divRef = FSComponent.createRef<HTMLDivElement>();

  private readonly soundController = new SoundServerController(this.props.bus);

  /** Instantiate a warning manager with our passed-in props after rendering. */
  public onAfterRender(): void {
    new WarningManager(this.props.warnings, this.props.logicHandler, this.onWarningText.bind(this), this.onWarningSound.bind(this));
  }

  /**
   * Turt the text of a warning on or off.
   * @param warning The warning text to display, undefined if it's cleared.
   */
  private onWarningText(warning: Warning | undefined): void {
    if (warning) {
      if (warning.shortText) {
        this.divRef.instance.textContent = warning.shortText;
        switch (warning.type) {
          case WarningType.Warning:
            this.divRef.instance.className = 'warnings-display red'; break;
          case WarningType.Caution:
            this.divRef.instance.className = 'warnings-display yellow'; break;
          case WarningType.Test:
            this.divRef.instance.className = 'warnings-display white'; break;
        }
      } else {
        this.divRef.instance.textContent = '';
        this.divRef.instance.className = 'warnings-display';
      }
    } else {
      this.divRef.instance.textContent = '';
      this.divRef.instance.className = 'warnings-display';
    }
  }

  /**
   * Start or stop playing a continuous warning sound.
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

  /**
   * Render a WarningDisplay
   * @returns a VNode
   */
  public render(): VNode {
    return <div class="warnings-display" ref={this.divRef} />;
  }
}