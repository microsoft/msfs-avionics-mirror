import { AnnunciationType, CasActiveMessage, CasSystem, ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { DefaultCasInhibitStateDataProvider } from '@microsoft/msfs-epic2-shared';

import { CasDisplayController, scrolledOffCounter } from './CasDisplayController';
import { CasInhibitsController } from './CasInhibitsController';

import './CAS.css';

/** The properties for the Crew Alerting System component. */
export interface CASProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** An instance of the instrument's CAS system. */
  readonly casSystem: CasSystem;
  /** The inhibit state data provider */
  readonly inhibitStateProvider: DefaultCasInhibitStateDataProvider;
}

/** The CAS component. */
export class CAS extends DisplayComponent<CASProps> {
  private alertRefs = [...Array(CasDisplayController.MAX_VISIBLE_ROWS).keys()].map(() => FSComponent.createRef<HTMLDivElement>());
  private readonly casDisplayController: CasDisplayController;
  private readonly casInhibitsController: CasInhibitsController;

  /** @inheritdoc */
  constructor(props: CASProps) {
    super(props);
    this.casDisplayController = new CasDisplayController(props.bus, props.casSystem);
    this.casInhibitsController = new CasInhibitsController(props.bus, props.inhibitStateProvider);
  }

  /**
   * Gets the CSS class for the annunciation based on the type and acknowledge status.
   * @param message The message which was received from the CasSystem.
   * @returns The CSS class for the annunciation.
   */
  private getAnnunciationClass(message: CasActiveMessage): string {
    let className = message.acknowledged ? '' : 'unacknowledged';
    switch (message.priority) {
      case AnnunciationType.Warning:
        className += ' cas-warning';
        break;
      case AnnunciationType.Caution:
        className += ' cas-caution';
        break;
      case AnnunciationType.Advisory:
        className += ' cas-advisory';
        break;
      case AnnunciationType.SafeOp:
      default:
        className += ' cas-status';
        break;
    }
    return className;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.casDisplayController.displayedAnnunciations.sub((idx, type, displayedAnnunciations) => {
      if (Array.isArray(displayedAnnunciations)) {
        this.alertRefs.forEach((ref, i) => {
          if (displayedAnnunciations[i]) {
            ref.instance.textContent = displayedAnnunciations[i].message;
            ref.instance.className = this.getAnnunciationClass(displayedAnnunciations[i]);
          } else {
            ref.instance.textContent = '';
            ref.instance.className = '';
          }
        });
      }
    }, true);

    this.casInhibitsController.init();
  }

  /**
   * Renders scrolled off messages counter in the side panel
   * @param counterTuple Subject storing necessary information to display a counter box
   * @returns Node element displaying the counter with proper styling
   */
  private renderCounter(counterTuple: Subject<scrolledOffCounter>): VNode {
    const counterRef = FSComponent.createRef<HTMLSpanElement>();
    counterTuple.sub(([ack, unack, type]) => {
      if (!counterRef.instance) {
        return;
      }
      const className = `cas-counter cas-${type} ${unack > 0 ? 'unacknowledged' : ''} ${ack + unack === 0 ? 'visibility-hidden' : ''}`;
      counterRef.instance.className = className;
    });

    return <span ref={counterRef}>{counterTuple.map(([ack, unack]) => ack + unack)}</span>;
  }

  /**
   * Renders all counters
   * @returns container with counters
   */
  renderCounters(): VNode {
    const counters = [
      this.casDisplayController.aboveCaution,
      this.casDisplayController.aboveAdvisory,
      this.casDisplayController.aboveStatus,
      this.casDisplayController.belowCaution,
      this.casDisplayController.belowAdvisory,
      this.casDisplayController.belowStatus,
    ];
    return <div class='cas-scrolled-off-counters'>{counters.map((counter) => this.renderCounter(counter))}</div>;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="cas-container" data-checklist="checklist-cas">
        <span class={{ 'cas-title': true, 'hidden': this.casDisplayController.hasAnnunciations }}>CAS</span>

        <div class={{ 'cas-side-panel': true, 'hidden': this.casDisplayController.scrollDisabled }}>
          <div class="cas-scroll-icon cas-up">
            <svg class='cas-arrow-svg'>
              <polygon points='2,32 14,3 26,32' />
            </svg>
          </div>
          {this.renderCounters()}
          <div class="cas-scroll-icon cas-down">
            <svg class='cas-arrow-svg'>
              <polygon points='2,3 14,32 26,3' />
            </svg>
          </div>
        </div>

        <div class="cas-annunciations-container">
          {[...Array(CasDisplayController.MAX_VISIBLE_ROWS).keys()].map(i => <div class="cas-annunciation" ><div ref={this.alertRefs[i]} /></div>)}
        </div>
      </div>
    );
  }
}
