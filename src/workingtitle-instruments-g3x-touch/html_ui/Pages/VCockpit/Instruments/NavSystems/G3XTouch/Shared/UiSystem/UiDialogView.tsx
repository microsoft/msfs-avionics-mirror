/**
 * A dialog view which accepts requests for values.
 */
export interface UiDialogView<Input, Output> {
  /**
   * Requests a value from this dialog.
   * @param input Input parameters defining the request.
   * @returns A Promise which is fulfilled with the result of the request. The result will indicate whether the
   * request was cancelled, and if the request was not cancelled, it will also contain the requested value.
   */
  request(input: Input): Promise<UiDialogResult<Output>>;
}

/**
 * A result of a cancelled request from a {@link UiDialogView}.
 */
export type UiDialogResultCancelled = {
  /** Indicates that the dialog was cancelled. */
  wasCancelled: true;
}

/**
 * A result of a successful request from a {@link UiDialogView}.
 */
export type UiDialogResultSubmitted<T> = {
  /** Indicates that the dialog was not cancelled. */
  wasCancelled: false;

  /** This result's data payload. */
  payload: T;
}

/**
 * A result of a request from a {@link UiDialogView}.
 */
export type UiDialogResult<T> = UiDialogResultCancelled | UiDialogResultSubmitted<T>;

/**
 * A utility type which extracts the input type of a {@link UiDialogView}.
 */
export type UiDialogInputType<Dialog extends UiDialogView<any, any>> = Dialog extends UiDialogView<infer Input, any> ? Input : never;

/**
 * A utility type which extracts the output type of a {@link UiDialogView}.
 */
export type UiDialogOutputType<Dialog extends UiDialogView<any, any>> = Dialog extends UiDialogView<any, infer Output> ? Output : never;