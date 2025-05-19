import {
  Accessible, ConsumerSubject, EventBus, LatLonInterface, MappedSubscribable, Subject, Subscribable, Subscription,
  UserSettingManager
} from '@microsoft/msfs-sdk';

import { UnitsDistanceSettingMode } from '@microsoft/msfs-garminsdk';

import { G3XBacklightEvents } from '../../../Shared/Backlight/G3XBacklightEvents';
import { G3XChartsSelectionManager } from '../../../Shared/Charts/G3XChartsSelectionManager';
import { G3XChartsSource } from '../../../Shared/Charts/G3XChartsSource';
import { G3XChartsDisplayColorMode, G3XChartsPageSelectionData } from '../../../Shared/Charts/G3XChartsTypes';
import { PositionHeadingDataProvider } from '../../../Shared/Navigation/PositionHeadingDataProvider';
import { G3XChartsColorModeSettingMode, G3XChartsUserSettingTypes } from '../../../Shared/Settings/G3XChartsUserSettings';
import { G3XUnitsUserSettings } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { WaypointInfoChartDisplayDataProvider } from './WaypointInfoChartDisplayDataProvider';

/**
 * A default implementation of {@link WaypointInfoChartDisplayDataProvider}.
 */
export class DefaultWaypointInfoChartDisplayDataProvider implements WaypointInfoChartDisplayDataProvider {
  private static readonly AUTO_MODE_BACKLIGHT_THRESHOLD = 0.5;

  /** @inheritDoc */
  public readonly chartsSources: ReadonlyMap<string, G3XChartsSource>;

  /** @inheritDoc */
  public readonly chartPageSelection: Subscribable<G3XChartsPageSelectionData | null>;

  /** @inheritDoc */
  public readonly isLoadingAirportData: Subscribable<boolean>;

  private readonly backlight = ConsumerSubject.create(null, 0).pause();
  private readonly autoColorMode: MappedSubscribable<G3XChartsDisplayColorMode>;

  private readonly _colorMode = Subject.create(G3XChartsDisplayColorMode.Day);
  /** @inheritDoc */
  public readonly colorMode = this._colorMode as Subscribable<G3XChartsDisplayColorMode>;

  /** @inheritDoc */
  public readonly planePosition: Accessible<Readonly<LatLonInterface>>;

  /** @inheritDoc */
  public readonly planeHeading: Accessible<number>;

  /** @inheritDoc */
  public readonly unitsDistanceMode: Subscribable<UnitsDistanceSettingMode>;

  private readonly autoLightModePipe: Subscription;
  private readonly colorModeSettingSub: Subscription;

  /**
   * Creates a new instance of DefaultWaypointInfoChartDisplayDataProvider.
   * @param gduIndex The index of the data provider's parent GDU.
   * @param bus The event bus.
   * @param chartsSelectionManager The manager that controls the selections for the chart display for which to provide
   * data.
   * @param posHeadingDataProvider A provider of airplane position and heading data.
   * @param chartsSettingManager A manager for electronic charts user settings.
   */
  public constructor(
    gduIndex: number,
    bus: EventBus,
    chartsSelectionManager: G3XChartsSelectionManager,
    posHeadingDataProvider: PositionHeadingDataProvider,
    chartsSettingManager: UserSettingManager<G3XChartsUserSettingTypes>
  ) {
    this.chartsSources = chartsSelectionManager.chartsSources;
    this.chartPageSelection = chartsSelectionManager.selectedPageData;
    this.isLoadingAirportData = chartsSelectionManager.isLoadingAirportData;

    const sub = bus.getSubscriber<G3XBacklightEvents>();

    this.backlight.setConsumer(sub.on(`g3x_backlight_screen_level_${gduIndex}`));

    // According to the G3X manual, Auto automatically chooses the color mode based on "local time of day". It's
    // unclear whether this is meant literally or is just an abstraction of the true logic. We will base our logic on
    // the display backlight level since this seems more useful than time of day.
    this.autoColorMode = this.backlight.map(backlight => {
      return backlight < DefaultWaypointInfoChartDisplayDataProvider.AUTO_MODE_BACKLIGHT_THRESHOLD
        ? G3XChartsDisplayColorMode.Night
        : G3XChartsDisplayColorMode.Day;
    }).pause();

    this.autoLightModePipe = this.autoColorMode.pipe(this._colorMode, true);

    this.colorModeSettingSub = chartsSettingManager.getSetting('chartsColorMode').sub(this.onLightModeSettingChanged.bind(this), false, true);

    this.planePosition = posHeadingDataProvider.pposWithFailure;
    this.planeHeading = posHeadingDataProvider.headingTrueWithFailure;

    this.unitsDistanceMode = G3XUnitsUserSettings.getManager(bus).getSetting('unitsDistance');
  }

  /** @inheritDoc */
  public resume(): void {
    this.colorModeSettingSub.resume(true);
  }

  /** @inheritDoc */
  public pause(): void {
    this.colorModeSettingSub.pause();
    this.backlight.pause();
    this.autoColorMode.pause();
    this.autoLightModePipe.pause();
  }

  /**
   * Responds to when the color mode setting changes.
   * @param mode The new color mode setting value.
   */
  private onLightModeSettingChanged(mode: G3XChartsColorModeSettingMode): void {
    if (mode === G3XChartsColorModeSettingMode.Auto) {
      this.backlight.resume();
      this.autoColorMode.resume();
      this.autoLightModePipe.resume(true);
    } else {
      this.backlight.pause();
      this.autoColorMode.pause();
      this.autoLightModePipe.pause();
      this._colorMode.set(
        mode === G3XChartsColorModeSettingMode.Night
          ? G3XChartsDisplayColorMode.Night
          : G3XChartsDisplayColorMode.Day
      );
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.backlight.destroy();
    this.autoColorMode.destroy();
    this.colorModeSettingSub.destroy();
  }
}
