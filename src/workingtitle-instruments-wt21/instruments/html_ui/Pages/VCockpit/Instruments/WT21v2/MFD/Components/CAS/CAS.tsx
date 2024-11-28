import {
  Annunciation, AnnunciationType, ComponentProps, CompositeLogicXMLHost, DisplayComponent, EventBus, FSComponent, KeyEventData, KeyEventManager, KeyEvents,
  NodeReference, SoundServerController, VNode, XMLAnnunciationFactory
} from '@microsoft/msfs-sdk';

import './CAS.css';

/** The properties for the Crew Alerting System component. */
export interface CASProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
  /** The xml host.  */
  logicHandler: CompositeLogicXMLHost;
  /** The instrument.  */
  instrument: BaseInstrument;
}

/** The CAS component. */
export class CAS extends DisplayComponent<CASProps> {
  private static readonly WARNING_PUSH_EVENT = 'MASTER_WARNING_ACKNOWLEDGE';
  private static readonly CAUTION_PUSH_EVENT = 'MASTER_CAUTION_ACKNOWLEDGE';

  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly soundController = new SoundServerController(this.props.bus);

  private readonly annunciationFactory: XMLAnnunciationFactory;
  private readonly annunciations: Annunciation[];

  private readonly activeAnnunciations: Map<Annunciation, NodeReference<CASAnnunciation>> = new Map();

  private readonly sndWarning = 'WT_tone_warning';
  private readonly sndCaution = 'WT_tone_caution';

  /**
   * Ctor
   * @param props The properties for the component.
   */
  constructor(props: CASProps) {
    super(props);
    this.annunciationFactory = new XMLAnnunciationFactory(this.props.instrument);
    this.annunciations = this.annunciationFactory.parseConfig(this.props.instrument.xmlConfig);

    KeyEventManager.getManager(props.bus).then(manager => {
      manager.interceptKey(CAS.WARNING_PUSH_EVENT, true);
      manager.interceptKey(CAS.CAUTION_PUSH_EVENT, true);

      const subscriber = this.props.bus.getSubscriber<KeyEvents>();
      subscriber.on('key_intercept').handle((keyData: KeyEventData) => {
        if (keyData.key === CAS.WARNING_PUSH_EVENT || keyData.key === CAS.CAUTION_PUSH_EVENT) {
          const ackEvent = (keyData.key === CAS.WARNING_PUSH_EVENT) ? AnnunciationType.Warning : AnnunciationType.Caution;
          this.activeAnnunciations.forEach((nodeRef, annunciation) => {
            if (annunciation.type === ackEvent) {
              nodeRef.instance.acknowledge();
            }
          });
          this.syncWarningCautionVars();
        }
      });
    });
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.annunciations.forEach(annunciation => {
      this.addAnnunciationLogic(annunciation);
    });
  }

  /**
   * Adds the logic for an annunciation to the logic host.
   * @param annunciation The annunciation to add.
   */
  private addAnnunciationLogic(annunciation: Annunciation): void {
    this.props.logicHandler.addLogicAsNumber(annunciation.condition, (state: number) => {
      if (state === 1) {
        this.addAnnunciation(annunciation);
      } else {
        this.removeAnnunciation(annunciation);
      }

      this.rerenderNodes();
      this.syncWarningCautionVars();
    }, 0);
  }

  /**
   * Rerenders the annunciations in order.
   */
  private rerenderNodes(): void {
    const sortFn = (a: NodeReference<CASAnnunciation>, b: NodeReference<CASAnnunciation>): number => {
      if (a.instance.props.annunciation.type < b.instance.props.annunciation.type) {
        return -1;
      } else if (a.instance.props.annunciation.type > b.instance.props.annunciation.type) {
        return 1;
      }

      return a.instance.getTimeCreated() < b.instance.getTimeCreated() ? 1 : -1;
    };
    const orderedActiveAnnunciations = [...this.activeAnnunciations.values()].sort(sortFn);

    this.containerRef.instance.innerHTML = '';
    const fragment = document.createDocumentFragment();
    orderedActiveAnnunciations.forEach(nodeRef => {
      fragment.appendChild(nodeRef.instance.getDomNode());
    });
    this.containerRef.instance.appendChild(fragment);
  }

  /**
   * Syncs the warning/caution sim-vars.
   */
  private syncWarningCautionVars(): void {
    // sync master warning/caution buttons
    let activeWarning = false;
    let activeCaution = false;
    this.activeAnnunciations.forEach((nodeRef, annunciation) => {
      if (annunciation.type === AnnunciationType.Warning && !nodeRef.instance.isAcknowledged()) {
        activeWarning = true;
      } else if (annunciation.type === AnnunciationType.Caution && !nodeRef.instance.isAcknowledged()) {
        activeCaution = true;
      }
    });

    SimVar.SetSimVarValue('K:MASTER_CAUTION_SET', 'Bool', activeCaution);
    SimVar.SetSimVarValue('K:MASTER_WARNING_SET', 'Bool', activeWarning);
  }

  /**
   * Adds an annunciation to the component.
   * @param annunciation The annunciation to add.
   */
  private addAnnunciation(annunciation: Annunciation): void {
    const nodeRef = FSComponent.createRef<CASAnnunciation>();
    FSComponent.render(<CASAnnunciation annunciation={annunciation} ref={nodeRef} />, this.containerRef.instance);
    this.activeAnnunciations.set(annunciation, nodeRef);

    if (annunciation.type === AnnunciationType.Warning) {
      this.soundController.playSound(this.sndWarning);
    } else if (annunciation.type === AnnunciationType.Caution) {
      this.soundController.playSound(this.sndCaution);
    }
  }

  /**
   * Adds an annunciation to the component.
   * @param annunciation The annunciation to remove.
   */
  private removeAnnunciation(annunciation: Annunciation): void {
    const nodeRef = this.activeAnnunciations.get(annunciation);
    nodeRef?.instance.destroy();
    this.activeAnnunciations.delete(annunciation);
  }

  /** Shows and resumes this CAS display */
  public show(): void {
    this.props.logicHandler.setIsPaused(false);
    this.containerRef.instance.classList.toggle('hidden', false);
  }

  /** Hides and pauses this CAS display */
  public hide(): void {
    this.props.logicHandler.setIsPaused(true);
    this.containerRef.instance.classList.toggle('hidden', true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="cas-container" ref={this.containerRef}>
      </div>
    );
  }
}

/** The props for a single annunciation. */
interface AnnunciationProps extends ComponentProps {
  /** The annunciation to display. */
  annunciation: Annunciation,
}

/**
 * The CAS Annunciation component.
 */
export class CASAnnunciation extends DisplayComponent<AnnunciationProps> {
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly annunciationRef = FSComponent.createRef<HTMLDivElement>();

  private acknowledged = false;
  private timeCreated: Date;

  /** @inheritdoc */
  constructor(props: AnnunciationProps) {
    super(props);
    // remember time when annunciation was created
    this.timeCreated = new Date();
  }

  /**
   * Sets the acknowledged state on the annunciation.
   */
  public acknowledge(): void {
    this.acknowledged = true;
    this.annunciationRef.instance.classList.remove('cas-blink');
  }

  /**
   * Gets the acknowledged state on the annunciation.
   * @returns True if acknowledged, false otherwise.
   */
  public isAcknowledged(): boolean {
    return this.acknowledged;
  }

  /**
   * Gets the time when the annunciation was created.
   * @returns The time when the annunciation was created.
   */
  public getTimeCreated(): number {
    return this.timeCreated.getTime();
  }

  /**
   * Removes the node from the DOM.
   */
  public removeDomNode(): void {
    this.containerRef.instance.remove();
  }

  /**
   * Gets the DOM node of this annunciation.
   * @returns The DOM node.
   */
  public getDomNode(): HTMLDivElement {
    return this.containerRef.instance;
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();
    this.removeDomNode();
  }

  /**
   * Gets the CSS class for the annunciation based on the type.
   * @param type The type of annunciation.
   * @returns The CSS class for the annunciation.
   */
  private getAnnunciationStyle(type: AnnunciationType): string {
    switch (type) {
      case AnnunciationType.Warning:
        return 'cas-warning cas-blink';
      case AnnunciationType.Caution:
        return 'cas-caution cas-blink';
      default:
        return 'cas-advisory';
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="cas-annunciation" ref={this.containerRef}>
        <div ref={this.annunciationRef} class={this.getAnnunciationStyle(this.props.annunciation.type)}>{this.props.annunciation.text} {this.props.annunciation.suffix}</div>
      </div>
    );
  }
}