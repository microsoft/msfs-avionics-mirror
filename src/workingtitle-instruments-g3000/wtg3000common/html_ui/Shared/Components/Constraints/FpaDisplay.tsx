import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject,
  SetSubject, Subscribable, Subscription, UnitType, VNode,
} from '@microsoft/msfs-sdk';

import { NumberUnitDisplay } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths } from '../../G3000FilePaths';

import './FpaDisplay.css';

const ANGLE_FORMATTER = NumberFormatter.create({ precision: 0.01, nanString: '_.__', useMinusSign: true });

/** The props for {@link FpaDisplay}. */
export interface FpaDisplayProps extends ComponentProps {
  /** The flight path angle to display, in degrees. Positive values indicate a descending path. */
  fpa: Subscribable<number>;
  /** Whether this fpa is user-edited and should display the pencil icon. */
  isEdited?: Subscribable<boolean>;
  /** When true, will display CLIMB instead of the fpa. */
  showClimb?: Subscribable<boolean>;
  /** Optional fpa number formatter. */
  formatter?: (number: number) => string;
}

/** Displays a Flight Path Angle. */
export class FpaDisplay extends DisplayComponent<FpaDisplayProps> {
  private readonly numberUnitDisplayRef = FSComponent.createRef<NumberUnitDisplay<any>>();

  private readonly classList = SetSubject.create(['flight-path-angle-display']);

  private readonly subs = [] as Subscription[];

  private readonly fpa = NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN));

  /** @inheritdoc */
  public override onAfterRender(): void {
    if (this.props.showClimb) {
      this.subs.push(this.props.showClimb.sub(showClimb => {
        this.classList.toggle('show-phase', showClimb);
      }, true));
    }

    if (this.props.isEdited) {
      this.subs.push(this.props.isEdited.sub(isEdited => {
        this.classList.toggle('edited', isEdited);
      }, true));
    }

    // FPA is stored as a positive number, but needs to be displayed as a negative one
    this.subs.push(this.props.fpa.pipe(this.fpa, x => -x));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <div class="phase">CLIMB</div>
        <NumberUnitDisplay
          ref={this.numberUnitDisplayRef}
          class="fpa-number-unit"
          value={this.fpa}
          formatter={this.props.formatter ?? ANGLE_FORMATTER}
          displayUnit={null}
        />
        {this.props.isEdited !== undefined &&
          <img
            class="pencil-icon"
            src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_pencil.png`}
          />
        }
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();

    this.numberUnitDisplayRef.getOrDefault()?.destroy();

    this.subs.forEach(x => x.destroy());
  }
}
