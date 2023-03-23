/* eslint-disable @typescript-eslint/no-empty-interface */
import {
  ComponentProps, ComputedSubject, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject,
  SetSubject, SpeedRestrictionType, SpeedUnit, Subscribable, Subscription, Unit, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { NumberUnitDisplay } from '@microsoft/msfs-garminsdk';
import './SpeedConstraintDisplay.css';

const SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });

/** The props for {@link SpeedConstraintDisplay}. */
export interface SpeedConstraintDisplayProps extends ComponentProps {
  /** The event bus. */
  userSpeedUnitsSetting: Subscribable<Unit<UnitFamily.Speed>>;
  /** The speed constraint speed. */
  speed: Subscribable<number>;
  /** The speed constraint unit. */
  speedUnit: Subscribable<SpeedUnit>;
  /** The speed constraint type. */
  speedDesc: Subscribable<SpeedRestrictionType>;
  /** Whether the speed is invalid. */
  isInvalid?: Subscribable<boolean>;
  /** Whether the speed is edited. */
  isEdited?: Subscribable<boolean>;
}

/** Displays a speed constraint. */
export class SpeedConstraintDisplay extends DisplayComponent<SpeedConstraintDisplayProps> {
  private readonly numberUnitDisplayRef = FSComponent.createRef<NumberUnitDisplay<any>>();

  private readonly classList = SetSubject.create(['speed-constraint-display']);

  private readonly speed = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  private readonly speedMach = ComputedSubject.create<number, string>(NaN, x => {
    return `M ${x.toFixed(3)}`;
  });

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.subs.push(this.props.speed.sub(speed => {
      this.speed.set(speed);
      this.speedMach.set(speed);
    }, true));

    this.subs.push(this.props.speedDesc.sub(speedDesc => {
      this.classList.toggle('at', speedDesc === SpeedRestrictionType.At);
      this.classList.toggle('above', speedDesc === SpeedRestrictionType.AtOrAbove);
      this.classList.toggle('below', speedDesc === SpeedRestrictionType.AtOrBelow);
    }, true));

    this.subs.push(this.props.speedUnit.sub(speedUnit => {
      this.classList.toggle('ias', speedUnit === SpeedUnit.IAS);
      this.classList.toggle('mach', speedUnit === SpeedUnit.MACH);
    }, true));

    if (this.props.isEdited) {
      this.subs.push(this.props.isEdited.sub(isEdited => {
        this.classList.toggle('edited', isEdited);
      }, true));
    }

    if (this.props.isInvalid) {
      this.subs.push(this.props.isInvalid.sub(isInvalid => {
        this.classList.toggle('invalid', isInvalid);
      }, true));
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <div class="lines-box">
          <div class="mach">{this.speedMach}</div>
          <NumberUnitDisplay
            ref={this.numberUnitDisplayRef}
            class="speed-number-unit"
            value={this.speed}
            formatter={SPEED_FORMATTER}
            displayUnit={this.props.userSpeedUnitsSetting}
          />
          {this.props.isInvalid !== undefined &&
            <img
              class="invalid-image single"
              src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/wt_cyan_crossed_out.png"
            />
          }
        </div>
        {this.props.isEdited !== undefined &&
          <img
            class="pencil-icon"
            src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_pencil.png"
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