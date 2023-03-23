import {
  FSComponent, VNode, Subject, ClockEvents, Subscription,
} from '@microsoft/msfs-sdk';
import { ApproachNameDisplay, Fms } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcApproachPage } from './GtcApproachPage';
import { GtcArrivalPage } from './GtcArrivalPage';
import { GtcDeparturePage } from './GtcDeparturePage';

import './GtcProceduresPage.css';

/**
 * The properties for the GtcProceduresPage component.
 */
interface GtcProceduresPageProps extends GtcViewProps {
  /** An instance of the Fms. */
  fms: Fms;
  /** Which flight plan index to work with. */
  planIndex: number;
  /** The flight plan store. */
  store: FlightPlanStore;
}

/**
 * Displays the loaded procedures and links to the procedure pages.
 */
export class GtcProceduresPage extends GtcView<GtcProceduresPageProps> {
  private thisNode?: VNode;

  private readonly departureText = this.props.store.departureString.map(x => x ? x : '____');
  private readonly arrivalText = this.props.store.arrivalString.map(x => x ? x : '____');

  private readonly canActivateApproach = Subject.create(false);
  private readonly canActivateVtf = Subject.create(false);
  private readonly canMissedApproachActivate = Subject.create(false);

  private clockSub?: Subscription;

  /** @inheritdoc */
  public override onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Procedures');

    this.clockSub = this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1).handle(this.update.bind(this)).pause();
  }

  /** @inheritdoc */
  public override onResume(): void {
    this.clockSub?.resume(true);
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.clockSub?.pause();
  }

  /** Runs checks to see if certain buttons should be enabled or not. */
  private update(): void {
    this.canActivateApproach.set(this.props.fms.canActivateApproach());
    this.canActivateVtf.set(this.props.fms.canActivateVtf());
    this.canMissedApproachActivate.set(this.props.fms.canMissedApproachActivate());
  }

  /** @inheritdoc */
  public render(): VNode {
    const approachDisplayRef = FSComponent.createRef<ApproachNameDisplay>();

    return (
      <div class="gtc-procedures-page">
        <div class="procedures-top-column">
          <GtcTouchButton onPressed={() => { this.gtcService.changePageTo<GtcDeparturePage>(GtcViewKeys.Departure).ref.initSelection(); }}>
            <div class="top-label">Departure</div>
            <div class="bottom-label cyan">{this.departureText}</div>
            <img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_departure_sm.png" />
          </GtcTouchButton>
          <GtcTouchButton onPressed={() => { this.gtcService.changePageTo<GtcArrivalPage>(GtcViewKeys.Arrival).ref.initSelection(); }}>
            <div class="top-label">Arrival</div>
            <div class="bottom-label cyan">{this.arrivalText}</div>
            <img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_arrivals_sm.png" />
          </GtcTouchButton>
          <GtcTouchButton
            onPressed={() => { this.gtcService.changePageTo<GtcApproachPage>(GtcViewKeys.Approach).ref.initSelection(); }}
            onDestroy={() => { approachDisplayRef.getOrDefault()?.destroy(); }}
          >
            <div class="top-label">Approach</div>
            <div class="bottom-label">
              <ApproachNameDisplay
                ref={approachDisplayRef}
                class="cyan"
                approach={this.props.store.approachProcedure}
                airport={this.props.store.destinationFacility}
                useZeroWithSlash={true}
                nullText="____"
              />
            </div>
            <img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_approach_sm.png" />
          </GtcTouchButton>
        </div>
        <div class="procedures-bottom-row">
          <GtcTouchButton
            label={'Activate\nApproach'}
            isEnabled={this.canActivateApproach}
            onPressed={() => {
              this.props.fms.activateApproach();
              this.gtcService.goBack();
            }}
          />
          <GtcTouchButton
            label={'Activate\nVectors To\nFinal'}
            isEnabled={this.canActivateVtf}
            onPressed={() => {
              this.props.fms.activateVtf();
              this.gtcService.goBack();
            }}
          />
          <GtcTouchButton
            label={'Activate\nMissed\nApproach'}
            isEnabled={this.canMissedApproachActivate}
            onPressed={() => {
              this.props.fms.activateMissedApproach();
              this.gtcService.goBack();
            }}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.departureText.destroy();
    this.arrivalText.destroy();

    this.clockSub?.destroy();

    super.destroy();
  }
}