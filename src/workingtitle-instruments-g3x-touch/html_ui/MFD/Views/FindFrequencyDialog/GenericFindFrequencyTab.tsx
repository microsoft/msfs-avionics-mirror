import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { AbstractTabbedContent } from '../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { TabbedContentProps } from '../../../Shared/Components/TabbedContainer/TabbedContent';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiList } from '../../../Shared/Components/List/UiList';
import { GenericFindFrequencyTabButtonRow } from './GenericFindFrequencyTabButtonRow';
import { FindFrequencyListConfiguration } from './AbstractFindFrequencyDialog';

/** Component props for {@link GenericFindFrequencyTab}. */
export interface GenericFindFrequencyTabProps extends TabbedContentProps {
  /** The UI service instance. */
  uiService: UiService;
  /** The configuration of the list */
  listConfig: FindFrequencyListConfiguration;
  /** The label of the back button. */
  backButtonLabel: Subject<string>;
  /** The image source of the back button. */
  backButtonImgSrc: Subject<string>;
  /** The function to call when the back button is pressed. */
  onBackPressed: () => void;
  /** The function to call when a frequency is selected. */
  onFrequencySelected: (frequency: number, name?: string) => void;
  /** The class of the tab. (optional) */
  class?: string;
}

/**
 * A generic tab for a find frequency dialog.
 */
export class GenericFindFrequencyTab<T extends GenericFindFrequencyTabProps> extends AbstractTabbedContent<T> {
  protected readonly listRef = FSComponent.createRef<UiList<any>>();

  protected readonly listHasElements = Subject.create<boolean>(false);

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    if (this.listRef.getOrDefault()) {
      const listKnobLabelPipe = this.listRef.instance.knobLabelState.pipe(this._knobLabelState, true);

      this.listHasElements.sub(hasElements => {
        if (!hasElements) {
          listKnobLabelPipe.pause();
          this._knobLabelState.clear();
        } else {
          listKnobLabelPipe.resume(true);
        }
      }, true);

      this.listRef.instance.scrollToIndex(0, 0, true, false);
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.getOrDefault()?.onUiInteractionEvent(event) || false;
  }

  /**
   * Handles the selection of a frequency.
   * @param frequency The frequency that was selected.
   * @param name The name of the frequency that was selected.
   */
  protected onFrequencySelected(frequency: number, name: string): void {
    this.props.onFrequencySelected(frequency, name);
  }

  /**
   * Generates the content of the tab.
   * @returns The tab content VNode.
   */
  protected getTabContent(): VNode {
    return (
      <div>{this.props.tabLabel}</div>
    );
  }

  /**
   * Generates the button row for the tab.
   * @returns The button row VNode.
   */
  protected getButtonRow(): VNode {
    return (
      <GenericFindFrequencyTabButtonRow
        actionButtonLabel={'Select an Airport'}
        backButtonImgSrc={this.props.backButtonImgSrc}
        backButtonLabel={this.props.backButtonLabel}
        onBackPressed={this.props.onBackPressed}
      />
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.props.class}>
        {this.getTabContent()}
        {this.getButtonRow()}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.listRef.getOrDefault()?.destroy();
  }
}
