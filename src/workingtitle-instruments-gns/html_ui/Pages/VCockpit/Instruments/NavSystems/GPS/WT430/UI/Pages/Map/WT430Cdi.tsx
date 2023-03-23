import { ArcCdi } from '../../../../Shared/UI/Pages/Map/ArcCdi';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import './WT430Cdi.css';

/**
 * WT430 CDI
 */
export class WT430Cdi extends ArcCdi {
  protected cdiWidth = 252;

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='arc-cdi-wt430'>
        <svg width='261px' height='38px' xmlns="http://www.w3.org/2000/svg">
          <rect x='0px' y='0px' width='261px' height='38px' stroke='cyan' stroke-width='2px' />

          <rect x='12px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='35px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='58px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='81px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='104px' y='17.5px' width='5px' height='5px' fill='cyan' />

          <rect x='152px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='175px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='198px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='221px' y='17.5px' width='5px' height='5px' fill='cyan' />
          <rect x='244px' y='17.5px' width='5px' height='5px' fill='cyan' />

          <path d='M 119 14 l 12 -10 l 12 10 z' fill='#0f0' ref={this.toFlag} />
          <path d='M 119 23 l 12 10 l 12 -10 z' fill='#0f0' ref={this.fromFlag} />
          <path d='M 22 18 l -4 0 l 0 -4 l -12 6 l 12 6 l 0 -4 l 4 0 z' fill='#0f0' ref={this.leftArrow} />
          <path d='M 238 18 l 4 0 l 0 -4 l 12 6 l -12 6 l 0 -4 l -4 0 z' fill='#0f0' ref={this.rightArrow} />

          <rect ref={this.needle} x='5px' y='2px' width='6px' height='34px' stroke='#0f0' stroke-width='2px' fill='transparent' />
        </svg>
        <div class='arc-cdi-xtk-label-left' ref={this.xtkLabelLeft}>{this.xtkLabel}</div>
        <div class='arc-cdi-xtk-label-right' ref={this.xtkLabelRight}>{this.xtkLabel}</div>
      </div>
    );
  }
}