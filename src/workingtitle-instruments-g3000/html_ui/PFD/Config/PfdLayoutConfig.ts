import { Config } from '@microsoft/msfs-wtg3000-common';

/**
 * Types of content that can be displayed in the PFD bottom panel's cell A.
 */
export enum BottomInfoPanelCellAContent {
  /** Empty content. */
  Empty = 'empty',

  /** Speed display (TAS, GS). */
  Speed = 'speed',

  /** Temperature display (SAT, ISA). */
  Temperature = 'temperature',
  Wind = 'wind',
  Time = 'time'
}

/**
 * A configuration object which defines the layout of a PFD.
 */
export class PfdLayoutConfig implements Config {
  /** Whether to include softkeys. */
  public readonly includeSoftKeys: boolean;

  /** The side on which to place the PFD's instrument pane in split mode. */
  public readonly splitModeInstrumentSide: 'left' | 'right' | 'auto';

  /** Whether the 'use-banners' flag is active. */
  public readonly useBanners: boolean;

  /** Whether to render the navigation status box in a banner instead of in the bottom panel. */
  public readonly useNavStatusBanner: boolean;

  /** Whether to render the NAV/DME information display in a banner instead of in the bottom panel. */
  public readonly useNavDmeInfoBanner: boolean;

  /** Whether to render the wind display in a banner instead of in the bottom panel. */
  public readonly useWindBanner: boolean;

  /** The content of the bottom panel's cell A, as `[left, right]`. */
  public readonly bottomInfoCellAContent: readonly [BottomInfoPanelCellAContent, BottomInfoPanelCellAContent];

  /**
   * Creates a new PfdLayoutConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    let inheritData: PfdLayoutConfigData | undefined;

    if (element !== undefined) {
      if (element.tagName !== 'PfdLayout') {
        throw new Error(`Invalid PfdLayoutConfig definition: expected tag name 'PfdLayout' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`PfdLayout[id='${inheritFromId}']`);

      inheritData = inheritFromElement ? new PfdLayoutConfigData(inheritFromElement) : undefined;
    }

    const data = new PfdLayoutConfigData(element);

    this.includeSoftKeys = data.includeSoftKeys ?? inheritData?.includeSoftKeys ?? false;
    this.splitModeInstrumentSide = data.splitModeInstrumentSide ?? inheritData?.splitModeInstrumentSide ?? 'auto';
    this.useBanners = data.useBanners ?? inheritData?.useBanners ?? false;
    this.useNavStatusBanner = data.useNavStatusBanner ?? inheritData?.useNavStatusBanner ?? this.useBanners;
    this.useNavDmeInfoBanner = data.useNavDmeInfoBanner ?? inheritData?.useNavDmeInfoBanner ?? this.useBanners;
    this.useWindBanner = data.useWindBanner ?? inheritData?.useWindBanner ?? this.useBanners;

    const bottomInfoCellAContent = data.bottomInfoCellAContent ?? inheritData?.bottomInfoCellAContent
      ?? (
        this.useWindBanner
          ? [BottomInfoPanelCellAContent.Speed, BottomInfoPanelCellAContent.Temperature]
          : [BottomInfoPanelCellAContent.Speed, BottomInfoPanelCellAContent.Wind]
      );

    // Ensure that cell A contains a wind display if the wind banner is not used.
    if (!this.useWindBanner && !bottomInfoCellAContent.includes(BottomInfoPanelCellAContent.Wind)) {
      const replaceIndex = bottomInfoCellAContent[0] === BottomInfoPanelCellAContent.Time ? 0 : 1;

      console.warn(`Invalid PfdLayoutConfig definition: wind banner not used and wind display not included in bottom panel cell A. Inserting the wind display in cell A's ${replaceIndex === 0 ? 'left' : 'right'} slot.`);
      bottomInfoCellAContent[replaceIndex] = BottomInfoPanelCellAContent.Wind;
    }

    // Ensure that cell A does not contain incompatible displays.
    if (bottomInfoCellAContent[0] === BottomInfoPanelCellAContent.Time || bottomInfoCellAContent[1] === BottomInfoPanelCellAContent.Time) {
      const nonTimeIndex = bottomInfoCellAContent[0] === BottomInfoPanelCellAContent.Time ? 1 : 0;
      const nonTimeContent = bottomInfoCellAContent[nonTimeIndex];

      if (nonTimeContent === BottomInfoPanelCellAContent.Time || nonTimeContent === BottomInfoPanelCellAContent.Wind) {
        console.warn(`Invalid PfdLayoutConfig definition: bottom panel cell A contents (${bottomInfoCellAContent}) are incompatible with each other. Replacing the ${nonTimeIndex === 0 ? 'left' : 'right'} slot with empty content.`);
        bottomInfoCellAContent[nonTimeIndex] = BottomInfoPanelCellAContent.Empty;
      }
    }

    this.bottomInfoCellAContent = bottomInfoCellAContent;
  }
}

/**
 * An object containing PFD layout configuration data parsed from an XML document element.
 */
class PfdLayoutConfigData {
  /** Whether to include softkeys. */
  public readonly includeSoftKeys?: boolean;

  /** The side on which to place the PFD's instrument pane in split mode. */
  public readonly splitModeInstrumentSide?: 'left' | 'right' | 'auto';

  /** Whether the 'use-banners' flag is active. */
  public readonly useBanners?: boolean;

  /** Whether to render the navigation status box in a banner instead of in the bottom panel. */
  public readonly useNavStatusBanner?: boolean;

  /** Whether to render the NAV/DME information display in a banner instead of in the bottom panel. */
  public readonly useNavDmeInfoBanner?: boolean;

  /** Whether to render the wind display in a banner instead of in the bottom panel. */
  public readonly useWindBanner?: boolean;

  /** The content of the bottom panel's cell A, as `[left, right]`. */
  public readonly bottomInfoCellAContent?: [BottomInfoPanelCellAContent, BottomInfoPanelCellAContent];

  /**
   * Creates a new PfdLayoutConfigData from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      return;
    }

    const includeSoftKeys = element.getAttribute('softkeys')?.toLowerCase();
    switch (includeSoftKeys) {
      case undefined:
        break;
      case 'true':
        this.includeSoftKeys = true;
        break;
      case 'false':
        this.includeSoftKeys = false;
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid softkeys option (must be true or false)');
    }

    const splitModeInstrumentSide = element.getAttribute('instrument-side')?.toLowerCase();
    switch (splitModeInstrumentSide) {
      case undefined:
        break;
      case 'left':
      case 'right':
      case 'auto':
        this.splitModeInstrumentSide = splitModeInstrumentSide;
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid instrument-side option (must be left or right)');
    }

    const useBanners = element.getAttribute('use-banners')?.toLowerCase();
    switch (useBanners) {
      case undefined:
        break;
      case 'true':
        this.useBanners = true;
        break;
      case 'false':
        this.useBanners = false;
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid use-banners option (must be true or false)');
    }

    const useNavStatusBanner = element.getAttribute('use-nav-status-banner')?.toLowerCase();
    switch (useNavStatusBanner) {
      case undefined:
        break;
      case 'true':
        this.useNavStatusBanner = true;
        break;
      case 'false':
        this.useNavStatusBanner = false;
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid use-nav-status-banner option (must be true or false)');
    }

    const useNavDmeInfoBanner = element.getAttribute('use-nav-dme-banner')?.toLowerCase();
    switch (useNavDmeInfoBanner) {
      case undefined:
        break;
      case 'true':
        this.useNavDmeInfoBanner = true;
        break;
      case 'false':
        this.useNavDmeInfoBanner = false;
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid use-nav-dme-banner option (must be true or false)');
    }

    const useWindBanner = element.getAttribute('use-wind-banner')?.toLowerCase();
    switch (useWindBanner) {
      case undefined:
        break;
      case 'true':
        this.useWindBanner = true;
        break;
      case 'false':
        this.useWindBanner = false;
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid use-wind-banner option (must be true or false)');
    }

    this.bottomInfoCellAContent = this.parseCellAContent(element.querySelector(':scope>BottomInfo>CellA'));
  }

  /**
   * Parses cell A content from a configuration document element.
   * @param element A configuration document element.
   * @returns The cell A content defined by the specified element.
   */
  private parseCellAContent(element: Element | null): [BottomInfoPanelCellAContent, BottomInfoPanelCellAContent] | undefined {
    if (element === null) {
      return undefined;
    }

    let left = BottomInfoPanelCellAContent.Empty;
    let right = BottomInfoPanelCellAContent.Empty;

    const leftText = element.getAttribute('left')?.toLowerCase();
    switch (leftText) {
      case BottomInfoPanelCellAContent.Empty:
      case BottomInfoPanelCellAContent.Speed:
      case BottomInfoPanelCellAContent.Temperature:
      case BottomInfoPanelCellAContent.Wind:
      case BottomInfoPanelCellAContent.Time:
        left = leftText;
        break;
      case undefined:
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid cell A left content (must be \'empty\', \'speed\', \'temperature\', \'wind\', or \'time\'). Defaulting to empty.');
    }

    const rightText = element.getAttribute('right')?.toLowerCase();
    switch (rightText) {
      case BottomInfoPanelCellAContent.Empty:
      case BottomInfoPanelCellAContent.Speed:
      case BottomInfoPanelCellAContent.Temperature:
      case BottomInfoPanelCellAContent.Wind:
      case BottomInfoPanelCellAContent.Time:
        right = rightText;
        break;
      case undefined:
        break;
      default:
        console.warn('Invalid PfdLayoutConfig definition: invalid cell A right content (must be \'empty\', \'speed\', \'temperature\', \'wind\', or \'time\'). Defaulting to empty.');
    }

    return [left, right];
  }
}