import { SimVarValueType } from '@microsoft/msfs-sdk';
import { SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-wtg1000';
import { Sr22tAntiIceTankMode } from '../../../Shared/AntiIceSystem/Sr22tAntiIceCalculator';

/** The SR22T Softkey Anti-Ice Menu. */
export class Sr22tMfdAntiIceMenu extends SoftKeyMenu {
  /**
   * Creates an instance of the SR22T Anti-Ice softkey menu.
   * @param menuSystem The menu system.
   */
  constructor(protected menuSystem: SoftKeyMenuSystem) {
    super(menuSystem);

    const initialTankMode = SimVar.GetSimVarValue('L:WT1000_TKS_TankMode', SimVarValueType.Number);

    this.addItem(0, 'Left', this.onLeftKeyPressed.bind(this), initialTankMode === Sr22tAntiIceTankMode.Left);
    this.addItem(1, 'Auto', this.onAutoKeyPressed.bind(this), initialTankMode === Sr22tAntiIceTankMode.Auto);
    this.addItem(2, 'Right', this.onRightKeyPressed.bind(this), initialTankMode === Sr22tAntiIceTankMode.Right);
    this.addItem(10, 'Back', this.onBackKeyPressed.bind(this));
  }

  /** Use left fuel tank for anti-ice calculations */
  private onLeftKeyPressed(): void {
    SimVar.SetSimVarValue('L:WT1000_TKS_TankMode', SimVarValueType.Number, Sr22tAntiIceTankMode.Left);
    this.getItem(0).value.set(true);
    this.getItem(1).value.set(false);
    this.getItem(2).value.set(false);
  }

  /** Use right fuel tank for anti-ice calculations */
  private onRightKeyPressed(): void {
    SimVar.SetSimVarValue('L:WT1000_TKS_TankMode', SimVarValueType.Number, Sr22tAntiIceTankMode.Right);
    this.getItem(0).value.set(false);
    this.getItem(1).value.set(false);
    this.getItem(2).value.set(true);
  }

  /** Returns to Auto tank mode. */
  private onAutoKeyPressed(): void {
    SimVar.SetSimVarValue('L:WT1000_TKS_TankMode', SimVarValueType.Number, Sr22tAntiIceTankMode.Auto);
    this.getItem(0).value.set(false);
    this.getItem(1).value.set(true);
    this.getItem(2).value.set(false);
  }

  /** Back softkey press handler */
  private onBackKeyPressed(): void {
    this.menuSystem.back();
  }
}
