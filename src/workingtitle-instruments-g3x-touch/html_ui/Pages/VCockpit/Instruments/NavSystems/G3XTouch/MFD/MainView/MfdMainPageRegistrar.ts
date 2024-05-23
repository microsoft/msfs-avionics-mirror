import { MfdPageDefinition } from '../PageNavigation/MfdPageDefinition';

/**
 * A record of registered MFD main pages.
 */
export class MfdMainPageRegistrar {
  private static readonly PAGE_DEF_COMPARATOR = (a: Readonly<MfdPageDefinition>, b: Readonly<MfdPageDefinition>): number => {
    return a.order - b.order;
  };

  private readonly registeredPages: Map<string, Readonly<MfdPageDefinition>> = new Map();

  /**
   * Checks if a page is registered with a given key.
   * @param key The key to check.
   * @returns Whether a page is registered with the specified key.
   */
  public isPageRegistered(key: string): boolean {
    return this.registeredPages.has(key);
  }

  /**
   * Registers an MFD main page. Registering a page with an existing key will replace the old page registered under
   * that key.
   * @param pageDef The definition of the page to register.
   */
  public registerPage(pageDef: Readonly<MfdPageDefinition>): void {
    this.registeredPages.set(pageDef.key, pageDef);
  }

  /**
   * Unregisters an MFD main page.
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
  public getRegisteredPagesArray(): Readonly<MfdPageDefinition>[] {
    return Array.from(this.registeredPages.values()).sort(MfdMainPageRegistrar.PAGE_DEF_COMPARATOR);
  }
}