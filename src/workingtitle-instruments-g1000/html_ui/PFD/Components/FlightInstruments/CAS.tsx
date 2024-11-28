import {
  Annunciation, AnnunciationType, CasActiveMessage, CasEvents, CasStateEvents, CasSystem, CasSystemLegacyAdapter, ComponentProps, CompositeLogicXMLHost,
  DisplayComponent, EventBus, FilteredMappedSubscribableArray, FSComponent, ObjectSubject, SortedMappedSubscribableArray, SoundServerController, VNode
} from '@microsoft/msfs-sdk';

import { CASAlertCounts, CASDisplay } from '@microsoft/msfs-garminsdk';

import { G1000ControlEvents } from '../../../Shared/G1000Events';
import { AlertMessage } from '../UI';

import './CAS.css';

/**
 * An alerts level on the G1000 NXi.
 */
export enum G1000AlertsLevel {
  None,
  Advisory,
  Caution,
  Warning
}

/**
 * CAS events specific to the G1000 NXi.
 */
export interface G1000CasEvents {
  /** Synchronizes the current CAS unacknowledged alerts level with the Alerts component. */
  'cas_unacknowledged_alerts_level': G1000AlertsLevel;
}

/**
 * An alerts message to be associated with a specified CAS.
 */
export interface CasAssociatedMessage {
  /** The ID of the CAS alert. */
  casUid: string,

  /** The alert message to display when the CAS alert is active. */
  message: AlertMessage
}

/** The props for a CAS element. */
interface CASProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus,
  /** Our logic handler. */
  logicHandler: CompositeLogicXMLHost,
  /** The configured annunciations. */
  annunciations: Array<Annunciation>,
  /** The ID string for the caution sound. */
  cautionSoundId?: string,
  /** The ID string for the warning sound. */
  warningSoundId?: string
}

/** A G1000 PFD CAS display. */
export class CAS extends DisplayComponent<CASProps> {
  /** The overall container for the CAS elements. */
  private divRef = FSComponent.createRef<HTMLDivElement>();
  /** The div for new, unacked annunciations. */
  /** The well little div for the divider bar beween acked and unacked. */
  private dividerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly soundController = new SoundServerController(this.props.bus);
  private readonly casSystem = new CasSystem(this.props.bus, true);
  private readonly casLegacyAdapater = new CasSystemLegacyAdapter(this.props.bus, this.props.logicHandler, this.props.annunciations);

  private readonly newMessages = SortedMappedSubscribableArray.create(FilteredMappedSubscribableArray.create(this.casSystem.casActiveMessageSubject, a => !a.acknowledged),
    this.orderMessages.bind(this));
  private readonly ackedMessages = SortedMappedSubscribableArray.create(FilteredMappedSubscribableArray.create(this.casSystem.casActiveMessageSubject, a => a.acknowledged),
    this.orderMessages.bind(this));

  private readonly newMessageCounts = ObjectSubject.create<CASAlertCounts>({
    totalAlerts: 0,
    countAboveWindow: 0,
    countBelowWindow: 0,
    numAdvisory: 0,
    numCaution: 0,
    numWarning: 0,
    numSafeOp: 0
  });

  /** @inheritdoc */
  public onAfterRender(): void {
    this.newMessages.sub(this.onMessagesChanged.bind(this));
    this.ackedMessages.sub(this.onMessagesChanged.bind(this));

    this.casLegacyAdapater.start();

    this.props.bus.getSubscriber<CasStateEvents>().on('cas_master_caution_active').handle(this.onCautionActive.bind(this));
    this.props.bus.getSubscriber<CasStateEvents>().on('cas_master_warning_active').handle(this.onWarningActive.bind(this));
    this.props.bus.getSubscriber<G1000ControlEvents>().on('pfd_alert_push').handle(v => v && this.acknowledgeMessages());

    this.newMessageCounts.sub(this.onMessageCountsChanged.bind(this));
  }

  /**
   * Handles when unacknowledged message counts have changed.
   * @param counts The message counts.
   */
  private onMessageCountsChanged(counts: Readonly<CASAlertCounts>): void {
    let level = G1000AlertsLevel.None;
    if (counts.numWarning > 0) {
      level = G1000AlertsLevel.Warning;
    } else if (counts.numCaution > 0) {
      level = G1000AlertsLevel.Caution;
    } else if (counts.numAdvisory > 0) {
      level = G1000AlertsLevel.Advisory;
    }

    this.props.bus.getPublisher<G1000CasEvents>().pub('cas_unacknowledged_alerts_level', level);
  }

  /**
   * Handles when the CAS messages are changed.
   */
  private onMessagesChanged(): void {
    if (this.newMessages.length > 0 && this.ackedMessages.length > 0) {
      this.dividerRef.instance.style.display = 'block';
    } else {
      this.dividerRef.instance.style.display = 'none';
    }

    if (this.newMessages.length === 0 && this.ackedMessages.length === 0) {
      this.divRef.instance.style.display = 'none';
    } else {
      this.divRef.instance.style.display = 'block';
    }
  }

  /**
   * Orders CAS messages as required.
   * @param a The first CAS message to compare.
   * @param b The second CAS message to compare.
   * @returns Negative if b is before a, zero if equal, positive otherwise.
   */
  private orderMessages(a: CasActiveMessage, b: CasActiveMessage): number {
    return a.priority === b.priority ? b.lastActive - a.lastActive : a.priority - b.priority;
  }

  /**
   * Acknowledges CAS messages.
   */
  private acknowledgeMessages(): void {
    SimVar.SetSimVarValue('K:MASTER_CAUTION_ACKNOWLEDGE', 'number', 1);
    SimVar.SetSimVarValue('K:MASTER_WARNING_ACKNOWLEDGE', 'number', 1);

    const publisher = this.props.bus.getPublisher<CasEvents>();
    //Do this on the next frame since the K events will be cached until the end of the frame
    //This avoids these being ack'd on this frame and the others the next frame
    setTimeout(() => {
      publisher.pub('cas_master_acknowledge', AnnunciationType.Advisory, true);
      publisher.pub('cas_master_acknowledge', AnnunciationType.SafeOp, true);
    });
  }

  /**
   * Handles when the CAS master caution active state changes.
   * @param isActive True if master caution is active, false otherwise.
   */
  private onCautionActive(isActive: boolean): void {
    if (this.props.cautionSoundId !== undefined && isActive) {
      this.soundController.playSound(this.props.cautionSoundId);
    }
  }

  /**
   * Handles when the CAS master warning active state changes.
   * @param isActive True if master warning is active, false otherwise.
   */
  private onWarningActive(isActive: boolean): void {
    if (this.props.warningSoundId !== undefined) {
      if (isActive) {
        this.soundController.play({ key: this.props.warningSoundId, sequence: this.props.warningSoundId, continuous: true });
      } else {
        this.soundController.stop(this.props.warningSoundId);
      }
    }
  }

  /**
   * Render the CAS.
   * @returns A VNode.
   */
  public render(): VNode {
    return (
      <div class="annunciations Annunciations" data-checklist='Annunciations' ref={this.divRef}>
        <CASDisplay bus={this.props.bus} annunciations={this.newMessages} numAnnunciationsShown={32} alertCounts={this.newMessageCounts} />
        <div class="annunciations-divider" ref={this.dividerRef} />
        <CASDisplay bus={this.props.bus} annunciations={this.ackedMessages} numAnnunciationsShown={32} />
      </div>)
      ;
  }
}