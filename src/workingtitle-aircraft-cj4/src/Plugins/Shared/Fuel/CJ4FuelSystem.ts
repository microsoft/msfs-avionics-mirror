import { ConsumerSubject, EngineEvents, EventBus, FuelSystemEvents, KeyEventManager, MappedSubject, SimVarValueType, UnitType } from '@microsoft/msfs-sdk';

import { Cj4TransferDirection, CJ4VarEvents } from '../CJ4VarPublisher';

/**
 * A Citation CJ4 fuel system
 */
export class Cj4FuelSystem {
  // The boost pumps should operate when manually selected, during fuel transfer, during engine start, and during low fuel pressure
  // We do not check fuel pressure however as the only times there will be low fuel pressure in the sim
  // is when the tanks are entirely depleted, in which case the boost pumps do nothing

  private static readonly LEFT_BOOST_PUMP_INDEX = 1;
  private static readonly RIGHT_BOOST_PUMP_INDEX = 2;
  private static readonly L_TO_R_TRANSFER_VALVE_INDEX = 3;
  private static readonly R_TO_L_TRANSFER_VALVE_INDEX = 4;

  private static readonly FUEL_LEVEL_LOW_LEFT_MSG_VAR = 'L:WT_CJ4_Fuel_Level_Low_Left_Msg_Alert';
  private static readonly FUEL_LEVEL_LOW_LEFT_ANNUN_VAR = 'L:WT_CJ4_Fuel_Level_Low_Left_Annun_Alert';
  private static readonly FUEL_LEVEL_LOW_RIGHT_MSG_VAR = 'L:WT_CJ4_Fuel_Level_Low_Right_Msg_Alert';
  private static readonly FUEL_LEVEL_LOW_RIGHT_ANNUN_VAR = 'L:WT_CJ4_Fuel_Level_Low_Right_Annun_Alert';
  private static readonly FUEL_LEVEL_LOW_QTY = UnitType.GALLON_FUEL.convertFrom(240, UnitType.POUND);

  private readonly fuelTransferDirection = ConsumerSubject.create(this.bus.getSubscriber<CJ4VarEvents>().on('cj4_fuel_transfer_direction'), Cj4TransferDirection.None);

  private readonly leftTankLevel = ConsumerSubject.create(this.bus.getSubscriber<FuelSystemEvents>().on('fuel_system_tank_quantity_1').whenChangedBy(1), 0);
  private readonly rightTankLevel = ConsumerSubject.create(this.bus.getSubscriber<FuelSystemEvents>().on('fuel_system_tank_quantity_2').whenChangedBy(1), 0);
  private readonly leftTankLow = this.leftTankLevel.map((qty) => qty < Cj4FuelSystem.FUEL_LEVEL_LOW_QTY);
  private readonly rightTankLow = this.rightTankLevel.map((qty) => qty < Cj4FuelSystem.FUEL_LEVEL_LOW_QTY);

  private readonly leftBoostPumpManual = ConsumerSubject.create(this.bus.getSubscriber<CJ4VarEvents>().on('cj4_boost_pump_manual_1'), false);
  private readonly rightBoostPumpManual = ConsumerSubject.create(this.bus.getSubscriber<CJ4VarEvents>().on('cj4_boost_pump_manual_2'), false);

  private readonly leftEngineStart = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('eng_starter_active_1'), false);
  private readonly rightEngineStart = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('eng_starter_active_2'), false);

  private keyEventManager?: KeyEventManager;

  /** @inheritdoc */
  constructor(private readonly bus: EventBus) {
    KeyEventManager.getManager(bus).then((manager) => {
      this.keyEventManager = manager;

      this.watchForPumpState();
    });

    this.watchFuelLevel();
  }

  /**
   * Watches the variables that determine the boost pump state
   */
  private watchForPumpState(): void {
    MappedSubject.create(([manSwitch, engStart, fuelTransferDirection]) => {
      this.keyEventManager?.triggerKey('FUELSYSTEM_PUMP_SET', true, Cj4FuelSystem.LEFT_BOOST_PUMP_INDEX, this.getBoostPumpState(manSwitch, engStart, fuelTransferDirection === Cj4TransferDirection.RightToLeft));
    }, this.leftBoostPumpManual, this.leftEngineStart, this.fuelTransferDirection);

    MappedSubject.create(([manSwitch, engStart, fuelTransferDirection]) => {
      this.keyEventManager?.triggerKey('FUELSYSTEM_PUMP_SET', true, Cj4FuelSystem.RIGHT_BOOST_PUMP_INDEX, this.getBoostPumpState(manSwitch, engStart, fuelTransferDirection === Cj4TransferDirection.LeftToRight));
    }, this.rightBoostPumpManual, this.rightEngineStart, this.fuelTransferDirection);

    this.fuelTransferDirection.map((transferDirection) => {
      this.keyEventManager?.triggerKey('FUELSYSTEM_VALVE_SET', true, Cj4FuelSystem.L_TO_R_TRANSFER_VALVE_INDEX, transferDirection === Cj4TransferDirection.LeftToRight ? 1 : 0);
      this.keyEventManager?.triggerKey('FUELSYSTEM_VALVE_SET', true, Cj4FuelSystem.R_TO_L_TRANSFER_VALVE_INDEX, transferDirection === Cj4TransferDirection.RightToLeft ? 1 : 0);
    });
  }

  /**
   * Watches the fuel levels of the CJ4 and publishes fuel level warnings to LVars
   */
  private watchFuelLevel(): void {
    let leftTankAlertSent: NodeJS.Timeout | undefined = undefined;
    let leftTankMsgSent: NodeJS.Timeout | undefined = undefined;
    let rightTankAlertSent: NodeJS.Timeout | undefined = undefined;
    let rightTankMsgSent: NodeJS.Timeout | undefined = undefined;

    this.leftTankLow.sub((isLow) => {
      if (isLow && !leftTankAlertSent) {
        leftTankMsgSent = setTimeout(() => SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_LEFT_MSG_VAR, SimVarValueType.Bool, this.leftTankLow.get()), 90_000);
        leftTankAlertSent = setTimeout(() => SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_LEFT_ANNUN_VAR, SimVarValueType.Bool, this.leftTankLow.get()), 30_000);
      } else if (!isLow) {
        clearTimeout(leftTankAlertSent);
        clearTimeout(leftTankMsgSent);
        leftTankAlertSent = undefined;
        SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_LEFT_MSG_VAR, SimVarValueType.Bool, false);
        SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_LEFT_ANNUN_VAR, SimVarValueType.Bool, false);
      }
    });

    this.rightTankLow.sub((isLow) => {
      if (isLow && !rightTankAlertSent) {
        rightTankMsgSent = setTimeout(() => SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_RIGHT_MSG_VAR, SimVarValueType.Bool, this.rightTankLow.get()), 90_000);
        rightTankAlertSent = setTimeout(() => SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_RIGHT_ANNUN_VAR, SimVarValueType.Bool, this.rightTankLow.get()), 30_000);
      } else if (!isLow) {
        clearTimeout(rightTankAlertSent);
        clearTimeout(rightTankMsgSent);
        rightTankAlertSent = undefined;
        SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_RIGHT_MSG_VAR, SimVarValueType.Bool, false);
        SimVar.SetSimVarValue(Cj4FuelSystem.FUEL_LEVEL_LOW_RIGHT_ANNUN_VAR, SimVarValueType.Bool, false);
      }
    });
  }

  /**
   * Returns the boost pump state. If returning true, the boost pumps should be on, otherwise they should be off.
   * @param manSwitchOn Whether the manual boost pump switches are depressed
   * @param engineStarting Whether the engine is currently starting on the boost pump's side
   * @param fuelTransferring Whether fuel is currently transferring to the tank for this boost pump
   * @returns If the boost pump should be on
   */
  private getBoostPumpState(manSwitchOn: boolean, engineStarting: boolean, fuelTransferring: boolean): number {
    return (manSwitchOn || fuelTransferring || engineStarting) ? 1 : 0;
  }
}
