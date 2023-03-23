import { FlightPlanSegmentType, FSComponent, NodeReference, ScrollUtils, Subject, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { ViewService } from '../Pages';

import './FPLSegmentHeader.css';
import { FPLLegArrow, LegArrowType } from './FPLLegArrow';

/**
 * Props on the FPLSegmentHeader component.
 */
export interface FPLSegmentHeaderProps extends GNSUiControlProps {
  /** The element container to scroll when selected. */
  scrollContainer?: NodeReference<HTMLElement>;

  /** The type of flight plan segment this header is for. */
  type: FlightPlanSegmentType;

  /** The flight plan management system. */
  fms: Fms;

  /** A callback called when the segment header is selected. */
  onSelected: () => void;
}

/**
 * A control that displays the flight plan segment header, if one exists.
 */
export class FPLSegmentHeader extends GNSUiControl<FPLSegmentHeaderProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly textEl = FSComponent.createRef<HTMLSpanElement>();
  private readonly legArrow = FSComponent.createRef<FPLLegArrow>();

  private readonly name = Subject.create('');
  private readonly longName = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.setDisabled(true);
  }

  /**
   * Sets the name to be displayed in the header.
   * @param name The short name to be displayed in the header.
   * @param longName The long name to be displayed in any confirmation dialogs.
   */
  public setName(name: string, longName?: string): void {
    this.name.set(name);

    if (longName !== undefined) {
      this.longName.set(longName);
    } else {
      this.longName.set(name);
    }
  }

  /**
   * Sets the leg arrow to be displayed with this entry.
   * @param type The type of arrow to display.
   */
  public setLegArrow(type: LegArrowType): void {
    this.legArrow.instance.set(type);
  }

  /** @inheritdoc */
  protected onDisabled(): void {
    this.el.instance.classList.add('hide-element');
  }

  /** @inheritdoc */
  protected onEnabled(): void {
    this.el.instance.classList.remove('hide-element');
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.textEl.instance.classList.add('selected-cyan');
    if (this.props.scrollContainer !== undefined) {
      ScrollUtils.ensureInView(this.el.instance, this.props.scrollContainer.instance);
    }

    this.props.onSelected();
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.textEl.instance.classList.remove('selected-cyan');
  }

  /** @inheritdoc */
  public onClr(): boolean {
    if (![FlightPlanSegmentType.Departure, FlightPlanSegmentType.Arrival, FlightPlanSegmentType.Approach].includes(this.props.type)) {
      return true;
    }

    ViewService.confirm(`Remove ${this.props.type}`.toUpperCase(), `Remove ${this.longName.get().toUpperCase()} from flight plan.`)
      .then((confirmed) => {
        if (confirmed) {
          switch (this.props.type) {
            case FlightPlanSegmentType.Approach:
              this.props.fms.removeApproach();
              break;
            case FlightPlanSegmentType.Departure:
              this.props.fms.removeDeparture();
              break;
            case FlightPlanSegmentType.Arrival:
              this.props.fms.removeArrival();
              break;
          }
        }
      });

    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='fpl-segment-header' ref={this.el}>
        <FPLLegArrow ref={this.legArrow} />
        <span ref={this.textEl}>{this.props.type} {this.name}</span>
      </div>
    );
  }
}