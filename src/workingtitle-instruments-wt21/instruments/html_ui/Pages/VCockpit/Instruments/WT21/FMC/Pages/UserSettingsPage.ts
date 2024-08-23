import { ConsumerSubject, DisplayField, ElectricalEvents, FmcRenderTemplate, KeyEventManager, SimbriefClient, Subject, SwitchLabel, TextInputField } from '@microsoft/msfs-sdk';

import { FmcUserSettings, WT21UserSettings } from '@microsoft/msfs-wt21-shared';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * USER SETTINGS PAGE
 */
export class UserSettingsPage extends WT21FmcPage {

  private readonly planeUserSettings = WT21UserSettings.getManager(this.bus);
  private readonly fmcUserSettings = FmcUserSettings.getManager(this.bus);

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

  private readonly cabinLightsModeSwitch = new SwitchLabel(this, {
    optionStrings: ['OFF', 'ON', 'DIM'],
    activeStyle: 'green',
  }).bind(this.planeUserSettings.getSetting('cabinLightsMode'));

  private readonly simbriefUsernameField = new TextInputField(this, {
    formatter: {
      nullValueString: '---------',

      /** @inheritDoc */
      format(value: number): string {
        return value === -1 ? '---------' : value.toString();
      },

      /** @inheritDoc */
      async parse(input: string) {
        if (input.trim().length === 0) {
          return null;
        }

        // check if input is a number
        if (/^\d+$/.test(input)) {
          return parseInt(input);
        }

        let pilotId = null;
        try {
          pilotId = await SimbriefClient.getSimbriefUserIDFromUsername(input);
        } catch (error) {
          return Promise.reject('INVALID SB USER');
        }

        return pilotId;
      },
    },

    onModified: async (pilotId) => {
      this.fmcUserSettings.getSetting('simbriefPilotId').set(pilotId);

      return true;
    },

    onDelete: async () => {
      this.fmcUserSettings.getSetting('simbriefPilotId').set(-1);

      return true;
    },
  }).bind(this.fmcUserSettings.getSetting('simbriefPilotId'));

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

  //For AUTO cabin lights, we could have them go to dim/off when thrust levers beyond 70% and airspeed above 40kts


  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'USER SETTINGS[blue]'],
        [' GROUND POWER[blue]'],
        [this.groundPowerSwitch, this.groundPowerAvailLabel],
        [' CABIN LIGHTS[blue]'],
        [this.cabinLightsModeSwitch],
        [' SIMBRIEF ID[blue]', ''],
        [this.simbriefUsernameField, ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
      ],
    ];
  }
}
