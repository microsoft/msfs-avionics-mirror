import { FSComponent, MathUtils, VNode } from '@microsoft/msfs-sdk';

import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { UiDialogResult } from '../../../../Shared/UiSystem/UiDialogView';
import { UiKnobId } from '../../../../Shared/UiSystem/UiKnobTypes';
import { TabbedContainer } from '../../../../Shared/Components/TabbedContainer/TabbedContainer';
import { AbstractFindFrequencyDialog, AbstractFindFrequencyDialogInput, AbstractFindFrequencyDialogOutput } from '../AbstractFindFrequencyDialog';
import { NavFindFrequencyFplTab } from './Tabs/FlightPlan/NavFindFrequencyFplTab';
import { NavFindFrequencyNearestTab } from './Tabs/Nearest/NavFindFrequencyNearestTab';
import { NavFindFrequencyRecentTab } from './Tabs/Recent/NavFindFrequencyRecentTab';
import { NavFindFrequencyUserTab } from './Tabs/User/NavFindFrequencyUserTab';

import './NavFindFrequencyDialog.css';

/**
 * A dialog that allows the user to find a NAV frequency.
 */
export class NavFindFrequencyDialog extends AbstractFindFrequencyDialog<AbstractFindFrequencyDialogInput, AbstractFindFrequencyDialogOutput> {

  /** @inheritDoc */
  public request(input: AbstractFindFrequencyDialogInput): Promise<UiDialogResult<AbstractFindFrequencyDialogOutput>> {
    return new Promise(resolve => {
      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.activeContext = this.contexts;
      this.activeContext.radioIndex = input.radioIndex;
      this.activeContext.hidden.set(false);

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
      <div class="nav-find-dialog ui-view-panel">
        <div class="nav-find-dialog-title">
          <img class="nav-find-dialog-title-icon" src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_find.png`} />
          Find NAV Frequency
        </div>
        <TabbedContainer
          ref={this.tabbedContainerRef}
          validKnobIds={[UiKnobId.RightOuter]}
          tabLength={this.tabLength}
          tabPosition={'top'}
          tabSpacing={this.tabSpacing}
          tabsPerListPage={4}
          gduFormat={this.props.uiService.gduFormat}
          class="com-find-dialog-tabbed-container"
        >
          <NavFindFrequencyRecentTab
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
          <NavFindFrequencyNearestTab
            uiService={this.props.uiService}
            tabLabel={'Nearest\nAirports'}
            isEnabled={true}
            backButtonImgSrc={this.backButtonImgSrc}
            backButtonLabel={this.backButtonLabel}
            onBackPressed={this.onBackPressed.bind(this)}
            onFrequencySelected={this.onFrequencySelected.bind(this)}
            listConfig={this.freqListConfig}
            posHeadingDataProvider={this.props.posHeadingDataProvider}
          />
          <NavFindFrequencyFplTab
            uiService={this.props.uiService}
            tabLabel={'Flight\nPlan'}
            isEnabled={false}
            backButtonImgSrc={this.backButtonImgSrc}
            backButtonLabel={this.backButtonLabel}
            onBackPressed={this.onBackPressed.bind(this)}
            onFrequencySelected={this.onFrequencySelected.bind(this)}
            listConfig={this.freqListConfig}
          />
          <NavFindFrequencyUserTab
            uiService={this.props.uiService}
            tabLabel={'User'}
            isEnabled={true}
            backButtonImgSrc={this.backButtonImgSrc}
            backButtonLabel={this.backButtonLabel}
            onBackPressed={this.onBackPressed.bind(this)}
            onFrequencySelected={this.onFrequencySelected.bind(this)}
            savedFrequenciesProvider={this.props.savedFrequenciesProvider}
            listConfig={this.freqListConfig}
            class={'nav-find-frequency-tab-user'}
          />
        </TabbedContainer>
      </div>
    );
  }
}
