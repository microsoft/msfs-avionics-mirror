import {
  BasicNavAngleSubject, BasicNavAngleUnit, CombinedSubject, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, GNSSEvents,
  NumberFormatter, NumberUnitSubject, ObjectSubject, Subject, Subscribable, Subscription, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { BearingDisplay, G3000NavIndicator, NavSourceFormatter, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import './BearingInfo.css';

/**
 * Component props for BearingInfo.
 */
export interface BearingInfoProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The index of the bearing pointer associaed with the display. */
  index: 1 | 2;

  /** The number of supported ADF radios. */
  adfRadioCount: 0 | 1 | 2;

  /** The nav indicator associated with the bearing info display. */
  indicator: G3000NavIndicator;

  /** A manager for display unit user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;

  /** The mode to display. */
  mode: 'center' | 'offset';

  /** The side on which the display is located. Ignored if `mode` is `offset`. Defaults to `left`. */
  side?: 'left' | 'right';
}

/**
 * A G3000 bearing info display.
 */
export class BearingInfo extends DisplayComponent<BearingInfoProps> {
  // TODO: support indexed FMS and GPS/FMS option
  private readonly sourceFormatter = NavSourceFormatter.createForIndicator('FMS', false, false, this.props.adfRadioCount > 1, false);

  private readonly distanceRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();
  private readonly bearingRef = FSComponent.createRef<BearingDisplay>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly brgDisStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly sourceText = Subject.create('');
  private readonly identText = Subject.create('');

  private readonly identState = CombinedSubject.create(
    this.props.indicator.isLocalizer,
    this.props.indicator.ident,
    this.props.indicator.bearing
  );

  private readonly isBrgDisVisible = Subject.create(false);

  private readonly distance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  private readonly bearing = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));
  private readonly magVar = ConsumerSubject.create(null, 0);
  private readonly bearingState = CombinedSubject.create(
    this.props.indicator.bearing,
    this.magVar
  );

  private declutterSub?: Subscription;
  private sourceSub?: Subscription;
  private identSub?: Subscription;
  private distancePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const distancePipe = this.distancePipe = this.props.indicator.distance.pipe(this.distance, distance => distance ?? NaN);

    this.magVar.setConsumer(this.props.bus.getSubscriber<GNSSEvents>().on('magvar'));
    const bearingStateSub = this.bearingState.sub(([bearing, magVar]) => {
      this.bearing.set(bearing ?? NaN, magVar);
    }, true);

    const identStateSub = this.identState.sub(([isLocalizer, ident, bearing]) => {
      if ((isLocalizer ?? false) || ident === null || ident === '' || bearing === null) {
        this.identText.set(isLocalizer ? 'ILS' : '______');
        this.isBrgDisVisible.set(false);
      } else {
        this.identText.set(ident);
        this.isBrgDisVisible.set(true);
      }
    }, false, true);

    this.isBrgDisVisible.sub(isVisible => {
      if (isVisible) {
        this.brgDisStyle.set('display', '');

        distancePipe.resume(true);
        this.magVar.resume();
        bearingStateSub.resume(true);
      } else {
        this.brgDisStyle.set('display', 'none');

        distancePipe.pause();
        this.magVar.pause();
        bearingStateSub.pause();
      }
    }, true);

    const sourceSub = this.sourceSub = this.props.indicator.source.sub(source => {
      if (source === null) {
        this.rootStyle.set('display', 'none');
      } else {
        this.rootStyle.set('display', '');

        this.sourceText.set(this.sourceFormatter(this.props.indicator));
      }
    }, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');

        this.magVar.pause();
        this.bearingState.pause();

        sourceSub.pause();
        identStateSub.pause();
      } else {
        this.magVar.resume();
        this.bearingState.resume();

        sourceSub.resume(true);
        identStateSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return this.props.mode === 'center'
      ? (
        <div class={`bearing-info bearing-info-${this.props.index} bearing-info-center bearing-info-center-${this.props.side ?? 'left'}`} style={this.rootStyle}>
          <div class='bearing-info-top'>
            {this.renderDistance()}
          </div>
          <div class='bearing-info-bottom'>
            {this.renderBearing()}
            {this.renderIdent()}
            {this.renderSource()}
            {this.renderArrows()}
          </div>
        </div>
      ) : (
        <div class={`bearing-info bearing-info-${this.props.index} bearing-info-offset`} style={this.rootStyle}>
          {this.renderArrows()}
          {this.renderSource()}
          {this.renderIdent()}
          {this.renderDistance()}
          {this.renderBearing()}
        </div>
      );
  }

  /**
   * Renders this display's bearing pointer arrow icon.
   * @returns This display's bearing pointer arrow icon, as a VNode.
   */
  private renderArrows(): VNode {
    return this.props.index === 1
      ? (
        <svg viewBox='0 0 50 100' class='bearing-info-arrow bearing-info-arrow-1'>
          <path d='M 25 0 L 25 100 M 0 40 L 25 20 L 50 40' />
        </svg>
      ) : (
        <svg viewBox='0 0 50 100' class='bearing-info-arrow bearing-info-arrow-2'>
          <path d='M 25 0 L 25 20 M 0 40 L 25 20 L 50 40 L 37.5 30 L 37.5 90 L 12.5 90 L 12.5 30 L 0 40 M 25 90 L 25 100' />
        </svg>
      );
  }

  /**
   * Renders this display's source field.
   * @returns This display's source field, as a VNode.
   */
  private renderSource(): VNode {
    return (
      <div class='bearing-info-source'>{this.sourceText}</div>
    );
  }

  /**
   * Renders this display's ident field.
   * @returns This display's ident field, as a VNode.
   */
  private renderIdent(): VNode {
    return (
      <div class='bearing-info-ident-container'>
        <div class='failed-box' />
        <div class='bearing-info-ident'>{this.identText}</div>
      </div>
    );
  }

  /**
   * Renders this display's distance field.
   * @returns This display's distance field, as a VNode.
   */
  private renderDistance(): VNode {
    return (
      <div class='bearing-info-distance-container'>
        <div class='failed-box' />
        <div style={this.brgDisStyle}>
          <NumberUnitDisplay
            ref={this.distanceRef}
            value={this.distance}
            displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
            formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' })}
            class='bearing-info-distance'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders this display's bearing field.
   * @returns This display's bearing field, as a VNode.
   */
  private renderBearing(): VNode {
    return (
      <div class='bearing-info-bearing-container'>
        <div class='failed-box' />
        <div style={this.brgDisStyle}>
          <BearingDisplay
            ref={this.bearingRef}
            value={this.bearing}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
            formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
            class='bearing-info-bearing'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.distanceRef.getOrDefault()?.destroy();

    this.magVar.destroy();
    this.bearingState.destroy();
    this.identState.destroy();

    this.declutterSub?.destroy();
    this.sourceSub?.destroy();
    this.identSub?.destroy();
    this.distancePipe?.destroy();

    super.destroy();
  }
}