import { FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { MfdPageDefinition } from '../../PageNavigation/MfdPageDefinition';

import './MfdPageSelectDialog.css';

/**
 * A request input for {@link MfdPageSelectDialog}.
 */
export type MfdPageSelectDialogInput = {
  /**
   * The key of the initially selected page. The selection button associated with the initially selected page will be
   * focused at the start of the request.
   */
  initialSelectedKey: string;
};

/**
 * Component props for {@link MfdPageSelectDialog}.
 */
export interface MfdPageSelectDialogProps extends UiViewProps {
  /**
   * An iterable of definitions for the dialog's selectable pages in the order in which their selection buttons should
   * appear in the dialog.
   */
  pageDefs: Iterable<Readonly<MfdPageDefinition>>;
}

/**
 * A pop-up dialog which allows the user to select an MFD main page.
 */
export class MfdPageSelectDialog extends AbstractUiView<MfdPageSelectDialogProps>
  implements UiDialogView<MfdPageSelectDialogInput, Readonly<MfdPageDefinition>> {

  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly buttonRefs: NodeReference<UiImgTouchButton>[] = [];

  private readonly pageDefs = Array.from(this.props.pageDefs);

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<any> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritDoc */
  public onAfterRender(): void {
    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Scroll List'],
      [UiKnobId.SingleInner, 'Scroll List'],
      [UiKnobId.LeftOuter, 'Scroll List'],
      [UiKnobId.LeftInner, 'Scroll List'],
      [UiKnobId.RightOuter, 'Scroll List'],
      [UiKnobId.RightInner, 'Scroll List']
    ]);

    this.focusController.setActive(true);
  }

  /** @inheritdoc */
  public request(input: MfdPageSelectDialogInput): Promise<UiDialogResult<Readonly<MfdPageDefinition>>> {
    if (!this.isAlive) {
      throw new Error('MfdPageSelectDialog: cannot request from a dead dialog');
    }

    return new Promise<UiDialogResult<Readonly<MfdPageDefinition>>>(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      const indexToFocus = this.pageDefs.findIndex(pageDef => pageDef.key === input.initialSelectedKey);
      if (indexToFocus >= 0) {
        this.buttonRefs[indexToFocus].instance.focusSelf();
      }
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Resolves this dialog's pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's page select buttons is pressed.
   * @param pageDef The definition of the page associated with the button that was pressed.
   */
  private onPageButtonPressed(pageDef: Readonly<MfdPageDefinition>): void {
    this.resultObject = {
      wasCancelled: false,
      payload: pageDef
    };
    this.props.uiService.goBackMfd();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='mfd-page-select-dialog ui-view-panel'>
        <div class='mfd-page-select-dialog-title'>Select Page</div>
        <UiList
          ref={this.listRef}
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds}
          listItemLengthPx={144}
          itemsPerPage={3}
          autoDisableOverscroll
          showScrollBar='auto'
          class='mfd-page-select-dialog-list'
        >
          {this.pageDefs
            .reduce((rows, pageDef, index) => {
              // Four buttons per row.
              const rowIndex = Math.trunc(index / 4);
              (rows[rowIndex] ??= []).push(pageDef);
              return rows;
            }, [] as Readonly<MfdPageDefinition>[][])
            .map(row => {
              return (
                <div class='mfd-page-select-dialog-row'>
                  <UiListFocusable>
                    {row.map(pageDef => {
                      const ref = FSComponent.createRef<UiImgTouchButton>();
                      this.buttonRefs.push(ref);

                      return (
                        <UiImgTouchButton
                          ref={ref}
                          label={pageDef.selectLabel}
                          imgSrc={pageDef.selectIconSrc}
                          isEnabled={pageDef.factory !== undefined}
                          onPressed={this.onPageButtonPressed.bind(this, pageDef)}
                          class='ui-directory-button'
                        />
                      );
                    })}
                  </UiListFocusable>
                </div>
              );
            })}
        </UiList>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}