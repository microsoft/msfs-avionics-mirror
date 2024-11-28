import { FSComponent, NodeReference, ToggleableClassNameRecord, VNode } from '@microsoft/msfs-sdk';

import { G3XCircleGauge } from './Circle/G3XCircleGauge';
import { G3XTextGauge } from './Text/G3XTextGauge';
import { G3XGaugeRow } from './G3XGaugeRow';
import { G3XHorizontalGauge } from './Linear/Horizontal/G3XHorizontalGauge';
import { G3XCylinderTempGauge } from './Cylinder/G3XCylinderTempGauge';
import { G3XToggleButtonGauge } from './Button/G3XToggleButtonGauge';
import { G3XCylinderGaugeProps } from '../G3XGaugesConfigFactory/Gauges/G3XCylinderGaugeProps';
import { G3XDoubleHorizontalGauge } from './Linear/Horizontal/G3XDoubleHorizontalGauge';
import { G3XTwinHorizontalGauge } from './Linear/Horizontal/G3XTwinHorizontalGauge';
import { G3XVerticalGauge } from './Linear/Vertical/G3XVerticalGauge';
import { G3XDoubleVerticalGauge } from './Linear/Vertical/G3XDoubleVerticalGauge';
import { G3XGaugeSpecConfig } from '../G3XGaugesConfigFactory/Definitions/G3XGaugeSpec';
import { G3XGaugeType } from '../G3XGaugesConfigFactory/Definitions/G3XGaugeType';
import { G3XGaugeRowProps, G3XGaugeColumnProps } from '../G3XGaugesConfigFactory';
import { G3XBaseGauge } from './G3XBaseGauge';

/** A single column of gauges. */
export class G3XGaugeColumn extends G3XBaseGauge<G3XGaugeColumnProps> {
  private static readonly RESERVED_CSS_CLASSES = ['gauge_column', 'gauge_column_outline', 'gauge_column_labeled'];

  private ref = this.props.ref ?? FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  protected initGauge(): void {

    if (this.props.logicHost === undefined) {
      throw new Error('Can not render column, logicHost is undefined');
    }

    const configIsRow = (config: G3XGaugeSpecConfig): config is G3XGaugeRowProps => {
      return (config as G3XGaugeRowProps).columns != undefined;
    };

    for (const gauge of this.props.gaugeConfig) {
      switch (gauge.gaugeType) {
        case G3XGaugeType.Circular:
          FSComponent.render(
            <G3XCircleGauge logicHost={this.props.logicHost} {...gauge.configuration} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.TwinCircular:
          FSComponent.render(
            <G3XCircleGauge logicHost={this.props.logicHost} {...gauge.configuration} isTwinEngine={true} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.Horizontal:
          FSComponent.render(
            <G3XHorizontalGauge logicHost={this.props.logicHost} {...gauge.configuration} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.DoubleHorizontal:
          FSComponent.render(
            <G3XDoubleHorizontalGauge logicHost={this.props.logicHost} {...gauge.configuration} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.TwinHorizontal:
          FSComponent.render(
            <G3XTwinHorizontalGauge logicHost={this.props.logicHost} {...gauge.configuration} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.Vertical:
          FSComponent.render(
            <G3XVerticalGauge logicHost={this.props.logicHost} {...gauge.configuration} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.DoubleVertical:
          FSComponent.render(
            <G3XDoubleVerticalGauge logicHost={this.props.logicHost} {...gauge.configuration} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.Cylinder:
          (gauge.configuration as G3XCylinderGaugeProps).bus = this.props.bus;
          FSComponent.render(
            <G3XCylinderTempGauge logicHost={this.props.logicHost} {...gauge.configuration} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.TwinCylinder:
          (gauge.configuration as G3XCylinderGaugeProps).bus = this.props.bus;
          FSComponent.render(
            <G3XCylinderTempGauge logicHost={this.props.logicHost} {...gauge.configuration} isTwinEngine={true} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.Text:
          FSComponent.render(
            <G3XTextGauge logicHost={this.props.logicHost} {...gauge.configuration} />,
            this.ref.instance
          );
          break;
        case G3XGaugeType.Row:
          if (configIsRow(gauge.configuration)) {
            FSComponent.render(
              <G3XGaugeRow logicHost={this.props.logicHost} {...gauge.configuration} />,
              this.ref.instance
            );
          } else {
            console.error('Invalid Column Group configuration. Columns is expected.');
          }
          break;
        case G3XGaugeType.ToggleButton:
          FSComponent.render(
            <G3XToggleButtonGauge logicHost={this.props.logicHost} {...gauge.configuration} bus={this.props.bus} />,
            this.ref.instance
          );
          break;
      }
    }
  }

  /** @inheritDoc */
  protected applyStyle(ref: NodeReference<HTMLElement>): void {
    super.applyStyle(ref);

    if (this.props.style) {
      ref.instance.style.width = this.props.style.width ?? '';
      ref.instance.style.justifyContent = this.props.style.justifyContent ?? '';
    }
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.applyStyle(this.ref);
    this.initGauge();
  }


  /** @inheritDoc */
  protected renderGauge(): VNode {
    return <></>;
  }

  /** @inheritDoc */
  public render(): VNode {
    const cssClass: ToggleableClassNameRecord = {
      'gauge_column': true,
      'gauge_column_outline': !!this.props.outline,
      'gauge_column_labeled': !!this.props.label,
    };

    const classesToAdd = FSComponent.parseCssClassesFromString(
      this.props.class ?? '',
      classToAdd => !G3XGaugeColumn.RESERVED_CSS_CLASSES.includes(classToAdd)
    );

    for (const classToAdd of classesToAdd) {
      cssClass[classToAdd] = true;
    }

    return (
      <div
        ref={this.ref}
        class={cssClass}
      >
        {this.props.label && <label class='gauge_column_label'>{this.props.label}</label>}
      </div>
    );
  }
}
