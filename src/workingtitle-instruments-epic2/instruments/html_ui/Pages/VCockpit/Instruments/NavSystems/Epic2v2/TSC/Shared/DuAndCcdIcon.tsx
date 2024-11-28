import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscription, VNode } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices, Epic2DuControlEvents } from '@microsoft/msfs-epic2-shared';

/** The properties for the {@link DuAndCcdIcon} component. */
interface DuAndCcdIconProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;

  /** The CSS style string applied to the <svg> tags. */
  readonly style?: string;
}

/** The DuAndCcdIcon component. */
export class DuAndCcdIcon extends DisplayComponent<DuAndCcdIconProps> {
  private readonly subscriber = this.props.bus.getSubscriber<Epic2DuControlEvents>();
  private readonly upperMfdRef = FSComponent.createRef<SVGRectElement>();
  private readonly copilotPfdRef = FSComponent.createRef<SVGRectElement>();
  private readonly lowerMfdRef = FSComponent.createRef<SVGRectElement>();
  private readonly pilotPfdRef = FSComponent.createRef<SVGRectElement>();

  private sub: Subscription | undefined;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.sub = this.subscriber.on('epic2_selected_display_unit').handle((du: DisplayUnitIndices) => {
      this.upperMfdRef.instance.style.fill = du === DisplayUnitIndices.MfdUpper ? '#00FCFD' : 'none';
      this.upperMfdRef.instance.style.stroke = du === DisplayUnitIndices.MfdUpper ? '#00FCFD' : 'white';
      this.lowerMfdRef.instance.style.fill = du === DisplayUnitIndices.MfdLower ? '#00FCFD' : 'none';
      this.lowerMfdRef.instance.style.stroke = du === DisplayUnitIndices.MfdLower ? '#00FCFD' : 'white';
      this.pilotPfdRef.instance.style.fill = du === DisplayUnitIndices.PfdLeft ? '#00FCFD' : 'none';
      this.pilotPfdRef.instance.style.stroke = du === DisplayUnitIndices.PfdLeft ? '#00FCFD' : 'white';
      this.copilotPfdRef.instance.style.fill = du === DisplayUnitIndices.PfdRight ? '#00FCFD' : 'none';
      this.copilotPfdRef.instance.style.stroke = du === DisplayUnitIndices.PfdRight ? '#00FCFD' : 'white';
    });
  }

  /** @inheritdoc */
  public destroy(): void {
    this.sub?.destroy();
    super.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="du-and-ccd-svg-container" style="display: flex; position: relative;">
        <svg
          width="148"
          height="71"
          viewBox="0 0 148 71"
          fill="none"
          style={this.props.style ?? 'position: absolute;'}
        >
          <rect
            x="2"
            y="2"
            width="38"
            height="26"
            stroke="white"
            stroke-width="4"
            ref={this.pilotPfdRef}
          />
        </svg>
        <svg
          width="148"
          height="71"
          viewBox="0 0 148 71"
          fill="none"
          style={this.props.style ?? 'position: absolute;'}
        >
          <rect
            x="108"
            y="2"
            width="38"
            height="26"
            stroke="white"
            stroke-width="4"
            ref={this.copilotPfdRef}
          />
        </svg>
        <svg
          width="148"
          height="71"
          viewBox="0 0 148 71"
          fill="none"
          style={this.props.style ?? 'position: absolute;'}
        >
          <rect
            x="55"
            y="2"
            width="38"
            height="26"
            fill="#00FCFD"
            stroke="#00FCFD"
            stroke-width="4"
            ref={this.upperMfdRef}
          />
        </svg>
        <svg
          width="148"
          height="71"
          viewBox="0 0 148 71"
          fill="none"
          style={this.props.style ?? 'position: absolute;'}
        >
          <rect
            x="55"
            y="43"
            width="38"
            height="26"
            stroke="white"
            stroke-width="4"
            ref={this.lowerMfdRef}
          />
        </svg>
      </div>
    );
  }
}
