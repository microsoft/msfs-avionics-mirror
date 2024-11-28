import {
  ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MathUtils, NodeReference, NumberFormatter, NumberUnit,
  NumberUnitInterface, NumberUnitSubject, SetSubject, SimpleUnit, Subject, SubscribableSetEventType, Subscription, TcasAdvisoryDataProvider, TcasAlertLevel,
  TcasOperatingMode, UnitFamily, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { Epic2TcasII, Epic2TcasIntruder, NumberUnitDisplay, PfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

import { Annunciator } from '../Annunciator';

import './TrafficAnnunciator.css';

/** The properties for the {@link TrafficAnnunciator} component. */
interface TrafficAnnunciatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** An instance of TCAS. */
  tcas: Epic2TcasII;
  /** A TCAS advisory data provider */
  tcasAdvisoryDataProvider: TcasAdvisoryDataProvider
  /** The settings manager to use. */
  settings: UserSettingManager<PfdAliasedUserSettingTypes>;
}

/** The TrafficAnnunciator component. */
export class TrafficAnnunciator extends DisplayComponent<TrafficAnnunciatorProps> {
  private readonly taContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly raContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly operatingMode = ConsumerSubject.create(null, TcasOperatingMode.Standby);
  private readonly tcasModeLabel = Subject.create('');
  readonly trafficOverlay = this.props.settings.getSetting('trafficEnabled');
  /** Manages visibility of the traffic annunciator */
  private readonly annunciatorClasses = SetSubject.create(['traffic']);

  private readonly activeTaAnnunciators = new Map<number, NodeReference<TcasAlertAnnunciator>>([]);
  private readonly activeRaAnnunciators = new Map<number, NodeReference<TcasAlertAnnunciator>>([]);

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.tcas.getEventSubscriber();
    this.operatingMode.setConsumer(sub.on('tcas_operating_mode')).map((operatingMode: TcasOperatingMode) => {
      switch (operatingMode) {
        case TcasOperatingMode.TA_RA:
          this.tcasModeLabel.set('TA/RA');
          break;
        case TcasOperatingMode.TAOnly:
          this.tcasModeLabel.set('TA');
          break;
        case TcasOperatingMode.Standby:
          this.tcasModeLabel.set('STBY');
          break;
        default:
          break;
      }
    });

    this.trafficOverlay.sub((trfcChecked) => {
      this.annunciatorClasses.toggle('hidden', !trfcChecked);
    });

    this.props.tcasAdvisoryDataProvider.taIntruders.sub((_, type, key) => {
      const container = this.taContainerRef.getOrDefault();
      if (container) {
        switch (type) {
          case SubscribableSetEventType.Added: {
            const ref = FSComponent.createRef<TcasAlertAnnunciator>();
            FSComponent.render(<TcasAlertAnnunciator intruder={key as Epic2TcasIntruder} bus={this.props.bus} ref={ref} />, container);
            this.activeTaAnnunciators.set(key.contact.uid, ref);
            break;
          }
          case SubscribableSetEventType.Deleted: {
            const alert = this.activeTaAnnunciators.get(key.contact.uid);
            alert?.getOrDefault()?.destroy();
          }
        }
      }
    });

    this.props.tcasAdvisoryDataProvider.raIntruders.sub((_, type, key) => {
      const container = this.raContainerRef.getOrDefault();
      if (container) {
        switch (type) {
          case SubscribableSetEventType.Added: {
            const ref = FSComponent.createRef<TcasAlertAnnunciator>();
            FSComponent.render(<TcasAlertAnnunciator intruder={key as Epic2TcasIntruder} bus={this.props.bus} ref={ref} />, container);
            this.activeRaAnnunciators.set(key.contact.uid, ref);
            break;
          }
          case SubscribableSetEventType.Deleted: {
            const alert = this.activeRaAnnunciators.get(key.contact.uid);
            alert?.getOrDefault()?.destroy();
          }
        }
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <Annunciator bus={this.props.bus} label={this.tcasModeLabel} hideLabel={false} mainTitle='TRAFFIC' subTitle='' class={this.annunciatorClasses}>
        <div class="ra-intruders" ref={this.raContainerRef} />
        <div class="ta-intruders" ref={this.taContainerRef} />
      </Annunciator>
    );
  }
}

/** Props for a {@link TcasAlertAnnunciator} */
export interface TcasAlertAnnunciatorProps extends ComponentProps {
  /** The event bus */
  bus: EventBus
  /** The intruder information */
  intruder: Epic2TcasIntruder;
}

/**
 * An annunciator containing TCAS alert information
 */
export class TcasAlertAnnunciator extends DisplayComponent<TcasAlertAnnunciatorProps> {
  private containerClass = SetSubject.create(['intruder']);
  private containerRef = FSComponent.createRef<HTMLDivElement>();

  private distance = NumberUnitSubject.create(new NumberUnit(NaN, UnitType.METER));
  private altitudeDifference = NumberUnitSubject.create(new NumberUnit(NaN, UnitType.METER));
  private isVsDown = Subject.create(false);

  private subs = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(
      this.props.intruder.alertLevel.sub((level) => {
        this.containerClass.toggle('ta-intruder', level === TcasAlertLevel.TrafficAdvisory);
        this.containerClass.toggle('ra-intruder', level === TcasAlertLevel.ResolutionAdvisory);
      }, true),
      this.props.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1).handle(() => this.update()),
    );
  }

  /**
   * Updates the intruder data
   */
  private update(): void {
    this.updatePosition(this.props.intruder);

    this.containerClass.toggle('hidden', this.props.intruder.isBearingDisplayDataValid);
  }

  /**
   * Updates the intruder position data
   * @param intruder The intruder
   */
  private updatePosition(intruder: Epic2TcasIntruder): void {
    const absX = Math.abs(intruder.relativePositionVec[0]);
    const absY = Math.abs(intruder.relativePositionVec[1]);
    const horizDist = Math.sqrt(Math.pow(absX, 2) + Math.pow(absY, 2));

    this.distance.set(horizDist);
    this.altitudeDifference.set(intruder.relativePositionVec[2]);
    this.isVsDown.set(intruder.verticalSpeed.asUnit(UnitType.FPM) < 50);
  }

  /**
   * Formats a relative altitude to a string
   * @param alt The relative altitude
   * @returns A formatted string
   */
  private formatAltitude(alt: NumberUnitInterface<string, SimpleUnit<UnitFamily.Distance>>): string {
    const diffFoot = MathUtils.round(alt.asUnit(UnitType.FOOT), 100);
    const prefix = diffFoot < 50 ? '-' : '+';

    return `${prefix}${Math.abs(diffFoot / 100).toFixed(0).padStart(2, '0')}`;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.containerClass} ref={this.containerRef}>
        <div>{this.props.intruder.alertLevel.get() === TcasAlertLevel.ResolutionAdvisory ? 'RA' : 'TA'}</div>
        <div class="dist">
          <NumberUnitDisplay
            value={this.distance}
            formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, pad: 2, nanString: '--' })}
            displayUnit={UnitType.NMILE}
          />
        </div>
        <div class="alt">
          <span>
            {this.altitudeDifference.map((v) => this.formatAltitude(v))}
          </span>
          <svg class={{ 'vs-down': this.isVsDown }} viewBox="0 0 40 70">
            <path d="m 20 10 l 13 22 l -9 0 l 0 30 l -8 0 l 0 -30 l -9 0 z" />
          </svg>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subs) {
      sub.destroy();
    }

    this.containerRef.getOrDefault()?.remove();
  }
}
