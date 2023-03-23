import { UserSettingManager } from '@microsoft/msfs-sdk';
import { SoftKeyEnumController, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';
import {
  DisplayPaneIndex, DisplayPanesUserSettings, NavSourceFormatter, PfdBearingPointerSource, PfdBearingPointerUserSettingTypes, PfdIndex, RadiosConfig
} from '@microsoft/msfs-wtg3000-common';

/**
 * The PFD settings softkey menu.
 */
export class PfdSettingsSoftKeyMenu extends SoftKeyMenu {
  private readonly splitPaneController: SoftKeyEnumController<boolean>;

  private readonly bearingPointer1Controller: SoftKeyEnumController<PfdBearingPointerSource>;
  private readonly bearingPointer2Controller: SoftKeyEnumController<PfdBearingPointerSource>;

  /**
   * Creates an instance of the PFD settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param pfdIndex The index of the PFD instrument to which this menu belongs.
   * @param bearingPointerSettingManager A manager for bearing pointer user settings for this menu's PFD.
   * @param radiosConfig The radios configuration object.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    pfdIndex: PfdIndex,
    bearingPointerSettingManager: UserSettingManager<PfdBearingPointerUserSettingTypes>,
    radiosConfig: RadiosConfig,
    isSplit: boolean
  ) {
    super(menuSystem);

    let bearingPointer1Index, bearingPointer2Index, backSoftKeyIndex;

    if (isSplit) {
      bearingPointer1Index = 2;
      bearingPointer2Index = 3;
      backSoftKeyIndex = 5;

      this.addItem(0, 'Attitude\nOverlays', () => { menuSystem.pushMenu('attitude-overlays-split'); });
      this.addItem(4, 'Other PFD\nSettings', () => { menuSystem.pushMenu('other-pfd-settings-split'); });
    } else {
      bearingPointer1Index = 5;
      bearingPointer2Index = 6;
      backSoftKeyIndex = 10;

      this.addItem(0, 'Attitude\nOverlays', () => { menuSystem.pushMenu('attitude-overlays'); });
      this.addItem(8, 'Other PFD\nSettings', () => { menuSystem.pushMenu('other-pfd-settings'); });
    }

    this.addItem(backSoftKeyIndex, 'Back', () => { menuSystem.back(); });

    const splitPaneSetting = DisplayPanesUserSettings.getDisplayPaneManager(
      menuSystem.bus,
      pfdIndex === 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd
    ).getSetting('displayPaneVisible');

    this.splitPaneController = new SoftKeyEnumController(
      this,
      1,
      'PFD Mode',
      splitPaneSetting,
      isVisible => isVisible ? 'SPLIT' : 'FULL',
      currentValue => !currentValue
    );

    const bearingPointerSourceFormatter = NavSourceFormatter.createForBearingPointerSetting('FMS', false, radiosConfig.dmeCount > 1, radiosConfig.adfCount > 1);

    this.bearingPointer1Controller = new SoftKeyEnumController(
      this,
      bearingPointer1Index,
      'Bearing 1',
      bearingPointerSettingManager.getSetting('pfdBearingPointer1Source'),
      bearingPointerSourceFormatter,
      currentValue => {
        // TODO: Support FMS1/2
        switch (currentValue) {
          case PfdBearingPointerSource.Nav1:
            return PfdBearingPointerSource.Nav2;
          case PfdBearingPointerSource.Nav2:
            return PfdBearingPointerSource.Fms1;
          case PfdBearingPointerSource.Fms1:
          case PfdBearingPointerSource.Fms2:
            return radiosConfig.adfCount > 0 ? PfdBearingPointerSource.Adf1 : PfdBearingPointerSource.None;
          case PfdBearingPointerSource.Adf1:
            return radiosConfig.adfCount > 1 ? PfdBearingPointerSource.Adf2 : PfdBearingPointerSource.None;
          case PfdBearingPointerSource.Adf2:
            return PfdBearingPointerSource.None;
          default:
            return PfdBearingPointerSource.Nav1;
        }
      }
    );

    this.bearingPointer2Controller = new SoftKeyEnumController(
      this,
      bearingPointer2Index,
      'Bearing 2',
      bearingPointerSettingManager.getSetting('pfdBearingPointer2Source'),
      bearingPointerSourceFormatter,
      currentValue => {
        // TODO: Support FMS1/2
        switch (currentValue) {
          case PfdBearingPointerSource.Nav1:
            return PfdBearingPointerSource.Nav2;
          case PfdBearingPointerSource.Nav2:
            return PfdBearingPointerSource.Fms1;
          case PfdBearingPointerSource.Fms1:
          case PfdBearingPointerSource.Fms2:
            return radiosConfig.adfCount > 0 ? PfdBearingPointerSource.Adf1 : PfdBearingPointerSource.None;
          case PfdBearingPointerSource.Adf1:
            return radiosConfig.adfCount > 1 ? PfdBearingPointerSource.Adf2 : PfdBearingPointerSource.None;
          case PfdBearingPointerSource.Adf2:
            return PfdBearingPointerSource.None;
          default:
            return PfdBearingPointerSource.Nav1;
        }
      }
    );

    this.splitPaneController.init();
    this.bearingPointer1Controller.init();
    this.bearingPointer2Controller.init();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.splitPaneController.destroy();
    this.bearingPointer1Controller.destroy();
    this.bearingPointer2Controller.destroy();

    super.destroy();
  }
}