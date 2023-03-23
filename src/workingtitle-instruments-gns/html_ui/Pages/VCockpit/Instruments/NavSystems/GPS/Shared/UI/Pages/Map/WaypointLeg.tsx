import { BitFlags, FixTypeFlags, FSComponent, ImageCache, LegDefinition, LegTurnDirection, Subject, VNode } from '@microsoft/msfs-sdk';

import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';

import './WaypointLeg.css';

/**
 * Props on the WaypointLeg component.
 */
interface WaypointLegProps extends GNSUiControlProps {
  /** The class to apply to this component. */
  class?: string;

  /** Whether or not this is the arc nav map. */
  isArcMap?: boolean
}

/**
 * A component that displays a waypoint leg, with fix type labels.
 */
export class WaypointLeg extends GNSUiControl<WaypointLegProps> {
  private readonly legName = Subject.create('_____');
  private readonly legType = Subject.create('');
  private readonly nameEl = FSComponent.createRef<HTMLElement>();
  private iconElement = FSComponent.createRef<HTMLImageElement>();

  /**
   * Sets the displayed leg, or null to not display.
   * @param leg The new leg data.
   */
  public setLeg(leg: LegDefinition | null): void {
    this.props.isArcMap && this.iconElement.instance.classList.add('hide-element');
    if (leg !== null) {
      switch (leg.name) {
        case 'PROC. TURN':
          if (this.props.isArcMap) {
            this.legName.set('');
            this.setProcTurnSvg(leg);
            this.iconElement.instance.classList.remove('hide-element');
          } else {
            this.legName.set('proc. turn');
            this.nameEl.instance.classList.add('extended2');
            this.nameEl.instance.classList.add('smaller-font');
          }
          break;
        case 'MANSEQ':
          this.legName.set('man seq');
          this.nameEl.instance.classList.add('extended');
          break;
        case 'HOLD':
          this.legName.set('hold');
          this.nameEl.instance.classList.add('extended');
          break;
        default:
          this.legName.set(leg.name ?? '_____');
          this.nameEl.instance.classList.remove('extended');
          break;
      }

      this.legType.set(this.getFixType(leg.leg.fixTypeFlags));
    } else {
      this.legName.set('_____');
      this.legType.set('');
    }
  }

  /**
   * Sets which Proc turn directon icon to get.
   * @param leg The new leg data.
   */
  private setProcTurnSvg(leg: LegDefinition): void {
    switch (leg.leg.turnDirection) {
      case LegTurnDirection.Left:
        this.iconElement.instance.src = ImageCache.get('LEGICON_PTURN_LEFT_GREEN').src;
        break;
      default:
        this.iconElement.instance.src = ImageCache.get('LEGICON_PTURN_RIGHT_GREEN').src;
        break;
    }
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.nameEl.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.nameEl.instance.classList.remove('selected');
  }

  /**
   * Gets the fix type label for the leg.
   * @param flags The flags on the leg.
   * @returns The fix type label.
   */
  private getFixType(flags: number): string {
    if (flags === 0) {
      return '';
    }

    if (BitFlags.isAny(flags, FixTypeFlags.IF)) {
      return 'IF';
    }

    if (BitFlags.isAny(flags, FixTypeFlags.IAF)) {
      return 'IA';
    }

    if (BitFlags.isAny(flags, FixTypeFlags.MAP)) {
      return 'MA';
    }

    if (BitFlags.isAny(flags, FixTypeFlags.FAF)) {
      return 'FA';
    }

    if (BitFlags.isAny(flags, FixTypeFlags.MAHP)) {
      return 'MH';
    }

    return '';
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`waypoint-leg ${this.props.class ?? ''}`}>
        <span class='waypoint-leg-name' ref={this.nameEl}>{this.legName}</span><span class='waypoint-leg-type'>{this.legType}</span>
        <img class='waypoint-leg-icon hide-element' src='' ref={this.iconElement} />
      </div>
    );
  }
}