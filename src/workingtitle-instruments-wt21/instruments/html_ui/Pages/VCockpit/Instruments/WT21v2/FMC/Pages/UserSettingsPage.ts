import {
  ConsumerSubject, DisplayField, ElectricalEvents, FmcRenderTemplate, KeyEventManager, Subject, SwitchLabel
} from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * USER SETTINGS PAGE
 */
export class UserSettingsPage extends WT21FmcPage {
  private readonly groundPowerSwitchState = Subject.create(0);
  private readonly groundPowerSimOnState = ConsumerSubject.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_ext_power_on_1').whenChanged(), false);
  private readonly groundPowerAvailState = ConsumerSubject.create(this.bus.getSubscriber<ElectricalEvents>().on('elec_ext_power_available_1').whenChanged(), false);

  private readonly groundPowerSwitch = new SwitchLabel(this, {
    optionStrings: ['OFF', 'ON'],
    activeStyle: 'green',
    onSelected: async () => {
      return !this.groundPowerAvailState.get();
    },
  }).bind(this.groundPowerSwitchState);

  private readonly groundPowerAvailLabel = new DisplayField(this, {
    formatter: {
      nullValueString: 'NOT AVAIL',
      format: (value: boolean): string => {
        return value ? 'AVAIL[green]' : 'NOT AVAIL[white]';
      },
    },
  }).bind(this.groundPowerAvailState);

  /** @inheritdoc */
  protected onInit(): void {
    this.addBinding(
      this.groundPowerAvailState.sub((value) => {
        if (value === false && this.groundPowerSwitchState.get() === 1) {
          this.groundPowerSwitchState.set(0);
        }
      }, true)
    );

    this.addBinding(
      this.groundPowerSimOnState.sub((value) => {
        this.groundPowerSwitchState.set(value ? 1 : 0);
      })
    );

    KeyEventManager.getManager(this.bus).then((manager) => {
      this.addBinding(
        this.groundPowerSwitchState.sub((value) => {
          manager.triggerKey('SET_EXTERNAL_POWER', true, 1, value);
        }, true)
      );
    });
  }

  /** @inheritdoc */
  protected onPause(): void {
    this.groundPowerAvailState.pause();
    this.groundPowerSimOnState.pause();
  }

  /** @inheritdoc */
  protected onResume(): void {
    this.groundPowerAvailState.resume();
    this.groundPowerSimOnState.resume();
  }

  //For the ground power annunciations, we could use NOT AVAIL in white, AVAIL in yellow, and IN USE in green

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'USER SETTINGS[blue]'],
        [' GROUND POWER[blue]'],
        [this.groundPowerSwitch, this.groundPowerAvailLabel],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
      ],
    ];
  }
}
