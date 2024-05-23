import { FSComponent, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface, Subscribable, UnitFamily, VNode } from '@microsoft/msfs-sdk';

import { NavDataBearingField, NavDataBearingFieldProps, NavDataDurationField, NavDataDurationFieldProps, NavDataGenericField, NavDataNumberUnitField, NavDataNumberUnitFieldProps, NavDataTimeField, NavDataTimeFieldProps } from './NavDataField';
import { NavDataFieldModel, TypeOfNavDataFieldModel } from './NavDataFieldModel';
import { NavDataFieldTypeRenderer } from './NavDataFieldRenderer';
import { NavDataFieldType, NavDataFieldTypeModelMap } from './NavDataFieldType';

/**
 * Basic configuration options for navigation data field renderers.
 */
export type BaseNavDataFieldTypeRendererOptions = {
  /** The title to display for the field. */
  title: string;

  /** CSS class(es) to apply to the field's root element. */
  class?: string;
};

/**
 * NavDataField types that have models whose values extend {@link NumberUnitInterface}.
 */
export type NumberUnitNavDataFieldTypes = keyof {
  [P in NavDataFieldType as NavDataFieldTypeModelMap[P] extends NavDataFieldModel<NumberUnitInterface<string>> ? P : never]: P
};

/**
 * Configuration options for {@link NavDataFieldNumberUnitRenderer}.
 */
export type NavDataFieldNumberUnitRendererOptions<T extends NumberUnitInterface<string>> = Pick<
  NavDataNumberUnitFieldProps<T>,
  'displayUnit' | 'formatter' | 'unitFormatter' | 'hideUnitWhenNaN'
> & BaseNavDataFieldTypeRendererOptions;

/**
 * Renders Distance to Waypoint navigation data fields.
 */
export class NavDataFieldNumberUnitRenderer<T extends NumberUnitNavDataFieldTypes> implements NavDataFieldTypeRenderer<T> {
  /**
   * Creates a new instance of NavDataFieldNumberUnitRenderer.
   * @param options Options with which to configure the renderer.
   */
  public constructor(
    protected readonly options: Readonly<NavDataFieldNumberUnitRendererOptions<TypeOfNavDataFieldModel<NavDataFieldTypeModelMap[T]>>>
  ) {
  }

  /** @inheritDoc */
  public render(model: NavDataFieldTypeModelMap[T]): VNode {
    return (
      <NavDataNumberUnitField
        title={this.options.title}
        model={model as NavDataFieldModel<TypeOfNavDataFieldModel<NavDataFieldTypeModelMap[T]>>}
        displayUnit={this.options.displayUnit}
        formatter={this.options.formatter}
        unitFormatter={this.options.unitFormatter}
        hideUnitWhenNaN={this.options.hideUnitWhenNaN}
        class={this.options.class}
      />
    );
  }
}

/**
 * NavDataField types that have models whose values are {@link NumberUnitInterface|NumberUnitInterfaces} with a
 * navigation angle unit family.
 */
export type BearingNavDataFieldTypes = keyof {
  [P in NavDataFieldType as NavDataFieldTypeModelMap[P] extends NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> ? P : never]: P
};

/**
 * Configuration options for {@link NavDataFieldBearingRenderer}.
 */
export type NavDataFieldBearingRendererOptions<T extends NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> = Pick<
  NavDataBearingFieldProps<T>,
  'displayUnit' | 'formatter' | 'unitFormatter' | 'use360'
> & BaseNavDataFieldTypeRendererOptions;

/**
 * Renders navigation data fields which display a bearing value.
 */
export class NavDataFieldBearingRenderer<T extends BearingNavDataFieldTypes> implements NavDataFieldTypeRenderer<T> {
  /**
   * Creates a new instance of NavDataFieldBearingRenderer.
   * @param options Options with which to configure the renderer.
   */
  public constructor(
    protected readonly options: Readonly<NavDataFieldBearingRendererOptions<TypeOfNavDataFieldModel<NavDataFieldTypeModelMap[T]>>>
  ) {
  }

  /** @inheritDoc */
  public render(model: NavDataFieldTypeModelMap[T]): VNode {
    return (
      <NavDataBearingField
        title={this.options.title}
        model={model}
        displayUnit={this.options.displayUnit}
        formatter={this.options.formatter}
        unitFormatter={this.options.unitFormatter}
        use360={this.options.use360}
        class={this.options.class}
      />
    );
  }
}

/**
 * NavDataField types that have models whose values are {@link NumberUnitInterface|NumberUnitInterfaces} with a
 * duration unit family.
 */
export type DurationNavDataFieldTypes = keyof {
  [P in NavDataFieldType as NavDataFieldTypeModelMap[P] extends NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>> ? P : never]: P
};

/**
 * Configuration options for {@link NavDataFieldDurationRenderer}.
 */
export type NavDataFieldDurationRendererOptions<T extends NumberUnitInterface<UnitFamily.Duration>> = Pick<
  NavDataDurationFieldProps<T>,
  'options'
> & BaseNavDataFieldTypeRendererOptions;

/**
 * Renders navigation data fields which display a duration value.
 */
export class NavDataFieldDurationRenderer<T extends DurationNavDataFieldTypes> implements NavDataFieldTypeRenderer<T> {
  /**
   * Creates a new instance of NavDataFieldDurationRenderer.
   * @param options Options with which to configure the renderer.
   */
  public constructor(
    protected readonly options: Readonly<NavDataFieldDurationRendererOptions<TypeOfNavDataFieldModel<NavDataFieldTypeModelMap[T]>>>
  ) {
  }

  /** @inheritDoc */
  public render(model: NavDataFieldTypeModelMap[T]): VNode {
    return (
      <NavDataDurationField
        title={this.options.title}
        model={model}
        options={this.options.options}
        class={this.options.class}
      />
    );
  }
}

/**
 * NavDataField types that have models whose values are numbers.
 */
export type TimeNavDataFieldTypes = keyof {
  [P in NavDataFieldType as NavDataFieldTypeModelMap[P] extends NavDataFieldModel<number> ? P : never]: P
};

/**
 * Configuration options for {@link NavDataFieldTimeRenderer}.
 */
export type NavDataFieldTimeRendererOptions = Pick<
  NavDataTimeFieldProps,
  'format' | 'localOffset' | 'padHour' | 'suffixFormatter' | 'hideSuffixWhenNaN'
> & BaseNavDataFieldTypeRendererOptions;

/**
 * Renders navigation data fields which display a time value.
 */
export class NavDataFieldTimeRenderer<T extends TimeNavDataFieldTypes> implements NavDataFieldTypeRenderer<T> {
  /**
   * Creates a new instance of NavDataFieldTimeRenderer.
   * @param options Options with which to configure the renderer.
   */
  public constructor(
    protected readonly options: Readonly<NavDataFieldTimeRendererOptions>
  ) {
  }

  /** @inheritDoc */
  public render(model: NavDataFieldTypeModelMap[T]): VNode {
    return (
      <NavDataTimeField
        title={this.options.title}
        model={model}
        format={this.options.format}
        localOffset={this.options.localOffset}
        padHour={this.options.padHour}
        suffixFormatter={this.options.suffixFormatter}
        hideSuffixWhenNaN={this.options.hideSuffixWhenNaN}
        class={this.options.class}
      />
    );
  }
}

/**
 * Configuration options for {@link NavDataFieldTextRenderer}.
 */
export type NavDataFieldTextRendererOptions<T> = {
  /**
   * A function which formats model values to displayed text. If not defined, then model values will be formatted using
   * Javascript's built-in `toString()` function.
   */
  formatter?: (value: T) => string;
} & BaseNavDataFieldTypeRendererOptions;

/**
 * Renders navigation data fields which display a text value.
 */
export class NavDataFieldTextRenderer<T extends NavDataFieldType> implements NavDataFieldTypeRenderer<T> {

  protected readonly formatter = this.options.formatter ?? ((value: any): string => `${value}`);

  /**
   * Creates a new instance of NavDataFieldDestRenderer.
   * @param options Options with which to configure the renderer.
   */
  public constructor(
    protected readonly options: Readonly<NavDataFieldTextRendererOptions<TypeOfNavDataFieldModel<NavDataFieldTypeModelMap[T]>>>
  ) {
  }

  /** @inheritDoc */
  public render(model: NavDataFieldTypeModelMap[T]): VNode {
    // This seems silly but we need to create our own subscribable in order to be able unsubscribe from it when the
    // component is destroyed.
    const text = (model.value as Subscribable<TypeOfNavDataFieldModel<NavDataFieldTypeModelMap[T]>>).map(this.formatter);

    return (
      <NavDataGenericField
        title={this.options.title}
        model={model}
        onDestroy={(): void => {
          text.destroy();
        }}
        class={this.options.class}
      >
        <div>{text}</div>
      </NavDataGenericField>
    );
  }
}