import {
  BitFlags, EventBus, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, ObjectSubject, Subject, Subscribable,
  SubscribableMapFunctions, Subscription, VNode
} from 'msfssdk';

/**
 * Component props for ArtificialHorizon.
 */
export interface ArtificalHorizonProps extends HorizonLayerProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** Whether to show the artificial horizon. */
  show: Subscribable<boolean>;
}

/**
 * A PFD artificial horizon. Displays a horizon line, and sky and ground boxes.
 */
export class ArtificialHorizon extends HorizonLayer<ArtificalHorizonProps> {
  private readonly style = ObjectSubject.create({
    display: '',
    transform: 'translate3d(0, 0, 0)'
  });

  private readonly pitchTranslation = Subject.create(0);
  private readonly roll = Subject.create(0);

  private needUpdate = false;

  private showSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.style.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    const transformHandler = (): void => {
      this.style.set('transform', `rotate(${-this.roll.get()}deg) translate3d(0px, ${this.pitchTranslation.get()}px, 0px)`);
    };

    this.pitchTranslation.map(SubscribableMapFunctions.withPrecision(0.1)).sub(transformHandler);
    this.roll.map(SubscribableMapFunctions.withPrecision(0.1)).sub(transformHandler);

    this.showSub = this.props.show.sub(show => { this.setVisible(show); }, true);
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(
      changeFlags,
      HorizonProjectionChangeType.ScaleFactor
      | HorizonProjectionChangeType.Fov
      | HorizonProjectionChangeType.Pitch
      | HorizonProjectionChangeType.Roll
    )) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const pitchResolution = this.props.projection.getScaleFactor() / this.props.projection.getFov();
    const pitch = this.props.projection.getPitch();
    const roll = this.props.projection.getRoll();

    this.pitchTranslation.set(pitch * pitchResolution);
    this.roll.set(roll);
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='artificial-horizon' style={this.style}>
        <div class='artificial-horizon-sky'></div>
        <div class='artificial-horizon-horizon'></div>
        <div class='artificial-horizon-ground'></div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
  }
}