import { ArcCdi } from '../../../../Shared/UI/Pages/Map/ArcCdi';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import './WT530Cdi.css';

/**
 * WT5330 CDI
 */
export class WT530Cdi extends ArcCdi {
  protected cdiWidth = 134;

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='arc-cdi-wt530'>
        <svg width='144px' height='24px' xmlns="http://www.w3.org/2000/svg">
          <rect x='0px' y='0px' width='144px' height='24px' stroke='cyan' stroke-width='2px' />
          <rect x='18px' y='10px' width='4px' height='4px' fill='cyan' />
          <rect x='44px' y='10px' width='4px' height='4px' fill='cyan' />
          <rect x='96px' y='10px' width='4px' height='4px' fill='cyan' />
          <rect x='122px' y='10px' width='4px' height='4px' fill='cyan' />
          <path d='M 60 14 l 12 -10 l 12 10 z' fill='#0f0' ref={this.toFlag} />
          <path d='M 60 10 l 12 10 l 12 -10 z' fill='#0f0' ref={this.fromFlag} />
          <path d='M 122 10 l 4 0 l 0 -4 l 12 6 l -12 6 l 0 -4 l -4 0 z' fill='#0f0' ref={this.rightArrow} />
          <path d='M 22 10 l -4 0 l 0 -4 l -12 6 l 12 6 l 0 -4 l 4 0 z' fill='#0f0' ref={this.leftArrow} />

          <rect ref={this.needle} x='5px' y='2px' width='6px' height='20px' stroke='#0f0' stroke-width='2px' fill='transparent' />
        </svg>
        <div class='arc-cdi-xtk-label-left' ref={this.xtkLabelLeft}>{this.xtkLabel}</div>
        <div class='arc-cdi-xtk-label-right' ref={this.xtkLabelRight}>{this.xtkLabel}</div>
      </div>
    );
  }
}