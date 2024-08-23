/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ComponentProps, ComputedSubject, DisplayComponent, EventBus, FlightPlanPredictorUtils, FSComponent, GNSSEvents, NavSourceType, Subject, VNode
} from '@microsoft/msfs-sdk';

import { NavIndicatorContext } from '../../Navigation/NavIndicators/NavIndicatorContext';
import { WT21NavIndicator, WT21NavIndicators, WT21NavSource } from '../../Navigation/WT21NavIndicators';
import { WaypointAlerter } from '../WaypointAlerter';

import './NavSourceDataField.css';

/** @inheritdoc */
interface NavSourceDataFieldProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A waypoint alerter instance that controls display of waypoint alert flashing. */
  waypointAlerter: WaypointAlerter;
}

/** @inheritdoc */
export class NavSourceDataField extends DisplayComponent<NavSourceDataFieldProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly navSourceDataFieldRef = FSComponent.createRef<HTMLDivElement>();
  private readonly navFlashGroupRef = FSComponent.createRef<HTMLDivElement>();
  private readonly sourceLabelSubject = Subject.create('TBD1');
  private readonly frequencySubject = ComputedSubject.create<number | null, string>(
    null, x => x === null ? '' : x.toFixed(2));
  private readonly dtkCrsLabelSubject = Subject.create('DTK');
  private readonly dtkCrsValueSubject = ComputedSubject.create<number | null, string>(
    null, x => x === null ? '---' : (x === 0 ? 360 : x).toFixed(0).padStart(3, '0'));
  private readonly identSubject = Subject.create<string | null>('IDT');
  private readonly ttgSubject = ComputedSubject.create<number | null, string>(0, s => {
    if (s === null) {
      return '--:--';
    }

    const minutes = Math.ceil(s / 60) % 60;
    const hours = Math.floor(s / 3600);

    return `${hours > 0 ? hours.toFixed(0).padStart(2, ' ') : '  '}:${minutes.toFixed(0).padStart(2, '0')}`;
  });
  private readonly distanceSubject = ComputedSubject.create<number | null, string>(
    null, x => (x === null || x < 0) ? '----' : x.toFixed(x >= 100 ? 0 : 1));
  private readonly groundSpeedSubject = Subject.create(0);

  private courseNeedleIndicator!: WT21NavIndicator;

  /** @inheritdoc */
  public onAfterRender(): void {
    const navIndicators = this.getContext(NavIndicatorContext).get();
    this.courseNeedleIndicator = navIndicators.get('courseNeedle');
    this.courseNeedleIndicator.source.sub(this.handleNewSource, true);
    this.courseNeedleIndicator.ident.sub(this.identSubject.set.bind(this.identSubject), true);
    this.courseNeedleIndicator.activeFrequency.sub(this.frequencySubject.set.bind(this.frequencySubject), true);
    this.courseNeedleIndicator.course.sub(this.dtkCrsValueSubject.set.bind(this.dtkCrsValueSubject), true);
    this.courseNeedleIndicator.isLocalizer.sub(this.updateSourceLabel, true);

    this.courseNeedleIndicator.distance.sub(d => {
      this.distanceSubject.set(d);
      this.handleTtgChanged();
    }, true);

    this.props.bus.getSubscriber<GNSSEvents>().on('ground_speed').withPrecision(0).handle(s => {
      this.groundSpeedSubject.set(s);
      this.handleTtgChanged();
    });

    this.props.waypointAlerter.isDisplayed.sub(isDisplayed => {
      this.navFlashGroupRef.instance.classList.toggle('flash-off', !isDisplayed);
    });
  }

  /**
   * Handles when the TTG changes, and manages the waypoint alert flashing.
   */
  private handleTtgChanged(): void {
    let d = this.distanceSubject.getRaw();
    let ttg = Number.POSITIVE_INFINITY;

    if (d !== null) {
      d = Math.round(d * 1000) / 1000;
      ttg = FlightPlanPredictorUtils.predictTime(this.groundSpeedSubject.get(), d);
      this.ttgSubject.set(isFinite(ttg) ? ttg : null);
    } else {
      this.ttgSubject.set(null);
    }
  }

  private readonly handleNewSource = (source: WT21NavSource | null): void => {
    if (!source) {
      throw new Error('This should not happen');
    }
    this.navSourceDataFieldRef.instance.classList.toggle('NAV', source.getType() === NavSourceType.Nav);
    this.navSourceDataFieldRef.instance.classList.toggle('FMS', source.getType() === NavSourceType.Gps);

    this.updateSourceLabel();
  };

  private readonly updateSourceLabel = (): void => {
    const isLocalizer = this.courseNeedleIndicator.isLocalizer.get();
    const source = this.courseNeedleIndicator.source.get()!;

    switch (source.getType()) {
      case NavSourceType.Nav:
        if (isLocalizer) {
          this.sourceLabelSubject.set('LOC' + source.index);
        } else {
          this.sourceLabelSubject.set('VOR' + source.index);
        }
        this.dtkCrsLabelSubject.set('CRS');
        break;
      case NavSourceType.Gps:
        this.sourceLabelSubject.set('FMS' + source.index);
        this.dtkCrsLabelSubject.set('DTK');
        break;
      default: throw new Error('unexpected nav source type');
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="navSourceDataField" ref={this.navSourceDataFieldRef}>
        <div class="navSourceDataFieldLine line1">
          <div class="source">{this.sourceLabelSubject}</div>
          <div class="frequency">{this.frequencySubject}</div>
        </div>
        <div class="navSourceDataFieldLine line2">
          <div class="dtk-crs-label">{this.dtkCrsLabelSubject}</div>
          <div class="dtk-crs-value">{this.dtkCrsValueSubject}</div>
        </div>
        <div ref={this.navFlashGroupRef}>
          <div class="navSourceDataFieldLine line3">
            <div class="ident">{this.identSubject}&nbsp;</div>
          </div>
          <div class="navSourceDataFieldLine line4">
            <div class="ttg-label">TTG</div>
            <div class="ttg-value">{this.ttgSubject}</div>
          </div>
          <div class="navSourceDataFieldLine line5">
            <div class="distance-value">{this.distanceSubject}</div>
            <div class="distance-unit">NM</div>
          </div>
        </div>
      </div>
    );
  }
}