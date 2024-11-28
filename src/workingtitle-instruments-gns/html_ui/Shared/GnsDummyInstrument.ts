/**
 * Dummy instrument to be registered when GNS is disabled (hot-swap).
 */
export class GNSDummyInstrument extends BaseInstrument {
  /** @inheritdoc */
  get templateID(): string { return 'GNS_DISABLED'; }
  /**
   * Ctor
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }
}
