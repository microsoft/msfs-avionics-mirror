import { DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './TCASRing.css';

/** The properties for the TCAS Ring component. */
interface TCASRingProps {
  /** Whether or not to show the TCAS ring. */
  isHidden: Subscribable<boolean>;
  /** The map scale in pixels/NM. */
  mapScale: Subscribable<number>;
}

/** The TCAS Ring component. */
export class TCASRing extends DisplayComponent<TCASRingProps> {

  /** The radius of the TCAS ring. [NM] */
  private readonly tcasRingRadiusNm = 2;
  /** The number of TCAS ring dots. */
  private readonly tcasRingDotNumber = 12;
  /** The dot transform array */
  private dotTransforms: Subject<string>[] = [];

  /** The radius of the TCAS ring. [SVG coordinates] */
  private readonly tcasRingRadiusSvg = this.props.mapScale.map((mapScale) => mapScale * this.tcasRingRadiusNm);

  /**
   * Renders the TCAS ring dots.
   * @returns The array of TCAS dots.
   */
  private renderDots(): VNode[] {
    const dots: VNode[] = [];
    for (let i = 0; i < this.tcasRingDotNumber; i++) {
      this.dotTransforms.push(Subject.create('translate(0 0)'));
      dots.push(<circle cx={0} cy={0} r={2} transform={this.dotTransforms[i]} />);
    }
    return dots;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    // Update dot ring radius
    const radiusSub = this.tcasRingRadiusSvg.sub(radius => {
      if (radius !== null) {
        for (let i = 0; i < this.dotTransforms.length; i++) {
          const angle = i * ((2 * Math.PI) / this.tcasRingDotNumber);
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          const transform = 'translate(' + x + ' ' + y + ')';
          this.dotTransforms[i].set(transform);
        }
      }
    });

    this.props.isHidden.sub((isHidden) => {
      if (isHidden) {
        radiusSub.pause();
      } else {
        radiusSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'tcas-ring': true,
        hidden: this.props.isHidden,
      }}>
        <svg width={1} height={1} viewBox={'0 0 1 1'}>
          {this.renderDots()}
        </svg>
      </div>
    );
  }
}
