import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/** A startup screen for an Epic 2 display (amber cross) */
export class Epic2StartupDisplayComponent extends DisplayComponent<ComponentProps> {
  private readonly isVisible = Subject.create(false);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.isVisible.map((visible) => visible ? '' : 'hidden')}>
        <svg viewBox="0 0 1024 768">
          <path d="M0 0 L1024 768" stroke="var(--epic2-color-red)" stroke-width="15" />
          <path d="M1024 0 L0 768" stroke="var(--epic2-color-red)" stroke-width="15" />
        </svg>
      </div>
    );
  }

  /**
   * Sets the visibility of the boot startup screen
   * @param visible Whether it should be visible
   */
  public setVisibility(visible: boolean): void {
    this.isVisible.set(visible);
  }
}
