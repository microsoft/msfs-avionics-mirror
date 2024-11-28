import { DisplayComponent, FSComponent, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import './PageIndicator.css';

/**
 * A component that displays the page group and pager indicator.
 */
export class PageIndicator extends DisplayComponent<any> {
  private readonly pagerBoxes: SVGElement[] = [];
  private readonly pager = FSComponent.createRef<HTMLElement>();

  private readonly label = Subject.create<string>('');


  /**
   * Sets the page group data on the page indicator.
   * @param label The label for the page group.
   * @param pages The number of pages in the group.
   */
  setGroupData(label: string, pages: number): void {
    this.pager.instance.innerText = '';
    this.pagerBoxes.length = 0;

    for (let i = 0; i < pages; i++) {
      this.pagerBoxes.push(this.renderPagerBox().instance);
    }

    this.label.set(label);
  }

  /**
   * Sets the current page number.
   * @param index The current page number.
   */
  setPage(index: number): void {
    for (let i = 0; i < this.pagerBoxes.length; i++) {
      if (i === index) {
        this.pagerBoxes[i].classList.add('active');
      } else {
        this.pagerBoxes[i].classList.remove('active');
      }
    }
  }

  /**
   * Renders a pager box for the indicator.
   * @returns A pager box reference.
   */
  private renderPagerBox(): NodeReference<SVGElement> {
    const ref = FSComponent.createRef<SVGElement>();
    FSComponent.render(
      <svg class='pager-box' viewBox='0 0 6 12' width='6' height='12' ref={ref}>
        <rect x='0' y='0' width='6' height='12' />
      </svg>,
      this.pager.instance);

    return ref;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page-indicator'>
        <div class='page-label'>{this.label}</div>
        <div class='pager' ref={this.pager} />
      </div>
    );
  }
}