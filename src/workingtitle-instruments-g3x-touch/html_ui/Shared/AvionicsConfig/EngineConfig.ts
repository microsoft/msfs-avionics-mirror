import { EventBus, XMLTextColumnProps } from '@microsoft/msfs-sdk';

import { EisSizes } from '../CommonTypes';
import { G3XTextElementProps } from '../Components/EngineInstruments/Text/G3XTextGauge';
import { G3XEisDefinition } from '../Components/G3XGaugesConfigFactory/Definitions/G3XEisDefinition';
import {
  G3XEnginePageDefinition, G3XEnginePageGaugesDefinition, G3XEnginePageTabDefinition, G3XEnginePageTabType
} from '../Components/G3XGaugesConfigFactory/Definitions/G3XEnginePageDefinition';
import { G3XFunction } from '../Components/G3XGaugesConfigFactory/Definitions/G3XFunction';
import { G3XGaugeColorZone, G3XGaugeColorZoneColor } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeColorZone';
import { G3XGaugeColumnProps, G3XGaugeColumnStyle } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeColumnProps';
import { G3XGaugeProps } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeProps';
import { G3XGaugeRowProps } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeRowProps';
import { G3XGaugeSpec } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeSpec';
import { G3XGaugeStyle } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeStyle';
import { G3XGaugeType } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeType';
import { G3XCircleGaugeProps, G3XCircularGaugeStyle } from '../Components/G3XGaugesConfigFactory/Gauges/G3XCircleGaugeProps';
import { G3XCylinderGaugeProps, G3XCylinderGaugeStyle } from '../Components/G3XGaugesConfigFactory/Gauges/G3XCylinderGaugeProps';
import { G3XDoubleZonesLinearGaugeProps } from '../Components/G3XGaugesConfigFactory/Gauges/G3XDoubleZonesLinearGaugeProps';
import { G3XToggleButtonGaugeProps } from '../Components/G3XGaugesConfigFactory/Gauges/G3XToggleButtonGaugeProps';
import { G3XLinearGaugeProps } from '../Components/G3XGaugesConfigFactory/Gauges/G3XLinearGaugeProps';
import { Config } from '../Config/Config';
import { G3XGaugeColorLine, G3XGaugeColorLineColor } from '../Components/G3XGaugesConfigFactory/Definitions/G3XGaugeColorLine';

import strToBool = Utils.strToBool;

/**
 * A configuration object which defines options related to the display of engine information.
 */
export class EngineConfig implements Config {
  private readonly functions: Map<string, G3XFunction>;

  private readonly eisRootElement?: Element;

  private readonly enginePageRootElement?: Element;

  /** Whether to include an EIS. */
  public readonly includeEis: boolean;

  /** The size of the EIS, or `undefined` if the EIS is not included. */
  public readonly eisSize: EisSizes | undefined;

  /** Whether to include an MFD engine page. */
  public readonly includeEnginePage: boolean;

  /**
   * Creates a new EngineConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  public constructor(private readonly baseInstrument: BaseInstrument, element: Element | undefined) {
    if (!element) {
      this.functions = new Map();
      this.includeEis = false;
      this.eisSize = undefined;
      this.includeEnginePage = false;
    } else {
      if (element.tagName !== 'Engine') {
        throw new Error(`Invalid EngineConfig definition: expected tag name 'Engine' but was '${element.tagName}'`);
      }

      const hydratedElement = this.parseAndHydrateDefinitions(element);
      this.functions = this.parseFunctions(hydratedElement);

      this.eisRootElement = hydratedElement.querySelector(':scope>Eis') ?? undefined;
      this.enginePageRootElement = hydratedElement.querySelector(':scope>EnginePage') ?? undefined;

      this.includeEis = this.eisRootElement !== undefined;
      this.eisSize = this.eisRootElement ? this.parseEisSize(this.eisRootElement) : undefined;

      this.includeEnginePage = this.enginePageRootElement !== undefined;
    }
  }

  /**
   * Parses the EIS size option defined by a configuration document element.
   * @param element A configuration document element.
   * @returns The EIS size option defined by the configuration document element.
   */
  private parseEisSize(element: Element): EisSizes {
    const size = element.getAttribute('size')?.toLowerCase();

    switch (size) {
      case 'wide':
        return EisSizes.Wide;
      case 'narrow':
        return EisSizes.Narrow;
      default:
        console.warn('Invalid EngineConfig definition: missing or unrecognized EIS size option (expected "narrow" or "wide"). Defaulting to narrow.');
        return EisSizes.Narrow;
    }
  }

  /**
   * Parses an EIS definition object from this config.
   * @param bus The event bus.
   * @returns The EIS definition object defined by this config, or `undefined` if the EIS is not to be included.
   */
  public parseEis(bus: EventBus): G3XEisDefinition | undefined {
    if (this.eisRootElement && this.eisSize) {
      const defaultGaugesElement = this.eisRootElement.querySelector(':scope>Default');
      const combinedGaugesElement = this.eisRootElement.querySelector(':scope>Combined,:scope>EngineDisplayIsActive');

      let defaultGauges: G3XGaugeSpec[];
      let combinedGauges: G3XGaugeSpec[] | undefined = undefined;
      if (defaultGaugesElement || combinedGaugesElement) {
        defaultGauges = defaultGaugesElement ? this.parseGaugesConfig(bus, defaultGaugesElement) : [];
        combinedGauges = combinedGaugesElement ? this.parseGaugesConfig(bus, combinedGaugesElement) : undefined;
      } else {
        defaultGauges = this.parseGaugesConfig(bus, this.eisRootElement);
      }

      return { size: this.eisSize, functions: this.functions, defaultGauges, combinedGauges };
    } else {
      return undefined;
    }
  }

  /**
   * Parses an engine page definition object from this config.
   * @param bus The event bus.
   * @returns The engine page definition object defined by this config, or `undefined` if the engine page is not to be
   * included.
   */
  public parseEnginePage(bus: EventBus): G3XEnginePageDefinition | undefined {
    if (this.enginePageRootElement) {
      const engineTabs = Array.from(this.enginePageRootElement.querySelectorAll(':scope>Tab'));
      return {
        functions: this.functions,
        content: engineTabs.length == 0
          ? this.parseEnginePageGaugesDefinition(bus, this.enginePageRootElement)
          : engineTabs.map(this.parseEnginePageTabDefinition.bind(this, bus))
      };
    } else {
      return undefined;
    }
  }

  /**
   * Parses definitions from a configuration document element and returns a copy of the element in which each
   * `<UseDefinition>` tag has been replaced with the contents of its associated definition.
   * @param element The configuration document element to parse.
   * @returns A copy of the specified element in which each `<UseDefinition>` tag has been replaced with the contents
   * of its associated definition.
   */
  private parseAndHydrateDefinitions(element: Element): Element {
    const updatedElement = element.cloneNode(true) as Element;

    const definitions = new Map<string, Element>();
    for (const definition of updatedElement.querySelectorAll(':scope>Definition')) {
      const key = definition.getAttribute('key');
      if (key !== null) {
        definitions.set(key, definition);
      }
    }

    const useDefinitions = updatedElement.querySelectorAll('UseDefinition');
    const useDefinitionsAsArray = Array.from(useDefinitions);
    for (let i = 0; i < useDefinitionsAsArray.length; i++) {
      const useDefinition = useDefinitionsAsArray[i];
      const key = useDefinition.getAttribute('key');
      if (key !== null) {
        const definition = definitions.get(key);
        if (definition !== undefined) {
          const nodes = definition.cloneNode(true).childNodes;
          useDefinition.replaceWith(...nodes);
        }
      }
    }

    return updatedElement;
  }

  /**
   * Parses functions defined in a configuration document element.
   * @param element The configuration document element to parse.
   * @returns A map of functions defined by the specified element, keyed by function name.
   */
  private parseFunctions(element: Element | undefined): Map<string, G3XFunction> {
    const functions = new Map<string, G3XFunction>();
    if (element) {
      for (const func of element.querySelectorAll('Function')) {
        const funcSpec = this.makeFunction(func);
        if (funcSpec !== undefined) {
          functions.set(funcSpec.name, funcSpec);
        }
      }
    }
    return functions;
  }

  /**
   * Make a function.
   * @param functionDef The XML definition for the function.
   * @returns an XMLFunction type or undefined if there's an error
   */
  private makeFunction(functionDef: Element): G3XFunction | undefined {
    const name = functionDef.getAttribute('Name');
    if (!name || functionDef.children.length == 0) {
      return undefined;
    }

    return {
      name: name,
      logic: new CompositeLogicXMLElement(this.baseInstrument, functionDef)
    };
  }

  /**
   * Parses an MFD engine page tab definition from a configuration document element.
   * @param bus The event bus.
   * @param element A configuration document element.
   * @param index The index of the configuration document element among all those that define engine page tab
   * definitions.
   * @returns The MFD engine page tab definition defined by the specified configuration document element.
   */
  private parseEnginePageTabDefinition(bus: EventBus, element: Element, index: number): G3XEnginePageTabDefinition {
    const type = element.getAttribute('type');
    const label = element.getAttribute('label') ?? `Tab ${index + 1}`;

    switch (type) {
      case G3XEnginePageTabType.FuelCalculator: {
        let presetFuel1: number | undefined = undefined;
        const presetFuel1Attribute = element.getAttribute('preset-fuel-1');
        if (presetFuel1Attribute !== null) {
          presetFuel1 = Number(presetFuel1Attribute);
          if (!isFinite(presetFuel1) || presetFuel1 < 0) {
            console.warn('Invalid Engine Page Fuel Calculator Tab definition: unrecognized "preset-fuel-1" option (must be a finite non-negative number). Discarding value.');
            presetFuel1 = undefined;
          }
        }

        let presetFuel2: number | undefined = undefined;
        const presetFuel2Attribute = element.getAttribute('preset-fuel-2');
        if (presetFuel2Attribute !== null) {
          presetFuel2 = Number(presetFuel2Attribute);
          if (!isFinite(presetFuel2) || presetFuel2 < 0) {
            console.warn('Invalid Engine Page Fuel Calculator Tab definition: unrecognized "preset-fuel-2" option (must be a finite non-negative number). Discarding value.');
            presetFuel2 = undefined;
          }
        }

        return {
          type: G3XEnginePageTabType.FuelCalculator,
          label,
          gaugesDef: this.parseEnginePageGaugesDefinition(bus, element),
          presetFuel1,
          presetFuel2
        };
      }
      default:
        return {
          type: G3XEnginePageTabType.Simple,
          label,
          gaugesDef: this.parseEnginePageGaugesDefinition(bus, element)
        };
    }
  }

  /**
   * Parses an MFD engine page gauges definition from a configuration document element.
   * @param bus The event bus.
   * @param element A configuration document element.
   * @returns The MFD engine page gauges definition defined by the specified configuration document element.
   */
  private parseEnginePageGaugesDefinition(bus: EventBus, element: Element): G3XEnginePageGaugesDefinition {
    const fullscreen = element.querySelector(':scope>Fullscreen');
    const splitscreen = element.querySelector(':scope>Splitscreen');

    if (fullscreen || splitscreen) {
      return {
        fullscreenGaugeConfig: fullscreen ? this.parseGaugesConfig(bus, fullscreen) : undefined,
        splitscreenGaugeConfig: splitscreen ? this.parseGaugesConfig(bus, splitscreen) : undefined
      };
    } else {
      return {
        gaugeConfig: this.parseGaugesConfig(bus, element)
      };
    }
  }

  /**
   * Parse gauges configs from XML document.
   * @param bus The event bus.
   * @param config An instrument XML config document.
   * @returns An array of the gauges.
   */
  private parseGaugesConfig(bus: EventBus, config: Element): Array<G3XGaugeSpec> {
    const gaugeSpecs = new Array<G3XGaugeSpec>();
    if (config.children.length == 0) {
      return gaugeSpecs;
    }

    for (const gaugeDef of config.children) {
      switch (gaugeDef.tagName) {
        case 'Gauge':
          switch (gaugeDef.getElementsByTagName('Type')[0]?.textContent) {
            case 'Circular':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.Circular,
                configuration: this.parseCircularGaugeProps(gaugeDef)
              });
              break;
            case 'TwinCircular':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.TwinCircular,
                configuration: this.parseCircularGaugeProps(gaugeDef)
              });
              break;
            case 'Horizontal':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.Horizontal,
                configuration: this.parseLinearGaugeProps(gaugeDef)
              });
              break;
            case 'TwinHorizontal':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.TwinHorizontal,
                configuration: this.parseLinearGaugeProps(gaugeDef)
              });
              break;
            case 'DoubleHorizontal':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.DoubleHorizontal,
                configuration: this.parseLinearGaugeProps(gaugeDef)
              });
              break;
            case 'Vertical':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.Vertical,
                configuration: this.parseLinearGaugeProps(gaugeDef)
              });
              break;
            case 'DoubleVertical':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.DoubleVertical,
                configuration: this.parseDoubleVerticalGaugeProps(gaugeDef)
              });
              break;
            case 'Cylinder':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.Cylinder,
                configuration: this.parseCylinderGaugeProps(bus, gaugeDef)
              });
              break;
            case 'TwinCylinder':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.TwinCylinder,
                configuration: this.parseCylinderGaugeProps(bus, gaugeDef)
              });
              break;
            case 'ToggleButton':
              gaugeSpecs.push({
                gaugeType: G3XGaugeType.ToggleButton,
                configuration: this.parseGaugeButtonProps(gaugeDef)
              });
              break;
          }
          break;
        case 'Text': {
          const textProps: G3XTextElementProps = {};
          const className = gaugeDef.getAttribute('id');
          if (className !== null) {
            textProps.class = className;
          }

          const leftElem = gaugeDef.querySelector(':scope > Left');
          if (leftElem != null) {
            textProps.left = this.makeTextColumn(leftElem);
          }

          const centerElem = gaugeDef.querySelector(':scope > Center');
          if (centerElem !== null) {
            textProps.center = this.makeTextColumn(centerElem);
          }

          const rightElem = gaugeDef.querySelector(':scope > Right');
          if (rightElem !== null) {
            textProps.right = this.makeTextColumn(rightElem);
          }

          const styleElem = gaugeDef.querySelector(':scope > Style');
          const style = EngineConfig.parseStyleDefinition(styleElem);
          if (style !== undefined) {
            textProps.style = style;
          }

          gaugeSpecs.push({
            gaugeType: G3XGaugeType.Text,
            configuration: textProps
          });
        }
          break;
        case 'Row':
          gaugeSpecs.push({
            gaugeType: G3XGaugeType.Row,
            configuration: this.parseRowProps(bus, gaugeDef)
          });
          break;
        case 'Column':
          gaugeSpecs.push({
            gaugeType: G3XGaugeType.Column,
            configuration: this.parseColumnProps(bus, gaugeDef)
          });
          break;
      }
    }
    return gaugeSpecs;
  }

  /**
   * Construct a single column of text for a text element.  This can be any
   * one of Left, Right, or Center.
   * @param columnDef The XML definition for the given column.
   * @returns an XMLTextColumn configuration.
   */
  private makeTextColumn(columnDef: Element): XMLTextColumnProps {
    const contentElem = columnDef.getElementsByTagName('Content');
    const config: XMLTextColumnProps = {
      content: new CompositeLogicXMLElement(this.baseInstrument, contentElem.length > 0 ? contentElem[0] : columnDef)
    };

    const colorElem = columnDef.getElementsByTagName('Color');
    if (colorElem.length > 0) {
      config.color = new CompositeLogicXMLElement(this.baseInstrument, colorElem[0]);
    }

    const className = columnDef.getAttribute('id');
    if (className !== null) {
      config.class = className;
    }

    const fontSize = columnDef.getAttribute('fontsize');
    if (fontSize !== null) {
      config.fontSize = fontSize;
    }
    return config;
  }

  /**
   * Create an array of color zones if a definition exists.
   * @param zones An array of color zone definitions.
   * @returns An array of G3XCylinderGaugeColorZone
   */
  private makeColorZones(zones: HTMLCollectionOf<Element>): Array<G3XGaugeColorZone> | undefined {
    const zoneArray = new Array<G3XGaugeColorZone>();
    for (let i = 0; i < zones.length; i++) {
      let color = 'white';
      const colorElem = zones[i].getElementsByTagName('Color');
      if (colorElem.length > 0) {
        color = colorElem[0]?.textContent ? colorElem[0]?.textContent : 'white';
      }
      zoneArray.push({
        color: this.mapColorToZoneColorEnum(color),
        begin: new CompositeLogicXMLElement(this.baseInstrument, zones[i].getElementsByTagName('Begin')[0]),
        end: new CompositeLogicXMLElement(this.baseInstrument, zones[i].getElementsByTagName('End')[0]),
      });
    }
    return zoneArray.length > 0 ? zoneArray : undefined;
  }

  /**
   * Maps color string enum into typescript enum for gauge color zones
   * @param color - The color string enum
   * @returns The typescript enum for gauge color zones
   * @throws Error if the color is invalid
   */
  private mapColorToZoneColorEnum(color: string): G3XGaugeColorZoneColor {
    switch (color) {
      case 'red':
        return G3XGaugeColorZoneColor.Red;
      case 'yellow':
        return G3XGaugeColorZoneColor.Yellow;
      case 'green':
        return G3XGaugeColorZoneColor.Green;
      case 'white':
        return G3XGaugeColorZoneColor.White;
      case 'cyan':
        return G3XGaugeColorZoneColor.Cyan;
      case 'black':
        return G3XGaugeColorZoneColor.Black;
      default:
        throw new Error(`Invalid color zone color: ${color}`);
    }
  }

  /**
   * Maps color string enum into typescript enum for gauge color lines
   * @param color - The color string enum
   * @returns The typescript enum for gauge color lines
   * @throws Error if the color is invalid
   */
  private mapColorToLineColorEnum(color: string): G3XGaugeColorLineColor {
    switch (color) {
      case 'red':
        return G3XGaugeColorLineColor.Red;
      case 'yellow':
        return G3XGaugeColorLineColor.Yellow;
      case 'green':
        return G3XGaugeColorLineColor.Green;
      case 'white':
        return G3XGaugeColorLineColor.White;
      case 'cyan':
        return G3XGaugeColorLineColor.Cyan;
      default:
        throw new Error(`Invalid color line color: ${color}`);
    }
  }

  /**
   * Create an array of color lines if a definition exists.
   * @param lines An array of color line definitions.
   * @returns An array of XMLGaugeColorLine
   */
  private makeColorLines(lines: HTMLCollectionOf<Element>): Array<G3XGaugeColorLine> | undefined {
    const lineArray = new Array<G3XGaugeColorLine>();
    for (let i = 0; i < lines.length; i++) {
      let color = 'white';
      const colorElem = lines[i].getElementsByTagName('Color');
      if (colorElem.length > 0) {
        color = colorElem[0]?.textContent ? colorElem[0]?.textContent : 'white';
      }
      lineArray.push({
        color: this.mapColorToLineColorEnum(color),
        position: new CompositeLogicXMLElement(this.baseInstrument, lines[i].getElementsByTagName('Position')[0]),
      });
    }
    return lineArray.length > 0 ? lineArray : undefined;
  }

  /**
   * Create logic element
   * @param elementLogicDef - The XML definition for the logic element
   * @returns CompositeLogicXMLElement
   */
  private createLogicElement(elementLogicDef: Element | undefined): CompositeLogicXMLElement | undefined {
    if (elementLogicDef !== undefined) {
      return new CompositeLogicXMLElement(this.baseInstrument, elementLogicDef);
    }
    return undefined;
  }

  /**
   * Create a base gauge definition.  This will be combined with the
   * props for a speciific gauge type to fully define the config interface.
   * @param gaugeDef An XML element defining the gauge.
   * @returns The props for this gauge.
   */
  private parseGaugeDefinition(gaugeDef: Element): Partial<G3XGaugeProps> {
    const props: Partial<G3XGaugeProps> = {};

    const colorZones = this.makeColorZones(gaugeDef.getElementsByTagName('ColorZone'));
    if (colorZones !== undefined) {
      props.colorZones = colorZones;
    }

    const colorLines = this.makeColorLines(gaugeDef.getElementsByTagName('ColorLine'));
    if (colorLines !== undefined) {
      props.colorLines = colorLines;
    }

    props.smoothFactor = EngineConfig.parseSmoothFactor(gaugeDef);

    props.minimum = this.createLogicElement(gaugeDef.getElementsByTagName('Minimum')[0]);
    props.maximum = this.createLogicElement(gaugeDef.getElementsByTagName('Maximum')[0]);
    props.value1 = this.createLogicElement(gaugeDef.getElementsByTagName('Value')[0]);
    props.value2 = this.createLogicElement(gaugeDef.getElementsByTagName('Value2')[0]);
    props.redBlink = this.createLogicElement(gaugeDef.getElementsByTagName('RedBlink')[0]);

    EngineConfig.getAndAssign(props, gaugeDef, 'title', 'Title', (v: string) => v ? v : '');
    EngineConfig.getAndAssign(props, gaugeDef, 'unit', 'Unit', (v: string) => v ? v : '');
    EngineConfig.getAndAssign(props, gaugeDef, 'cursorText1', 'CursorText', (v: string) => v ? v : '');
    EngineConfig.getAndAssign(props, gaugeDef, 'cursorText2', 'CursorText2', (v: string) => v ? v : '');
    EngineConfig.getAndAssign(props, gaugeDef, 'dataChecklistId', 'ID');

    return props;
  }

  /**
   * Create a circular gauge.
   * @param gaugeDef An XML element defining the gauge.
   * @returns The props for this gauge.
   */
  private parseCircularGaugeProps(gaugeDef: Element): Partial<G3XCircleGaugeProps> {
    const styleElem = gaugeDef.querySelector(':scope > Style');
    const style: Partial<G3XCircularGaugeStyle> = EngineConfig.parseStyleDefinition(styleElem);

    if (styleElem !== null) {
      EngineConfig.getAndAssign(style, styleElem, 'beginAngle', 'BeginAngle', parseFloat);
      EngineConfig.getAndAssign(style, styleElem, 'endAngle', 'EndAngle', parseFloat);
      EngineConfig.getAndAssign(style, styleElem, 'displayRelativeValue', 'DisplayRelativeValue', strToBool);
      EngineConfig.getAndAssign(style, styleElem, 'textIncrement', 'TextIncrement', parseFloat);
      EngineConfig.getAndAssign(style, styleElem, 'valuePrecision', 'ValuePrecision', parseInt);
    }

    return Object.assign({ style }, this.parseGaugeDefinition(gaugeDef));
  }

  /**
   * Parse linear gauge props.
   * @param gaugeDef An XML element defining the gauge.
   * @returns The props for this gauge.
   */
  private parseLinearGaugeProps(gaugeDef: Element): Partial<G3XLinearGaugeProps> {
    const styleElem = gaugeDef.querySelector(':scope > Style');
    const style: Partial<G3XGaugeStyle> = EngineConfig.parseStyleDefinition(styleElem);

    if (styleElem !== null) {
      EngineConfig.getAndAssign(style, styleElem, 'textIncrement', 'TextIncrement', parseFloat);
      EngineConfig.getAndAssign(style, styleElem, 'valuePrecision', 'ValuePrecision', parseInt);
      EngineConfig.getAndAssign(style, styleElem, 'displayPlus', 'DisplayPlus');
    }

    const props: Partial<G3XLinearGaugeProps> = Object.assign({ style }, this.parseGaugeDefinition(gaugeDef));
    EngineConfig.getAndAssign(props, gaugeDef, 'allowPeakMode', 'AllowPeakMode', strToBool);
    EngineConfig.getAndAssign(props, gaugeDef, 'reflectPeakModeInHeader', 'ReflectPeakModeInHeader');
    EngineConfig.getAndAssign(props, gaugeDef, 'peakModeTriggerBusEvent', 'PeakModeTriggerBusEvent');

    return props;
  }

  /**
   * Create a double vertical gauge.
   * @param gaugeDef An XML element defining the gauge.
   * @returns The props for this gauge.
   */
  private parseDoubleVerticalGaugeProps(gaugeDef: Element): Partial<G3XDoubleZonesLinearGaugeProps> {
    const props: Partial<G3XDoubleZonesLinearGaugeProps> = this.parseLinearGaugeProps(gaugeDef);

    const styleElem = gaugeDef.getElementsByTagName('Style');
    const innerElem = styleElem[0];
    if (innerElem !== undefined && props.style) {
      EngineConfig.getAndAssign(props.style, innerElem, 'useDoubleZones', 'UseDoubleZones', strToBool);
      EngineConfig.getAndAssign(props.style, innerElem, 'valuesTextRowWidth', 'ValuesTextRowWidth');
    }
    props.minimum2 = this.createLogicElement(gaugeDef.getElementsByTagName('Minimum2')[0]);
    props.maximum2 = this.createLogicElement(gaugeDef.getElementsByTagName('Maximum2')[0]);

    const colorZones2 = this.makeColorZones(gaugeDef.getElementsByTagName('ColorZone2'));
    if (colorZones2 !== undefined) {
      props.colorZones2 = colorZones2;
    }

    const colorLines2 = this.makeColorLines(gaugeDef.getElementsByTagName('ColorLine2'));
    if (colorLines2 !== undefined) {
      props.colorLines2 = colorLines2;
    }
    return props;
  }

  /**
   * Create a gauge button.
   * @param gaugeDef An XML element defining the gauge.
   * @returns The props for this gauge.
   */
  private parseGaugeButtonProps(gaugeDef: Element): Partial<G3XToggleButtonGaugeProps> {
    const styleElem = gaugeDef.querySelector(':scope > Style');
    const style: Partial<G3XCircularGaugeStyle> = EngineConfig.parseStyleDefinition(styleElem);
    let props: Partial<G3XToggleButtonGaugeProps> = { style };
    props = Object.assign(props, this.parseGaugeDefinition(gaugeDef));
    EngineConfig.getAndAssign(props, gaugeDef, 'event', 'Event');
    EngineConfig.getAndAssign(props, gaugeDef, 'sync', 'Sync', strToBool);
    EngineConfig.getAndAssign(props, gaugeDef, 'cached', 'Cached', strToBool);

    const labelText = gaugeDef.querySelector(':scope>Label')?.textContent;
    let label: string | undefined;
    if (labelText) {
      label = labelText;
      try {
        const parsedLabel = JSON.parse(labelText);
        if (typeof parsedLabel === 'string') {
          label = parsedLabel;
        }
      } catch {
        // noop
      }
    }

    props.label = label;

    return props;
  }

  /**
   * Create a cylinder gauge.
   * @param bus The event bus.
   * @param gaugeDef An XML element defining the gauge.
   * @returns The props for this gauge.
   */
  private parseCylinderGaugeProps(bus: EventBus, gaugeDef: Element): Partial<G3XCylinderGaugeProps> {
    const styleElem = gaugeDef.querySelector(':scope > Style');
    const genericStyle = EngineConfig.parseStyleDefinition(styleElem);
    const columnElems = gaugeDef.getElementsByTagName('Columns');
    const tickElems = gaugeDef.getElementsByTagName('Tick');

    let props: Partial<G3XCylinderGaugeProps> = {};
    props = Object.assign(props, this.parseGaugeDefinition(gaugeDef));
    props.value3 = this.createLogicElement(gaugeDef.getElementsByTagName('Value3')[0]);
    props.value4 = this.createLogicElement(gaugeDef.getElementsByTagName('Value4')[0]);
    const chtColorZones = this.makeColorZones(gaugeDef.getElementsByTagName('ChtColorZone'));
    if (chtColorZones !== undefined) {
      if (props.colorZones2) {
        props.colorZones2.push(...chtColorZones);
      } else {
        props.colorZones2 = chtColorZones;
      }
    }
    const chtColorLines = this.makeColorLines(gaugeDef.getElementsByTagName('ChtColorLine'));
    if (chtColorLines !== undefined) {
      if (props.colorLines2) {
        props.colorLines2.push(...chtColorLines);
      } else {
        props.colorLines2 = chtColorLines;
      }
    }
    props.minimum2 = this.createLogicElement(gaugeDef.getElementsByTagName('ChtMinimum')[0])
      ?? this.createLogicElement(gaugeDef.getElementsByTagName('Minimum2')[0]);
    props.maximum2 = this.createLogicElement(gaugeDef.getElementsByTagName('ChtMaximum')[0])
      ?? this.createLogicElement(gaugeDef.getElementsByTagName('Maximum2')[0]);

    props.bus = bus;
    let style: Partial<G3XCylinderGaugeStyle> = {};

    if (styleElem !== null) {
      EngineConfig.getAndAssign(style, styleElem, 'textIncrement', 'TextIncrement', parseFloat);
      EngineConfig.getAndAssign(style, styleElem, 'valuePrecision', 'ValuePrecision', parseInt);
      EngineConfig.getAndAssign(style, styleElem, 'displayColorLinesOnTop', 'DisplayColorLinesOnTop', strToBool);
      EngineConfig.getAndAssign(style, styleElem, 'peakTemps', 'ShowPeak', strToBool);
    }
    style = Object.assign(style, genericStyle);
    props.style = style;

    if (columnElems.length > 0) {
      const parsedValue = Number(columnElems[0].textContent ?? undefined);
      if (Number.isInteger(parsedValue) && parsedValue > 0) {
        props.numCylinders = parsedValue;
      }
    }

    if (tickElems.length > 0) {
      props.egtTicks = Array.from(tickElems).map(tickElem => new CompositeLogicXMLElement(this.baseInstrument, tickElem));
    }

    EngineConfig.getAndAssign(props, gaugeDef, 'tempOrder', 'TempOrder', (text: string) => {
      const tempOrder = new Array<number>();
      for (const item of text.split(',')) {
        tempOrder.push(parseInt(item));
      }
      return tempOrder;
    });
    EngineConfig.getAndAssign(props, gaugeDef, 'peakModeTriggerBusEvent', 'PeakModeTriggerBusEvent');

    return props;
  }

  /**
   * Create a row.
   * @param bus The event bus.
   * @param gaugeDef AN XML element defining the group.
   * @returns The props for the group with all contained columns.
   */
  private parseRowProps(bus: EventBus, gaugeDef: Element): G3XGaugeRowProps {
    const styleElem = gaugeDef.querySelector(':scope > Style');
    const style: Partial<G3XGaugeColumnStyle> = EngineConfig.parseStyleDefinition(styleElem);
    const columns = new Array<G3XGaugeColumnProps>();
    const children = gaugeDef.children;
    const label = gaugeDef.getAttribute('label') ?? undefined;
    const outline = gaugeDef.getAttribute('outline')?.toLowerCase() === 'true';
    for (const child of children) {
      if (child.tagName == 'Column') {
        columns.push(this.parseColumnProps(bus, child));
      }
    }
    const props: G3XGaugeRowProps = {
      bus,
      columns,
      label,
      outline,
      style,
    };
    EngineConfig.getAndAssign(props, gaugeDef, 'class', 'Class');
    return props;
  }

  /**
   * Create a column of gauges.
   * @param bus The event bus.
   * @param gaugeDef An XML element defining the column.
   * @returns The props of the column with all contained gauges.
   */
  private parseColumnProps(bus: EventBus, gaugeDef: Element): G3XGaugeColumnProps {
    const label = gaugeDef.getAttribute('label') ?? undefined;
    const outline = gaugeDef.getAttribute('outline')?.toLowerCase() === 'true';
    const styleElem = gaugeDef.querySelector(':scope > Style');
    const style: Partial<G3XGaugeColumnStyle> = EngineConfig.parseStyleDefinition(styleElem);
    if (styleElem) {
      EngineConfig.getAndAssign(style, styleElem, 'width', 'Width');
      EngineConfig.getAndAssign(style, styleElem, 'justifyContent', 'JustifyContent');
    }
    const props: G3XGaugeColumnProps = {
      bus,
      gaugeConfig: this.parseGaugesConfig(bus, gaugeDef),
      label,
      outline,
      style
    };
    EngineConfig.getAndAssign(props, gaugeDef, 'class', 'Class');
    return props;
  }

  // Utility functions.

  /**
   * Check the value of a setting and, if it's defined, assign it to the
   * property of an object with optional type conversion.
   * @param obj The object to manipulate.
   * @param elem The element to get the value from.
   * @param prop The name of the property to set.
   * @param tag The tag name to retrieve.
   * @param converter A type conversion used if the value is defined.
   */
  private static getAndAssign<P, K extends keyof P>(
    obj: P,
    elem: Element,
    prop: K,
    tag: string,
    converter: (val: any) => P[K] | undefined = (val: any): P[K] => {
      return val;
    }
  ): void {
    const value = elem.getElementsByTagName(tag)[0]?.textContent;
    if (value === null || value === undefined) {
      return;
    }
    const newVal = converter(value);
    if (newVal !== undefined) {
      obj[prop] = newVal;
    }
  }

  /**
   * Create a basic XML style from a gauge definition.
   * @param styleElement The element with style definition.
   * @returns An G3XGaugeStyle
   */
  private static parseStyleDefinition(styleElement: Element | null): Partial<G3XGaugeStyle> {
    const style: Partial<G3XGaugeStyle> = {};
    if (styleElement) {
      EngineConfig.getAndAssign(style, styleElement, 'sizePercent', 'SizePercent', parseFloat);

      const marginsElem = styleElement.querySelector(':scope > Margins');
      if (marginsElem && marginsElem.textContent !== null) {
        EngineConfig.getAndAssign(style, marginsElem, 'marginLeft', 'Left');
        EngineConfig.getAndAssign(style, marginsElem, 'marginRight', 'Right');
        EngineConfig.getAndAssign(style, marginsElem, 'marginTop', 'Top');
        EngineConfig.getAndAssign(style, marginsElem, 'marginBottom', 'Bottom');
      }
      EngineConfig.getAndAssign(style, styleElement, 'height', 'Height');
    }
    return style;
  }

  /**
   * Get the SmoothFactor value from a gauge definition if present.
   * @param element The HTML element to search for the parameter.
   * @returns The smoothing factor as a number, or undefined if not found.
   */
  private static parseSmoothFactor(element: Element): number | undefined {
    const smoothElem = element.getElementsByTagName('SmoothFactor');
    if (smoothElem.length > 0 && smoothElem[0]?.textContent !== null) {
      return smoothElem.length > 0 ? parseFloat(smoothElem[0].textContent) : undefined;
    }
    return undefined;
  }
}