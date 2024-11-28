import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { G3XHorizontalPointer } from '../../Horizontal/Elements/G3XHorizontalPointer';

/** A single-value pointer. */
export class G3XVerticalPointer extends G3XHorizontalPointer {

  /** @inheritDoc */
  protected updatePosition(value: number): void {
    this.pointerRef.instance.style.transform = `translate3d(0px, calc(${100 - value}% - 9px), 0px)`;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class='gauge_pointer'
        ref={this.pointerRef}
      >
        <svg
          viewBox={'0 0 28 28'}
          width={'18px'}
          height={'18px'}
          fill={this.fillSubject}
        >
          {this.props.showAsPeak ? (
            <path
              d='M0 2 L3 0 L28 12 L28 16 L3 28 L0 26 L0 2 M4 6 L4 6 L4 22 L22 14'
              fill-rule='nonzero'
              fill='var(--g3x-color-cyan)'
              transform={`rotate(${this.props.index == 0 ? 0 : 180}) translate(${this.props.index === 0 ? 0 : -28}, ${this.props.index === 0 ? 0 : -28})`}
              stroke='var(--g3x-color-black)'
              stroke-width='0.25'
            />
          ) : (
            <>
              <path
                d='M0 2 L3 0 L28 12 L28 16 L3 28 L0 26 L0 2'
                fill='var(--g3x-color-white)'
                stroke='var(--g3x-color-black)'
                stroke-width='0.25'
                transform={`rotate(${this.props.index == 0 ? 0 : 180}) translate(${this.props.index === 0 ? 0 : -28}, ${this.props.index === 0 ? 0 : -28})`}
              />
              <text
                text-anchor='middle'
                fill='var(--g3x-color-black)'
                x={this.props.index === 0 ? '10px' : '20px'}
                y='21px'
                font-size='18px'
              >
                {this.props.label}
              </text>
            </>
          )}
        </svg>
      </div>
    );
  }
}