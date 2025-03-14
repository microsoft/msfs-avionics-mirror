/* eslint-disable max-len */
import {
  DisplayComponent, EventBus, Facility, FacilitySearchType, FSComponent, ICAO, SetSubject, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2Fms, Epic2TscKeyboardEvents, FlightPlanStore, FmsMessageKey, FmsMessageTransmitter, InputField, KeyboardInputButton, ListItem, ModalKey, ModalService,
  TouchButton, UppercaseTextInputFormat
} from '@microsoft/msfs-epic2-shared';

import { SelectObjectModal } from '../../Modals/SelectObjectModal';

import './FlightPlanDtoRandomListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanDtoRandomListItemProps {

  /** The flight plan index. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The event bus */
  bus: EventBus;

  /** The fms */
  fms: Epic2Fms;

  /** Is this item visible? */
  isVisible: Subscribable<boolean>

  /** The modal service */
  modalService: ModalService
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanDtoRandomListItem extends DisplayComponent<FlightPlanDtoRandomListItemProps> {
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.props.bus);
  private readonly publisher = this.props.bus.getPublisher<Epic2TscKeyboardEvents>();
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();

  private readonly inputFieldRef = FSComponent.createRef<InputField<string>>();

  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);
  private readonly dtoWaypoint = Subject.create<string | null>(null);
  private readonly classList = SetSubject.create(['dto-random-list-item']);
  private readonly isVisible = Subject.create(true);

  private readonly airwaySubs = [] as Subscription[];

  /**
   * Gets a facility from an ident
   * @param ident The waypoint ident
   * @returns The chosen facility, or null if there are none
   */
  private async getFacilityFromIdent(ident: string): Promise<Facility | null> {
    const identUpper = ident.toUpperCase();
    const icaos = (await this.props.fms.facLoader.searchByIdentWithIcaoStructs(FacilitySearchType.AllExceptVisual, identUpper)).filter((icao) => icao.ident == identUpper);
    if (!icaos || icaos.length == 0) {
      return null;
    } else {
      let resultA = null;
      if (icaos.length == 1 && icaos[0]) {
        resultA = await this.props.fms.facLoader.tryGetFacility(ICAO.getFacilityTypeFromValue(icaos[0]), icaos[0]);
      } else {
        [resultA] = await this.props.modalService.open<SelectObjectModal>(ModalKey.SelectObject).modal.getFacility(icaos);
      }

      return resultA;
    }
  }

  /**
   * Creates a direct to
   * @returns nothing
   */
  private async directTo(): Promise<void> {
    const ident = this.dtoWaypoint.get();
    this.close();

    if (ident === null) {
      return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
    }

    if (this.props.fms.getFlightPlan(this.props.fms.getPlanIndexForFmcPage()).length < 2) {
      return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.InvalidFlightPlanOp);
    }

    const facility = await this.getFacilityFromIdent(ident);

    if (!facility) {
      return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
    }

    const plan = this.props.fms.getModFlightPlan();

    const legSegment = plan.getSegmentIndex(plan.activeLateralLeg);
    const legIndex = plan.getSegmentLegIndex(plan.activeLateralLeg);

    this.props.fms.createDirectTo(legSegment, legIndex, true, undefined, facility);
    this.props.store.isDtoRandomEntryShown.set(false);

    const activeLegSegment = plan.getSegmentIndex(plan.activeLateralLeg);
    const activeLegIndex = plan.getSegmentLegIndex(plan.activeLateralLeg);
    const activeLeg = plan.tryGetLeg(activeLegSegment, activeLegIndex);
    activeLeg && this.props.store.amendWaypointForDisplay.set(this.props.store.legMap.get(activeLeg));
  }

  /**
   * Closes this list item
   */
  private close(): void {
    this.props.store.isDtoRandomEntryShown.set(false);
    this.closeTscKeyboard();
  }

  /** Closes the tsc keyboard */
  private closeTscKeyboard(): void {
    this.publisher.pub('tsc_keyboard_active_input_id', undefined, true);
    this.publisher.pub('tsc_keyboard_header', '', true);
  }

  private readonly inputFormatter = new UppercaseTextInputFormat('', 30);

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      <ListItem
        ref={this.listItemRef}
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class={this.classList}
        isVisible={this.isVisible}
      >
        <div class='dto-random-touch-button'>
          <div class='dto-random-top-row-container'>
            <div>Direct To:</div>
            <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
            <TouchButton isEnabled={true} variant='bar' class={'close-button'} onPressed={() => this.close()}>
              <div class="text">X</div>
            </TouchButton>
          </div>
          <div class='dto-random-bottom-row-container'>
            <InputField
              ref={this.inputFieldRef}
              bus={this.props.bus}
              textAlign='center'
              bind={this.dtoWaypoint}
              formatter={this.inputFormatter}
              maxLength={30}
              tscDisplayLabel='Direct To'
              tscConnected
              blurOnEnter
              onBlur={this.directTo.bind(this)}
            />
            <TouchButton onPressed={this.directTo.bind(this)} isEnabled={true} variant='bar' class={'enter-button'}>
              <div class="text">Enter</div>
            </TouchButton>
          </div>
        </div>
      </ListItem >
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.inputFieldRef.getOrDefault()?.destroy();
    this.listItemRef.getOrDefault()?.destroy();

    this.airwaySubs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}
