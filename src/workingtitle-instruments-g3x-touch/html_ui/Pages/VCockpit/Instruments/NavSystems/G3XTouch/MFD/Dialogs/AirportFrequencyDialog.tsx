import {
  ArraySubject, ComSpacing, FacilityFrequency, FacilityFrequencyType, FSComponent, ICAO, RadioFrequencyFormatter, RadioType, Subject, VNode,
} from '@microsoft/msfs-sdk';
import { AirportWaypoint, DynamicListData } from '@microsoft/msfs-garminsdk';

import { AbstractUiView } from '../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../Shared/UiSystem/UiDialogView';
import { UiList } from '../../Shared/Components/List/UiList';
import { UiListItem } from '../../Shared/Components/List/UiListItem';
import { FindFrequencyListConfiguration } from '../Views/FindFrequencyDialog/AbstractFindFrequencyDialog';
import { GduFormat } from '../../Shared/CommonTypes';
import { UiKnobUtils } from '../../Shared/UiSystem/UiKnobUtils';
import { UiImgTouchButton } from '../../Shared/Components/TouchButton/UiImgTouchButton';
import { G3XTouchFilePaths } from '../../Shared/G3XTouchFilePaths';
import { UiListFocusable } from '../../Shared/Components/List/UiListFocusable';
import { UiTouchButton } from '../../Shared/Components/TouchButton/UiTouchButton';
import { UiInteractionEvent } from '../../Shared/UiSystem/UiInteraction';
import { UiWaypointIcon } from '../../Shared/Components/Waypoint/UiWaypointIcon';
import { UiViewKeys } from '../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../Shared/UiSystem/UiViewTypes';
import { WaypointInfoPopup } from '../Views/WaypointInfoPopup/WaypointInfoPopup';

import './AirportFrequencyDialog.css';


/**
 * The input of a {@link AirportFrequencyDialog}.
 */
export interface FindFrequencyNearestAptFreqSelectionDialogInput {
  /** The type of the radio */
  type: RadioType.Com | RadioType.Nav;
  /** The array of frequencies to display */
  frequencies: readonly FacilityFrequency[];
  /** The airport waypoint */
  airport: AirportWaypoint;
  /** The formatter for the frequency. */
  frequencyFormatter: (freqHz: number) => string;
}

/**
 * The output of a {@link AirportFrequencyDialog}.
 */
export interface FindFrequencyNearestAptFreqSelectionDialogOutput {
  /** The frequency that was selected in Hz, rounded to 5000 Hz (5 KHz) */
  frequency: FacilityFrequency;
}

/**
 * A dialog that allows the user to select a frequency from a list of frequencies.
 */
export class AirportFrequencyDialog extends AbstractUiView
  implements UiDialogView<FindFrequencyNearestAptFreqSelectionDialogInput, FindFrequencyNearestAptFreqSelectionDialogOutput> {

  private readonly facilityTypeMap = new Map<FacilityFrequencyType, string>([
    [FacilityFrequencyType.ATIS, 'ATIS'],
    [FacilityFrequencyType.Unicom, 'Unicom'],
    [FacilityFrequencyType.Multicom, 'Multicom'],
    [FacilityFrequencyType.CTAF, 'CTAF'],
    [FacilityFrequencyType.Ground, 'Ground'],
    [FacilityFrequencyType.Tower, 'Tower'],
    [FacilityFrequencyType.Clearance, 'Clearance'],
    [FacilityFrequencyType.Approach, 'Approach'],
    [FacilityFrequencyType.Departure, 'Departure'],
    [FacilityFrequencyType.Center, 'Center'],
    [FacilityFrequencyType.FSS, 'FSS'],
    [FacilityFrequencyType.AWOS, 'AWOS'],
    [FacilityFrequencyType.ASOS, 'ASOS'],
    [FacilityFrequencyType.CPT, 'Pre-Taxi'],
    [FacilityFrequencyType.GCO, 'Remote Clearance'],
  ]);

  private readonly LIST_CONFIGS: Map<GduFormat, FindFrequencyListConfiguration> = new Map([
    ['460', {
      itemHeightPx: 82,
      itemsPerPage: 5,
      itemSpacingPx: 8,
      listHeightPx: 450,
    }],
    // TODO: specify 470 numbers, these are the 460 numbers as placeholder
    ['470', {
      itemHeightPx: 82,
      itemsPerPage: 5,
      itemSpacingPx: 8,
      listHeightPx: 450,
    }],
  ]);

  private readonly listConfig = this.LIST_CONFIGS.get(this.props.uiService.gduFormat)
    || {
      itemHeightPx: 82,
      itemsPerPage: 5,
      itemSpacingPx: 8,
      listHeightPx: 450,
    };

  private thisNode?: VNode;
  private readonly listRef = FSComponent.createRef<UiList<any>>();
  private readonly iconRef = FSComponent.createRef<UiWaypointIcon>();

  private readonly frequencyArray = ArraySubject.create<FacilityFrequency>([]);
  private type = RadioType.Com;
  private readonly airportWaypoint = Subject.create<AirportWaypoint | null>(null);
  private readonly airportIdent = Subject.create('');
  private readonly airportName = Subject.create('');
  private frequencyFormatter: (freqHz: number) => string = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz, '___.__');

  private resolveFunction?: (value: UiDialogResult<FindFrequencyNearestAptFreqSelectionDialogOutput>) => void;
  private resultObject: UiDialogResult<FindFrequencyNearestAptFreqSelectionDialogOutput> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public request(input: FindFrequencyNearestAptFreqSelectionDialogInput): Promise<UiDialogResult<FindFrequencyNearestAptFreqSelectionDialogOutput>> {
    return new Promise(resolve => {
      this.cleanupRequest();

      this.type = input.type;
      const facility = input.airport.facility.get();
      this.airportWaypoint.set(input.airport);
      this.airportIdent.set(ICAO.getIdent(facility.icao));
      this.airportName.set(Utils.Translate(facility.name));
      this.frequencyFormatter = input.frequencyFormatter;
      this.frequencyArray.set(input.frequencies);

      this.listRef.instance.scrollToIndex(0, 0, true, false);

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };
    });
  }

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    this.thisNode = node;

    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.focusController.clearRecentFocus();
    this.cleanupRequest();
  }


  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }


  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this.frequencyArray.clear();
    this.type = RadioType.Com;
    this.airportWaypoint.set(null);
    this.airportIdent.set('');
    this.airportName.set('');

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when this dialog's back button is pressed.
   */
  private onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Opens airport waypoint info popup when the airport info button is pressed.
   */
  private onAirportInfoPressed(): void {
    const airportWpt = this.airportWaypoint.get();
    if (!airportWpt) {
      return;
    }
    this.props.uiService
      .openMfdPopup<WaypointInfoPopup>(UiViewStackLayer.Overlay, UiViewKeys.WaypointInfoPopup, true, {
        popupType: 'slideout-right-full',
        backgroundOcclusion: 'hide',
      })
      .ref.setWaypoint(airportWpt);
  }

  /**
   * Responds to when a frequency is selected.
   * @param frequency The frequency that was selected.
   */
  private onFrequencySelected(frequency: FacilityFrequency): void {
    this.resultObject = {
      wasCancelled: false,
      payload: {
        frequency,
      },
    };

    this.props.uiService.goBackMfd();
  }

  /**
   * Gets the name of a frequency.
   * @param freq The facility frequency to get the name of.
   * @returns The name of the frequency.
   */
  private getFrequencyName(freq: FacilityFrequency): string {
    if (this.type === RadioType.Nav) {
      return freq.name;
    } else {
      return `${this.facilityTypeMap.get(freq.type) ?? ''}`;
    }
  }

  /**
   * Renders a frequency list item.
   * @param data The frequency data to render.
   * @returns The rendered list item.
   */
  public renderItem(data: FacilityFrequency): VNode {
    return (
      <UiListItem>
        <div class="airport-frequency-list-item">
          <div class="airport-frequency-list-item-name">{this.getFrequencyName(data)}</div>
          <UiListFocusable>
            <UiTouchButton
              label={this.frequencyFormatter(data.freqMHz * 1e6)}
              class="airport-frequency-list-item-frequency"
              onPressed={this.onFrequencySelected.bind(this, data)}
            />
          </UiListFocusable>
        </div>
      </UiListItem>
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="ui-view-panel airport-frequency-dialog">
        <div class="airport-frequency-dialog-title">Airport Frequencies</div>
        <div class="airport-frequency-dialog-airport-info">
          <div class="airport-frequency-dialog-icon-container">
            <UiWaypointIcon
              ref={this.iconRef}
              waypoint={this.airportWaypoint}
              class='airport-frequency-dialog-airport-icon'
            />
            <div class="airport-frequency-dialog-airport-ident">{this.airportIdent}</div>
          </div>
          <div>{this.airportName}</div>
        </div>
        <UiList<FacilityFrequency & DynamicListData>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.frequencyArray}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isTurnKnobId)}
          listItemLengthPx={this.listConfig.itemHeightPx}
          listItemSpacingPx={this.listConfig.itemSpacingPx}
          itemsPerPage={this.listConfig.itemsPerPage}
          lengthPx={this.listConfig.listHeightPx}
          renderItem={this.renderItem.bind(this)}
        >
        </UiList>
        <div class="airport-frequency-input-row">
          <UiImgTouchButton
            label={'Cancel'}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`}
            onPressed={this.onBackPressed.bind(this)}
            class="ui-nav-button"
          />
          <UiTouchButton
            label={'Airport\nInfo...'}
            onPressed={this.onAirportInfoPressed.bind(this)}
            class="ui-nav-button airport-info-button"
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.cleanupRequest();

    this.iconRef.getOrDefault()?.destroy();
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
