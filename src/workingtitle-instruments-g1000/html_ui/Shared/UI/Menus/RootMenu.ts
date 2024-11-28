import {
  ComputedSubject, ConsumerSubject, ControlPublisher, DebounceTimer, EventBus, InstrumentEvents, LNavEvents, MappedSubject, NavEvents,
  Subscription
} from '@microsoft/msfs-sdk';

import { GarminControlEvents, ObsSuspModes } from '@microsoft/msfs-garminsdk';

import { G1000AlertsLevel, G1000CasEvents } from '../../../PFD/Components/FlightInstruments';
import { AlertMessageEvents } from '../../../PFD/Components/UI/Alerts/AlertsSubject';
import { G1000ControlPublisher } from '../../G1000Events';
import { SoftKeyMenu } from './SoftKeyMenu';
import { SoftKeyMenuSystem } from './SoftKeyMenuSystem';

/**
 * The root PFD softkey menu.
 */
export class RootMenu extends SoftKeyMenu {
  private readonly isLNavSuspended: ConsumerSubject<boolean>;
  private readonly isObsActive: ConsumerSubject<boolean>;
  private readonly obsMode: MappedSubject<[boolean, boolean], ObsSuspModes>;

  private readonly isObsAvailable: ConsumerSubject<boolean>;
  private readonly isObsButtonDisabled: MappedSubject<[ObsSuspModes, boolean], boolean>;

  private readonly obsLabel = ComputedSubject.create(ObsSuspModes.NONE, (v): string => {
    return v === ObsSuspModes.SUSP ? 'SUSP' : 'OBS';
  });

  private readonly obsButtonValue = ComputedSubject.create(ObsSuspModes.NONE, (v): boolean => {
    return v === ObsSuspModes.NONE ? false : true;
  });

  private mfdPoweredOn = false;
  private currentAlertsLevel = G1000AlertsLevel.None;
  private readonly alertStylingDebounceTimer = new DebounceTimer();

  private readonly mfdPowerOnSub: Subscription;

  /**
   * Creates an instance of the root PFD softkey menu.
   * @param menuSystem The menu system.
   * @param controlPublisher A ControlPublisher for command events.
   * @param g1000Publisher A publisher for G1000-specific command events.
   * @param bus The event bus to use.
   */
  constructor(menuSystem: SoftKeyMenuSystem, controlPublisher: ControlPublisher, g1000Publisher: G1000ControlPublisher, bus: EventBus) {
    super(menuSystem);

    const obsButtonPressed = (): void => {
      const obsMode = this.obsMode.get();

      const isObsModeActive = obsMode === ObsSuspModes.OBS;

      if (obsMode === ObsSuspModes.SUSP) {
        controlPublisher.publishEvent('suspend_sequencing', false);
      } else if (isObsModeActive || this.isObsAvailable.get()) {
        SimVar.SetSimVarValue(`K:GPS_OBS_${isObsModeActive ? 'OFF' : 'ON'}`, 'number', 0);
        if (isObsModeActive) {
          controlPublisher.publishEvent('suspend_sequencing', false);
        }
      }
    };

    this.addItem(0, '', () => { });
    this.addItem(1, 'Map/HSI', () => menuSystem.pushMenu('map-hsi'));
    this.addItem(2, 'TFC Map');
    this.addItem(3, 'PFD Opt', () => menuSystem.pushMenu('pfd-opt'));
    this.addItem(4, this.obsLabel.get() as string, () => obsButtonPressed(), this.obsButtonValue.get() as boolean, true);
    this.addItem(5, 'CDI', () => { controlPublisher.publishEvent('cdi_src_switch', true); });
    this.addItem(6, 'ADF/DME', () => {
      g1000Publisher.publishEvent('pfd_dme_push', true);
    });
    this.addItem(7, 'XPDR', () => menuSystem.pushMenu('xpdr'));
    this.addItem(8, 'Ident', () => {
      controlPublisher.publishEvent('xpdr_send_ident_1', true);
    });
    this.addItem(9, 'Tmr/Ref', () => {
      g1000Publisher.publishEvent('pfd_timerref_push', true);
    });
    this.addItem(10, 'Nearest', () => {
      g1000Publisher.publishEvent('pfd_nearest_push', true);
    });
    this.addItem(11, 'Alerts', () => {
      g1000Publisher.publishEvent('pfd_alert_push', true);
    }, undefined, false);

    const sub = bus.getSubscriber<NavEvents & LNavEvents & GarminControlEvents & InstrumentEvents & AlertMessageEvents & G1000CasEvents>();

    this.isLNavSuspended = ConsumerSubject.create(sub.on('lnav_is_suspended'), false);
    this.isObsActive = ConsumerSubject.create(sub.on('gps_obs_active'), false);
    this.isObsAvailable = ConsumerSubject.create(sub.on('obs_available'), false);

    this.obsMode = MappedSubject.create(
      ([isLnavSuspended, isObsActive]): ObsSuspModes => {
        return isObsActive
          ? ObsSuspModes.OBS
          : isLnavSuspended ? ObsSuspModes.SUSP : ObsSuspModes.NONE;
      },
      this.isLNavSuspended,
      this.isObsActive
    );
    this.isObsButtonDisabled = MappedSubject.create(
      ([obsMode, isObsAvailable]): boolean => {
        return obsMode === ObsSuspModes.NONE && !isObsAvailable;
      },
      this.obsMode,
      this.isObsAvailable
    );

    this.obsMode.sub(obsMode => {
      this.obsLabel.set(obsMode);
      this.obsButtonValue.set(obsMode);

      const item = this.getItem(4);
      item.label.set(this.obsLabel.get());
      item.value.set(this.obsButtonValue.get());
    }, true);

    this.isObsButtonDisabled.sub(isDisabled => {
      const item = this.getItem(4);
      item.disabled.set(isDisabled);
    });

    this.mfdPowerOnSub = bus.on('mfd_power_on', this.onMfdPowerOn, true);

    bus.on('mfd_power_on', poweredOn => this.mfdPoweredOn = poweredOn);
    sub.on('vc_screen_state').handle(state => {
      if (state.current === ScreenState.REVERSIONARY) {
        setTimeout(() => {
          this.getItem(0).label.set('Engine');
          this.getItem(0).handler = (): void => this.menuSystem.pushMenu('engine-menu');

          if (!this.mfdPoweredOn) {
            this.mfdPowerOnSub.resume(true);
          }
        }, 1000);
      } else if (this.mfdPoweredOn) {
        setTimeout(() => {
          this.getItem(0).label.set('');
          this.getItem(0).handler = undefined;
        }, 1000);
      }
    });

    sub.on('alerts_available')
      .handle(available => this.getItem(11).highlighted.set(available));

    sub.on('cas_unacknowledged_alerts_level').handle(v => {
      this.currentAlertsLevel = v;
      this.getItem(11).additionalClasses.clear();

      //We have a debounce here so we can reset and re-add the CSS animations to restart
      //their timing. This ensures that the Alerts button flashes in sync with any CAS
      //alerts
      if (!this.alertStylingDebounceTimer.isPending()) {
        this.alertStylingDebounceTimer.schedule(this.updateAlertsStyle, 0);
      }
    });
  }

  /**
   * Handles when the MFD has powered on.
   * @param isPowered Whether or not the MFD has finished powering up.
   */
  private onMfdPowerOn = (isPowered: boolean): void => {
    if (isPowered) {
      setTimeout(() => {
        this.getItem(0).label.set('');
        this.getItem(0).handler = undefined;

        this.mfdPowerOnSub.pause();
      }, 1000);
    }
  };

  /**
   * Updates the Alerts button style.
   */
  private updateAlertsStyle = (): void => {
    const item = this.getItem(11);

    switch (this.currentAlertsLevel) {
      case G1000AlertsLevel.None:
        item.label.set('Alerts');
        item.additionalClasses.clear();
        break;
      case G1000AlertsLevel.Advisory:
        item.label.set('Advisory');
        item.additionalClasses.set(['advisory']);
        break;
      case G1000AlertsLevel.Caution:
        item.label.set('Caution');
        item.additionalClasses.set(['caution']);
        break;
      case G1000AlertsLevel.Warning:
        item.label.set('Warning');
        item.additionalClasses.set(['warning']);
        break;
    }
  };
}
