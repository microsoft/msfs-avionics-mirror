import { Config } from '../Config/Config';

/**
 * A configuration object which defines audio options.
 */
export class AudioConfig implements Config {
  /** A config that defines options for the audio panel. If not defined, then the audio panel is not supported. */
  public readonly audioPanel?: AudioPanelConfig;

  /**
   * Creates a new AudioConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.audioPanel = undefined;
    } else {
      if (element.tagName !== 'Audio') {
        throw new Error(`Invalid AudioConfig definition: expected tag name 'Audio' but was '${element.tagName}'`);
      }

      this.audioPanel = this.parseAudioPanelConfig(element.querySelector(':scope>AudioPanel'));
    }
  }

  /**
   * Parses a sensors configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The sensors configuration defined by the configuration document element.
   */
  private parseAudioPanelConfig(element: Element | null): AudioPanelConfig | undefined {
    if (element !== null) {
      try {
        return new AudioPanelConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
  }
}

/**
 * A configuration object which defines audio panel options.
 */
export class AudioPanelConfig implements Config {
  /** The shape with which the CNS data bar audio panel button should render its MIC/COM indicators. */
  public readonly cnsButtonIndicatorShape: 'square' | 'triangle';

  /**
   * Creates a new instance of AudioPanelConfig.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'AudioPanel') {
      throw new Error(`Invalid AudioPanelConfig definition: expected tag name 'AudioPanel' but was '${element.tagName}'`);
    }

    const cnsButtonIndicatorShape = element.getAttribute('indicator-shape')?.toLowerCase();
    switch (cnsButtonIndicatorShape) {
      case 'square':
        this.cnsButtonIndicatorShape = 'square';
        break;
      case 'triangle':
      case undefined:
        this.cnsButtonIndicatorShape = 'triangle';
        break;
      default:
        console.warn('Invalid AudioPanelConfig definition: unrecognized "indicator-shape" option value (expected "square" or "triangle"). Defaulting to "triangle".');
        this.cnsButtonIndicatorShape = 'triangle';
    }
  }
}