/* eslint-disable max-len */
import { ClockEvents, ComponentProps, ConsumerSubject, EventBus, FSComponent, RadioType, Subject, VNode } from '@microsoft/msfs-sdk';

import { FmsHEvent, G1000UiControl } from '../UI';
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

enum ArmedModes {
  inactive = 'inactive',
  blink = 'blink',
  solid = 'solid',
  standby = 'standby',
}

/**
 *
 */
export class NavComRadio extends G1000UiControl<NavComRadioProps> {

  frequency1Element = FSComponent.createRef<NavComFrequencyElement>();
  frequency2Element = FSComponent.createRef<NavComFrequencyElement>();

  private readonly sub = this.props.bus.getSubscriber<ClockEvents>();
  private readonly simTime = ConsumerSubject.create(this.sub.on('simTime').withPrecision(-2), 0); // milliseconds, updates at 10Hz
  private activeBorderRef = FSComponent.createRef<HTMLDivElement>();
  public armedMode = Subject.create(ArmedModes.inactive);
  private lastArmedTime = 0;  // milliseconds
  private readonly blinkTimeout = 5; // seconds
  private readonly solidTimeout = 10; // seconds
  private readonly borderClasses: ArmedModes[] = [
    ArmedModes.inactive,
    ArmedModes.blink,
    ArmedModes.solid,
    ArmedModes.standby
  ];


  /**
   * Stuff to do after render.
   */
  public onAfterRender(): void {

    // Add and remove CSS classes based on changes in ArmedMode
    this.armedMode.sub((mode) => {

      // Find class to add
      const addClassIndex = this.borderClasses.indexOf(mode);
      if (addClassIndex < 0) { return; }
      const addClass = this.borderClasses[addClassIndex];

      // Find classes to remove
      const removeClasses = [];
      for (let i = 0; i < this.borderClasses.length; i++) {
        if (i !== addClassIndex) {
          removeClasses.push(this.borderClasses[i]);
        }
      }
      if (removeClasses.length !== this.borderClasses.length - 1) { return; }

      // Set last armed time
      if (mode === ArmedModes.blink) { this.lastArmedTime = this.simTime.get(); }

      // Add and remove classes
      this.activeBorderRef.instance.classList.add(addClass);
      this.activeBorderRef.instance.classList.remove(
        removeClasses[0],
        removeClasses[1],
        removeClasses[2],
      );
    }, true);

    // Watch for blink and solid border timeouts
    this.simTime.sub((t) => {
      if (this.armedMode.get() === ArmedModes.blink && (t - this.lastArmedTime > this.blinkTimeout * 1000)) {
        this.armedMode.set(ArmedModes.solid);
      }
      if (this.armedMode.get() === ArmedModes.solid && (t - this.lastArmedTime > this.solidTimeout * 1000)) {
        this.armedMode.set(ArmedModes.standby);
      }
    }, true);

    // Initilize the COM radio in standby mode
    if (this.props.position === 'right') {
      this.armedMode.set(ArmedModes.standby);
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    // We simply pass on the event to the frequency elements:
    return this.frequency1Element.instance.onInteractionEvent(evt) ||
      this.frequency2Element.instance.onInteractionEvent(evt);
  }

  /** Sets the armed mode of the radio input box
   * @param armed whether or not the radio box is armed for input
   */
  public setArmed(armed: boolean): void {
    if (armed) {
      this.armedMode.set(ArmedModes.blink);
    } else {
      this.armedMode.set(ArmedModes.inactive);
    }
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
          <div ref={this.activeBorderRef} class="radio-armed-border nav inactive" />
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
          <div ref={this.activeBorderRef} class="radio-armed-border com inactive" />
        </div>
      );
    }
  }
}
