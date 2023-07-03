/* eslint-disable max-len */
import { ComponentProps, DisplayComponent, EventBus, FSComponent, RadioType, VNode } from '@microsoft/msfs-sdk';

import { NavComFrequencyElement } from './NavComFrequencyElement';

import './NavComRadio.css';

/**
 *
 */
interface NavComRadioProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The title of the navcom radio component. */
  title: string;

  /** The position of the navcom frequency elements. */
  position: 'left' | 'right';

  /** The template ID of this instrument, from the HTML config */
  templateId: string;
}

/**
 *
 */
export class NavComRadio extends DisplayComponent<NavComRadioProps> {
  frequency1Element = FSComponent.createRef<NavComFrequencyElement>();
  frequency2Element = FSComponent.createRef<NavComFrequencyElement>();

  /**
   * Stuff to do after render.
   */
  public onAfterRender(): void {
    // Nothing to do at the moment.
    return;
  }

  /**
   * Render NavCom Element
   * @returns Vnode containing the element
   */
  render(): VNode {
    if (this.props.position === 'left') {
      return (
        <div class="Nav1" data-checklist="Nav1">
          <div class="navcom-title left">{this.props.title}</div>
          <div class="navcom-title-numbers left">12</div>
          <div class="navcom-frequencies left">
            <NavComFrequencyElement ref={this.frequency1Element} bus={this.props.bus} position={this.props.position} type={RadioType.Nav} index={1} templateId={this.props.templateId} />
            <NavComFrequencyElement ref={this.frequency2Element} bus={this.props.bus} position={this.props.position} type={RadioType.Nav} index={2} templateId={this.props.templateId} />
          </div>
        </div>
      );
    } else {
      return (
        <div class="Com1" data-checklist="Com1">
          <div class="navcom-frequencies right">
            <NavComFrequencyElement ref={this.frequency1Element} bus={this.props.bus} position={this.props.position} type={RadioType.Com} index={1} templateId={this.props.templateId} />
            <NavComFrequencyElement ref={this.frequency2Element} bus={this.props.bus} position={this.props.position} type={RadioType.Com} index={2} templateId={this.props.templateId} />
          </div>
          <div class="navcom-title-numbers right">12</div>
          <div class="navcom-title right">{this.props.title}</div>
        </div>
      );
    }
  }
}