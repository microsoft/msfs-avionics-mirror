import { ComponentProps, DisplayComponent, FSComponent, Subscribable, Subscription, Vec2Math, Vec2Subject, VNode } from '@microsoft/msfs-sdk';

import { VerticalSpeedUtils } from './VerticalSpeedUtils';

import './VerticalSpeedPointer.css';

/** The VSI props. */
export interface VerticalSpeedPointerProps extends ComponentProps {
  /** Vertical speed in feet/minute, or null if invalid. */
  verticalSpeed: Subscribable<number | null>,
}

/** The VSI pointer. */
export class VerticalSpeedPointer extends DisplayComponent<VerticalSpeedPointerProps> {
  private readonly vsTranslate = Vec2Subject.create(Vec2Math.create());

  private verticalSpeedSub?: Subscription;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.verticalSpeedSub = this.props.verticalSpeed.sub((vs) => {
      if (vs === null) {
        return;
      }

      const angle = VerticalSpeedUtils.calculateAngle(vs, 4500);

      const cosAngle = Math.cos(angle);
      this.vsTranslate.set(-104 * (1 - cosAngle) / cosAngle, angle);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="vertical-speed-pointer">
      <svg
        class="vertical-speed-needle"
        style={{
          'transform-origin': '104px 50%',
          'transform': this.vsTranslate.map((v) => `rotate3d(0,0,1,${v[1]}rad) translateX(${v[0]}px)`),
          'width': '84px',
          'height': '6px',
          'display': this.props.verticalSpeed.map((v) => v === null ? 'none' : 'block')
        }}
        viewBox="0 -3 84 6"
      >
        <line class="shadow" x1={1.5} x2={60} y1={0} y2={1} />
        <line class="shadow" x1={1.5} x2={60} y1={0} y2={-1} />
        <line x1={2} x2={60} y1={0} y2={1} />
        <line x1={2} x2={60} y1={0} y2={-1} />
      </svg>
      <div class="bar-bound"
        style={{
          'top': this.props.verticalSpeed.map((v) => v !== null && v > 0 ? '0' : '130px')
        }}>
        <div class="bar" style={{
          'transform': this.vsTranslate.map((v) => `rotate3d(0,0,1,${v[1]}rad)`),
          'top': this.props.verticalSpeed.map((v) => v !== null && v > 0 ? '130px' : '-100px'),
          'transform-origin': this.props.verticalSpeed.map((v) => v !== null && v > 0 ? '150px 0' : '150px 100px')
        }}>
          <div class="bar-border" style={{
            'top': this.props.verticalSpeed.map((v) => v !== null && v > 0 ? '-130px' : '100px'),
            'transform': this.vsTranslate.map((v) => `rotate(${v[1] * -1}rad)`),
            'transform-origin': this.props.verticalSpeed.map((v) => v !== null && v > 0 ? '100px 130px' : '100px 0')
          }}></div>
        </div>
      </div>
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.verticalSpeedSub?.destroy();
  }
}
