import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, NumberFormatter, NumberUnitSubject, ObjectSubject,
  Subscribable, Subscription, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { NavReferenceSource, NumberUnitDisplay } from '@microsoft/msfs-garminsdk';

import { G3XTouchNavIndicator, G3XTouchNavSourceName } from '../../../Shared/NavReference/G3XTouchNavReference';
import { G3XUnitsUserSettingManager } from '../../../Shared/Settings/G3XUnitsUserSettings';

import './BearingInformationDisplay.css';

/**
 * Component props for {@link BearingInformationDisplay}.
 */
export interface BearingInformationDisplayProps extends ComponentProps {
  /** The index of the bearing pointer associaed with the display. */
  index: 1 | 2;

  /** The nav indicator associated with the bearing info display. */
  indicator: G3XTouchNavIndicator;

  /** A manager for display unit user settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/** Engine data indication display component for the G3X Touch */
export class BearingInformationDisplay extends DisplayComponent<BearingInformationDisplayProps> {

  private readonly distanceRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly bearingInfoState = MappedSubject.create(
    this.props.indicator.source,
    this.props.indicator.ident,
    this.props.indicator.distance
  );

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly distanceStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly outerTextStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly innerText = MappedSubject.create(
    ([isLocalizer, ident, source]) => {
      if (source !== null) {
        if (ident === null) {
          //If there is no ident
          if (source.name === 'NRST') {
            return 'NO APT';
          } else {
            return 'NO DATA';
          }
        } else {
          //If there is an ident, the inner display (cyan) should display the ident
          return isLocalizer ? 'ILS' : ident;
        }
      } else {
        return '';
      }
    },
    this.props.indicator.isLocalizer,
    this.props.indicator.ident,
    this.props.indicator.source
  );

  private readonly outerText = MappedSubject.create(
    ([ident, source, isLocalizer, distance]) => {
      if (source !== null && (ident === null || distance === null)) {
        if (source.name === 'NRST') {
          return '__._';
        } else if (source.name === 'GPS1' || source.name === 'GPS2') {
          return 'GPS';
        } else if (source.name === 'NAV1' || source.name === 'NAV2') {
          return isLocalizer ? 'LOC' : 'VOR';
        }
      }

      return '';
    },
    this.props.indicator.ident,
    this.props.indicator.source,
    this.props.indicator.isLocalizer,
    this.props.indicator.distance
  );

  private readonly distance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  private declutterSub?: Subscription;
  private distancePipe?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.distancePipe = this.props.indicator.distance.pipe(this.distance, distance => distance ?? NaN, true);

    const stateSub = this.bearingInfoState.sub(this.onStateChanged.bind(this), false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.bearingInfoState.pause();
        stateSub.pause();
        this.distancePipe?.pause();
        this.rootStyle.set('display', 'none');
      } else {
        this.bearingInfoState.resume();
        stateSub.resume(true);
      }
    }, true);
  }

  /**
   * Handles if the state needs to change (background showing, showing distance, showing ident)
   * @param state the state the bearing pointer is in.
   */
  private onStateChanged(state: readonly [NavReferenceSource<G3XTouchNavSourceName> | null, string | null, number | null]): void {
    const [source, ident, distance] = state;

    if (source === null) {
      this.distancePipe?.pause();
      this.rootStyle.set('display', 'none');
      return;
    }

    this.rootStyle.set('display', '');
    if (ident === null || distance === null) {
      this.distancePipe?.pause();
      this.distanceStyle.set('display', 'none');
      this.outerTextStyle.set('display', '');
    } else {
      this.outerTextStyle.set('display', 'none');
      this.distanceStyle.set('display', '');
      this.distancePipe?.resume(true);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={`bearing-information-display-container bearing-information-display-container-${this.props.index === 2 ? 'right' : 'left'}`}
        style={this.rootStyle}
      >
        {this.renderInfoBackground()}
        {this.renderInfo()}
      </div>
    );
  }

  /**
   * Renders this display's bearing info background
   * @returns This display's bearing info background, as a VNode.
   */
  private renderInfoBackground(): VNode {
    return (
      <svg viewBox='0 0 182 25' class='bearing-information-background'>
        <path
          d='M 0 25 h 182 a 160 160 0 0 1 -40 -25 h -137 a 5 5 0 0 0 -5 5 Z'
          transform={this.props.index === 2 ? 'translate(91, 12.5) scale(-1, 1) translate(-91, -12.5)' : ''}
        />
      </svg>
    );
  }

  /**
   * Renders this display's bearing info
   * @returns This display's bearing info, as a VNode.
   */
  private renderInfo(): VNode {
    return (
      <div class='bearing-information-display'>
        <div class='bearing-information-display-outer' style={this.distanceStyle}>
          <NumberUnitDisplay
            ref={this.distanceRef}
            value={this.distance}
            displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
            formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '_.__' })}
            class='bearing-info-distance'
          />
        </div>
        <div class='bearing-information-display-outer' style={this.outerTextStyle}>
          {this.outerText}
        </div>
        <div class='bearing-information-left-display-inner'>{this.innerText}</div>
        <svg viewBox='0 0 24 12' preserveAspectRatio='none' class='bearing-information-display-icon'>
          {
            this.props.index === 2
              ? <path d='M 24 6 h -6 m -6 -6 l 6 6 l -6 6 m 3 -3 h -10 v -6 h 10 m -10 3 h -5' vector-effect='non-scaling-stroke' />
              : <path d='M 0 6 h 24 M 12 0 l -6 6 l 6 6' vector-effect='non-scaling-stroke' />
          }
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.distanceRef.getOrDefault()?.destroy();
    this.declutterSub?.destroy();
    this.distancePipe?.destroy();
    this.bearingInfoState.destroy();
    super.destroy();
  }
}
