import {
  AltitudeRestrictionType, ComponentProps, DisplayComponent, FSComponent,
  MappedSubject, NumberUnitInterface, SetSubject, Subject, Subscribable,
  SubscribableUtils, Subscription, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';

import { G3000FilePaths } from '../../G3000FilePaths';

import './AltitudeConstraintDisplay.css';

/** The props for {@link AltitudeConstraintDisplay}. */
export interface AltitudeConstraintDisplayProps extends ComponentProps {
  /** The altitude restriction type. */
  altDesc: Subscribable<AltitudeRestrictionType>;
  /** Altitude 1. */
  altitude1: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;
  /** Altitude 2. */
  altitude2?: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;
  /** Whether the altitude 1 should be displayed as a flight level. */
  displayAltitude1AsFlightLevel: Subscribable<boolean>;
  /** Whether the altitude 2 should be displayed as a flight level. Defaults to false. */
  displayAltitude2AsFlightLevel?: Subscribable<boolean>;
  /** When true, the pencil icon will be displayed. Defaults to false. */
  isEdited?: Subscribable<boolean>;
  /** Whether to display this constraint as invalid or not. Defaults to false. */
  isInvalid?: Subscribable<boolean>;
  /** Whether to display this constraint in cyan or not. Defaults to false. */
  isCyan?: Subscribable<boolean> | boolean;
}

/** Displays an altitude constraint. */
export class AltitudeConstraintDisplay extends DisplayComponent<AltitudeConstraintDisplayProps> {
  private readonly altitudesRef = FSComponent.createRef<HTMLDivElement>();

  private readonly altitude1Feet = this.props.altitude1.map(x => x.asUnit(UnitType.FOOT));
  private readonly altitude2Feet = this.props.altitude2?.map(x => x.asUnit(UnitType.FOOT)) ?? Subject.create(NaN);

  private readonly displayAltitude2AsFlightLevel = Subject.create(false);

  private readonly line1Content = MappedSubject.create(([altitude1Feet, isFlightLevel]) => {
    return AltitudeConstraintDisplay.formatAltitude(altitude1Feet, isFlightLevel);
  }, this.altitude1Feet, this.props.displayAltitude1AsFlightLevel);

  private readonly line2Content = MappedSubject.create(([altitude2Feet, isFlightLevel]) => {
    return AltitudeConstraintDisplay.formatAltitude(altitude2Feet, isFlightLevel);
  }, this.altitude2Feet, this.displayAltitude2AsFlightLevel);

  private readonly fontScale = MappedSubject.create(([line1Content, line2Content, altDesc]) => {
    if (altDesc === AltitudeRestrictionType.Between) {
      if ((!line1Content.startsWith('FL') && line1Content.length === 5) ||
        (!line2Content.startsWith('FL') && line2Content.length === 5)) {
        return '0.78em';
      } else {
        return '0.95em';
      }
    } else {
      if ((!line1Content.startsWith('FL') && line1Content.length === 5) ||
        (!line2Content.startsWith('FL') && line2Content.length === 5)) {
        return '0.95em';
      } else {
        return '1em';
      }
    }
  }, this.line1Content, this.line2Content, this.props.altDesc);

  private readonly classList = SetSubject.create(['altitude-constraint-display']);

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.subs.push(this.props.displayAltitude1AsFlightLevel.sub(isFlightLevel => {
      this.classList.toggle('FL1', isFlightLevel);
    }, true));

    if (this.props.displayAltitude2AsFlightLevel) {
      this.subs.push(this.props.displayAltitude2AsFlightLevel.pipe(this.displayAltitude2AsFlightLevel));
    }

    this.displayAltitude2AsFlightLevel.sub(isFlightLevel => {
      this.classList.toggle('FL2', isFlightLevel);
    }, true);

    if (this.props.isInvalid) {
      this.subs.push(this.props.isInvalid.sub(isInvalid => {
        this.classList.toggle('invalid', isInvalid);
      }, true));
    }

    if (this.props.isEdited) {
      this.subs.push(this.props.isEdited.sub(isEdited => {
        this.classList.toggle('edited', isEdited);
      }, true));
    }

    if (SubscribableUtils.isSubscribable(this.props.isCyan)) {
      this.subs.push(this.props.isCyan.sub(isCyan => {
        this.classList.toggle('altitude-constraint-display-cyan', isCyan);
      }, true));
    } else {
      this.classList.toggle('altitude-constraint-display-cyan', !!this.props.isCyan);
    }

    this.fontScale.sub(fontScale => {
      this.altitudesRef.instance.style.setProperty('--altitude-constraint-display-font-size-scale', fontScale);
    }, true);

    this.subs.push(this.props.altDesc.sub(altDesc => {
      this.classList.toggle('altitude-constraint-display-at', altDesc === AltitudeRestrictionType.At);
      this.classList.toggle('altitude-constraint-display-atorabove', altDesc === AltitudeRestrictionType.AtOrAbove);
      this.classList.toggle('altitude-constraint-display-atorbelow', altDesc === AltitudeRestrictionType.AtOrBelow);
      this.classList.toggle('altitude-constraint-display-between', altDesc === AltitudeRestrictionType.Between);
      this.classList.toggle('altitude-constraint-display-unused', altDesc === AltitudeRestrictionType.Unused);
    }, true));
  }

  /**
   * Formats altitude.
   * @param altitudeFeet The altitude in feet.
   * @param isFlightLevel Whether this is flight level or not.
   * @returns The formatted altitude.
   */
  public static formatAltitude(altitudeFeet: number | undefined, isFlightLevel: boolean): string {
    if (isFlightLevel) {
      if (altitudeFeet !== undefined && !isNaN(altitudeFeet)) {
        return `FL${Math.round(altitudeFeet / 100).toString().padStart(3, '0').substring(0, 3)}`;
      } else {
        return 'FL___';
      }
    } else {
      if (altitudeFeet !== undefined && !isNaN(altitudeFeet)) {
        return altitudeFeet.toFixed(0);
      } else {
        return '_____';
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <div class="altitudes" ref={this.altitudesRef}>
          <div class="lines-box">
            <div class="line line-1"><div class="line-inner">{this.line1Content}<span class="FT">FT</span></div></div>
            <div class="line line-2"><div class="line-inner">{this.line2Content}<span class="FT">FT</span></div></div>
          </div>
          <div class="solid-line-box" />
          <img class="invalid-image single" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/wt_cyan_crossed_out.png`} />
          <img class="invalid-image double" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/wt_cyan_crossed_out_double.png`} />
        </div>
        <img class="pencil-icon" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_pencil.png`} />
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();

    this.altitude1Feet.destroy();
    if ('destroy' in this.altitude2Feet) {
      this.altitude2Feet.destroy();
    }

    this.line1Content.destroy();
    this.line2Content.destroy();
    this.fontScale.destroy();

    this.subs.forEach(x => x.destroy());
  }
}
