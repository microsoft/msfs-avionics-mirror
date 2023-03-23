/**
 * A cache of images for runway designations.
 */
export interface MapRunwayDesignationImageCache {
  /**
   * Retrieves an image from this cache for a runway number.
   * @param num The runway number for which to retrieve an image.
   * @returns The image for the specified runway number, or `undefined` if one could not be found.
   */
  getNumber(num: number): HTMLImageElement | undefined;

  /**
   * Retrieves an image from this cache for a runway designator.
   * @param designator The runway designator for which to retrieve an image.
   * @returns The image for the specified runway designator, or `undefined` if one could not be found.
   */
  getDesignator(designator: RunwayDesignator): HTMLImageElement | undefined;
}

/**
 * A default implementation of {@link MapRunwayDesignationImageCache}.
 */
export class DefaultMapRunwayDesignationImageCache implements MapRunwayDesignationImageCache {
  protected readonly numberCache = new Map<number, HTMLImageElement>();
  protected readonly designatorCache = new Map<RunwayDesignator, HTMLImageElement>();

  /**
   * Registers an image with this cache for a runway number.
   * @param num The runway number for which to register the image.
   * @param src The source URI of the image to register.
   */
  public registerNumber(num: number, src: string): void {
    const img = new Image();
    img.src = src;
    this.numberCache.set(num, img);
  }

  /**
   * Registers an image with this cache for a runway designator.
   * @param designator The runway designator for which to register the image.
   * @param src The source URI of the image to register.
   */
  public registerDesignator(designator: RunwayDesignator, src: string): void {
    const img = new Image();
    img.src = src;
    this.designatorCache.set(designator, img);
  }

  /** @inheritdoc */
  public getNumber(num: number): HTMLImageElement | undefined {
    return this.numberCache.get(num);
  }

  /** @inheritdoc */
  public getDesignator(designator: RunwayDesignator): HTMLImageElement | undefined {
    return this.designatorCache.get(designator);
  }
}