import { MathUtils } from '@microsoft/msfs-sdk';

import { Config } from '../Config/Config';
import { BacklightControlSettingMode } from '../Settings/BacklightUserSettings';

/**
 * A configuration object which defines backlight options.
 */
export class BacklightConfig implements Config {
  /**
   * The default backlight control mode to apply on power-up, or `null` if the setting should be persistent between
   * power cycles.
   */
  public readonly defaultMode: BacklightControlSettingMode | null;

  /** A config that defines options for photocell control of backlighting. */
  public readonly photoCell: BacklightPhotoCellConfig;

  /**
   * A config that defines options for light bus control of backlighting. If not defined, then light bus control of
   * backlighting is not supported.
   */
  public readonly lightBus?: BacklightLightBusConfig;

  /**
   * Creates a new BacklightConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.defaultMode = null;
      this.photoCell = new BacklightPhotoCellConfig(baseInstrument, undefined);
    } else {
      if (element.tagName !== 'Backlight') {
        throw new Error(`Invalid BacklightConfig definition: expected tag name 'Backlight' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`Backlight[id='${inheritFromId}']`);

      const inheritData = inheritFromElement ? new BacklightConfigData(baseInstrument, inheritFromElement) : undefined;
      const data = new BacklightConfigData(baseInstrument, element);

      this.photoCell = data.photoCell ?? inheritData?.photoCell ?? new BacklightPhotoCellConfig(baseInstrument, undefined);
      this.lightBus = data.lightBus ?? inheritData?.lightBus;

      const defaultMode = data.defaultMode !== undefined
        ? data.defaultMode
        : inheritData?.defaultMode !== undefined
          ? inheritData.defaultMode
          : null;

      if (defaultMode === BacklightControlSettingMode.LightBus && !this.lightBus) {
        console.warn('Invalid BacklightConfig definition: "default-mode" option is "lightbus" when no light bus is configured. Defaulting to none.');
        this.defaultMode = null;
      } else {
        this.defaultMode = defaultMode;
      }
    }
  }
}

/**
 * A configuration object which defines backlight photocell options.
 */
export class BacklightPhotoCellConfig implements Config {
  /** The range of backlight levels, as `[min, max]`, allowed to be set when under automatic photocell control. */
  public readonly brightnessRange: readonly [number, number];

  /**
   * Creates a new BacklightPhotoCellConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.brightnessRange = [0, 1];
    } else {
      if (element.tagName !== 'PhotoCell') {
        throw new Error(`Invalid BacklightPhotoCellConfig definition: expected tag name 'PhotoCell' but was '${element.tagName}'`);
      }

      let min = Number(element.getAttribute('min-brightness') ?? 0);
      if (!Number.isFinite(min)) {
        console.warn('Invalid BacklightPhotoCellConfig definition: unrecognized "min-brightness" option (must be a number between 0 and 1). Defaulting to 0.');
        min = 0;
      } else {
        min = MathUtils.clamp(min, 0, 1);
      }

      let max = Number(element.getAttribute('max-brightness') ?? 1);
      if (!Number.isFinite(min)) {
        console.warn('Invalid BacklightPhotoCellConfig definition: unrecognized "max-brightness" option (must be a number between 0 and 1). Defaulting to 1.');
        max = 1;
      } else {
        max = MathUtils.clamp(max, min, 1);
      }

      this.brightnessRange = [min, max];
    }
  }
}

/**
 * A configuration object which defines backlight light bus options.
 */
export class BacklightLightBusConfig implements Config {
  /** The logic that provides the backlight level requested by the light bus. */
  public readonly level: CompositeLogicXMLElement;

  /**
   * The light bus level threshold below which backlight control will default to photocell instead. If the threshold is
   * zero, then backlight control will always use the light bus level when light bus control is selected.
   */
  public readonly offThreshold: number;

  /**
   * Creates a new BacklightLightBusConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element) {
    if (element.tagName !== 'LightBus') {
      throw new Error(`Invalid BacklightLightBusConfig definition: expected tag name 'LightBus' but was '${element.tagName}'`);
    }

    const levelElement = element.querySelector(':scope>Level');

    if (!levelElement) {
      throw new Error('Invalid BacklightLightBusConfig definition: missing <Level> tag');
    }

    this.level = new CompositeLogicXMLElement(baseInstrument, levelElement);

    let minimumLevel = Number(element.getAttribute('minimum-level') ?? 0);
    if (!Number.isFinite(minimumLevel)) {
      console.warn('Invalid BacklightLightBusConfig definition: unrecognized "off-threshold" option (must be a number between 0 and 1). Defaulting to 0.');
      minimumLevel = 0;
    } else {
      minimumLevel = MathUtils.clamp(minimumLevel, 0, 1);
    }

    this.offThreshold = minimumLevel;
  }
}

/**
 * An object containing backlight config data parsed from an XML document element.
 */
class BacklightConfigData {
  /**
   * The default backlight control mode to apply on power-up, or `null` if the setting should be persistent between
   * power cycles.
   */
  public readonly defaultMode?: BacklightControlSettingMode | null;

  /** A config that defines options for photocell control of backlighting. */
  public readonly photoCell?: BacklightPhotoCellConfig;

  /** A config that defines options for light bus control of backlighting. */
  public readonly lightBus?: BacklightLightBusConfig;

  /**
   * Creates a new BacklightConfigData from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      return;
    }

    this.photoCell = this.parsePhotoCellConfig(baseInstrument, element.querySelector(':scope>PhotoCell'));
    this.lightBus = this.parseLightBusConfig(baseInstrument, element.querySelector(':scope>LightBus'));

    const defaultModeAttr = element.getAttribute('default-mode')?.toLowerCase();
    switch (defaultModeAttr) {
      case 'manual':
        this.defaultMode = BacklightControlSettingMode.Manual;
        break;
      case 'photocell':
        this.defaultMode = BacklightControlSettingMode.PhotoCell;
        break;
      case 'lightbus':
        this.defaultMode = BacklightControlSettingMode.LightBus;
        break;
      case 'none':
        this.defaultMode = null;
        break;
      case undefined:
        break;
      default:
        console.warn('Invalid BacklightConfig definition: unrecognized "default-mode" option (must be "manual", "photocell", "lightbus", or "none"). Discarding option.');
    }
  }

  /**
   * Parses a photocell configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The photocell configuration defined by the configuration document element.
   */
  private parsePhotoCellConfig(baseInstrument: BaseInstrument, element: Element | null): BacklightPhotoCellConfig | undefined {
    if (element !== null) {
      try {
        return new BacklightPhotoCellConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
  }

  /**
   * Parses a light bus configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The light bus configuration defined by the configuration document element.
   */
  private parseLightBusConfig(baseInstrument: BaseInstrument, element: Element | null): BacklightLightBusConfig | undefined {
    if (element !== null) {
      try {
        return new BacklightLightBusConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
  }
}
