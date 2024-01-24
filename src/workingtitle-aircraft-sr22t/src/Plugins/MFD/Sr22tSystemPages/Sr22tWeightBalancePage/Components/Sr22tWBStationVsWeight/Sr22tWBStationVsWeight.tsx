import { ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, NodeReference, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';
import { UnitsUserSettings, UnitsWeightSettingMode } from '@microsoft/msfs-wtg1000';

import { StationVsWeightCurrentIcon, StationVsWeightLandingIcon, StationVsWeightTakeoffIcon } from './Sr22tWBStationVsWeightIcons';
import { Sr22tWBStationVsWeightConstants as Constants } from './Sr22tWBStationVsWeightConstants';
import { WeightBalanceStore } from '../../../Stores';

import './Sr22tWBStationVsWeight.css';

/** Component props for {@link Sr22tWBStationVsWeight}. */
export interface Sr22tWBStationVsWeightProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
  /** The weight and balance store. */
  store: WeightBalanceStore;
  /** Whether or not the component is zoomed. */
  isZoomed: Subscribable<boolean>;
}

/** A component which displays the SR22T's weight and balance envelope. */
export class Sr22tWBStationVsWeight extends DisplayComponent<Sr22tWBStationVsWeightProps> {

  /** The subscriptions array. */
  private subs: Subscription[] = [];

  private readonly takeoffData = this.props.store.cgAtTakeOff;
  private readonly currentData = this.props.store.cgCurrent;
  private readonly landingData = this.props.store.cgAtLanding;
  private readonly emptyData = this.props.store.cgZeroFuel;

  private readonly loadingOutsideDisplayArea = this.currentData.map(data => {
    return data.weight > Constants.DIAGRAM_WEIGHT_MAX || data.weight < Constants.DIAGRAM_WEIGHT_MIN
      || data.cgPosition > Constants.DIAGRAM_STATION_MAX || data.cgPosition < Constants.DIAGRAM_STATION_MIN;
  });

  private readonly loadingInvalidErrorRef = FSComponent.createRef<HTMLDivElement>();

  private readonly unitsSettingsManager = UnitsUserSettings.getManager(this.props.bus);
  private readonly weightUnit = this.unitsSettingsManager.getSetting('unitsWeight');

  // DIAGRAM ELEMENT REFS
  private readonly fuelBurnLineRef = FSComponent.createRef<SVGLineElement>();
  private readonly takeoffIconRef = FSComponent.createRef<HTMLDivElement>();
  private readonly landingIconRef = FSComponent.createRef<HTMLDivElement>();
  private readonly currentIconRef = FSComponent.createRef<HTMLDivElement>();
  private readonly fuelBurnLineLegendRef = FSComponent.createRef<SVGPathElement>();
  private readonly takeoffIconLegendRef = FSComponent.createRef<HTMLDivElement>();
  private readonly landingIconLegendRef = FSComponent.createRef<HTMLDivElement>();
  private readonly currentIconLegendRef = FSComponent.createRef<HTMLDivElement>();

  /** Updates the fuel burn line position when the weight or station changes.
   * @param startWeight The weight at the start of the line
   * @param startStation The station at the start of the line
   * @param endWeight The weight at the end of the line
   * @param endStation The station at the end of the line
   */
  private updateLinePosition(startWeight: number, startStation: number, endWeight: number, endStation: number): void {
    const diagramHeight = this.props.isZoomed.get() ? Constants.DIAGRAM_HEIGHT_ZOOMED : Constants.DIAGRAM_HEIGHT;
    const weightSpread = Constants.DIAGRAM_WEIGHT_MAX - Constants.DIAGRAM_WEIGHT_MIN;
    const stationSpread = Constants.DIAGRAM_STATION_MAX - Constants.DIAGRAM_STATION_MIN;
    const startWeightPixels = (startWeight - Constants.DIAGRAM_WEIGHT_MIN) / weightSpread * diagramHeight;
    const startStationPixels = (startStation - Constants.DIAGRAM_STATION_MIN) / stationSpread * Constants.DIAGRAM_WIDTH;
    const endWeightPixels = (endWeight - Constants.DIAGRAM_WEIGHT_MIN) / weightSpread * diagramHeight;
    const endStationPixels = (endStation - Constants.DIAGRAM_STATION_MIN) / stationSpread * Constants.DIAGRAM_WIDTH;
    this.fuelBurnLineRef.instance.x1.baseVal.value = startStationPixels;
    this.fuelBurnLineRef.instance.y1.baseVal.value = diagramHeight - startWeightPixels;
    this.fuelBurnLineRef.instance.x2.baseVal.value = endStationPixels;
    this.fuelBurnLineRef.instance.y2.baseVal.value = diagramHeight - endWeightPixels;
  }

  /** Updates the given icon's position based on weight and station values
   * @param weight The current weight value
   * @param station The current station value
   * @param ref The reference to the icon to move
   * @param iconOffset The distance to offset the icon by (half of the icon's width/height) in pixels
   */
  private updateIconPosition(weight: number, station: number, ref: NodeReference<HTMLDivElement>, iconOffset: number): void {
    const weightSpread = Constants.DIAGRAM_WEIGHT_MAX - Constants.DIAGRAM_WEIGHT_MIN;
    const stationSpread = Constants.DIAGRAM_STATION_MAX - Constants.DIAGRAM_STATION_MIN;
    const weightPixels = (weight - Constants.DIAGRAM_WEIGHT_MIN) / weightSpread * (this.props.isZoomed.get() ? Constants.DIAGRAM_HEIGHT_ZOOMED : Constants.DIAGRAM_HEIGHT);
    const stationPixels = (station - Constants.DIAGRAM_STATION_MIN) / stationSpread * Constants.DIAGRAM_WIDTH;

    ref.instance.style.transform = `translate(${stationPixels - iconOffset}px, ${-weightPixels + iconOffset}px)`;
  }

  /**
   * Gets the weight step for the given index and unit.
   * @param unit The weight unit currently in use
   * @param index The index of the step
   * @returns The weight step
   */
  private getWeightStep(unit: UnitsWeightSettingMode, index: number): number {
    return unit === UnitsWeightSettingMode.Pounds
      ? Constants.DIAGRAM_WEIGHT_STEPS_LB[index]
      : Constants.DIAGRAM_WEIGHT_STEPS_KG[index];
  }

  /**
   * Gets the station step for the given index and unit.
   * @param unit The weight unit currently in use
   * @param index The index of the step
   * @returns The station step
   */
  private getStationStep(unit: UnitsWeightSettingMode, index: number): number {
    return unit === UnitsWeightSettingMode.Pounds
      ? Constants.DIAGRAM_STATION_STEPS_IN[index]
      : Constants.DIAGRAM_STATION_STEPS_CM[index];
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subs.push(this.loadingOutsideDisplayArea.sub(loadingInvalid => {
      this.fuelBurnLineRef.instance.classList.toggle('hidden', loadingInvalid);
      this.takeoffIconRef.instance.classList.toggle('hidden', loadingInvalid);
      this.landingIconRef.instance.classList.toggle('hidden', loadingInvalid);
      this.currentIconRef.instance.classList.toggle('hidden', loadingInvalid);
      this.loadingInvalidErrorRef.instance.classList.toggle('hidden', !loadingInvalid);
    }, true));

    this.subs.push(MappedSubject
      .create(this.takeoffData, this.currentData, this.emptyData, this.props.isZoomed)
      .sub(([takeoffData, currentData, emptyData]) => {
        this.updateLinePosition(takeoffData?.weight ?? currentData.weight, takeoffData?.cgPosition ?? currentData.cgPosition, emptyData.weight, emptyData.cgPosition);
        const fuelBurnInvalid = takeoffData ? takeoffData.isOutOfCGEnvelope : currentData.isOutOfCGEnvelope || emptyData.isOutOfCGEnvelope;
        this.fuelBurnLineRef.instance.classList.toggle('warning', fuelBurnInvalid);
        this.fuelBurnLineLegendRef.instance.classList.toggle('warning', fuelBurnInvalid);
      }, true)
    );

    this.subs.push(MappedSubject
      .create(this.takeoffData, this.currentData, this.props.isZoomed)
      .sub(([takeoffData, currentData]) => {
        this.updateIconPosition(takeoffData?.weight ?? currentData.weight, takeoffData?.cgPosition ?? currentData.cgPosition, this.takeoffIconRef, 7);
        const takeoffDataInvalid = takeoffData ? takeoffData.isOutOfCGEnvelope : currentData.isOutOfCGEnvelope;
        this.takeoffIconRef.instance.classList.toggle('warning', takeoffDataInvalid);
        this.takeoffIconLegendRef.instance.classList.toggle('warning', takeoffDataInvalid);
      }, true));

    this.subs.push(MappedSubject.create(this.landingData, this.props.isZoomed).sub(([data]) => {
      this.updateIconPosition(data.weight, data.cgPosition, this.landingIconRef, 6.5);
      this.landingIconRef.instance.classList.toggle('warning', data.isOutOfCGEnvelope);
      this.landingIconLegendRef.instance.classList.toggle('warning', data.isOutOfCGEnvelope);
    }, true));

    this.subs.push(MappedSubject.create(this.currentData, this.props.isZoomed).sub(([data]) => {
      this.updateIconPosition(data.weight, data.cgPosition, this.currentIconRef, 8.5);
      this.currentIconRef.instance.classList.toggle('warning', data.isOutOfCGEnvelope);
      this.currentIconLegendRef.instance.classList.toggle('warning', data.isOutOfCGEnvelope);
    }, true));
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{
        'sr22t-system-page-section': true,
        'sr22t-wb-page-station-vs-weight': true,
        'station-vs-weight-zoomed': this.props.isZoomed,
      }}>
        <div class="sr22t-system-page-section-title">Station vs Weight</div>
        <div class="loaded-weight-label">
          Loaded Weight {this.weightUnit.map(v => v === UnitsWeightSettingMode.Pounds ? 'LB' : 'KG')}
        </div>
        <div class="loaded-station-label">
          Loaded Station - {this.weightUnit.map(v => v === UnitsWeightSettingMode.Pounds ? 'Inches' : 'Centimeters')} Aft of Datum
        </div>
        <div class="station-vs-weight-diagram-container">
          <svg class="background-grid-with-envelope" viewBox="0 0 400 480">
            {/* small vertical lines - does not change with zoom */}
            <path d="M 40 0 L 40 480 M 80 0 L 80 480 M 120 0 L 120 480 M 160 0 L 160 480 M 200 0 L 200 480
                     M 240 0 L 240 480 M 280 0 L 280 480 M 320 0 L 320 480 M 360 0 L 360 480"
              stroke="#282828" stroke-width="1" fill="none"
            />
            {/* small horizontal lines */}
            <path class="small-diagram"
              d="M 0 21 L 400 21 M 0 42 L 400 42 M 0 63 L 400 63 M 0 84 L 400 84 M 0 105 L 400 105
                     M 0 126 L 400 126 M 0 147 L 400 147 M 0 168 L 400 168 M 0 189 L 400 189"
              stroke="#282828" stroke-width="1" fill="none"
            />
            <path class="zoomed-diagram"
              d="M 0 48 L 400 48 M 0 96 L 400 96 M 0 144 L 400 144 M 0 192 L 400 192 M 0 240 L 400 240
                  M 0 288 L 400 288 M 0 336 L 400 336 M 0 384 L 400 384 M 0 432 L 400 432"
              stroke="#282828" stroke-width="1" fill="none"
            />
            {/* main vertical lines - does not change with zoom */}
            <path d="M 20 0 L 20 480 M 60 0 L 60 480 M 100 0 L 100 480 M 140 0 L 140 480 M 180 0 L 180 480
                     M 220 0 L 220 480 M 260 0 L 260 480 M 300 0 L 300 480 M 340 0 L 340 480 M 380 0 L 380 480"
              stroke="#404040" stroke-width="1" fill="none"
            />
            {/* main horizontal lines */}
            <path class="small-diagram"
              d="M 0 10 L 400 10 M 0 30 L 400 30 M 0 52 L 400 52 M 0 73 L 400 73 M 0 94 L 400 94
                     M 0 115 L 400 115 M 0 137 L 400 137 M 0 158 L 400 158 M 0 179 L 400 179 M 0 200 L 400 200"
              stroke="#404040" stroke-width="1" fill="none"
            />
            <path class="zoomed-diagram"
              d="M 0 23 L 400 23 M 0 72 L 400 72 M 0 120 L 400 120 M 0 168 L 400 168 M 0 217 L 400 217
                  M 0 265 L 400 265 M 0 313 L 400 313 M 0 361 L 400 361 M 0 409 L 400 409 M 0 457 L 400 457"
              stroke="#404040" stroke-width="1" fill="none"
            />
            {/* cg envelope */}
            <path class="small-diagram" d="M 90 184 L 302 184 L 302 52 L 201 52 L 117 131 z" stroke="#FFFFFF" stroke-width="2" fill="none" />
            <path class="zoomed-diagram" d="M 90 420.6 L 302 420.6 L 302 120 L 201 120 L 117 300 z" stroke="#FFFFFF" stroke-width="2" fill="none" />
            <line ref={this.fuelBurnLineRef} x1="0px" y1="0px" x2="0px" y2="0px" stroke="#00FF00" stroke-width="3" />
          </svg>
          <StationVsWeightLandingIcon ref={this.landingIconRef} />
          <StationVsWeightCurrentIcon ref={this.currentIconRef} />
          <StationVsWeightTakeoffIcon ref={this.takeoffIconRef} />
          <div class="invalid-load-warning" ref={this.loadingInvalidErrorRef}>
            <div class="invalid-load-warning-line">CURRENT LOADING</div>
            <div class="invalid-load-warning-line">OUTSIDE DISPLAY AREA</div>
          </div>
        </div>
        <div class="station-vs-weight-weight-steps">
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 9))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 8))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 7))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 6))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 5))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 4))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 3))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 2))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 1))}</div>
          <div>{this.weightUnit.map(v => this.getWeightStep(v, 0))}</div>
        </div>
        <div class="station-vs-weight-station-steps">
          <div>{this.weightUnit.map(v => this.getStationStep(v, 0))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 1))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 2))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 3))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 4))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 5))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 6))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 7))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 8))}</div>
          <div>{this.weightUnit.map(v => this.getStationStep(v, 9))}</div>
        </div>
        <div class="station-vs-weight-legend-container">
          <div class="station-vs-weight-legend-single-row">
            <div class="station-vs-weight-legend-item">
              Take Off
              <StationVsWeightTakeoffIcon ref={this.takeoffIconLegendRef} />
            </div>
            <div class="station-vs-weight-legend-item legend-landing">
              Landing
              <StationVsWeightLandingIcon ref={this.landingIconLegendRef} />
            </div>
            <div class="station-vs-weight-legend-item">
              Current
              <StationVsWeightCurrentIcon ref={this.currentIconLegendRef} />
            </div>
          </div>
          <div class="station-vs-weight-legend-second-row">
            <div class="station-vs-weight-legend-item">
              Normal <br /> Envelope
              <svg viewBox="0 0 15 12" width="15px" height="12px">
                <path d="M 0 0 L 15 0 L 15 12 L 0 12 Z" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round" fill="none" />
              </svg>
            </div>
            <div class="station-vs-weight-legend-fuel-burn">
              <div class="legend-fuel-burn-label">
                Fuel burn
              </div>
              <div class="legend-fuel-burn-line-container">
                <svg viewBox="0 0 39 3" width="39px" height="3px">
                  <path ref={this.fuelBurnLineLegendRef} d="M 0 1.5 L 39 1.5" stroke="#00FF00" stroke-width="3" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subs.forEach(sub => sub.pause());
  }

  /** @inheritdoc */
  public resume(): void {
    this.subs.forEach(sub => sub.resume());
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}
