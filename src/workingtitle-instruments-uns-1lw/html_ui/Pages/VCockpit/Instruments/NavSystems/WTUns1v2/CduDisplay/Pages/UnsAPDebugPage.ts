import { APEvents, APLateralModes, APVerticalModes, ConsumerSubject, DisplayField, EventBus, FmcRenderTemplate } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';
import { UnsApDebugDataEvents } from '../../Autopilot/UnsAutopilot';

/**
 * Store for {@link UnsAPDebugPage}
 */
class UnsAPDebugPageStore {
  /**
   * Constructor
   * @param bus the event bus
   */
  constructor(private readonly bus: EventBus) {
  }

  public readonly apMasterStatus = ConsumerSubject.create(
    this.bus.getSubscriber<APEvents>().on('ap_master_status'),
    false,
  );

  public readonly apLateralActive = ConsumerSubject.create(
    this.bus.getSubscriber<UnsApDebugDataEvents>().on('lateralActive'),
    APLateralModes.NONE,
  );

  public readonly apLateralArmed = ConsumerSubject.create(
    this.bus.getSubscriber<UnsApDebugDataEvents>().on('lateralArmed'),
    APLateralModes.NONE,
  );

  public readonly apVerticalActive = ConsumerSubject.create(
    this.bus.getSubscriber<UnsApDebugDataEvents>().on('verticalActive'),
      APVerticalModes.NONE,
  );

  public readonly apVerticalArmed = ConsumerSubject.create(
    this.bus.getSubscriber<UnsApDebugDataEvents>().on('verticalArmed'),
    APVerticalModes.NONE,
  );
}

/**
 * AP Debug page
 */
export class UnsAPDebugPage extends UnsFmcPage {
  private readonly store = new UnsAPDebugPageStore(this.bus);

  protected readonly pageTitle = ' AP DEBUG';

  private readonly ApMasterStatusField = new DisplayField<boolean>(this, {
    formatter: (status) => {
      return status ? 'ACTIVE[green d-text]' : 'OFF[amber d-text]';
    }
  }).bind(this.store.apMasterStatus);

  private readonly ApLateralActiveField = new DisplayField<APLateralModes>(this, {
    formatter: (mode) => {
      return `${APLateralModes[mode].toUpperCase()}[d-text]`;
    }
  }).bind(this.store.apLateralActive);

  private readonly ApLateralArmedField = new DisplayField<APLateralModes>(this, {
    formatter: (mode) => {
      return `${APLateralModes[mode].toUpperCase()}[d-text]`;
    }
  }).bind(this.store.apLateralArmed);

  private readonly ApVerticalActiveField = new DisplayField<APVerticalModes>(this, {
    formatter: (mode) => {
      return `${APVerticalModes[mode].toUpperCase()}[d-text]`;
    }
  }).bind(this.store.apVerticalActive);

  private readonly ApVerticalArmedField = new DisplayField<APVerticalModes>(this, {
    formatter: (mode) => {
      return `${APVerticalModes[mode].toUpperCase()}[d-text]`;
    }
  }).bind(this.store.apVerticalArmed);

  /** @inheritDoc */
  protected override onInit(): void {
    this.addBinding(this.store.apMasterStatus);
    this.addBinding(this.store.apLateralActive);
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['AP MASTER[cyan s-text]'],
        [this.ApMasterStatusField],
        ['LAT ACTIVE[cyan s-text]', 'VERT ACTIVE[cyan s-text]'],
        [this.ApLateralActiveField, this.ApVerticalActiveField],
        ['LAT ARMED[cyan s-text]', 'VERT ARMED[cyan s-text]'],
        [this.ApLateralArmedField, this.ApVerticalArmedField],
      ]
    ];
  }
}
