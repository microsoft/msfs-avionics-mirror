import { ComputedSubject, ControlEvents, MappedSubject, MappedSubscribable, Subscribable, Subscription, UserSettingManager } from '@microsoft/msfs-sdk';
import { ObsSuspDataProvider, ObsSuspModes, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import {
  DisplayPaneControlEvents, DisplayPaneIndex, FmsConfig, G3000NavIndicator, NavSourceFormatter, PfdIndex, PfdMapLayoutSettingMode, PfdMapLayoutUserSettingTypes,
  RadiosConfig
} from '@microsoft/msfs-wtg3000-common';

/**
 * The root PFD softkey menu.
 */
export class PfdRootSoftKeyMenu extends SoftKeyMenu {

  private readonly isObsButtonDisabled: MappedSubject<[ObsSuspModes, boolean], boolean>;

  private readonly obsLabel = ComputedSubject.create(ObsSuspModes.NONE, (v): string => {
    return v === ObsSuspModes.SUSP ? 'SUSP' : 'OBS';
  });

  private readonly obsButtonValue = ComputedSubject.create(ObsSuspModes.NONE, (v): boolean => {
    return v === ObsSuspModes.NONE ? false : true;
  });

  private readonly activeNavValue: MappedSubscribable<string | undefined>;

  private readonly subs: Subscription[] = [];

  /**
   * Creates an instance of the root PFD softkey menu.
   * @param menuSystem The softkey menu system.
   * @param pfdIndex The index of the PFD instrument to which this menu belongs.
   * @param activeNavIndicator The active nav indicator of this menu's PFD.
   * @param obsSuspDataProvider A provider of OBS/SUSP data.
   * @param mapLayoutSettingManager A manager for map layout settings for this menu's PFD.
   * @param radiosConfig The radios configuration object.
   * @param fmsConfig The FMS configuration object.
   * @param declutter Whether this menu's parent PFD is decluttered.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    private readonly pfdIndex: PfdIndex,
    activeNavIndicator: G3000NavIndicator,
    obsSuspDataProvider: ObsSuspDataProvider,
    mapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>,
    radiosConfig: RadiosConfig,
    fmsConfig: FmsConfig,
    declutter: Subscribable<boolean>,
    isSplit: boolean
  ) {
    super(menuSystem);

    let obsSoftKeyIndex, activeNavSoftkeyIndex;
    const declutterDisableIndexes: number[] = [];

    if (isSplit) {
      obsSoftKeyIndex = 2;
      activeNavSoftkeyIndex = 3;

      this.addItem(0, 'Traffic');
      this.addItem(1, 'PFD\nSettings', () => menuSystem.pushMenu('pfd-settings-split'));
      this.addItem(4, 'PFD Map\nSettings', () => menuSystem.pushMenu('pfd-map-settings-split'));

      declutterDisableIndexes.push(1, 4);
    } else {
      obsSoftKeyIndex = 5;
      activeNavSoftkeyIndex = 6;

      const displayPaneIndex = this.pfdIndex === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument;

      const mapLayoutSetting = mapLayoutSettingManager.getSetting('pfdMapLayout');

      const mapRangeDecItem = this.addItem(0, 'Map\nRange -', () => {
        this.menuSystem.bus.getPublisher<DisplayPaneControlEvents>().pub('display_pane_view_event', {
          displayPaneIndex,
          eventType: 'display_pane_map_range_dec',
          eventData: undefined,
        }, true);
      });
      const mapRangeIncItem = this.addItem(1, 'Map\nRange +', () => {
        this.menuSystem.bus.getPublisher<DisplayPaneControlEvents>().pub('display_pane_view_event', {
          displayPaneIndex,
          eventType: 'display_pane_map_range_inc',
          eventData: undefined,
        }, true);
      });

      this.addItem(2, 'PFD Map\nSettings', () => menuSystem.pushMenu('pfd-map-settings'));

      const trafficInsetItem = this.addItem(3, 'Traffic\nInset', () => {
        if (mapLayoutSetting.value === PfdMapLayoutSettingMode.Traffic) {
          mapLayoutSetting.value = PfdMapLayoutSettingMode.Off;
        } else {
          mapLayoutSetting.value = PfdMapLayoutSettingMode.Traffic;
        }
      });

      this.addItem(4, 'PFD\nSettings', () => menuSystem.pushMenu('pfd-settings'));
      this.addItem(7, 'Sensors', () => { menuSystem.pushMenu('sensors'); });

      this.subs.push(mapLayoutSetting.sub(mapLayout => {
        const disabled = mapLayout === PfdMapLayoutSettingMode.Off;

        mapRangeDecItem.disabled.set(disabled);
        mapRangeIncItem.disabled.set(disabled);

        trafficInsetItem.value.set(mapLayout === PfdMapLayoutSettingMode.Traffic);
      }, true));

      declutterDisableIndexes.push(2, 3, 4);
    }

    // ---- OBS softkey ----

    const controlPublisher = menuSystem.bus.getPublisher<ControlEvents>();

    const obsButtonPressed = (): void => {
      const obsMode = obsSuspDataProvider.mode.get();

      const isObsModeActive = obsMode === ObsSuspModes.OBS;

      if (obsMode === ObsSuspModes.SUSP) {
        controlPublisher.pub('suspend_sequencing', false, true);
      } else if (isObsModeActive || obsSuspDataProvider.isObsAvailable.get()) {
        SimVar.SetSimVarValue(`K:GPS_OBS_${isObsModeActive ? 'OFF' : 'ON'}`, 'number', 0);
        if (isObsModeActive) {
          controlPublisher.pub('suspend_sequencing', false, true);
        }
      }
    };

    const obsItem = this.addItem(obsSoftKeyIndex, this.obsLabel.get() as string, () => obsButtonPressed(), this.obsButtonValue.get() as boolean, true);

    this.isObsButtonDisabled = MappedSubject.create(
      ([obsMode, isObsAvailable]): boolean => {
        return obsMode === ObsSuspModes.NONE && !isObsAvailable;
      },
      obsSuspDataProvider.mode,
      obsSuspDataProvider.isObsAvailable
    );

    this.subs.push(
      obsSuspDataProvider.mode.sub(obsMode => {
        this.obsLabel.set(obsMode);
        this.obsButtonValue.set(obsMode);

        obsItem.label.set(this.obsLabel.get());
        obsItem.value.set(this.obsButtonValue.get());
      }, true),

      this.isObsButtonDisabled.sub(isDisabled => {
        obsItem.disabled.set(isDisabled);
      })
    );

    // ---- Active NAV softkey ----

    const activeNavItem = this.addItem(activeNavSoftkeyIndex, 'Active NAV', () => { controlPublisher.pub('cdi_src_switch', true, true, false); });

    this.activeNavValue = MappedSubject.create(
      NavSourceFormatter.createForIndicator(
        fmsConfig.navSourceLabelText,
        false,
        radiosConfig.dmeCount > 1,
        radiosConfig.adfCount > 1,
        true
      ).bind(undefined, activeNavIndicator),
      activeNavIndicator.source,
      activeNavIndicator.isLocalizer
    );

    this.subs.push(this.activeNavValue.pipe(activeNavItem.value));

    // ---- Declutter ----

    this.subs.push(declutter.sub(isDecluttered => {
      for (let i = 0; i < declutterDisableIndexes.length; i++) {
        this.getItem(declutterDisableIndexes[i])?.disabled.set(isDecluttered);
      }
    }, true));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isObsButtonDisabled.destroy();
    this.activeNavValue.destroy();

    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}