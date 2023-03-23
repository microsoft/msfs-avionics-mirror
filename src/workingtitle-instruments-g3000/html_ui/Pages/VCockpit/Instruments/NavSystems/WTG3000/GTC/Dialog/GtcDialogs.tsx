import { VNode, Wait } from '@microsoft/msfs-sdk';

import { GtcPopupType, GtcService, GtcViewOcclusionType } from '../GtcService/GtcService';
import { GtcView } from '../GtcService/GtcView';
import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { GtcDialogInputType, GtcDialogOutputType, GtcDialogResult, GtcDialogResultCancelled, GtcDialogView } from './GtcDialogView';

import { GtcMessageDialog } from './GtcMessageDialog';

import './GtcDialogs.css';

/**
 * A definition for a single step in a dialog chain.
 */
export type GtcDialogChainStep<Dialog extends GtcDialogView<any, any>> = {
  /** The key of the dialog to open. */
  key: string;

  /** The popup type to apply to the opened dialog. Defaults to `'normal'`. */
  popupType?: GtcPopupType;

  /** The occlusion type to apply to views beneath the opened dialog. Defaults to `'darken'`. */
  popupOcclusionType?: GtcViewOcclusionType;

  /**
   * A function which generates the request input to pass to the opened dialog.
   * @param chainOutput The outputs of each prior step in the dialog chain, in order.
   * @returns The request input to pass to the opened dialog.
   */
  input: (chainOutput: readonly GtcDialogResult<any>[]) => GtcDialogInputType<Dialog>;

  /**
   * A callback function which is invoked when the opened dialog returns a result and returns whether the chain should
   * continue. If not defined, no action will be taken when the dialog returns a result and the chain will continue if
   * and only if the dialog request was not cancelled.
   * @param result The result returned by the opened dialog.
   * @returns Whether the chain should continue.
   */
  onResult?: (result: GtcDialogResult<GtcDialogOutputType<Dialog>>) => boolean;

  /** The delay, in milliseconds, after the step has finished before the next step can begin. */
  delay?: number;
};

/**
 * A utility type which extracts the type of an invoked dialog view from a dialog chain step.
 */
export type GtcDialogChainStepDialogType<Step> = Step extends GtcDialogChainStep<infer Dialog> ? Dialog : never;

/**
 * An array of individual dialog results from an invoked dialog chain.
 */
export type GtcDialogChainStepResults<Steps extends readonly GtcDialogChainStep<any>[]> = {
  [Index in keyof Steps]: Index extends keyof [] ? Steps[Index] : GtcDialogResult<GtcDialogOutputType<GtcDialogChainStepDialogType<Steps[Index]>>>;
}

/**
 * A result of an invoked dialog chain that was completed without being cancelled.
 */
export type GtcDialogChainResultSubmitted<Steps extends readonly GtcDialogChainStep<any>[]> = {
  /** Whether the dialog chain was cancelled. */
  wasCancelled: false;

  /**
   * The results of each dialog invoked in the chain, in order.
   */
  payload: GtcDialogChainStepResults<Steps>;
}

/**
 * A result of an invoked dialog chain.
 */
export type GtcDialogChainResult<Steps extends readonly GtcDialogChainStep<any>[]> = GtcDialogResultCancelled | GtcDialogChainResultSubmitted<Steps>

/**
 * Utility class for opening GTC dialogs.
 */
export class GtcDialogs {
  /**
   * Opens a message dialog.
   * @param gtcService The GtcService.
   * @param message The message to display.
   * @param showRejectButton Whether to show the reject button. Defaults to true.
   * @param acceptButtonLabel The label to display for the accept button. Defaults to 'OK'.
   * @param rejectButtonLabel The label to display for the reject button. Defaults to 'Cancel'.
   * @returns True if user hit the accept button, otherwise false.
   */
  public static async openMessageDialog(
    gtcService: GtcService,
    message: string | VNode,
    showRejectButton = true,
    acceptButtonLabel = 'OK',
    rejectButtonLabel = 'Cancel',
  ): Promise<boolean> {
    const result =
      await gtcService.openPopup<GtcMessageDialog>(GtcViewKeys.MessageDialog1)
        .ref.request({
          message,
          showRejectButton,
          acceptButtonLabel,
          rejectButtonLabel,
        });
    if (!result.wasCancelled && result.payload === true) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Opens a chain of dialogs. Each dialog in the chain is opened sequentially until the chain is cancelled or there
   * are no more dialogs left to open. By default, if a user cancels any dialog request in the chain, the entire chain
   * is cancelled. This behavior can be overridden by the definitions of the individual steps in the chain.
   * Additionally, if the GTC's active view at the beginning of any step is different from the active view when the
   * chain was started, the chain will be immediately cancelled.
   * @param gtcService The GTC service.
   * @param steps An array of steps defining the actions to take with each dialog opened in the chain.
   * @returns A Promise which is fulfilled with the result of the chain when the chain is completed or cancelled.
   */
  public static async openDialogChain<Steps extends readonly GtcDialogChainStep<any>[]>(
    gtcService: GtcService,
    steps: Steps
  ): Promise<GtcDialogChainResult<Steps>> {
    const activeView = gtcService.activeView.get();

    const outputs: GtcDialogResult<any>[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const result = await gtcService.openPopup<GtcDialogView<any, any> & GtcView>(step.key, step.popupType, step.popupOcclusionType)
        .ref.request(step.input(outputs));

      const shouldContinue = step.onResult === undefined ? !result.wasCancelled : step.onResult(result);

      if (!shouldContinue) {
        return {
          wasCancelled: true
        };
      }

      outputs.push(result);

      if (i < steps.length - 1 && step.delay !== undefined) {
        await Wait.awaitDelay(step.delay);
      }

      // If the active view on the GTC is not the same as when the dialog chain was started, we will act as if the
      // chain was cancelled.
      if (activeView !== gtcService.activeView.get()) {
        return {
          wasCancelled: true
        };
      }
    }

    return {
      wasCancelled: false,
      payload: outputs as unknown as GtcDialogChainStepResults<Steps>,
    };
  }
}