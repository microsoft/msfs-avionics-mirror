import { BitFlags, ComponentProps, DisplayComponent, FSComponent, LegDefinition, LegDefinitionFlags, LegTurnDirection, LegType, ObjectSubject, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for NavStatusBoxLegArrow.
 */
export interface NavStatusBoxLegArrowProps extends ComponentProps {
  /** The nominal flight plan leg which LNAV is currently tracking. */
  toLeg: Subscribable<LegDefinition | null>;
}

/**
 * A leg arrow display mode.
 */
type ArrowMode = 'none' | 'straight' | 'left' | 'right' | 'hold-left' | 'hold-right' | 'direct';

/**
 * A next-generation (NXi, G3000, etc) navigation status box leg arrow display.
 */
export class NavStatusBoxLegArrow extends DisplayComponent<NavStatusBoxLegArrowProps> {
  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly straightStyle = ObjectSubject.create({
    display: 'none',
    width: '25px',
    height: '15px'
  });
  private readonly leftStyle = ObjectSubject.create({
    display: 'none',
    width: '25px',
    height: '13px'
  });
  private readonly rightStyle = ObjectSubject.create({
    display: 'none',
    width: '25px',
    height: '13px'
  });
  private readonly holdLeftStyle = ObjectSubject.create({
    display: 'none',
    width: '33px',
    height: '15px'
  });
  private readonly holdRightStyle = ObjectSubject.create({
    display: 'none',
    width: '33px',
    height: '15px'
  });
  private readonly directStyle = ObjectSubject.create({
    display: 'none',
    width: '25px',
    height: '15px'
  });

  private readonly arrowMode = Subject.create<ArrowMode>('straight');

  private legSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.legSub = this.props.toLeg.sub(leg => {
      if (leg === null) {
        this.arrowMode.set('none');
      } else {
        if (BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo)) {
          this.arrowMode.set('direct');
        } else {
          switch (leg.leg.type) {
            case LegType.HF:
            case LegType.HA:
            case LegType.HM:
              this.arrowMode.set(leg.leg.turnDirection === LegTurnDirection.Left ? 'hold-left' : 'hold-right');
              break;
            case LegType.AF:
            case LegType.RF:
              this.arrowMode.set(leg.leg.turnDirection === LegTurnDirection.Left ? 'left' : 'right');
              break;
            default:
              this.arrowMode.set('straight');
          }
        }
      }
    }, true);

    this.arrowMode.sub(mode => {
      if (mode === 'none') {
        this.rootStyle.set('display', 'none');
      } else {
        this.rootStyle.set('display', '');

        this.straightStyle.set('display', mode === 'straight' ? '' : 'none');
        this.leftStyle.set('display', mode === 'left' ? '' : 'none');
        this.rightStyle.set('display', mode === 'right' ? '' : 'none');
        this.holdLeftStyle.set('display', mode === 'hold-left' ? '' : 'none');
        this.holdRightStyle.set('display', mode === 'hold-right' ? '' : 'none');
        this.directStyle.set('display', mode === 'direct' ? '' : 'none');
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='nav-status-leg-arrow' style={this.rootStyle}>
        <svg viewBox='0 0 25 14.5' style={this.straightStyle}>
          <path d='M 25 7.25 L 18 0 L 18 4.75 L 0 4.75 L 0 9.75 L 18 9.75 L 18 14.5 Z' fill='var(--nav-status-icon-color)' stroke='none' />
        </svg>
        <svg viewBox='0 0 25 13' style={this.leftStyle}>
          <path d='m 0 6.6 c 0 4.4 1.5 6.4 5.1 6.4 l 11.8 0 c 3.7 0 5.1 -2 5.1 -6.4 l 2.9 0 l -5.5 -6.6 l -5.5 6.6 l 2.9 0 c 0 1.5 -0.7 2.9 -2.9 2.9 l -5.9 0 c -2.2 0 -2.9 -1.5 -2.9 -2.9 l -5.1 0' fill='var(--nav-status-icon-color)' stroke='none' />
        </svg>
        <svg viewBox='0 0 25 13' style={this.rightStyle}>
          <path d='m 0 6.4 c 0 -4.4 1.5 -6.4 5.1 -6.4 l 11.8 0 c 3.7 0 5.1 2 5.1 6.4 l 2.9 0 l -5.5 6.6 l -5.5 -6.6 l 2.9 0 c 0 -1.5 -0.7 -2.9 -2.9 -2.9 l -5.9 0 c -2.2 0 -2.9 1.5 -2.9 2.9 l -5.1 0' fill='var(--nav-status-icon-color)' stroke='none' />
        </svg>
        <svg viewBox='0 0 33 15' style={this.holdLeftStyle}>
          <path d='m 0 13 l 22 0 m 0 -2 l 3 0 m 0 2 l 8 0 m -8 -1 l 1 0 c 7 0 7 -11 0 -11 l -19 0 c -7 0 -7 11 0 11 l 15 0 m 0 2 l 3 0' fill='none' stroke='var(--nav-status-icon-color)' stroke-width='2' />
        </svg>
        <svg viewBox='0 0 33 15' style={this.holdRightStyle}>
          <path d='m 0 2 l 22 0 m 0 2 l 3 0 m 0 -2 l 8 0 m -8 1 l 1 0 c 7 0 7 11 0 11 l -19 0 c -7 0 -7 -11 0 -11 l 15 0 m 0 -2 l 3 0' fill='none' stroke='var(--nav-status-icon-color)' stroke-width='2' />
        </svg>
        <svg viewBox='0 0 25 16.5' style={this.directStyle}>
          <path d='M 25 8.25 l -7 -7.25 l 0 4.75 l -18 0 l 0 5 l 18 0 l 0 4.75 z' fill='var(--nav-status-icon-color)' stroke='none' />
          <path d='M 4 1 l 4 0 a 6.25 7.25 0 0 1 0 14.5 l -4 0 z' fill='none' stroke='var(--nav-status-icon-color)' stroke-width='2' />
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.legSub?.destroy();

    super.destroy();
  }
}
