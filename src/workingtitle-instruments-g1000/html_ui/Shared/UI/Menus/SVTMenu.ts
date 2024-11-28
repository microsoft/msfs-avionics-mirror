import { PFDUserSettings } from '../../../PFD/PFDUserSettings';
import { SoftKeyMenuSystem } from './SoftKeyMenuSystem';
import { SoftKeyMenu } from './SoftKeyMenu';

/**
 * The PFD Opt softkey menu.
 */
export class SVTMenu extends SoftKeyMenu {
  private readonly settingManager = PFDUserSettings.getManager(this.menuSystem.bus);

  private pathwaysStateOn = true;
  private hdgLabelStateOn = true;

  /**
   * Creates an instance of the PFD Opt SVT menu.
   * @param menuSystem The menu system.
   */
  constructor(menuSystem: SoftKeyMenuSystem) {
    super(menuSystem);

    this.addItem(0, 'Pathways', () => { this.onPathwaysTogglePressed(); }, false);
    this.addItem(1, 'Terrain', () => { this.onSvtTogglePressed(); }, false);
    this.addItem(2, 'HDG LBL', () => { this.onHdgLblPressed(); }, false);
    this.addItem(3, 'APT Sign');
    this.addItem(10, 'Back', () => menuSystem.back());
    this.addItem(11, 'Alerts');

    this.settingManager.whenSettingChanged('svtPathwaysShow').handle(this.onPathwaysActiveChanged.bind(this));
    this.settingManager.whenSettingChanged('svtToggle').handle(this.onSvtActiveChanged.bind(this));
    this.settingManager.whenSettingChanged('svtHdgLabelToggle').handle(this.onHdgLblActiveChanged.bind(this));
  }

  /**
   * Callback when the pathways setting is changed.
   * @param v true if pathways are active, false otherwise.
   */
  private onPathwaysActiveChanged(v: boolean): void {
    this.getItem(0).value.set(v);
  }

  /**
   * Callback when the SVT setting is changed.
   * @param v true if SVT is active, false otherwise.
   */
  private onSvtActiveChanged(v: boolean): void {
    this.getItem(1).value.set(v);
  }

  /**
   * Callback when the Hdg label setting is changed.
   * @param v true if hdg label is active, false otherwise.
   */
  private onHdgLblActiveChanged(v: boolean): void {
    this.getItem(2).value.set(v);
  }

  /**
   * Callback when the SVT pathways toggle is pressed.
   */
  private onPathwaysTogglePressed(): void {
    this.settingManager.getSetting('svtPathwaysShow').value = !this.settingManager.getSetting('svtPathwaysShow').value;
  }

  /**
   * Callback when the SVT setting toggle is pressed.
   */
  private onSvtTogglePressed(): void {
    const newSvtToggleSetting = !this.settingManager.getSetting('svtToggle').value;
    if (newSvtToggleSetting == false) {
      this.pathwaysStateOn = this.settingManager.getSetting('svtPathwaysShow').value;
      this.hdgLabelStateOn = this.settingManager.getSetting('svtHdgLabelToggle').value;
      this.settingManager.getSetting('svtPathwaysShow').value = false;
      this.settingManager.getSetting('svtHdgLabelToggle').value = false;
    } else {
      this.settingManager.getSetting('svtPathwaysShow').value = this.pathwaysStateOn;
      this.settingManager.getSetting('svtHdgLabelToggle').value = this.hdgLabelStateOn;
    }

    this.settingManager.getSetting('svtToggle').value = !this.settingManager.getSetting('svtToggle').value;
  }



  /**
   * Callback when the SVT setting toggle is pressed.
   */
  private onHdgLblPressed(): void {
    this.settingManager.getSetting('svtHdgLabelToggle').value = !this.settingManager.getSetting('svtHdgLabelToggle').value;
  }
}