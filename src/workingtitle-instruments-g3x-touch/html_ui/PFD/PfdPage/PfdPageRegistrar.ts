import { PfdPageDefinition } from './PfdPageDefinition';

/**
 * A record of registered PFD pane pages.
 */
export class PfdPageRegistrar {
  private static readonly PAGE_DEF_COMPARATOR = (a: Readonly<PfdPageDefinition>, b: Readonly<PfdPageDefinition>): number => {
    return a.order - b.order;
  };

  private readonly registeredPages: Map<string, Readonly<PfdPageDefinition>> = new Map();

  /**
   * Checks if a page is registered with a given key.
   * @param key The key to check.
   * @returns Whether a page is registered with the specified key.
   */
  public isPageRegistered(key: string): boolean {
    return this.registeredPages.has(key);
  }

  /**
   * Registers a PFD page. Registering a page with an existing key will replace the old page registered under
   * that key.
   * @param pageDef The definition of the page to register.
   */
  public registerPage(pageDef: Readonly<PfdPageDefinition>): void {
    this.registeredPages.set(pageDef.key, pageDef);
  }

  /**
   * Unregisters a PFD page.
   * @param key The key of the page to unregister.
   * @returns Whether the page with the specified key was successfully unregistered.
   */
  public unregisterPage(key: string): boolean {
    return this.registeredPages.delete(key);
  }

  /**
   * Gets an array of page definitions registered with this registrar, in ascending order according to the values of
   * their `order` properties.
   * @returns An array of page definitions registered with this registrar, in ascending order according to the values
   * of their `order` properties.
   */
  public getRegisteredPagesArray(): Readonly<PfdPageDefinition>[] {
    return Array.from(this.registeredPages.values()).sort(PfdPageRegistrar.PAGE_DEF_COMPARATOR);
  }
}
