import { PfdInsetDefinition } from './PfdInsetDefinition';

/**
 * A record of registered PFD insets.
 */
export class PfdInsetRegistrar {
  private static readonly INSET_DEF_COMPARATOR = (a: Readonly<PfdInsetDefinition>, b: Readonly<PfdInsetDefinition>): number => {
    return a.order - b.order;
  };

  private readonly registeredInsets: Map<string, Readonly<PfdInsetDefinition>> = new Map();

  /**
   * Checks if an inset is registered with a given key.
   * @param key The key to check.
   * @returns Whether an inset is registered with the specified key.
   */
  public isInsetRegistered(key: string): boolean {
    return this.registeredInsets.has(key);
  }

  /**
   * Registers a PFD inset. Registering an inset with an existing key will replace the old inset registered under that
   * key.
   * @param insetDef The definition of the inset to register.
   * @throws Error if the inset key specified by the provided definition is the empty string.
   */
  public registerInset(insetDef: Readonly<PfdInsetDefinition>): void {
    if (insetDef.key === '') {
      throw new Error('PfdInsetRegistrar: the empty string is not a valid inset key');
    }

    this.registeredInsets.set(insetDef.key, insetDef);
  }

  /**
   * Unregisters a PFD inset.
   * @param key The key of the inset to unregister.
   * @returns Whether the inset with the specified key was successfully unregistered.
   */
  public unregisterInset(key: string): boolean {
    return this.registeredInsets.delete(key);
  }

  /**
   * Gets an array of inset definitions registered with this registrar, in ascending order according to the values of
   * their `order` properties.
   * @returns An array of inset definitions registered with this registrar, in ascending order according to the values
   * of their `order` properties.
   */
  public getRegisteredInsetsArray(): Readonly<PfdInsetDefinition>[] {
    return Array.from(this.registeredInsets.values()).sort(PfdInsetRegistrar.INSET_DEF_COMPARATOR);
  }
}