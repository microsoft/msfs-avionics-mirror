/**
 * A dialog view which accepts requests for values.
 */
export interface GtcDialogView<Input, Output> {
  /**
   * Requests a value from this dialog.
   * @param input Input parameters defining the request.
   * @returns A Promise which is fulfilled with the result of the request. The result will indicate whether the
   * request was cancelled, and if the request was not cancelled, it will also contain the requested value.
   */
  request(input: Input): Promise<GtcDialogResult<Output>>;
}

/** The result of a cancelled dialog */
export type GtcDialogResultCancelled = {
  /** Indicates that the dialog was cancelled */
  wasCancelled: true,
}

/** The result of a submitted dialog containing a data payload */
export type GtcDialogResultSubmitted<T> = {
  /** Indicates that the dialog was not cancelled */
  wasCancelled: false,
  /** The data payload to return to the dialog opener */
  payload: T,
}

/** The result of opening a dialog, depending on whether it was cancelled or submitted */
export type GtcDialogResult<T> = GtcDialogResultCancelled | GtcDialogResultSubmitted<T>;

/**
 * A utility type which extracts the input type of a dialog view.
 */
export type GtcDialogInputType<Dialog extends GtcDialogView<any, any>> = Dialog extends GtcDialogView<infer Input, any> ? Input : never;

/**
 * A utility type which extracts the output type of a dialog view.
 */
export type GtcDialogOutputType<Dialog extends GtcDialogView<any, any>> = Dialog extends GtcDialogView<any, infer Output> ? Output : never;