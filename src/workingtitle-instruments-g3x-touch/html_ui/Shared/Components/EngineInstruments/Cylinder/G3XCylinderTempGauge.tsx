import { ArrayUtils, ComponentProps, FSComponent, MappedSubject, MathUtils, Subject, SubscribableMapFunctions, VNode, XMLHostedLogicGauge } from '@microsoft/msfs-sdk';

import { G3XBaseGauge } from '../G3XBaseGauge';
import { CylinderColumn, CylinderTypes } from './CylinderTypes';
import { G3XCylinderGaugeProps } from '../../G3XGaugesConfigFactory/Gauges/G3XCylinderGaugeProps';
import { G3XGaugeColorZoneColor } from '../../G3XGaugesConfigFactory';

import './G3XEnginePageCylinderTempGauge.css';
import './G3XEISCylinderTempGauge.css';

/**
 * A cylinders temp gauge.
 */
export class G3XCylinderTempGauge extends G3XBaseGauge<Partial<G3XCylinderGaugeProps> & XMLHostedLogicGauge & ComponentProps> {
  private static readonly randomNumbersTemplate = Array(40).fill(0).map(Math.random);
  private readonly randomizer = [...G3XCylinderTempGauge.randomNumbersTemplate];
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly backgroundFrameRef = FSComponent.createRef<HTMLDivElement>();
  private readonly foregroundFrameRef = FSComponent.createRef<HTMLDivElement>();
  private readonly chtValuesContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly egtValuesContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly egtValuesLeftLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly egtValuesRightLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly egtCylindersContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly chtContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly egtPeakCylindersContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly numCylinders = this.props.numCylinders ?? 4;
  private readonly numColumns = this.props.isTwinEngine ? this.numCylinders * 2 : this.numCylinders;
  private readonly currentEgtValues = ArrayUtils.create(this.numColumns, () => Subject.create(0));
  private readonly hottestEgtCylinderValue = MappedSubject.create(
    SubscribableMapFunctions.max(),
    ...this.currentEgtValues,
  );

  private egtMinimum = 0;
  private egtMaximum = 0;
  private chtMinimum = 0;
  private chtMaximum = 0;
  private readonly columnMap = new Array<CylinderColumn>();
  private tempOrder = new Array<number>();
  private readonly timeouts = new Array<NodeJS.Timeout>();
  private ticks = new Array<number>();
  private chtColorLines = new Array<{
    /** color */
    color: string,
    /** position temperature */
    position: number
  }>();
  private egtColorZones = new Array<{
    /** color */
    color: G3XGaugeColorZoneColor,
    /** begin position temperature */
    begin: number,
    /** end position temperature */
    end: number
  }>();

  private chtColorZones = new Array<{
    /** color */
    color: G3XGaugeColorZoneColor,
    /** begin position temperature */
    begin: number,
    /** end position temperature */
    end: number
  }>();

  private usePeakMode = false;
  private readonly hottestChtCylinderValue = Subject.create(0);
  private peaksAppearanceOrder = new Array<Array<number>>();

  private readonly chtHottestTempBackgroundColor = this.hottestChtCylinderValue.map(value => {
    const zone = this.chtColorZones.find(
      coneCandidate => value >= coneCandidate.begin && value <= coneCandidate.end
    );
    if (zone?.color && this.mapColorToIsWarningZoneValue(zone.color)) {
      return zone.color;
    } else {
      return 'none';
    }
  });

  private readonly chtHottestTempTextColor = this.hottestChtCylinderValue.map(value => {
    const zone = this.chtColorZones.find(
      coneCandidate => value >= coneCandidate.begin && value <= coneCandidate.end
    );
    if (zone?.color && this.mapColorToIsWarningZoneValue(zone.color)) {
      return zone.color === G3XGaugeColorZoneColor.Red ? 'var(--g3x-color-white)' : 'var(--g3x-color-black)';
    } else {
      return 'var(--g3x-color-white)';
    }
  });

  private readonly egtHottestTempBackgroundColor = this.hottestEgtCylinderValue.map(value => {
    const zone = this.egtColorZones.find(
      coneCandidate => value >= coneCandidate.begin && value <= coneCandidate.end
    );
    if (zone?.color && this.mapColorToIsWarningZoneValue(zone.color)) {
      return zone.color;
    } else {
      return 'none';
    }
  });

  private readonly egtHottestTempTextColor = this.hottestEgtCylinderValue.map(value => {
    const zone = this.egtColorZones.find(
      coneCandidate => value >= coneCandidate.begin && value <= coneCandidate.end
    );
    if (zone?.color && this.mapColorToIsWarningZoneValue(zone.color)) {
      return zone.color === G3XGaugeColorZoneColor.Red ? 'var(--g3x-color-white)' : 'var(--g3x-color-black)';
    } else {
      return 'var(--g3x-color-white)';
    }
  });

  /** @inheritDoc */
  protected initGauge(): void {

    this.egtMinimum = this.props.minimum?.getValueAsNumber() ?? 0;
    this.egtMaximum = this.props.maximum?.getValueAsNumber() ?? 0;
    this.chtMinimum = this.props.minimum2?.getValueAsNumber() ?? 0;
    this.chtMaximum = this.props.maximum2?.getValueAsNumber() ?? 0;

    this.cleanAndHidePeakVisuals();

    if (this.props.egtTicks) {
      this.ticks = this.props.egtTicks.map(tick => tick.getValueAsNumber());
    }

    if (this.props.colorZones) {
      this.egtColorZones = this.props.colorZones.map(zone => ({
        color: zone.color,
        begin: zone.begin.getValueAsNumber(),
        end: zone.end.getValueAsNumber(),
      }));
    }

    if (this.props.colorZones2) {
      this.chtColorZones = this.props.colorZones2.map(zone => ({
        color: zone.color,
        begin: zone.begin.getValueAsNumber(),
        end: zone.end.getValueAsNumber()
      }));
    }

    if (this.props.colorLines2) {
      this.chtColorLines = this.props.colorLines2.map(line => ({
        color: line.color,
        position: line.position.getValueAsNumber()
      }));
    }

    if (this.props.value1) {
      this.props.logicHost?.addLogicAsNumber(
        this.props.value1,
        val => this.updateEgtValue(val, 0),
        2,
        this.props.smoothFactor
      );
    }

    if (this.props.value2) {
      this.props.logicHost?.addLogicAsNumber(
        this.props.value2,
        val => this.updateChtValue(val, 0),
        2,
        this.props.smoothFactor
      );
    }

    if (this.props.value3) {
      this.props.logicHost?.addLogicAsNumber(
        this.props.value3,
        val => this.updateEgtValue(val, 1),
        2,
        this.props.smoothFactor
      );
    }

    if (this.props.value4) {
      this.props.logicHost?.addLogicAsNumber(
        this.props.value4,
        val => this.updateChtValue(val, 1),
        2,
        this.props.smoothFactor
      );
    }

    this.tempOrder = this.getSafeTempOrder();

    const cylinders = new Array<CylinderTypes>();

    //This part is cloned from WTG1000 CylinderSet::onAfterRender(). It is used to simulate the GAMI spread of values.
    const egtAdjFactor = ((this.egtMaximum - this.egtMinimum) * 0.075) / this.egtMaximum;
    const chtAdjFactor = ((this.chtMaximum - this.chtMinimum) * 0.075) / this.chtMaximum;

    for (let i = 0; i < this.numColumns; i++) {
      const chtFactor = (this.randomizer.pop() ?? Math.random()) * 2 * chtAdjFactor + 1 - chtAdjFactor;
      const egtFactor = (this.randomizer.pop() ?? Math.random()) * 2 * egtAdjFactor + 1 - egtAdjFactor;

      // This is G3X improvement to simulating GAMI spread factor for values dynamics
      const egtDelayFactor = (this.randomizer.pop() ?? Math.random()) * 1500;
      cylinders.push(new CylinderTypes(chtFactor, egtFactor, egtDelayFactor));
    }

    for (let i = 0; i < this.numColumns; i++) {
      const egtColumnRef = FSComponent.createRef<HTMLDivElement>();
      const egtColumnPeakRef = FSComponent.createRef<HTMLDivElement>();
      const chtIndicatorRef = FSComponent.createRef<HTMLDivElement>();
      const chtPeakLabelRef = FSComponent.createRef<HTMLDivElement>();
      const numLabelRef = FSComponent.createRef<HTMLSpanElement>();
      const chtValueRef = FSComponent.createRef<HTMLDivElement>();
      const egtValueRef = FSComponent.createRef<HTMLDivElement>();

      const secondEngineMarginOffset = (this.props.isTwinEngine && i === this.numColumns / 2)
        ? { 'margin-left': 'var(--dual-engine-separator-width)' }
        : {};
      const cylinderNumber = this.props.isTwinEngine && (i + 1) > this.numColumns / 2
        ? (i + 1) - this.numColumns / 2
        : i + 1;

      //EGT
      FSComponent.render(
        <div class='egt cyl-container' style={secondEngineMarginOffset}>
          <div class='cyl-vertical-line' />
          <div class='cyl-peak-column' ref={egtColumnPeakRef} />
          <div class='cyl-peak-column-value-label' ref={chtPeakLabelRef} />
          <div class='cyl-column' ref={egtColumnRef} />
          <div
            ref={numLabelRef}
            class={{
              'cyl-number': true,
              'cyl-number-background': this.props.value1 === undefined,
            }}
          >
            {cylinderNumber.toString()}
          </div>
        </div>,
        this.egtCylindersContainerRef.instance);

      //CHT
      if (this.props.value2) {
        FSComponent.render(
          <div class='cht cyl-container' style={secondEngineMarginOffset}>
            <div class='cyl-indicator' ref={chtIndicatorRef}></div>
          </div>,
          this.chtContainerRef.instance
        );
        FSComponent.render(
          <div class='cht-value' style={secondEngineMarginOffset} ref={chtValueRef} />,
          this.chtValuesContainerRef.instance
        );
      }
      if (this.props.value1) {
        FSComponent.render(
          <div class='egt-value' style={secondEngineMarginOffset} ref={egtValueRef} />,
          this.egtValuesContainerRef.instance
        );
      }

      this.columnMap[i] = {
        egtColumnRef,
        egtColumnPeakRef,
        chtIndicatorRef,
        chtPeakLabelRef,
        numLabelRef,
        egtValueRef,
        chtValueRef,
        cylinder: cylinders[this.tempOrder.indexOf(i + 1)],
      };
    }

    const sub = this.props.bus?.getSubscriber<any>();
    if (sub && this.props.peakModeTriggerBusEvent) {
      sub.on(this.props.peakModeTriggerBusEvent).handle(state => {
        this.usePeakMode = state;
        if (!state) {
          this.cleanAndHidePeakVisuals();
        }
      });
    } else if (!sub && this.props.peakModeTriggerBusEvent) {
      throw Error('Bus is not provided to use peak mode.');
    }

    for (let i = 0; i < this.ticks.length; i++) {
      FSComponent.render(
        <hr
          class='cyl-tick'
          style={{
            bottom: `${(this.ticks[i] - this.chtMinimum) / (this.chtMaximum - this.chtMinimum) * 100}%`
          }}
        />,
        this.backgroundFrameRef.instance
      );
    }
    for (let i = 0; i < this.egtColorZones.length; i++) {
      const cylinderBottom = (this.egtColorZones[i].begin - this.egtMinimum) / (this.egtMaximum - this.egtMinimum) * 100;
      const cylinderHeight = (this.egtColorZones[i].end - this.egtColorZones[i].begin) / (this.egtMaximum - this.egtMinimum) * 100;
      FSComponent.render(
        <>
          <div
            class='cyl-egt-color-zone'
            style={{
              background: this.egtColorZones[i].color,
              bottom: `${cylinderBottom}%`,
              height: `${cylinderHeight}%`
            }}
          />
          <div
            class='cyl-egt-color-cover'
            style={{
              bottom: `${cylinderBottom}%`,
              height: `${cylinderHeight}%`
            }}
          />
        </>,
        this.backgroundFrameRef.instance
      );
    }
    for (let i = 0; i < this.chtColorZones.length; i++) {
      const cylinderBottom = (this.chtColorZones[i].begin - this.chtMinimum) / (this.chtMaximum - this.chtMinimum) * 100;
      const cylinderHeight = (this.chtColorZones[i].end - this.chtColorZones[i].begin) / (this.chtMaximum - this.chtMinimum) * 100;
      FSComponent.render(
        <>
          <div
            class='cyl-cht-color-zone'
            style={{
              background: this.chtColorZones[i].color,
              bottom: `${cylinderBottom}%`,
              height: `${cylinderHeight}%`
            }}
          />
          <div
            class='cyl-cht-color-cover'
            style={{
              bottom: `${cylinderBottom}%`,
              height: `${cylinderHeight}%`
            }}
          />
        </>,
        this.backgroundFrameRef.instance
      );
    }
    for (let i = 0; i < this.chtColorLines.length; i++) {
      FSComponent.render(
        <hr
          class='cyl-color-line'
          style={{
            background: this.chtColorLines[i].color,
            bottom: `${(this.chtColorLines[i].position - this.chtMinimum) / (this.chtMaximum - this.chtMinimum) * 100}%`
          }}
        />,
        this.props.style?.displayColorLinesOnTop ? this.foregroundFrameRef.instance : this.backgroundFrameRef.instance
      );
    }
  }

  /** @inheritdoc */
  protected renderGauge(): VNode {
    return (
      <div
        class='cylinder-gauge-container'
        ref={this.containerRef}
      >
        {/* for ticks, color zones */}
        <div class='outer-frame' ref={this.backgroundFrameRef} />
        {/* for egt cylinders, egt peak cylinders */}
        <div class='inner-frame'>
          <div class='temp-array' ref={this.egtPeakCylindersContainerRef}></div>
          <div class='temp-array' ref={this.egtCylindersContainerRef} />
        </div>
        {/* for color lines */}
        <div class='outer-frame' ref={this.foregroundFrameRef}>
          {this.props.isTwinEngine && <div class='double-engine-separator' />}
        </div>
        {/* for cht indicators */}
        <div class='inner-frame'>
          <div class='cht temp-array' ref={this.chtContainerRef} />
        </div>
        {/* hottest egt value text label, used in eis version */}
        <div
          class='egt-hottest-temp-value'
          style={{
            background: this.egtHottestTempBackgroundColor,
            color: this.egtHottestTempTextColor
          }}
        >
          <div>EGT {this.props.unit}</div>
          <div class='size20'>{this.hottestEgtCylinderValue}</div>
        </div>
        {/* hottest cht value text label, used in eis version */}
        <div
          class='cht-hottest-temp-value'
          style={{
            background: this.chtHottestTempBackgroundColor,
            color: this.chtHottestTempTextColor
          }}
        >
          <div>CHT {this.props.unit}</div>
          <div class='size20'>{this.hottestChtCylinderValue}</div>
        </div>
        {/* each cylinders cht value, used in engine display version */}
        {this.props.value2 && (
          <div class='cht-values'>
            <div class='cht-values-label'>CHT</div>
            <div class='cht-values-unit'>{this.props.unit}</div>
            <div class='cht-values-container' ref={this.chtValuesContainerRef} />
          </div>
        )}
        {/* each cylinders egt value, used in engine display version */}
        {this.props.value1 && (
          <div class='egt-values'>
            <div class='egt-values-left-label' ref={this.egtValuesLeftLabelRef}>LEAN</div>
            <div class='egt-values-container' ref={this.egtValuesContainerRef} />
            <div class='egt-values-right-label' ref={this.egtValuesRightLabelRef}>EGT</div>
          </div>
        )}
        {/* frame borders */}
        <div class='outer-frame'>
          <div class='left-border' />
          <div class='left-bottom-dash' />
          <div class='bottom-border' />
          <div class='right-border' />
          <div class='right-top-dash' />
          <div class='top-border' />
        </div>
      </div>
    );
  }

  /**
   * hiding visuals for peak temps and cleaning peak data.
   */
  private cleanAndHidePeakVisuals(): void {
    for (const column of this.columnMap) {
      column.chtPeakLabelRef.instance.style.display = 'none';
      if (this.props.value1) {
        column.egtColumnRef.instance.classList.toggle('peak-background', false);
        column.egtValueRef.instance.classList.toggle('first-peak-label', false);
        column.egtValueRef.instance.classList.toggle('last-peak-label', false);
      }
      column.egtColumnPeakRef.instance.style.display = 'none';
    }
    if (this.props.value1) {
      this.egtValuesLeftLabelRef.instance.classList.toggle('peak-label-color', false);
      this.egtValuesLeftLabelRef.instance.textContent = this.props.value2 ? '' : 'EGT';
      this.egtValuesRightLabelRef.instance.classList.toggle('peak-label-color', false);
      this.egtValuesRightLabelRef.instance.textContent = this.props.value2 ? 'EGT' : '°C';
    }

    this.peaksAppearanceOrder = [[], []];
  }

  /**
   * Turns temp order prop into a safe list to use.
   * @returns An array of cylinder numbers matching our cylinder count.
   */
  private getSafeTempOrder(): Array<number> {
    const tempOrder = new Array<number>();
    if (this.props.tempOrder) {
      for (const num of this.props.tempOrder) {
        if (num > 0 && num <= this.numColumns && tempOrder.indexOf(num) == -1) {
          tempOrder.push(num);
        }
      }
    }

    // Any columns not specified tack on the end.
    for (let i = 1; i <= this.numColumns; i++) {
      if (tempOrder.indexOf(i) == -1) {
        tempOrder.push(i);
      }
    }
    return tempOrder;
  }

  /**
   * Update the EGT value of the gauge, with GAMI time shift.
   * @param value The new value.
   * @param engineIndex The engine index (0 or 1).
   */
  private updateEgtValue(value: number, engineIndex: 0 | 1): void {
    const startIndex = this.props.isTwinEngine ? this.numColumns / 2 * engineIndex : 0;
    const endIndex = this.props.isTwinEngine ? this.numColumns / 2 * (engineIndex + 1) : this.numColumns;
    for (let i = startIndex; i < endIndex; i++) {
      const column = this.columnMap[i];
      if (column.cylinder.lastEgtReading === 0) {
        this.updateColumnEgtValue(i, value);
      } else {
        const timeoutRef = {
          timeout: setTimeout(() => {
            this.updateColumnEgtValue(i, value);
            this.timeouts.splice(this.timeouts.indexOf(timeoutRef.timeout), 1);
          },
            column.cylinder.egtDelayFactor
          )
        };
        this.timeouts.push(timeoutRef.timeout);
      }
    }
  }

  /**
   * Update the value of a single EGT column.
   * @param index The column index.
   * @param value The new value.
   */
  private updateColumnEgtValue(index: number, value: number): void {

    const column = this.columnMap[index];
    const engineIndex = this.props.isTwinEngine && index >= this.numColumns / 2 ? 1 : 0;
    const simulatedValue = MathUtils.clamp(column.cylinder.setEgtValue(value), this.egtMinimum, this.egtMaximum);
    this.currentEgtValues[index].set(simulatedValue);

    if (this.usePeakMode && this.props.style?.peakTemps) {
      const enginePeaksAppearanceOrder = this.peaksAppearanceOrder[engineIndex];
      if (simulatedValue > column.cylinder.leaningPriorTemp) {
        column.cylinder.leaningPeak = 0;
        enginePeaksAppearanceOrder.splice(enginePeaksAppearanceOrder.indexOf(index), 1);
      }
      if (column.cylinder.leaningPeak == 0) {
        if (column.cylinder.leaningPriorTemp > simulatedValue) {
          column.cylinder.leaningPeak = column.cylinder.leaningPriorTemp;
          enginePeaksAppearanceOrder.push(index);
        } else {
          column.cylinder.leaningPriorTemp = simulatedValue;
        }
      } else {
        column.cylinder.peakDelta = simulatedValue - column.cylinder.leaningPeak;
      }
      const engineStartIndex = this.props.isTwinEngine ? this.numColumns / 2 * engineIndex : 0;
      const engineEndIndex = this.props.isTwinEngine ? this.numColumns / 2 * (engineIndex + 1) : this.numColumns;

      for (let i = engineStartIndex; i < engineEndIndex; i++) {
        const isAFirstPeak = enginePeaksAppearanceOrder.indexOf(i) === 0;
        const isALastPeak = enginePeaksAppearanceOrder[enginePeaksAppearanceOrder.length - 1] === i && enginePeaksAppearanceOrder.length > 1;
        const columnToUpdate = this.columnMap[i];
        columnToUpdate.egtValueRef.instance.classList.toggle('first-peak-label', isAFirstPeak);
        columnToUpdate.egtValueRef.instance.classList.toggle('last-peak-label', isALastPeak);
      }

      const peakOrdersFlatLength = ArrayUtils.flat(this.peaksAppearanceOrder).length;
      this.egtValuesLeftLabelRef.instance.classList.toggle('peak-label-color', peakOrdersFlatLength > 0);
      this.egtValuesLeftLabelRef.instance.textContent = peakOrdersFlatLength > 0 ? 'LEAN' : '';
      this.egtValuesRightLabelRef.instance.classList.toggle('peak-label-color', peakOrdersFlatLength > 0);
      this.egtValuesRightLabelRef.instance.textContent = peakOrdersFlatLength > 0 ? 'ΔEGT' : 'EGT';
      column.chtPeakLabelRef.instance.innerText = this.precise(column.cylinder.leaningPeak);
    }

    // update visuals
    const columnScale = 1 - (this.egtMaximum - simulatedValue) / (this.egtMaximum - this.egtMinimum);
    column.egtColumnRef.instance.style.transform = `scale3d(1, ${columnScale}, 1)`;

    const displayColumnPeak = this.usePeakMode && this.props.style?.peakTemps && column.cylinder.leaningPeak > 0;
    column.egtColumnRef.instance.classList.toggle('peak-background', displayColumnPeak);
    column.egtValueRef.instance.classList.toggle('peak-label-color', displayColumnPeak);
    column.egtColumnPeakRef.instance.style.display = displayColumnPeak ? 'block' : 'none';
    column.chtPeakLabelRef.instance.style.display = displayColumnPeak ? 'block' : 'none';

    if (displayColumnPeak) {
      const columnPeakScale = 1 - (this.egtMaximum - column.cylinder.leaningPeak) / (this.egtMaximum - this.egtMinimum);
      column.egtColumnPeakRef.instance.style.transform = `scale3d(1, ${columnPeakScale}, 1)`;
      column.chtPeakLabelRef.instance.style.bottom = Math.round(columnPeakScale * 100) + '%';
      column.egtValueRef.instance.innerText = this.precise(column.cylinder.peakDelta);
    } else {
      column.egtValueRef.instance.innerText = this.precise(simulatedValue);
    }
  }

  /**
   * Update all the CHT values of the gauge .
   * @param value The new value.
   * @param engineIndex The engine index (0 or 1).
   */
  private updateChtValue(value: number, engineIndex: 0 | 1): void {
    const startIndex = this.props.isTwinEngine ? this.numColumns / 2 * engineIndex : 0;
    const endIndex = this.props.isTwinEngine ? this.numColumns / 2 * (engineIndex + 1) : this.numColumns;
    let maxChtValue = 0;
    for (let i = startIndex; i < endIndex; i++) {
      const column = this.columnMap[i];
      const clampedChtValue = MathUtils.clamp(column.cylinder.setChtValue(value), this.chtMinimum, this.chtMaximum);
      maxChtValue = Math.max(maxChtValue, clampedChtValue);

      // update visuals
      const indicatorPositionY = (1 - (clampedChtValue - this.chtMinimum) / (this.chtMaximum - this.chtMinimum)) * 100;
      column.chtIndicatorRef.instance.style.top = indicatorPositionY + '%';
      const zone = this.chtColorZones.find(
        coneCandidate => clampedChtValue >= coneCandidate.begin && clampedChtValue <= coneCandidate.end
      );

      if (zone?.color && this.mapColorToIsWarningZoneValue(zone.color)) {
        column.chtIndicatorRef.instance.style.background = zone.color;
        column.chtValueRef.instance.style.background = zone.color;
        column.chtValueRef.instance.style.color = 'black';
      } else {
        column.chtValueRef.instance.style.background = 'black';
        column.chtValueRef.instance.style.color = 'white';
        column.chtIndicatorRef.instance.style.background = 'white';
      }
      column.chtValueRef.instance.innerText = this.precise(clampedChtValue);
    }
    if (this.hottestChtCylinderValue) {
      this.hottestChtCylinderValue.set(maxChtValue);
    }
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
  }
}
