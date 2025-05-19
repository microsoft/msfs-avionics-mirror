import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';

/**
 * A description of a LiveView used by {@link ChartView} to display a chart image.
 */
export type ChartViewLiveView = {
  /**
   * The name of the LiveView. The name can be used wherever an image URL is accepted (e.g. as the `src` attribute for
   * an image element or as the argument for the CSS `url()` function).
   */
  readonly name: string;

  /** The URL of the chart page displayed by the LiveView. */
  readonly chartUrl: string;
};

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
  private _isAlive = true;
  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this view is alive. */
  public get isAlive(): boolean {
    return this._isAlive;
  }

  public _id: string | null = null;
  // eslint-disable-next-line jsdoc/require-returns
  /** This view's GUID, or `null` if it has not been initialized yet. */
  public get id(): string | null {
    return this._id;
  }

  private listener: ViewListener.ViewListener | null = null;

  private readonly _liveView = Subject.create<ChartViewLiveView>({ name: '', chartUrl: '' });
  /** A description of the LiveView currently backing this chart view. */
  public readonly liveView = this._liveView as Subscribable<ChartViewLiveView>;

  /** The name of the LiveView currently backing this chart view. */
  public readonly liveViewName: Subscribable<string> = this._liveView.map(view => view.name);

  /**
   * Initializes this chart view with a listener. This must be a JS_LISTENER_CHARTS ViewListener.
   *
   * @param listener the listener
   */
  public async init(listener: ViewListener.ViewListener): Promise<void> {
    if (this.listener) {
      throw new Error('[ChartView](init) Cannot call init if the view is already initialized');
    }

    if (!this._isAlive) {
      throw new Error('[ChartView](init) Cannot call init on a destroyed chart view');
    }

    this._id = await listener.call('CREATE_CHART_VIEW');

    if (!this._isAlive) {
      listener.call('DESTROY_CHART_VIEW', this._id);
      return;
    }

    listener.on('SendLiveViewName', this.onSendLiveViewName);

    this.listener = listener;
  }

  /**
   * Updates this chart view to show a new chart image. Once the image has been retrieved, this view's backing LiveView
   * will be updated to display the new image.
   *
   * **Note:** When changing the chart image, this view's backing LiveView will change. In order to ensure you have the
   * most up-to-date LiveView information with which to display the chart image, subscribe to {@link liveView} or
   * {@link liveViewName}.
   * @param pageUrl The URL of the image to show. The URL should be sourced from a valid `ChartPage` record and point
   * to a file in PNG format.
   * @throws if the view is not initialized or has been destroyed
   */
  public showChartImage(pageUrl: string): void {
    if (!this.listener) {
      throw new Error('[ChartView](showChartImage) Cannot call showChartImage before the view is initialized. Did you call init()?');
    }

    if (!this._isAlive) {
      throw new Error('[ChartView](showChartImage) Cannot call showChartImage on a destroyed chart view');
    }

    this.listener.call('SET_CHART_VIEW_URL', this._id, pageUrl);
  }

  /**
   * Destroys this chart view. This will release resources associated with this view. Once the view is destroyed, it
   * can no longer be used to display chart images.
   */
  public destroy(): void {
    if (!this._isAlive) {
      return;
    }

    this.listener?.off('SendLiveViewName', this.onSendLiveViewName);
    this.listener?.call('DESTROY_CHART_VIEW', this._id);
    this.listener = null;

    this._isAlive = false;
  }

  private readonly onSendLiveViewName = (guid: string, liveViewName: string, chartUrl: string): void => {
    if (this._id === guid) {
      this._liveView.set({ name: liveViewName, chartUrl });
    }
  };
}
