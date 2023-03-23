import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './GNSScrollBar.css';

/**
 * A component that renders a GNS list scrollbar.
 */
export class GNSScrollBar extends DisplayComponent<any> {
  private readonly topArrow = FSComponent.createRef<SVGPathElement>();
  private readonly bottomArrow = FSComponent.createRef<SVGPathElement>();

  private readonly outerBar = FSComponent.createRef<SVGPathElement>();
  private readonly innerBar = FSComponent.createRef<SVGPathElement>();

  private readonly svg = FSComponent.createRef<SVGAElement>();
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly scrollContainer = FSComponent.createRef<HTMLElement>();

  private readonly barMargin = 5;

  private currentScrollHeight = 0;
  private sizeChangeTimer?: number;

  /** @inheritdoc */
  public onAfterRender(): void {
    const scrollContainer = this.el.instance.previousElementSibling;
    if (scrollContainer !== null) {
      this.scrollContainer.instance = scrollContainer as HTMLElement;
      this.scrollContainer.instance.addEventListener('scroll', this.onScroll);
    }

    const diffAndAdjust = (): void => {
      if (this.currentScrollHeight !== this.scrollContainer.instance.scrollHeight) {
        this.redraw(true);
      }
    };

    this.sizeChangeTimer = window.setInterval(diffAndAdjust, 150);
  }

  /**
   * Handles when the scrollcontainer is scrolled.
   */
  public onScroll = (): void => {
    this.redraw(false);
  };

  /**
   * Redraws the SVG components as necessary.
   * @param resetHeight If true, will reset the heights of the scrollbar components.
   */
  private redraw(resetHeight: boolean): void {
    const height = this.scrollContainer.instance.scrollHeight;
    const clientHeight = this.scrollContainer.instance.clientHeight;
    const top = this.scrollContainer.instance.scrollTop;
    const bottom = top + clientHeight;

    if (top === 0) {
      this.topArrow.instance.classList.add('hide-element');
    } else {
      this.topArrow.instance.classList.remove('hide-element');
    }

    if (bottom === height) {
      this.bottomArrow.instance.classList.add('hide-element');
    } else {
      this.bottomArrow.instance.classList.remove('hide-element');
    }

    //Need two pixels of slop here because Coherent is not precise about scrollHeights sometimes
    if (Math.abs(height - clientHeight) <= 2) {
      this.el.instance.classList.add('hide-element');
    } else {
      this.el.instance.classList.remove('hide-element');
    }

    if (resetHeight) {
      this.el.instance.style.height = `${clientHeight}px`;
      this.svg.instance.setAttribute('height', `${clientHeight}px`);
    }

    const barHeight = clientHeight - (this.barMargin * 2);
    const visibleAreaRatio = clientHeight / height;
    const scrollTopPercentage = top / height;

    this.innerBar.instance.setAttribute('transform', `translate(0,${barHeight * scrollTopPercentage})`);

    if (resetHeight) {
      this.outerBar.instance.setAttribute('d', `M 0 5 l 4 0 l 0 ${barHeight} l -4 0 z`);
      this.innerBar.instance.setAttribute('d', `M 0 5 l 4 0 l 0 ${barHeight * visibleAreaRatio} l -4 0 z`);
      this.bottomArrow.instance.setAttribute('transform', `translate(0, ${clientHeight - 2})`);

      this.currentScrollHeight = height;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='scroll-bar' ref={this.el}>
        <svg ref={this.svg} width='4px'>
          <path d='M 2 0 L 0 2 L 4 2 Z' ref={this.topArrow} class='scroll-bar-arrow' />
          <path d='M 2 2 L 0 0 L 4 0 Z' ref={this.bottomArrow} transform='translate(0,8)' class='scroll-bar-arrow' />
          <path d='M 0 5 l 4 0 l 0 4 l -4 0 z' ref={this.outerBar} class='scroll-bar-bar' />
          <path d='M 0 5 l 4 0 l 0 4 l -4 0 z' ref={this.innerBar} class='scroll-bar-bar filled' />
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.scrollContainer.getOrDefault() !== null) {
      this.scrollContainer.instance.removeEventListener('scroll', this.onScroll);
    }

    if (this.sizeChangeTimer !== undefined) {
      clearInterval(this.sizeChangeTimer);
    }
  }
}