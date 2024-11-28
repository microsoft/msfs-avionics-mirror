/**
 * A configuration object.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Config {

}

/**
 * A configuration object which can be resolved to a value.
 */
export interface ResolvableConfig<T> extends Config {
  /** Flags this object as a ResolvableConfig. */
  readonly isResolvableConfig: true;

  /**
   * Resolves this config to a value.
   * @returns This config's resolved value.
   */
  resolve(): T;
}

/**
 * A configuration object factory.
 */
export interface ConfigFactory {
  /**
   * Creates a configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The configuration object defined by the specified element, or `undefined` if the element does not define
   * a configuration object recognized by this factory.
   */
  create(element: Element): Config | undefined;
}