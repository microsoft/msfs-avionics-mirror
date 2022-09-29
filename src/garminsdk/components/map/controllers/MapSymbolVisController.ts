import {
  MapIndexedRangeModule, MappedSubject, MappedSubscribable, MapSystemContext, MapSystemController, MutableSubscribable, Subject, Subscribable, Subscription
} from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapDeclutterMode, MapDeclutterModule } from '../modules/MapDeclutterModule';

/**
 * Modules required by MapSymbolVisController.
 */
export interface MapSymbolVisControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Declutter module. */
  [GarminMapKeys.Declutter]?: MapDeclutterModule;
}

/**
 * Controls the visibility of a specific type of map symbol whose visibility is dependent on its own show and maximum
 * range index settings as well as the global map declutter setting.
 */
export class MapSymbolVisController extends MapSystemController<MapSymbolVisControllerModules> {
  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly declutterModule = this.context.model.getModule(GarminMapKeys.Declutter);

  private isSymbolVisible?: MappedSubscribable<boolean>;
  private isSymbolVisiblePipe?: Subscription;

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param showSetting A subscribable which provides the show setting of this controller's symbol.
   * @param rangeIndexSetting A subscribable which provides the maximum range index setting of this controller's
   * symbol.
   * @param maxDeclutterMode The highest global declutter mode, inclusive, at which this controller's symbol remains
   * visible.
   * @param symbolVisibility The mutable subscribable which controls the visibility of this controller's symbol.
   */
  constructor(
    context: MapSystemContext<MapSymbolVisControllerModules, any, any, any>,
    private readonly showSetting: Subscribable<boolean>,
    private readonly rangeIndexSetting: Subscribable<number>,
    private readonly maxDeclutterMode: MapDeclutterMode,
    private readonly symbolVisibility: MutableSubscribable<boolean>
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.isSymbolVisible = MappedSubject.create(
      ([showSetting, rangeIndexSetting, rangeIndex, declutterMode]): boolean => {
        return showSetting && (declutterMode <= this.maxDeclutterMode) && (rangeIndex <= rangeIndexSetting);
      },
      this.showSetting,
      this.rangeIndexSetting,
      this.rangeModule.nominalRangeIndex,
      this.declutterModule?.mode ?? Subject.create(0)
    );

    this.isSymbolVisiblePipe = this.isSymbolVisible.pipe(this.symbolVisibility);
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isSymbolVisible?.destroy();
    this.isSymbolVisiblePipe?.destroy();
  }
}