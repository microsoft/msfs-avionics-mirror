import {
  AdcEvents, AvionicsSystemState, ComponentProps, ConsumerSubject, DebounceTimer, DisplayComponent, EventBus, FSComponent, MappedSubject, ObjectSubject, Subject, Subscribable,
  SubscribableMapFunctions, TcasOperatingMode, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { HSIFormat, MapUserSettings, PfdOrMfd } from '../../Map/MapUserSettings';
import { WT21_PFD_MFD_Colors as WT21_PFD_MFD_Colors } from '../../WT21_Colors';
import { TSSSystemEvents } from '../../Systems';
import { WT21TCAS } from '../../Traffic/WT21TCAS';
import { TrafficSettings, TrafficUserSettings } from '../../Traffic/TrafficUserSettings';
import { WT21DisplayUnitFsInstrument } from '../../WT21DisplayUnitFsInstrument';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';

import './TfcInfo.css';

/** @inheritdoc */
interface TfcInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The display unit */
  displayUnit: WT21DisplayUnitFsInstrument;

  /** The TCAS instance. */
  tcas: WT21TCAS;

  /** Whether the component is on the PFD or the MFD. */
  pfdOrMfd: PfdOrMfd;
}

/** The TfcInfo component. */
export class TfcInfo extends DisplayComponent<TfcInfoProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly dataFieldRef = FSComponent.createRef<TfcInfoDataField>();
  private readonly otherTrafficRef = FSComponent.createRef<TfcInfoOtherTraffic>();
  private readonly aboveBelowRef = FSComponent.createRef<TfcInfoAboveBelow>();
  private readonly altitudeRef = FSComponent.createRef<TfcInfoAltitude>();

  private readonly mapSettings = MapUserSettings.getAliasedManager(this.props.bus, this.props.pfdOrMfd);
  private readonly trafficSettings = TrafficUserSettings.getManager(this.props.bus);

  private readonly isUsingSoftkeys = this.props.displayUnit.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;

  private readonly isVisible = MappedSubject.create(
    ([format, isTfcEnabled]): boolean => {
      return format === 'TCAS' || isTfcEnabled;
    },
    this.mapSettings.getSetting('hsiFormat'),
    this.mapSettings.getSetting('tfcEnabled')
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.mapSettings.getSetting('hsiFormat').sub(this.handleFormat, true);

    this.isVisible.sub(isVisible => {
      this.rootRef.instance.classList.toggle('tfc-disabled', !isVisible);
    }, true);
  }

  private readonly handleFormat = (format: HSIFormat): void => {
    this.rootRef.instance.classList.toggle('format-supported', format !== 'PLAN');
  };

  /** @inheritDoc */
  public render(): VNode | null {
    return this.isUsingSoftkeys ? this.renderSoftkeyLayout() : this.renderTraditionalLayout();
  }

  /** @inheritdoc */
  private renderSoftkeyLayout(): VNode {
    return (
      <div ref={this.rootRef} class="tfc-info tfc-info-side-buttons">
        <div class="right-info-tfc-switch-arrow-wrapper">
          <svg class="right-info-tfc-switch-arrow" viewBox="0 0 10 14">
            <path d="M 3, 2 l 4, 5 l -4, 5" stroke-width={1.5} stroke="white" />
          </svg>
        </div>

        <div class="tfc-label">TFC</div>
        <div class="tfc-info-hideable">
          <TfcInfoDataField bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
          <TfcInfoOtherTraffic bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
          <TfcInfoAboveBelow bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
          <TfcInfoAltitude bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  private renderTraditionalLayout(): VNode {
    return (
      <div ref={this.rootRef} class='tfc-info'>
        <div class='tfc-label'>TFC</div>
        <div class='tfc-info-hideable'>
          <TfcInfoDataField bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
          <TfcInfoOtherTraffic bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
          <TfcInfoAboveBelow bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
          <TfcInfoAltitude bus={this.props.bus} tcas={this.props.tcas} trafficSettings={this.trafficSettings} isVisible={this.isVisible} pfdOrMfd={this.props.pfdOrMfd} />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.mapSettings.getSetting('hsiFormat').unsub(this.handleFormat);
    this.isVisible.destroy();

    this.dataFieldRef.instance.destroy();
    this.otherTrafficRef.instance.destroy();
    this.aboveBelowRef.instance.destroy();
    this.altitudeRef.instance.destroy();
  }
}

/**
 * Component props for individual TfcInfo subfields.
 */
interface TfcInfoFieldProps extends Omit<TfcInfoProps, 'displayUnit'> {
  /** The traffic user settings manager. */
  trafficSettings: UserSettingManager<TrafficSettings>;

  /** Whether the traffic legend is visible. */
  isVisible: Subscribable<boolean>;
}

/**
 * TFC data field statuses.
 */
enum TfcInfoDataFieldStatus {
  NoVsiRA = 'NO VSI RA',
  NoAttRA = 'NO ATT RA',
  TCASTest = 'TCAS TEST',
  TCASOff = 'TCAS OFF',
  TAOnly = 'TA ONLY',
  Traffic = 'TRAFFIC',
  TCASFail = 'TCAS FAIL',
  None = ''
}

/**
 * The TFC data field.
 */
class TfcInfoDataField extends DisplayComponent<TfcInfoFieldProps> {
  private static readonly COLORS = {
    [TfcInfoDataFieldStatus.NoVsiRA]: WT21_PFD_MFD_Colors.yellow,
    [TfcInfoDataFieldStatus.NoAttRA]: WT21_PFD_MFD_Colors.yellow,
    [TfcInfoDataFieldStatus.TCASTest]: WT21_PFD_MFD_Colors.cyan,
    [TfcInfoDataFieldStatus.TCASOff]: WT21_PFD_MFD_Colors.cyan,
    [TfcInfoDataFieldStatus.TAOnly]: WT21_PFD_MFD_Colors.cyan,
    [TfcInfoDataFieldStatus.Traffic]: WT21_PFD_MFD_Colors.red,
    [TfcInfoDataFieldStatus.TCASFail]: WT21_PFD_MFD_Colors.yellow,
    [TfcInfoDataFieldStatus.None]: WT21_PFD_MFD_Colors.cyan,
  };

  private readonly status = Subject.create(TfcInfoDataFieldStatus.None);
  private tssState: AvionicsSystemState | undefined;

  private readonly textSub = this.status.map(SubscribableMapFunctions.identity());
  private readonly styleSub = ObjectSubject.create({ color: '' });

  private readonly operatingMode = ConsumerSubject.create(null, TcasOperatingMode.Standby).pause();
  private readonly raCount = ConsumerSubject.create(null, 0).pause();

  private readonly visibilityHandler = this.updateFromVisibility.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.tcas.getEventSubscriber();

    this.operatingMode.setConsumer(sub.on('tcas_operating_mode'));
    this.raCount.setConsumer(sub.on('tcas_ra_intruder_count'));

    this.status.sub(status => {
      this.styleSub.set('color', TfcInfoDataField.COLORS[status]);
    }, true);

    const updateStatusHandler = this.updateStatus.bind(this);

    this.operatingMode.sub(updateStatusHandler);
    this.raCount.sub(updateStatusHandler);

    this.props.bus.getSubscriber<TSSSystemEvents>().on('tss_state')
      .whenChanged()
      .handle(state => {
        this.tssState = state.current;
        this.updateStatus();
      });

    this.updateStatus();

    this.props.isVisible.sub(this.visibilityHandler, true);
  }

  /**
   * Updates this component based on whether it is visible.
   * @param isVisible Whether this component is visible.
   */
  private updateFromVisibility(isVisible: boolean): void {
    if (isVisible) {
      this.operatingMode.resume();
      this.raCount.resume();
    } else {
      this.operatingMode.pause();
      this.raCount.pause();
    }
  }

  /**
   * Updates this field's status.
   */
  private updateStatus(): void {
    if (this.tssState === AvionicsSystemState.On) {
      switch (this.operatingMode.get()) {
        case TcasOperatingMode.Standby:
          this.status.set(TfcInfoDataFieldStatus.TCASOff);
          return;
        case TcasOperatingMode.TAOnly:
          this.status.set(TfcInfoDataFieldStatus.TAOnly);
          return;
      }
    } else if (this.tssState === AvionicsSystemState.Off) {
      this.status.set(TfcInfoDataFieldStatus.TCASOff);
      return;
    } else {
      this.status.set(this.props.pfdOrMfd === 'MFD' ? TfcInfoDataFieldStatus.TCASFail : TfcInfoDataFieldStatus.None);
      return;
    }

    if (this.raCount.get() > 0) {
      this.status.set(TfcInfoDataFieldStatus.Traffic);
      return;
    }

    this.status.set(TfcInfoDataFieldStatus.None);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.styleSub} class='tfc-data'>{this.textSub}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.props.isVisible.unsub(this.visibilityHandler);
    this.operatingMode.destroy();
    this.raCount.destroy();
  }
}

/**
 * The TFC other traffic message.
 */
class TfcInfoOtherTraffic extends DisplayComponent<TfcInfoFieldProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly showOther = ConsumerSubject.create(null, false).pause();

  private readonly visibilityHandler = this.updateFromVisibility.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showOther.setConsumer(this.props.trafficSettings.whenSettingChanged('trafficShowOther'));
    this.showOther.sub(show => {
      this.rootRef.instance.classList.toggle('visibility-hidden', show);
    }, true);

    this.props.isVisible.sub(this.visibilityHandler, true);
  }

  /**
   * Updates this component based on whether it is visible.
   * @param isVisible Whether this component is visible.
   */
  private updateFromVisibility(isVisible: boolean): void {
    if (isVisible) {
      this.showOther.resume();
    } else {
      this.showOther.pause();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='tfc-other-traffic'>
        <svg viewBox='0 0 100 100'>
          <polygon points='50,10 90,50 50,90 10,50' />
        </svg>
        <span>-OFF</span>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.props.isVisible.unsub(this.visibilityHandler);
    this.showOther.destroy();
  }
}

/**
 * The TFC above/below message.
 */
class TfcInfoAboveBelow extends DisplayComponent<TfcInfoFieldProps> {
  private readonly showAbove = ConsumerSubject.create(null, false).pause();
  private readonly showBelow = ConsumerSubject.create(null, false).pause();

  private readonly aboveStyle = ObjectSubject.create({ color: '' });
  private readonly belowStyle = ObjectSubject.create({ color: '' });

  private readonly visibilityHandler = this.updateFromVisibility.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showAbove.setConsumer(this.props.trafficSettings.whenSettingChanged('trafficShowAbove'));
    this.showBelow.setConsumer(this.props.trafficSettings.whenSettingChanged('trafficShowBelow'));

    this.showAbove.sub(show => {
      this.aboveStyle.set('color', show ? WT21_PFD_MFD_Colors.cyan : WT21_PFD_MFD_Colors.white);
    }, true);
    this.showBelow.sub(show => {
      this.belowStyle.set('color', show ? WT21_PFD_MFD_Colors.cyan : WT21_PFD_MFD_Colors.white);
    }, true);

    this.props.isVisible.sub(this.visibilityHandler, true);
  }

  /**
   * Updates this component based on whether it is visible.
   * @param isVisible Whether this component is visible.
   */
  private updateFromVisibility(isVisible: boolean): void {
    if (isVisible) {
      this.showAbove.resume();
      this.showBelow.resume();
    } else {
      this.showAbove.pause();
      this.showBelow.pause();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tfc-above-below'>
        <div style={this.aboveStyle}>ABOVE</div>
        <div style={this.belowStyle}>BELOW</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.props.isVisible.unsub(this.visibilityHandler);
    this.showAbove.destroy();
    this.showBelow.destroy();
  }
}

/**
 * The TFC altitude field.
 */
class TfcInfoAltitude extends DisplayComponent<TfcInfoFieldProps> {
  private static readonly INOP_DELAY = 15000; // ms

  private readonly topTextSub = Subject.create('');
  private readonly bottomTextSub = Subject.create('');

  private readonly pressureAlt = ConsumerSubject.create(null, 0).pause();
  private readonly isAltitudeRelative = ConsumerSubject.create(null, false).pause();

  private readonly isInop = this.pressureAlt.map(alt => alt < 18000);

  private readonly inopTimer = new DebounceTimer();

  private readonly visibilityHandler = this.updateFromVisibility.bind(this);
  private readonly altitudeHandler = this.updateAltitudeDisplay.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<AdcEvents>();

    this.pressureAlt.setConsumer(sub.on('pressure_alt').withPrecision(0));
    this.isAltitudeRelative.setConsumer(this.props.trafficSettings.whenSettingChanged('trafficAltitudeRelative'));

    this.isInop.sub(isInop => {
      if (!this.isAltitudeRelative.get()) {
        this.startAltitudeDisplay(isInop);
      }
    });

    this.isAltitudeRelative.sub(isRelative => {
      if (isRelative) {
        this.stopAltitudeDisplay();
      } else {
        this.startAltitudeDisplay(this.isInop.get());
      }
    }, true);

    this.props.isVisible.sub(this.visibilityHandler, true);
  }

  /**
   * Updates this component based on whether it is visible.
   * @param isVisible Whether this component is visible.
   */
  private updateFromVisibility(isVisible: boolean): void {
    if (isVisible) {
      this.pressureAlt.resume();
      this.isAltitudeRelative.resume();
    } else {
      this.pressureAlt.pause();
      this.isAltitudeRelative.pause();
    }
  }

  /**
   * Begins displaying the airplane's pressure altitude.
   * @param isInop Whether the altitude display is inop. If `true`, the altitude display will be replaced by the inop
   * message after 15 seconds.
   */
  private startAltitudeDisplay(isInop: boolean): void {
    this.inopTimer.clear();

    this.topTextSub.set('ALT');

    this.pressureAlt.unsub(this.altitudeHandler);
    this.pressureAlt.sub(this.altitudeHandler, true);
    if (isInop) {
      this.inopTimer.schedule(() => {
        this.stopAltitudeDisplay();
        this.displayInop();
      }, TfcInfoAltitude.INOP_DELAY);
    }
  }

  /**
   * Stops displaying the airplane's pressure altitude.
   */
  private stopAltitudeDisplay(): void {
    this.inopTimer.clear();
    this.pressureAlt.unsub(this.altitudeHandler);

    this.topTextSub.set('');
    this.bottomTextSub.set('');
  }

  /**
   * Displays the absolute altitude inop message.
   */
  private displayInop(): void {
    this.topTextSub.set('ABS');
    this.bottomTextSub.set('INOP');
  }

  /**
   * Updates the displayed altitude.
   * @param alt The airplane's current pressure altitude, in feet.
   */
  private updateAltitudeDisplay(alt: number): void {
    alt = Math.min(Math.round(alt / 100), 999);
    this.bottomTextSub.set(alt < 0 ? 'XXX' : alt.toString().padStart(3, '0'));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tfc-altitude'>
        <div>{this.topTextSub}</div>
        <div>{this.bottomTextSub}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.props.isVisible.unsub(this.visibilityHandler);
    this.pressureAlt.destroy();
    this.isAltitudeRelative.destroy();
  }
}