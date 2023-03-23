import { ComponentProps, ComputedSubject, DisplayComponent, EventBus, FSComponent, NavSourceType, Subject, VNode } from '@microsoft/msfs-sdk';

import { NavIndicatorContext } from '../../Navigation/NavIndicators/NavIndicatorContext';
import { WT21NavIndicators, WT21NavSource } from '../../Navigation/WT21NavIndicators';

import './BearingPointerDataFields.css';

/** @inheritdoc */
interface BearingPointerDataFieldsProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/** Displays info about active bearing pointers in bottom left of PFD. */
export class BearingPointerDataFields extends DisplayComponent<BearingPointerDataFieldsProps> {
  private readonly bearingPointerDataFieldsRef = FSComponent.createRef<HTMLDivElement>();

  public readonly setVisibility = (isVisible: boolean): void => {
    this.bearingPointerDataFieldsRef.instance.classList.toggle('hidden', !isVisible);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="bearingPointerDataFields" ref={this.bearingPointerDataFieldsRef}>
        <BearingPointerDataField bus={this.props.bus} bearingPointerNumber='1' />
        <BearingPointerDataField bus={this.props.bus} bearingPointerNumber='2' />
      </div>
    );
  }
}

/** @inheritdoc */
interface BearingPointerDataFieldProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Which bearing pointer is it. */
  bearingPointerNumber: '1' | '2';
}

/** Info for a specific bearing pointer. */
class BearingPointerDataField extends DisplayComponent<BearingPointerDataFieldProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly dataFieldRef = FSComponent.createRef<HTMLDivElement>();
  private readonly distanceRef = FSComponent.createRef<HTMLDivElement>();
  private readonly distanceSubject = ComputedSubject.create<number | null, string>(null, x => x ? x.toFixed(1) + 'NM' : '');
  private readonly labelSubject = Subject.create('');
  private readonly identSubject = ComputedSubject.create<string | null, string>(null, x => x || '');
  private readonly frequencyNAVSubject = ComputedSubject.create<number | null, string>(123, x => x?.toFixed(2) || '');
  private readonly frequencyADFSubject = ComputedSubject.create<number | null, string>(123, x => x?.toFixed(1) || '');
  private frequencyDisplayTimeout: number | null = null;

  /** @inheritdoc */
  public onAfterRender(): void {
    const { bearingPointerNumber } = this.props;

    const navIndicators = this.getContext(NavIndicatorContext).get();
    const bearingPointerIndicator = navIndicators.get(`bearingPointer${bearingPointerNumber}`);
    bearingPointerIndicator.distance.sub(this.distanceSubject.set.bind(this.distanceSubject), true);
    bearingPointerIndicator.ident.sub(this.identSubject.set.bind(this.identSubject), true);
    bearingPointerIndicator.isLocalizer.sub(this.handleNewIsLocalizer, true);
    bearingPointerIndicator.source.sub(this.handleNewSource, true);
    bearingPointerIndicator.activeFrequency.sub(this.frequencyNAVSubject.set.bind(this.frequencyNAVSubject), true);
    bearingPointerIndicator.activeFrequency.sub(this.frequencyADFSubject.set.bind(this.frequencyADFSubject), true);
    bearingPointerIndicator.activeFrequency.sub(this.startFrequencyDisplayTimeout);

    this.identSubject.sub(ident => {
      if (!this.frequencyDisplayTimeout) {
        // Show frequency when ident is not available
        this.dataFieldRef.instance.classList.toggle('showFrequency', !ident);
      }
    });
  }

  private readonly handleNewIsLocalizer = (isLocalizer: boolean | null): void => {
    this.dataFieldRef.instance.classList.toggle('isLocalizer', !!isLocalizer);
  };

  private readonly handleNewSource = (source: WT21NavSource | null): void => {
    if (!source) {
      this.dataFieldRef.instance.classList.toggle('visibility-hidden', true);
    } else {
      this.dataFieldRef.instance.classList.toggle('visibility-hidden', false);
      switch (source.getType()) {
        case NavSourceType.Nav:
          this.labelSubject.set(`VOR${this.props.bearingPointerNumber}`);
          this.startFrequencyDisplayTimeout();
          break;
        case NavSourceType.Gps:
          this.labelSubject.set(`FMS${this.props.bearingPointerNumber}`);
          break;
        case NavSourceType.Adf:
          this.labelSubject.set('ADF');
          break;
        default: throw new Error('unexpected nav source type');
      }

      this.dataFieldRef.instance.classList.toggle('NAV', source.getType() === NavSourceType.Nav);
      this.dataFieldRef.instance.classList.toggle('FMS', source.getType() === NavSourceType.Gps);
      this.dataFieldRef.instance.classList.toggle('ADF', source.getType() === NavSourceType.Adf);
    }
  };

  /** Show the frequency field (instead of the ident) (only when source is NAV) for 10 seconds, then hides it. */
  private readonly startFrequencyDisplayTimeout = (): void => {
    if (this.frequencyDisplayTimeout !== null) {
      window.clearTimeout(this.frequencyDisplayTimeout);
    }
    this.dataFieldRef.instance.classList.add('showFrequency');
    this.frequencyDisplayTimeout = window.setTimeout(() => {
      this.frequencyDisplayTimeout = null;
      // Only show ident if it has a value
      if (this.identSubject.get()) {
        this.dataFieldRef.instance.classList.remove('showFrequency');
      }
    }, 10000);
  };

  /** @inheritdoc */
  public render(): VNode {
    const arrowPath = this.props.bearingPointerNumber === '1'
      ? 'm 0 0 l 0 -21 m -8 18 l 8 -12 l 8 12'
      : 'M -3 0 l 0 -16 M -8 -9 l 8 -12 l 8 12 M 3 0 l 0 -16';
    return (
      <div class={`bearingPointer${this.props.bearingPointerNumber}`} ref={this.dataFieldRef}>
        <div class="bearingPointer-row bearingPointer-row1">
          <div class="bearingPointer-label">{this.labelSubject}</div>
          <svg class="bearingPointer-arrow-icon">
            <path d={arrowPath} />
          </svg>
          <div class="bearingPointer-distance" ref={this.distanceRef}>
            {this.distanceSubject}
          </div>
        </div>
        <div class="bearingPointer-row bearingPointer-row2">
          <div class="bearingPointer-ident">{this.identSubject}&nbsp;</div>
          <div class="bearingPointer-frequencyNAV">{this.frequencyNAVSubject}&nbsp;</div>
          <div class="bearingPointer-frequencyADF">{this.frequencyADFSubject}&nbsp;</div>
        </div>
      </div>
    );
  }
}