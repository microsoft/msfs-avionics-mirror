import { Subject, Subscribable } from '../sub';

/**
 * A chart view.
 *
 * Chart views represent a single updatable reference that can be updated to show a particular chart image.
 *
 * The sim's engine manages downloading chart images and uploading them as GPU bitmaps. You must use the {@link showChartImage}
 * method to choose which chart image should be shown for this view, after which {@link liveViewName} will be updated to
 * give you access to that image. See documentation of that field for more information.
 */
export class ChartView {
  isAlive = true;

  public id: string | null = null;

  private listener: ViewListener.ViewListener | null = null;

  private readonly _liveViewName = Subject.create<string>('');

  /**
   * The name of the LiveView currently backing thiDs chart view.
   *
   * Setting the `src` attribute of an `img` tag to this string will render the last chart selected via `showChartPageUrl` as
   * the image bitmap.
   *
   * You can also use that string as a `background-image` url in CSS.
   */
  public readonly liveViewName: Subscribable<string> = this._liveViewName;

  /**
   * Initializes this chart view with a listener. This must be a JS_LISTENER_CHARTS ViewListener.
   *
   * @param listener the listener
   */
  public async init(listener: ViewListener.ViewListener): Promise<void> {
    if (this.listener) {
      throw new Error('[ChartView](init) Cannot call init if the view is already initialized');
    }

    if (!this.isAlive) {
      throw new Error('[ChartView](init) Cannot call init on a destroyed chart view');
    }

    this.listener = listener;

    this.id = await this.listener?.call('CREATE_CHART_VIEW');
    this.listener.on('SendLiveViewName', this.onSendLiveViewName);
  }

  /**
   * Updates this chart view to show a new chart image.
   *
   * The URLs passed to this method must come from the {@link ChartPage.url} property, and point to a file in PNG format.
   * Any URL that does not meet this criteria will be ignored.
   *
   * **Note:** you must subscribe to {@link liveViewName} in order to get the new image source. The previous image source is destroyed
   * when a new chart image is shown.
   *
   * @throws if the view is not initialized or has been destroyed
   *
   * @param pageUrl the URL of the image to show.
   */
  public showChartImage(pageUrl: string): void {
    if (!this.listener) {
      throw new Error('[ChartView](showChartImage) Cannot call showChartImage before the view is initialized. Did you call init()?');
    }

    if (!this.isAlive) {
      throw new Error('[ChartView](showChartImage) Cannot call showChartImage on a destroyed chart view');
    }

    this.listener.call('SET_CHART_VIEW_URL', this.id, pageUrl);
  }
  
  /** @inheritdoc */
  public destroy(): void {
    if (!this.isAlive) {
      throw new Error('[ChartView](destroy) View is already destroyed');
    }

    this.listener?.off('SendLiveViewName', this.onSendLiveViewName);
    this.listener?.call('DESTROY_CHART_VIEW', this.id);
    this.listener = null;

    this.isAlive = false;
  }

  private readonly onSendLiveViewName = (guid: string, liveViewName: string): void => {
    if (this.id === guid) {
      this._liveViewName.set(liveViewName);
    }
  };
}
