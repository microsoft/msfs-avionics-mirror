import { ComponentProps, DisplayComponent, FSComponent, NodeReference, SetSubject, SubscribableSetEventType, Subscription, VNode } from '@microsoft/msfs-sdk';

import { MenuItem, SoftKeyMenu } from './SoftKeyMenu';

import './SoftKey.css';

/**
 * Soft key props
 */
interface SoftKeyProps extends ComponentProps {
  /** The menu item this softkey is bound to */
  menuItem: MenuItem
}

/**
 * A softkey tab in the soft key bar interface.
 */
export class SoftKey extends DisplayComponent<SoftKeyProps> {

  private menuItem = SoftKeyMenu.EmptyMenuItem;
  private readonly rootEl = new NodeReference<HTMLDivElement>();
  private readonly labelEl = new NodeReference<HTMLLabelElement>();
  private readonly indicatorEl = new NodeReference<HTMLDivElement>();
  private readonly valueEl = new NodeReference<HTMLSpanElement>();
  private readonly classList = SetSubject.create(['softkey-tab']);

  private readonly menuItemSubs: Subscription[] = [];

  /** @inheritdoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.setMenuItem(this.props.menuItem);
  }

  /**
   * Sets and binds a menu item to this soft key.
   * @param item the menu item
   */
  public setMenuItem(item: MenuItem): void {

    // remove former subs
    this.unsubscribeFromMenuItem(this.menuItem);

    this.menuItem = item;
    const value = item.value.get();

    this.menuItemValueChangedHandler(value);

    this.menuItemSubs.push(
      item.value.sub(this.menuItemValueChangedHandler, true),
      item.disabled.sub(this.setDisabled, true),
      item.pressed.on(this.setPressed),
      item.label.sub(this.setLabel, true),
      item.highlighted.sub(this.setHighlighted, true),
      item.additionalClasses.sub(this.setAdditionalClasses),
    );

    item.additionalClasses.get().forEach(v => this.classList.add(v));
  }

  /**
   * Unsubscribes from change events on the menu item.
   * @param item the menu item
   */
  private unsubscribeFromMenuItem(item: MenuItem): void {
    for (const sub of this.menuItemSubs) {
      sub.destroy();
    }
    this.menuItemSubs.length = 0;

    item.additionalClasses.get().forEach(v => this.classList.delete(v));
  }

  /**
   * Menu item value changed handler.
   * @param v the new value
   */
  private menuItemValueChangedHandler = (v: string | boolean | undefined): void => {
    if (typeof v === 'string') {
      this.showIndicator(false);
      this.indicate(false);

      this.valueEl.instance.style.display = '';
      this.valueEl.instance.textContent = v;

      this.labelEl.instance.classList.add('text-value');
    } else if (typeof v === 'boolean') {
      this.showIndicator(true);
      this.valueEl.instance.style.display = 'none';
      this.labelEl.instance.classList.remove('text-value');

      this.valueEl.instance.textContent = '';
      this.indicate(v as unknown as boolean);
    } else {
      this.showIndicator(false);

      this.valueEl.instance.textContent = '';
      this.valueEl.instance.style.display = 'none';
      this.labelEl.instance.classList.remove('text-value');
    }
  };

  /**
   * Shows or hides the active/inactive indicator.
   * @param isShown Whether or not the indicator is shown.
   */
  private showIndicator(isShown: boolean): void {
    if (isShown) {
      this.indicatorEl.instance.classList.add('shown');
    } else {
      this.indicatorEl.instance.classList.remove('shown');
    }
  }

  /**
   * Activates or inactivates the indicator.
   * @param isIndicating Whether or not the indicator is indicating.
   */
  private indicate(isIndicating: boolean): void {
    if (isIndicating) {
      if (this.menuItem.disabled.get() === true) {
        this.showIndicator(true);
        this.indicatorEl.instance.classList.add('indicating-dim');
        this.indicatorEl.instance.classList.remove('indicating');
      } else {
        this.showIndicator(true);
        this.indicatorEl.instance.classList.remove('indicating-dim');
        this.indicatorEl.instance.classList.add('indicating');
      }
    } else {
      this.indicatorEl.instance.classList.remove('indicating');
      this.indicatorEl.instance.classList.remove('indicating-dim');
    }
  }

  /**
   * Sets the css class to make the soft key look disabled.
   * @param isDisabled Whether or not the soft key is disabled.
   */
  private setDisabled = (isDisabled: boolean): void => {
    if (isDisabled) {
      this.rootEl.instance.classList.add('text-disabled');
    } else {
      this.rootEl.instance.classList.remove('text-disabled');
    }
  };

  /**
   * Sets the css class to make the soft key look pressed.
   */
  private setPressed = (): void => {
    this.rootEl.instance.classList.add('pressed');
    setTimeout(() => this.rootEl.instance.classList.remove('pressed'), 150);
  };

  /**
   * Sets the text of this soft key.
   * @param text the text
   */
  private setLabel = (text: string): void => {
    this.labelEl.instance.textContent = text;
  };

  /**
   * Sets whether or not the soft key is highlighted.
   * @param isHighlighted Whether or not the softkey is highlighted.
   */
  private setHighlighted = (isHighlighted: boolean): void => {
    if (isHighlighted) {
      this.classList.add('highlighted');
    } else {
      this.classList.delete('highlighted');
    }
  };

  /**
   * Sets additional classes on the soft key item.
   * @param set The full current set of additional classes.
   * @param type The type of event.
   * @param key The key that was changed.
   */
  private setAdditionalClasses = (set: ReadonlySet<string>, type: SubscribableSetEventType, key: string): void => {
    if (type === SubscribableSetEventType.Added) {
      this.classList.add(key);
    } else {
      this.classList.delete(key);
    }
  };

  /**
   * Renders the component.
   * @returns The rendered component VNode.
   */
  public render(): VNode {
    return (
      <div class={this.classList} ref={this.rootEl}>
        <div class='softkey-tab-borders' />
        <label class='softkey-tab-label' ref={this.labelEl}></label>
        <span class='softkey-tab-value' ref={this.valueEl} style='display: none'></span>
        <div class='softkey-tab-indicator' ref={this.indicatorEl} />
      </div>
    );
  }
}
