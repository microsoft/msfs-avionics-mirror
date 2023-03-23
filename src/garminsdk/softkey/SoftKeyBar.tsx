import { DisplayComponent, FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';
import { SoftKey } from './SoftKey';
import { SoftKeyMenu, SoftKeyMenuItem } from './SoftKeyMenu';
import { SoftKeyMenuSystem } from './SoftKeyMenuSystem';

/**
 * Component props for SoftKeyBar.
 */
export interface SoftKeyBarProps {
  /** An instance of the softkey menu system. */
  menuSystem: SoftKeyMenuSystem;

  /**
   * The amount of time, in milliseconds, to display the softkey pressed animation after a softkey has been pressed.
   * Defaults to {@link SoftKey.DEFAULT_PRESSED_DURATION}.
   */
  pressedDuration?: number;
}

/**
 * A Garmin softkey bar display. Each softkey bar has 12 softkey tabs. The behavior and display of each softkey tab is
 * defined by the current softkey menu of the display's softkey menu system.
 */
export class SoftKeyBar extends DisplayComponent<SoftKeyBarProps> {

  private readonly softkeyRefs = Array.from({ length: SoftKeyMenu.SOFTKEY_COUNT }, () => FSComponent.createRef<SoftKey>());

  private readonly menuItems = Array.from({ length: SoftKeyMenu.SOFTKEY_COUNT }, () => Subject.create<SoftKeyMenuItem | null>(null));

  private menuSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.menuSub = this.props.menuSystem.currentMenu.sub(menu => {
      this.menuItems.forEach((menuItem, index) => {
        menuItem.set(menu?.getItem(index) ?? null);
      });
    }, true);
  }

  /**
   * Renders the component.
   * @returns The rendered component.
   */
  public render(): VNode {
    return (
      <div class='softkey-container' data-checklist='SoftKeys'>
        {this.buildSoftKeys()}
      </div>
    );
  }

  /**
   * Builds the softkeys tab elements.
   * @returns A collection of soft key div elements.
   */
  private buildSoftKeys(): VNode[] {
    return Array.from({ length: SoftKeyMenu.SOFTKEY_COUNT }, (value, index): VNode => {
      return (
        <SoftKey
          ref={this.softkeyRefs[index]}
          menuItem={this.menuItems[index]}
          pressedDuration={this.props.pressedDuration}
          class={`softkey-${index}`}
        />
      );
    });
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.softkeyRefs.forEach(softkey => softkey.getOrDefault()?.destroy());

    this.menuSub?.destroy();
  }
}
