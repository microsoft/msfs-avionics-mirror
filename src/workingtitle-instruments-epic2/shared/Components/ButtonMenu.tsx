import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { TouchButton } from './TouchButton';

import './ButtonMenu.css';

/**
 * @inheritDoc
 */
interface ButtonMenuProps extends ComponentProps {
  /**
   * Position menu will appear from
   */
  position: 'right' | 'left' | 'right-down' | 'left-down' | 'bottom' | 'bottom-offset';
  /**
   * Button to appear on the menu
   */
  buttons: TouchButton[];
  /**
   * CSS class to apply to the root element.
   */
  class?: string | SubscribableSet<string>;
  /**
   * CSS class to apply to the button menu root element.
   */
  menuClass?: string | SubscribableSet<string>;
  /**
   * Whether the button is enabled, or a subscribable which provides it. Disabled buttons cannot be touched, primed,
   * pressed, or held. Defaults to `true`.
   */
  isEnabled?: boolean | Subscribable<boolean>;
  /**
   * The maximum number of buttons that can be displayed before it moves onto a new column
   */
  maxButtonsPerColumn?: number
}
/**
 * Button menu
 */
export class ButtonMenu extends DisplayComponent<ButtonMenuProps> {
  private static readonly RESERVED_CSS_CLASSES = new Set([
    'button-menu-container',
    'button-menu-open',
    'button-menu-position-bottom',
    'button-menu-position-bottom-offset',
    'button-menu-position-right',
    'button-menu-position-left',
    'button-menu-position-right-down',
    'button-menu-position-left-down',
    'button-menu-disabled',
  ]);

  private readonly isOpen = Subject.create<boolean>(false);
  private readonly menuLevel = Subject.create<number>(0);

  private readonly cssClassSet = SetSubject.create(['button-menu-container']);
  private readonly menuClasses = SetSubject.create(['button-menu-buttons']);

  public readonly menuContainerElement = FSComponent.createRef<HTMLElement>();
  // public readonly menuButtonsElement = FSComponent.createRef<HTMLElement>();

  private readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true);

  private cssClassSub?: Subscription;
  private cssMenuClassSub?: Subscription;

  /**
   * Toggles the menu
   */
  private readonly toggleMenu = (): void => {
    this.isOpen.set(!this.isOpen.get());
    this.cssClassSet.toggle('button-menu-open');
  };

  /**
   * Close the menu
   */
  private closeMenu(): void {
    this.isOpen.set(false);
    this.cssClassSet.delete('button-menu-open');
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.cssClassSet.add(`button-menu-position-${this.props.position}`);
    /** click event for the menu overlay on top of the trigger button **/
    this.menuContainerElement.instance.addEventListener('click', this.toggleMenu);
    window.addEventListener('mouseup', this.handleMouseUp);

    this.isEnabled.sub(isEnabled => {
      if (isEnabled) {
        this.cssClassSet.delete('button-menu-disabled');
      } else {
        this.cssClassSet.add('button-menu-disabled');
      }
    }, true);

    const count = this.countAncestorsWithClass(this.menuContainerElement.instance, 'button-menu-container');
    this.menuLevel.set(count);
  }

  /**
   * Count the number of ancestors with a specific class.
   * @param node HTMLElement
   * @param className className to search for
   * @returns The count of ancestors with the specified class.
   */
  public countAncestorsWithClass(node: HTMLElement | null, className: string): number {
    let count = 0;

    while (node && node !== document.body) {
      if (node.classList.contains(className)) {
        count++;
      }

      node = node.parentElement;
    }

    return count;
  }

  /**
   * Global event handler to close any open menus
   * @param e MouseEvent
   */
  public readonly handleMouseUp = (e: MouseEvent): void => {
    const currentElement = e.target as HTMLElement;
    const menuContainer = currentElement.closest('.button-click-container') as HTMLElement;
    if (this.isOpen.get() && !menuContainer) {
      const closestTouchButton = currentElement.closest('.touch-button');
      const noCheckBox = closestTouchButton && !closestTouchButton?.querySelector('.checkbox-container');
      const noRadio = closestTouchButton && !closestTouchButton?.querySelector('.radio-button-container');
      if (noCheckBox && noRadio) {
        this.closeMenu();
      }
    }
    if (menuContainer) {
      const menuContainerLevel = Number(menuContainer.dataset['menuLevel']);
      const isClickedMenu = menuContainer == this.menuContainerElement.instance;

      /** Close open menus at the same level or higher **/
      if (!isClickedMenu && this.menuLevel.get() === menuContainerLevel || !isClickedMenu && this.menuLevel.get() > menuContainerLevel) {
        this.closeMenu();
      }
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = ButtonMenu.RESERVED_CSS_CLASSES;

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    if (typeof this.props.menuClass === 'object') {
      this.cssMenuClassSub = FSComponent.bindCssClassSet(this.menuClasses, this.props.menuClass, reservedClasses);
    } else if (this.props.menuClass !== undefined && this.props.menuClass.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.menuClass, cssClass => !reservedClasses.has(cssClass))) {
        this.menuClasses.add(cssClassToAdd);
      }
    }

    const menus = [];
    for (let i = 0; i < this.props.buttons.length; i += this.props.maxButtonsPerColumn ?? Infinity) {
      const buttonSlice = this.props.buttons.slice(i, i + (this.props.maxButtonsPerColumn ?? Infinity));

      menus.push(<div class={this.menuClasses} style={`left: ${i * 100 / (this.props.maxButtonsPerColumn ?? Infinity)}%`} /*ref={this.menuButtonsElement}*/>{buttonSlice}</div>);
    }

    return (
      <div class={this.cssClassSet}>
        <div class={'button-click-container'} ref={this.menuContainerElement} data-menu-level={this.menuLevel}>{this.props.children}</div>
        {menus}
      </div>
    );
  }

  /** @inheritdoc */
  public onDestroy(): void {
    this.menuContainerElement.instance.removeEventListener('click', this.toggleMenu);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.cssClassSub?.destroy();
    this.cssMenuClassSub?.destroy();
  }
}
