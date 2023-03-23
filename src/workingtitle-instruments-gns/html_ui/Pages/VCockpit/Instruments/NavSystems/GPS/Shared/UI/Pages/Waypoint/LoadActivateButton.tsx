import { FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { GNSType } from '../../../UITypes';
import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';

import './LoadActivateButton.css';

/**
 * Props on the LoadActivateButton control.
 */
interface LoadActivateButtonProps extends GNSUiControlProps {
  /** The CSS class to apply to the control. */
  class?: string;

  /** Whether to show the "Activate?" prompt */
  showActivate?: boolean;

  /** The GNS type */
  gnsType: GNSType;

  /** A callback called when the load control is selected. */
  onLoad: () => void;

  /** A callback called when the activate control is selected. */
  onActivate: () => void;
}

/**
 * A control that displays a Load Or Activate button.
 */
export class LoadActivateButton extends GNSUiControl<LoadActivateButtonProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly loadEl = FSComponent.createRef<HTMLDivElement>();
  private readonly loadSpan = FSComponent.createRef<HTMLSpanElement>();
  private readonly orEl = FSComponent.createRef<HTMLDivElement>();
  private readonly activateEl = FSComponent.createRef<HTMLDivElement>();
  private readonly activateSpan = FSComponent.createRef<HTMLSpanElement>();

  private readonly loadControl = FSComponent.createRef<GNSUiControl>();
  private readonly activateControl = FSComponent.createRef<GNSUiControl>();

  /** @inheritdoc */
  protected onDisabled(): void {
    this.el.instance.classList.add('hide-element');
  }

  /** @inheritdoc */
  protected onEnabled(): void {
    this.el.instance.classList.remove('hide-element');
  }

  /**
   * A callback called when an element is focused.
   * @param ref The element to focus.
   */
  private onElementFocused(ref: NodeReference<HTMLElement>): void {
    ref.instance.classList.add('selected-white');
  }

  /**
   * A callback called when an element is blurred.
   * @param ref The element to blur.
   */
  private onElementBlurred(ref: NodeReference<HTMLElement>): void {
    ref.instance.classList.remove('selected-white');
  }

  /**
   * Sets the active state of the control.
   * @param state Whether load, both load and active, or just activate should be enabled.
   */
  public setState(state: 'load' | 'loadAndActivate' | 'activate'): void {
    switch (state) {
      case 'load':
        this.loadEl.instance.classList.remove('hide-element');
        this.props.gnsType === 'wt530' && this.orEl.instance.classList.add('hide-element');
        this.activateEl.getOrDefault()?.classList.add('hide-element');
        this.loadControl.getOrDefault()?.setDisabled(false);
        this.activateControl.getOrDefault()?.setDisabled(true);
        break;
      case 'loadAndActivate':
        this.loadEl.instance.classList.remove('hide-element');
        this.props.gnsType === 'wt530' && this.orEl.instance.classList.remove('hide-element');
        this.activateEl.getOrDefault()?.classList.remove('hide-element');
        this.loadControl.getOrDefault()?.setDisabled(false);
        this.activateControl.getOrDefault()?.setDisabled(false);
        break;
      case 'activate':
        this.loadEl.instance.classList.add('hide-element');
        this.props.gnsType === 'wt530' && this.orEl.instance.classList.add('hide-element');
        this.activateEl.getOrDefault()?.classList.remove('hide-element');
        this.loadControl.getOrDefault()?.setDisabled(true);
        this.activateControl.getOrDefault()?.setDisabled(false);
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class} ref={this.el}>
        <GNSUiControl ref={this.loadControl} onFocused={(): void => this.onElementFocused(this.loadSpan)} onBlurred={(): void => this.onElementBlurred(this.loadSpan)}
          onEnt={(): boolean => { this.props.onLoad(); return true; }}>
          <div ref={this.loadEl}><span ref={this.loadSpan}>Load?</span></div>
        </GNSUiControl>
        {this.props.gnsType === 'wt530' && (
          <div ref={this.orEl} className='load-or-activate-button-or'>OR</div>
        )}
        {(this.props.showActivate ?? true) && (
          <GNSUiControl ref={this.activateControl} onFocused={(): void => this.onElementFocused(this.activateSpan)} onBlurred={(): void => this.onElementBlurred(this.activateSpan)}
            onEnt={(): boolean => { this.props.onActivate(); return true; }}>
            <div ref={this.activateEl}><span ref={this.activateSpan}>Activate?</span></div>
          </GNSUiControl>
        )}
      </div>
    );
  }
}