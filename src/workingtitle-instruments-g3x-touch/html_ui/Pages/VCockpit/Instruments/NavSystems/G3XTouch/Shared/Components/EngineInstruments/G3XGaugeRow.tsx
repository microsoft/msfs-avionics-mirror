import { FSComponent, ToggleableClassNameRecord, VNode, XMLHostedLogicGauge } from '@microsoft/msfs-sdk';

import { G3XGaugeColumn } from './G3XGaugeColumn';
import { G3XGaugeRowProps } from '../G3XGaugesConfigFactory/Definitions/G3XGaugeRowProps';
import { G3XBaseGauge } from './G3XBaseGauge';

/**
 * Gauges for a row.
 */
export type XMLGaugeRowConfigProps = G3XGaugeRowProps & XMLHostedLogicGauge;

/**
 * A row of columns.
 */
export class G3XGaugeRow extends G3XBaseGauge<XMLGaugeRowConfigProps> {
  private static readonly RESERVED_CSS_CLASSES = ['gauge_row', 'gauge_row_outline', 'gauge_row_labeled'];

  /** @inheritDoc */
  protected renderGauge(): VNode {
    throw new Error('Method is not used in the implementation.');
  }

  /** @inheritDoc */
  protected initGauge(): void {
    throw new Error('Method is not used in the implementation.');
  }

  private readonly theRow = FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  public onAfterRender(): void {
    for (const column of this.props.columns) {
      const ref = FSComponent.createRef<HTMLDivElement>();
      FSComponent.render(
        <G3XGaugeColumn
          bus={this.props.bus}
          ref={ref}
          logicHost={this.props.logicHost}
          label={column.label}
          outline={column.outline}
          gaugeConfig={column.gaugeConfig}
          style={column.style}
        />,
        this.theRow.instance
      );

      if (column.style.width === undefined) {
        ref.instance.style.flex = '1';
      }
    }

    this.applyStyle(this.theDiv);
  }


  /** @inheritDoc */
  public render(): VNode {
    const cssClass: ToggleableClassNameRecord = {
      'gauge_row': true,
      'gauge_row_outline': !!this.props.outline,
      'gauge_row_labeled': !!this.props.label,
    };

    const classesToAdd = FSComponent.parseCssClassesFromString(
      this.props.class ?? '',
      classToAdd => !G3XGaugeRow.RESERVED_CSS_CLASSES.includes(classToAdd)
    );

    for (const classToAdd of classesToAdd) {
      cssClass[classToAdd] = true;
    }

    return <div
      class={cssClass}
      ref={this.theDiv}
    >
      {this.props.label && <label class='gauge_row_label'>{this.props.label}</label>}
      <div class='gauge_column_row' ref={this.theRow} />
    </div>;
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
  }
}
