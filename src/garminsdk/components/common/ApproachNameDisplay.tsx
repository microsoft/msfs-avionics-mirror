import {
  AirportFacility, ComponentProps, DisplayComponent, FSComponent, ICAO, StringUtils, Subscribable, SubscribableUtils,
  VNode
} from '@microsoft/msfs-sdk';

import { GarminApproachProcedure } from '../../flightplan/FmsTypes';
import { ApproachNameParts, FmsUtils } from '../../flightplan/FmsUtils';

/** Properties for a VNode representing an approach name. */
export interface ApproachNameDisplayProps extends ComponentProps {
  /** A subscribable which provides an approach procedure. */
  approach?: GarminApproachProcedure | null | undefined | Subscribable<GarminApproachProcedure | null | undefined>;

  /**
   * A subscribable which provides the approach name parts.
   * If used, the approach prop will be ignored.
   */
  approachNameParts?: ApproachNameParts | null | undefined | Subscribable<ApproachNameParts | null | undefined>;

  /**
   * A subscribable which provides the approach's parent airport. If no subscribable is provided or its value is null,
   * the airport ident will not be displayed as part of the approach name.
   */
  airport?: AirportFacility | null | undefined | Subscribable<AirportFacility | null | undefined>;

  /**
   * A subscribable which provides the approach's parent airport ident. If no subscribable is provided or its value is null,
   * the airport ident will not be displayed as part of the approach name.
   * If passed in, the airport prop will be ignored.
   */
  airportIdent?: string | null | undefined | Subscribable<string | null | undefined>;

  /** Text to display at the beginning of the display. */
  prefix?: string | null | undefined | Subscribable<string | null | undefined>;

  /** The text to display when the approach is null. Defaults to the empty string. */
  nullText?: string;

  /** Whether to use the zero with the slash through it in place of any 0's in the name. */
  useZeroWithSlash?: boolean;

  /** CSS class(es) to apply to the root of the component. */
  class?: string;
}

/** A VNode representing a preformated rendering of an approach's name. */
export class ApproachNameDisplay extends DisplayComponent<ApproachNameDisplayProps> {
  private readonly nameRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly prefixRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly airportRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly subTypeRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly suffixRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly runwayRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly flagsRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly nullRef = FSComponent.createRef<HTMLSpanElement>();

  private readonly approach = SubscribableUtils.toSubscribable(this.props.approach, true) as Subscribable<GarminApproachProcedure | null | undefined>;
  private readonly approachNamePartsProp = SubscribableUtils.toSubscribable(this.props.approachNameParts, true) as Subscribable<ApproachNameParts | null | undefined>;

  private readonly airport = SubscribableUtils.toSubscribable(this.props.airport ?? null, true) as Subscribable<AirportFacility | null | undefined>;
  private readonly airportIdent = SubscribableUtils.toSubscribable(this.props.airportIdent ?? '', true) as Subscribable<string>;
  private readonly prefix = SubscribableUtils.toSubscribable(this.props.prefix ?? '', true) as Subscribable<string | null | undefined>;

  private readonly prefixText = this.prefix.map(prefix => prefix ?? '');

  private readonly airportText = this.props.airportIdent
    ? this.airportIdent.map(x => x)
    : this.airport.map(airport => airport ? ICAO.getIdent(airport.icao) : '');

  private readonly approachNameParts = this.props.approachNameParts
    ? this.approachNamePartsProp.map(x => x)
    : this.approach.map(approach => approach ? FmsUtils.getApproachNameAsParts(approach) : null);

  private readonly typeText = this.approachNameParts.map(parts => parts?.type ?? '');
  private readonly subTypeText = this.approachNameParts.map(parts => parts?.subtype ?? '');
  private readonly suffixConnectorText = this.approachNameParts.map(parts => !parts || parts.runway ? ' ' : '–');
  private readonly suffixText = this.approachNameParts.map(parts => parts?.suffix ?? '');
  private readonly runwayText = this.approachNameParts.map(parts => parts?.runway ?? '');
  private readonly flagsText = this.approachNameParts.map(parts => parts?.flags ?? '');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.approachNameParts.sub(parts => {
      this.nameRef.instance.style.display = parts ? '' : 'none';
      this.nullRef.instance.style.display = this.props.nullText === undefined || parts ? 'none' : '';
    }, true);

    this.prefixText.sub(value => { this.prefixRef.instance.style.display = !value ? 'none' : ''; }, true);
    this.airportText.sub(value => { this.airportRef.instance.style.display = value === '' ? 'none' : ''; }, true);
    this.subTypeText.sub(value => { this.subTypeRef.instance.style.display = value === '' ? 'none' : ''; }, true);
    this.suffixText.sub(value => { this.suffixRef.instance.style.display = value === '' ? 'none' : ''; }, true);
    this.runwayText.sub(value => { this.runwayRef.instance.style.display = value === '' ? 'none' : ''; }, true);
    this.flagsText.sub(value => { this.flagsRef.instance.style.display = value === '' ? 'none' : ''; }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`appr-name ${this.props.class ?? ''}`}>
        <span ref={this.nameRef}>
          <span ref={this.prefixRef}>{this.prefixText}</span>
          <span ref={this.airportRef}>{this.props.useZeroWithSlash ? this.airportText.map(StringUtils.useZeroSlash) : this.airportText}–</span>
          <span>{this.typeText}</span>
          <span ref={this.subTypeRef} class='appr-name-subtype'>{this.subTypeText}</span>
          <span ref={this.suffixRef}>{this.suffixConnectorText}{this.suffixText}</span>
          <span ref={this.runwayRef}> {this.props.useZeroWithSlash ? this.runwayText.map(StringUtils.useZeroSlash) : this.runwayText}</span>
          <span ref={this.flagsRef}> {this.flagsText}</span>
        </span>
        <span ref={this.nullRef}>{this.props.nullText ?? ''}</span>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.prefixText.destroy();
    this.airportText.destroy();
    this.approachNameParts.destroy();

    super.destroy();
  }
}