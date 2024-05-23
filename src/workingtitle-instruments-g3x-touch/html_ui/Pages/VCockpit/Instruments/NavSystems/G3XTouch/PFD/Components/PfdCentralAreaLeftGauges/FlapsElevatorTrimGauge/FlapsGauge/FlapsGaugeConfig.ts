import { Config } from '../../../../../Shared/Config/Config';

/**
 * The FlapsGaugeLineComponentConfig component configuration.
 */
export type FlapsGaugeLineComponentConfig = {
  /** The type of component to render. */
  type: 'line';
  /** The color of the component. */
  color: string;
  /** The value of the component. */
  value: number;
}
/**
 * The FlapsGaugeTickMarkComponentConfig component configuration.
 */
export type FlapsGaugeTickMarkComponentConfig = {
  /** The type of component to render. */
  type: 'tickMark';
  /** The value of the component. */
  value: number;
}
/**
 * The FlapsGaugeRangeComponentConfig component configuration.
 */
export type FlapsGaugeRangeComponentConfig = {
  /** The type of component to render. */
  type: 'range';
  /** The color of the component. */
  color: string;
  /** The range of the component. */
  range: [number, number];
}

/**
 * Flaps Gauge user settings.
 */
export class FlapsGaugeConfig implements Config {
  /** minimum flaps value. */
  public readonly minFlapsValue: number = 0;

  /** maximum flaps value. */
  public readonly maxFlapsValue: number = 0;

  /** flaps gauge components. */
  public readonly flapsGaugeComponents: (FlapsGaugeLineComponentConfig | FlapsGaugeTickMarkComponentConfig | FlapsGaugeRangeComponentConfig)[] = [];

  /**
   * Creates a new FlapsGaugeConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'FlapsGauge') {
      throw new Error(`Invalid FlapsGaugeConfig definition: expected tag name 'FlapsGauge' but was '${element.tagName}'`);
    }

    const minFlapsValue = element.getAttribute('min-flaps-value');
    const minFlapsValueCandidate = Number(minFlapsValue);

    const maxFlapsValue = element.getAttribute('max-flaps-value');
    const maxFlapsValueCandidate = Number(maxFlapsValue);


    if (minFlapsValue !== null && !isNaN(minFlapsValueCandidate)) {
      this.minFlapsValue = minFlapsValueCandidate;
    } else {
      throw new Error('minFlapsValue is null or NaN');
    }

    if (maxFlapsValue !== null && !isNaN(maxFlapsValueCandidate)) {
      this.maxFlapsValue = maxFlapsValueCandidate;
    } else {
      throw new Error('maxFlapsValue is null or NaN');
    }

    const flapsGaugeComponentsElements = element.getElementsByTagName('FlapsGaugeComponent');

    for (let i = 0; i < flapsGaugeComponentsElements.length; i++) {
      const flapsGaugeComponent = flapsGaugeComponentsElements[i];
      const type = flapsGaugeComponent.getAttribute('type');
      if (type === null) {
        throw new Error('Invalid FlapsGaugeComponent definition: missing \'type\' attribute.');
      }
      switch (type) {
        case 'line':
          this.buildAndAddLineComponent(this.flapsGaugeComponents, flapsGaugeComponent);
          break;
        case 'tickMark':
          this.buildAndAddTickMarkComponent(this.flapsGaugeComponents, flapsGaugeComponent);
          break;
        case 'range':
          this.buildAndAddRangeComponent(this.flapsGaugeComponents, flapsGaugeComponent);
          break;
        default:
          throw new Error(`Invalid FlapsGaugeComponent definition: unrecognized type '${type}'.`);
      }
    }
  }

  /**
   * build and add line component to components array.
   * @param components - The component configs to add to.
   * @param flapsGaugeComponent - The component to add.
   * @throws Error if the component config is invalid.
   */
  private buildAndAddLineComponent(
    components: (FlapsGaugeLineComponentConfig | FlapsGaugeTickMarkComponentConfig | FlapsGaugeRangeComponentConfig)[],
    flapsGaugeComponent: Element
  ): void {

    const lineColor = flapsGaugeComponent.getAttribute('color');
    if (lineColor === null) {
      throw new Error('Invalid FlapsGaugeComponent definition: missing \'color\' attribute.');
    }
    const lineValue = flapsGaugeComponent.getAttribute('value');
    if (lineValue === null) {
      throw new Error('Invalid FlapsGaugeComponent definition: missing \'value\' attribute.');
    }
    if (lineColor === null || lineValue === null) {
      return;
    } else {
      const component: FlapsGaugeLineComponentConfig = {
        type: 'line',
        color: lineColor,
        value: parseInt(lineValue),
      };
      components.push(component);
    }
  }

  /**
   * build and add tick mark component to components array.
   * @param components - The components to add to.
   * @param flapsGaugeComponent - The component to add.
   * @throws Error if the component config is invalid.
   */
  private buildAndAddTickMarkComponent(
    components: (FlapsGaugeLineComponentConfig | FlapsGaugeTickMarkComponentConfig | FlapsGaugeRangeComponentConfig)[],
    flapsGaugeComponent: Element
  ): void {
    const tickMarkValue = flapsGaugeComponent.getAttribute('value');
    if (tickMarkValue === null) {
      throw new Error('Invalid FlapsGaugeComponent definition: missing \'value\' attribute.');
    }
    if (tickMarkValue === null) {
      return;
    } else {
      const component: FlapsGaugeTickMarkComponentConfig = {
        type: 'tickMark',
        value: parseInt(tickMarkValue),
      };
      components.push(component);
    }
  }

  /**
   * build and add range component to components array.
   * @param components - The components to add to.
   * @param flapsGaugeComponent - The component to add.
   * @throws Error if the component config is invalid.
   */
  private buildAndAddRangeComponent(
    components: (FlapsGaugeLineComponentConfig | FlapsGaugeTickMarkComponentConfig | FlapsGaugeRangeComponentConfig)[],
    flapsGaugeComponent: Element
  ): void {
    const rangeColor = flapsGaugeComponent.getAttribute('color');
    if (rangeColor === null) {
      throw new Error('Invalid FlapsGaugeComponent definition: missing \'color\' attribute.');
    }
    const rangeStart = flapsGaugeComponent.getAttribute('start');
    if (rangeStart === null) {
      throw new Error('Invalid FlapsGaugeComponent definition: missing \'start\' attribute.');
    }
    const rangeEnd = flapsGaugeComponent.getAttribute('end');
    if (rangeEnd === null) {
      throw new Error('Invalid FlapsGaugeComponent definition: missing \'end\' attribute.');
    }

    const rangeStartCandidate = Number(rangeStart);
    const rangeEndCandidate = Number(rangeEnd);

    if (isNaN(rangeStartCandidate) || isNaN(rangeEndCandidate)) {
      throw new Error('Invalid FlapsGaugeComponent definition: \'start\' or \'end\' attribute is not a number.');
    }

    if (rangeStartCandidate < this.minFlapsValue || rangeStartCandidate > this.maxFlapsValue) {
      throw new Error('Invalid FlapsGaugeComponent definition: \'start\' attribute is out of range.');
    }

    if (rangeEndCandidate < this.minFlapsValue || rangeEndCandidate > this.maxFlapsValue) {
      throw new Error('Invalid FlapsGaugeComponent definition: \'end\' attribute is out of range.');
    }

    const component: FlapsGaugeRangeComponentConfig = {
      type: 'range',
      color: rangeColor,
      range: [rangeStartCandidate, rangeEndCandidate],
    };
    components.push(component);
  }
}