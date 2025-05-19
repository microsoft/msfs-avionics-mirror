import {
  Accessible, ConsumerSubject, ConsumerValue, EventBus, LatLonInterface, MappedSubject, MappedSubscribable,
  MappedValue, Subject, Subscribable, Subscription, Value
} from '@microsoft/msfs-sdk';

import {
  AhrsSystemEvents, FmsPositionMode, FmsPositionSystemEvents, UnitsDistanceSettingMode, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { G3000ChartsEvents } from '../../Charts/G3000ChartsEvents';
import { G3000ChartsSource } from '../../Charts/G3000ChartsSource';
import { G3000ChartsDisplayLightMode, G3000ChartsPageSelectionData } from '../../Charts/G3000ChartsTypes';
import { G3000BacklightEvents } from '../../Instruments/G3000Backlight';
import { G3000ChartsLightModeSettingMode, G3000ChartsUserSettings } from '../../Settings/G3000ChartsUserSettings';
import { PfdSensorsUserSettingManager } from '../../Settings/PfdSensorsUserSettings';
import { DisplayPaneIndex } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneUtils } from '../DisplayPanes/DisplayPaneUtils';
import { G3000MapBuilder } from '../Map/G3000MapBuilder';
import { ChartsPaneViewDataProvider } from './ChartsPaneViewDataProvider';

/**
 * A default implementation of {@link ChartsPaneViewDataProvider}.
 */
export class DefaultChartsPaneViewDataProvider implements ChartsPaneViewDataProvider {

  private readonly _chartPageSelection = ConsumerSubject.create<G3000ChartsPageSelectionData | null>(null, null).pause();
  /** @inheritDoc */
  public readonly chartPageSelection = this._chartPageSelection as Subscribable<G3000ChartsPageSelectionData | null>;

  private readonly _chartPageSection = ConsumerSubject.create<string>(null, '').pause();
  /** @inheritDoc */
  public readonly chartPageSection = this._chartPageSection as Subscribable<string>;

  private readonly backlight = ConsumerSubject.create(null, 0).pause();
  private readonly autoLightMode?: MappedSubscribable<G3000ChartsDisplayLightMode>;

  private readonly _lightMode = Subject.create(G3000ChartsDisplayLightMode.Day);
  /** @inheritDoc */
  public readonly lightMode = this._lightMode as Subscribable<G3000ChartsDisplayLightMode>;

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None).pause();

  private readonly isPlaneHeadingValid = ConsumerValue.create(null, false);
  private readonly planeHeadingSource = ConsumerValue.create(null, 0);

  private readonly planePositionSource = { lat: NaN, lon: NaN };
  private readonly _planePosition = Value.create(this.planePositionSource);
  /** @inheritDoc */
  public readonly planePosition = this._planePosition as Accessible<Readonly<LatLonInterface>>;

  /** @inheritDoc */
  public readonly unitsDistanceMode: Subscribable<UnitsDistanceSettingMode>;

  /** @inheritDoc */
  public readonly planeHeading = MappedValue.create(
    ([isValid, heading]) => isValid ? heading : NaN,
    this.isPlaneHeadingValid,
    this.planeHeadingSource
  ) as Accessible<number>;

  private readonly autoLightModePipe?: Subscription;
  private readonly lightModeSettingSub?: Subscription;

  private readonly fmsPosModeSub: Subscription;
  private readonly planePositionSub: Subscription;
  private readonly ahrsIndexSub: Subscription;

  /**
   * Creates a new instance of DefaultChartsPaneViewDataProvider.
   * @param bus The event bus.
   * @param chartsSources All available charts sources.
   * @param displayPaneIndex The index of the display pane for which the provider provides data.
   * @param pfdSensorsSettingManager A manager for PFD sensors user settings.
   * @param isProcPreview Whether the provider should provide data for the display pane's procedure preview chart
   * instead of the general chart.
   */
  public constructor(
    bus: EventBus,
    public readonly chartsSources: Iterable<G3000ChartsSource>,
    displayPaneIndex: DisplayPaneIndex,
    pfdSensorsSettingManager: PfdSensorsUserSettingManager,
    isProcPreview: boolean
  ) {
    if (DisplayPaneUtils.isControllableDisplayPaneIndex(displayPaneIndex)) {
      const sub = bus.getSubscriber<G3000ChartsEvents & G3000BacklightEvents>();

      if (isProcPreview) {
        this._chartPageSelection.setConsumer(sub.on(`charts_proc_preview_page_selection_${displayPaneIndex}`));
        this._chartPageSection.setConsumer(sub.on(`charts_proc_preview_page_section_${displayPaneIndex}`));
      } else {
        this._chartPageSelection.setConsumer(sub.on(`charts_page_selection_${displayPaneIndex}`));
        this._chartPageSection.setConsumer(sub.on(`charts_page_section_${displayPaneIndex}`));
      }

      const settingManager = G3000ChartsUserSettings.getDisplayPaneManager(bus, displayPaneIndex);

      switch (displayPaneIndex) {
        case DisplayPaneIndex.LeftMfd:
        case DisplayPaneIndex.RightMfd:
          this.backlight.setConsumer(sub.on('g3000_backlight_mfd_1'));
          break;
        case DisplayPaneIndex.LeftPfd:
          this.backlight.setConsumer(sub.on('g3000_backlight_pfd_1'));
          break;
        case DisplayPaneIndex.RightPfd:
          this.backlight.setConsumer(sub.on('g3000_backlight_pfd_2'));
          break;
      }

      this.autoLightMode = MappedSubject.create(
        ([threshold, backlight]) => backlight * 100 < threshold ? G3000ChartsDisplayLightMode.Night : G3000ChartsDisplayLightMode.Day,
        settingManager.getSetting('chartsLightThreshold'),
        this.backlight
      ).pause();

      this.autoLightModePipe = this.autoLightMode.pipe(this._lightMode, true);

      this.lightModeSettingSub = settingManager.getSetting('chartsLightMode').sub(this.onLightModeSettingChanged.bind(this), false, true);
    }

    const sub = bus.getSubscriber<AhrsSystemEvents & FmsPositionSystemEvents>();

    const pfdIndex = G3000MapBuilder.getPfdIndexForDisplayPane(displayPaneIndex, pfdSensorsSettingManager.pfdCount);

    this.planePositionSub = sub.on(`fms_pos_gps-position_${pfdIndex}`).handle(lla => {
      this.planePositionSource.lat = lla.lat;
      this.planePositionSource.lon = lla.long;
    }, true);

    this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${pfdIndex}`));

    this.fmsPosModeSub = this.fmsPosMode.sub(this.onFmsPosModeChanged.bind(this), false, true);

    this.ahrsIndexSub = pfdSensorsSettingManager.getAliasedManager(pfdIndex).getSetting('pfdAhrsIndex').sub(index => {
      this.isPlaneHeadingValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
      this.planeHeadingSource.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`));
    }, false, true);

    this.unitsDistanceMode = UnitsUserSettings.getManager(bus).getSetting('unitsDistance');
  }

  /** @inheritDoc */
  public resume(): void {
    this._chartPageSelection.resume();
    this._chartPageSection.resume();

    this.lightModeSettingSub?.resume(true);

    this.fmsPosMode.resume();
    this.fmsPosModeSub.resume(true);
    this.ahrsIndexSub.resume(true);
  }

  /** @inheritDoc */
  public pause(): void {
    this._chartPageSelection.pause();
    this._chartPageSection.pause();

    this.lightModeSettingSub?.pause();
    this.backlight.pause();
    this.autoLightMode?.pause();
    this.autoLightModePipe?.pause();

    this.fmsPosMode.pause();
    this.fmsPosModeSub.pause();
    this.ahrsIndexSub.pause();
  }

  /**
   * Responds to when the light mode setting changes.
   * @param mode The new light mode setting value.
   */
  private onLightModeSettingChanged(mode: G3000ChartsLightModeSettingMode): void {
    if (mode === G3000ChartsLightModeSettingMode.Auto) {
      this.backlight.resume();
      this.autoLightMode!.resume();
      this.autoLightModePipe!.resume(true);
    } else {
      this.backlight.pause();
      this.autoLightMode!.pause();
      this.autoLightModePipe!.pause();
      this._lightMode.set(
        mode === G3000ChartsLightModeSettingMode.Night
          ? G3000ChartsDisplayLightMode.Night
          : G3000ChartsDisplayLightMode.Day
      );
    }
  }

  /**
   * Responds to when the FMS positioning mode changes.
   * @param fmsPosMode The new FMS positioning mode.
   */
  private onFmsPosModeChanged(fmsPosMode: FmsPositionMode): void {
    if (fmsPosMode === FmsPositionMode.None) {
      this.planePositionSub.pause();
      this.planePositionSource.lat = NaN;
      this.planePositionSource.lon = NaN;
    } else {
      this.planePositionSub.resume(true);
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this._chartPageSelection.destroy();
    this._chartPageSection.destroy();
    this.backlight.destroy();
    this.autoLightMode?.destroy();
    this.lightModeSettingSub?.destroy();
    this.fmsPosMode.destroy();
    this.isPlaneHeadingValid.destroy();
    this.planeHeadingSource.destroy();
    this.planePositionSub.destroy();
    this.ahrsIndexSub.destroy();
  }
}
