import { ComSpacing, FSComponent, MathUtils, Subject, VNode } from '@microsoft/msfs-sdk';

import { UiDialogResult } from '../../../../Shared/UiSystem/UiDialogView';
import { UiKnobUtils } from '../../../../Shared/UiSystem/UiKnobUtils';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { TabbedContainer } from '../../../../Shared/Components/TabbedContainer/TabbedContainer';
import { AbstractFindFrequencyDialog, AbstractFindFrequencyDialogInput, AbstractFindFrequencyDialogOutput } from '../AbstractFindFrequencyDialog';
import { ComFindFrequencyRecentTab } from './Tabs/Recent/ComFindFrequencyRecentTab';
import { ComFindFrequencyNearestAptTab } from './Tabs/NearestApt/ComFindFrequencyNearestAptTab';
import { ComFindFrequencyFplTab } from './Tabs/FlightPlan/ComFindFrequencyFplTab';
import { ComFindFrequencyUserTab } from './Tabs/User/ComFindFrequencyUserTab';

import './ComFindFrequencyDialog.css';

/**
 * The input of a COM find frequency dialog.
 */
export interface ComFindFrequencyDialogInput extends AbstractFindFrequencyDialogInput {
  /** The com spacing for the radio */
  comSpacing: ComSpacing;
}

/**
 * A dialog that allows the user to find a COM frequency.
 */
export class ComFindFrequencyDialog extends AbstractFindFrequencyDialog<ComFindFrequencyDialogInput, AbstractFindFrequencyDialogOutput> {
  private readonly comSpacing = Subject.create<ComSpacing>(ComSpacing.Spacing25Khz);

  /** @inheritDoc */
  public request(input: ComFindFrequencyDialogInput): Promise<UiDialogResult<AbstractFindFrequencyDialogOutput>> {
    return new Promise(resolve => {
      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.activeContext = this.contexts;
      this.activeContext.radioIndex = input.radioIndex;
      this.activeContext.hidden.set(false);

      this.comSpacing.set(input.comSpacing);

      this.backButtonLabel.set('Cancel');
      this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`);
    });
  }

  /**
   * Responds to when a frequency is selected.
   * @param frequency The frequency that was selected.
   * @param name (optional) The name of the radio station that was selected
   */
  protected onFrequencySelected(frequency: number, name?: string): void {
    if (!this.activeContext) {
      return;
    }

    this.resultObject = {
      wasCancelled: false,
      payload: {
        // frequency rounded to the nearest 5 kHz, converted to Hz
        frequency: MathUtils.round(frequency, 0.005) * 1e6,
        name,
      }
    };

    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="com-find-dialog ui-view-panel">
        <div class="com-find-dialog-title">
          <img class="com-find-dialog-title-icon" src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_find.png`} />
          Find COM Frequency
        </div>
        <TabbedContainer
          ref={this.tabbedContainerRef}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isOuterKnobId)}
          tabLength={this.tabLength}
          tabPosition={'top'}
          tabSpacing={this.tabSpacing}
          tabsPerListPage={4}
          gduFormat={this.props.uiService.gduFormat}
          class="com-find-dialog-tabbed-container"
        >
          <ComFindFrequencyRecentTab
            uiService={this.props.uiService}
            tabLabel={'Recent'}
            isEnabled={true}
            backButtonImgSrc={this.backButtonImgSrc}
            backButtonLabel={this.backButtonLabel}
            onBackPressed={this.onBackPressed.bind(this)}
            onFrequencySelected={this.onFrequencySelected.bind(this)}
            savedFrequenciesProvider={this.props.savedFrequenciesProvider}
            listConfig={this.freqListConfig}
          />
          <ComFindFrequencyNearestAptTab
            uiService={this.props.uiService}
            tabLabel={'Nearest\nAirports'}
            backButtonImgSrc={this.backButtonImgSrc}
            backButtonLabel={this.backButtonLabel}
            onBackPressed={this.onBackPressed.bind(this)}
            onFrequencySelected={this.onFrequencySelected.bind(this)}
            listConfig={this.freqListConfig}
            posHeadingDataProvider={this.props.posHeadingDataProvider}
            comSpacing={this.comSpacing.get()}
          />
          <ComFindFrequencyFplTab
            uiService={this.props.uiService}
            tabLabel={'Flight\nPlan'}
            isEnabled={false}
            backButtonImgSrc={this.backButtonImgSrc}
            backButtonLabel={this.backButtonLabel}
            onBackPressed={this.onBackPressed.bind(this)}
            onFrequencySelected={this.onFrequencySelected.bind(this)}
            listConfig={this.freqListConfig}
          />
          <ComFindFrequencyUserTab
            uiService={this.props.uiService}
            tabLabel={'User'}
            isEnabled={true}
            backButtonImgSrc={this.backButtonImgSrc}
            backButtonLabel={this.backButtonLabel}
            onBackPressed={this.onBackPressed.bind(this)}
            onFrequencySelected={this.onFrequencySelected.bind(this)}
            savedFrequenciesProvider={this.props.savedFrequenciesProvider}
            comSpacing={this.comSpacing}
            listConfig={this.freqListConfig}
            class={'com-find-frequency-tab-user'}
          />
        </TabbedContainer>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.tabbedContainerRef.getOrDefault()?.destroy();
  }
}
