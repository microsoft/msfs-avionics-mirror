import {
  ClockEvents, DebounceTimer, FSComponent, MathUtils, NodeReference, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { ApproachNameDisplay, Fms } from '@microsoft/msfs-garminsdk';

import { FlightPlanStore, G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

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

  private readonly departureBottomLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly departureBottomLabelTextRef = FSComponent.createRef<HTMLDivElement>();
  private readonly arrivalBottomLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly arrivalBottomLabelTextRef = FSComponent.createRef<HTMLDivElement>();
  private readonly approachBottomLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly approachBottomLabelTextRef = FSComponent.createRef<HTMLDivElement>();

  private readonly departureText = this.props.store.departureString.map(x => x ? x : '____');
  private readonly arrivalText = this.props.store.arrivalString.map(x => x ? x : '____');

  private readonly refreshButtonTextTimer = new DebounceTimer();
  private needRefreshDepartureButtonText = false;
  private needRefreshArrivalButtonText = false;
  private needRefreshApproachButtonText = false;

  private readonly canActivateApproach = Subject.create(false);
  private readonly canActivateVtf = Subject.create(false);
  private readonly canMissedApproachActivate = Subject.create(false);

  private clockSub?: Subscription;
  private readonly textSubs: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Procedures');

    this.clockSub = this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1).handle(this.update.bind(this), true);

    const refreshAllButtonTextScaling = this.refreshAllButtonTextScaling.bind(this);

    this.textSubs.push(
      this.departureText.sub(() => {
        this.needRefreshDepartureButtonText = true;
        this.refreshButtonTextTimer.schedule(refreshAllButtonTextScaling, 0);
      }, false, true),

      this.arrivalText.sub(() => {
        this.needRefreshArrivalButtonText = true;
        this.refreshButtonTextTimer.schedule(refreshAllButtonTextScaling, 0);
      }, false, true),

      this.props.store.approachProcedure.sub(() => {
        this.needRefreshApproachButtonText = true;
        this.refreshButtonTextTimer.schedule(refreshAllButtonTextScaling, 0);
      }, false, true),
    );
  }

  /** @inheritdoc */
  public onOpen(): void {
    for (const sub of this.textSubs) {
      sub.resume();
    }

    this.needRefreshDepartureButtonText = true;
    this.needRefreshArrivalButtonText = true;
    this.needRefreshApproachButtonText = true;
    this.refreshButtonTextTimer.schedule(this.refreshAllButtonTextScaling.bind(this), 0);
  }

  /** @inheritdoc */
  public onClose(): void {
    for (const sub of this.textSubs) {
      sub.pause();
    }
    this.refreshButtonTextTimer.clear();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.clockSub?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.clockSub?.pause();
  }

  /**
   * Refreshes the horizontal scaling of all of this page's selection button text elements, if necessary.
   */
  private refreshAllButtonTextScaling(): void {
    const departureBottomLabelWidth = this.departureBottomLabelRef.instance.clientWidth;
    const departureBottomLabelTextWidth = this.departureBottomLabelTextRef.instance.offsetWidth;

    const arrivalBottomLabelWidth = this.arrivalBottomLabelRef.instance.clientWidth;
    const arrivalBottomLabelTextWidth = this.arrivalBottomLabelTextRef.instance.offsetWidth;

    const approachBottomLabelWidth = this.approachBottomLabelRef.instance.clientWidth;
    const approachBottomLabelTextWidth = this.approachBottomLabelTextRef.instance.offsetWidth;

    if (this.needRefreshDepartureButtonText) {
      this.refreshButtonTextScaling(
        this.departureBottomLabelTextRef,
        departureBottomLabelWidth,
        departureBottomLabelTextWidth
      );
      this.needRefreshDepartureButtonText = false;
    }

    if (this.needRefreshArrivalButtonText) {
      this.refreshButtonTextScaling(
        this.arrivalBottomLabelTextRef,
        arrivalBottomLabelWidth,
        arrivalBottomLabelTextWidth
      );
      this.needRefreshArrivalButtonText = false;
    }

    if (this.needRefreshApproachButtonText) {
      this.refreshButtonTextScaling(
        this.approachBottomLabelTextRef,
        approachBottomLabelWidth,
        approachBottomLabelTextWidth
      );
      this.needRefreshApproachButtonText = false;
    }
  }

  /**
   * Refreshes the horizontal scaling of one of this page's selection button text elements. If the text element is
   * wider than its containing element, then it will be scaled to fit inside the container. Otherwise, it will be
   * horizontally scaled to unity.
   * @param textRef A reference to the text element to refresh.
   * @param containerWidth The width of the text element's containing element, in pixels.
   * @param textWidth The width of the text element, in pixels.
   */
  private refreshButtonTextScaling(textRef: NodeReference<HTMLDivElement>, containerWidth: number, textWidth: number): void {
    if (textWidth > containerWidth) {
      textRef.instance.style.transform = `scaleX(${MathUtils.floor(containerWidth / textWidth, 0.01)})`;
    } else {
      textRef.instance.style.transform = '';
    }
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
            <div ref={this.departureBottomLabelRef} class="bottom-label cyan">
              <div ref={this.departureBottomLabelTextRef}>{this.departureText}</div>
            </div>
            <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_departure_sm.png`} />
          </GtcTouchButton>
          <GtcTouchButton onPressed={() => { this.gtcService.changePageTo<GtcArrivalPage>(GtcViewKeys.Arrival).ref.initSelection(); }}>
            <div class="top-label">Arrival</div>
            <div ref={this.arrivalBottomLabelRef} class="bottom-label cyan">
              <div ref={this.arrivalBottomLabelTextRef}>{this.arrivalText}</div>
            </div>
            <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_arrivals_sm.png`} />
          </GtcTouchButton>
          <GtcTouchButton
            onPressed={() => { this.gtcService.changePageTo<GtcApproachPage>(GtcViewKeys.Approach).ref.initSelection(); }}
            onDestroy={() => { approachDisplayRef.getOrDefault()?.destroy(); }}
          >
            <div class="top-label">Approach</div>
            <div ref={this.approachBottomLabelRef} class="bottom-label">
              <div ref={this.approachBottomLabelTextRef}>
                <ApproachNameDisplay
                  ref={approachDisplayRef}
                  class="cyan"
                  approach={this.props.store.approachProcedure}
                  airport={this.props.store.destinationFacility}
                  useZeroWithSlash={true}
                  nullText="____"
                />
              </div>
            </div>
            <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_approach_sm.png`} />
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

    this.refreshButtonTextTimer.clear();

    this.departureText.destroy();
    this.arrivalText.destroy();

    this.clockSub?.destroy();

    for (const sub of this.textSubs) {
      sub.destroy();
    }

    super.destroy();
  }
}
