import {
  DisplayComponent, FSComponent, SetSubject, SubscribableSet, Subscription, VNode, ComponentProps, OneWayRunway,
  RunwayUtils, UnitFamily, UnitType, RunwaySurfaceCategory, RunwayLightingType, NumberFormatter
} from '@microsoft/msfs-sdk';
import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import './GtcToldRunwayDisplay.css';

/**
 * Component props for {@link GtcToldRunwayDisplay}.
 */
export interface GtcToldRunwayDisplayProps extends ComponentProps {
  /** The runway to display. */
  runway: OneWayRunway;

  /** Whether to include the displaced threshold in the length of the runway. */
  includeDisplacedThreshold: boolean;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** The CSS class(es) to apply to the component's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * Displays the ident, name, and icon for a waypoint.
 */
export class GtcToldRunwayDisplay extends DisplayComponent<GtcToldRunwayDisplayProps> {
  private static readonly RESERVED_CSS_CLASSES = ['told-runway-display'];

  private static readonly SURFACE_TEXT = {
    [RunwaySurfaceCategory.Hard]: 'Hard Surface',
    [RunwaySurfaceCategory.Soft]: 'Turf Surface',
    [RunwaySurfaceCategory.Water]: 'Water Surface',
    [RunwaySurfaceCategory.Unknown]: 'Unknown Surface'
  };

  private static readonly LIGHTING_TEXT = {
    [RunwayLightingType.FullTime]: 'Full Time',
    [RunwayLightingType.PartTime]: 'Part Time',
    [RunwayLightingType.Frequency]: 'PCL',
    [RunwayLightingType.None]: 'No Lights',
    [RunwayLightingType.Unknown]: 'Unknown'
  };

  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly lengthRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();
  private readonly widthRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['told-runway-display']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, GtcToldRunwayDisplay.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'told-runway-display';
      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !GtcToldRunwayDisplay.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <div class={cssClass}>
        <div class='told-runway-display-name'>{RunwayUtils.getRunwayNameString(this.props.runway.direction, this.props.runway.runwayDesignator, true)}</div>
        <div>
          <NumberUnitDisplay
            ref={this.lengthRef}
            value={UnitType.METER.createNumber(this.props.runway.length - (this.props.includeDisplacedThreshold ? 0 : this.props.runway.startThresholdLength))}
            displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
            formatter={GtcToldRunwayDisplay.DISTANCE_FORMATTER}
            class='told-runway-display-dimension'
          />
          <span> x </span>
          <NumberUnitDisplay
            ref={this.widthRef}
            value={UnitType.METER.createNumber(this.props.runway.width)}
            displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
            formatter={GtcToldRunwayDisplay.DISTANCE_FORMATTER}
            class='told-runway-display-dimension'
          />
        </div>
        <div class='told-runway-display-bottom'>
          <div class='told-runway-display-surface'>{GtcToldRunwayDisplay.SURFACE_TEXT[RunwayUtils.getSurfaceCategory(this.props.runway)]}</div>
          <div class='told-runway-display-lighting'>{GtcToldRunwayDisplay.LIGHTING_TEXT[this.props.runway.lighting]}</div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.lengthRef.getOrDefault()?.destroy();
    this.widthRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}