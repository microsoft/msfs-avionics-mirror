/**
 * An generator of a sequence of consecutive integers that is guaranteed to not ever generate the same integer twice
 * across all CoherentGT views.
 */
export interface AtomicSequence {
  /**
   * Gets the next integer in ascending order starting from zero. Each time this method is called, it is guaranteed to
   * return a value that has not yet been returned by any other call to this method, including calls made in other
   * CoherentGT views.
   * 
   * **Note:** The uniqueness guarantee outlined above is valid as long as the method returns a value less than or
   * equal to `Number.MAX_SAFE_INTEGER`.
   * @returns The smallest non-negative integer not yet returned by any invocation of this method across all CoherentGT
   * views.
   */
  getNext(): number;
}

/**
 * A utility class for working with {@link AtomicSequence}.
 */
export class AtomicSequenceUtils {
  private static instancePromise?: Promise<AtomicSequence>;

  /**
   * Gets an instance of {@link AtomicSequence}.
   * @returns A Promise which is fulfilled with an instance of AtomicSequence as soon as the instance is available.
   */
  public static async getInstance(): Promise<AtomicSequence> {
    return AtomicSequenceUtils.instancePromise ??= new Promise(resolve => {
      RegisterViewListener('JS_LISTENER_ATOMIC', () => {
        resolve(Object.freeze({
          /** @inheritDoc */
          getNext() {
            return (window as any).AtomicSequence.getNext();
          }
        } satisfies AtomicSequence));
      });
    });
  }
}
