import { ComSpacing, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { GenericFindFrequencyTab, GenericFindFrequencyTabProps } from '../../../GenericFindFrequencyTab';
import { PositionHeadingDataProvider } from '../../../../../../Shared/Navigation';
import { FindFrequencyNearestAirportList } from '../../../FindFrequencyNearestAirportList/FindFrequencyNearestAirportList';
import { G3XUnitsUserSettings } from '../../../../../../Shared/Settings/G3XUnitsUserSettings';

/** Component props for {@link ComFindFrequencyNearestAptTab}. */
export interface ComFindFrequencyNearestAptTabProps extends GenericFindFrequencyTabProps {
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;
  /** The com spacing for the radio */
  comSpacing: ComSpacing;
}

/**
 * A tab for a COM find frequency dialog that shows nearby airports.
 */
export class ComFindFrequencyNearestAptTab extends GenericFindFrequencyTab<ComFindFrequencyNearestAptTabProps> {

  private readonly findFrequencyNearestAirportListRef = FSComponent.createRef<FindFrequencyNearestAirportList>();

  /** @inheritDoc */
  public onUpdate(time: number): void {
    super.onUpdate(time);
    this.findFrequencyNearestAirportListRef.instance.update(time);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
    this.findFrequencyNearestAirportListRef.instance.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
    this.findFrequencyNearestAirportListRef.instance.pause();
  }

  protected readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  /** @inheritDoc */
  protected getTabContent(): VNode {
    return (
      <div class="com-find-dialog-tabbed-content">
        <FindFrequencyNearestAirportList
          ref={ this.findFrequencyNearestAirportListRef }
          listRef={ this.listRef }
          listHasElements={ this.listHasElements }
          posHeadingDataProvider={ this.props.posHeadingDataProvider }
          uiService={ this.props.uiService }
          radioType={ this.props.comSpacing === ComSpacing.Spacing833Khz ? 'com833' : 'com25' }
          listConfig={ this.props.listConfig }
          unitsSettingManager={ this.unitsSettingManager }
          onFrequencySelected={ this.props.onFrequencySelected }
        />
      </div>
    );
  }
}
