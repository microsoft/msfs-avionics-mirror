import {
  FSComponent, ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FlightPlanPredictor, MappedSubject,
  NodeReference, Subject, VNode,
} from '@microsoft/msfs-sdk';
import { PerformancePlanData } from '../../Shared/Performance/PerformancePlanData';
import { WT21MfdTextPage } from '../../Shared/WT21MfdTextPageEvents';
import { MfdDisplayMode, MFDUserSettings } from '../MFDUserSettings';
import { APPRefPage } from './Pages/APPRefPage';
import { GNSSStatusPage } from './Pages/GNSSStatusPage';
import { MfdTextPageComponent } from './Pages/MfdTextPageComponent';
import { NavStatusPage } from './Pages/NavStatusPage';
import { PosReportPage } from './Pages/PosReportPage';
import { PosSummaryPage } from './Pages/PosSummaryPage';
import { ProgressPage } from './Pages/ProgressPage';
import { TORefPage } from './Pages/TORefPage';
import { VORDMEStatusPage } from './Pages/VORDMEStatusPage';

/**
 * Props for {@link TextPagesContainer}
 */
export interface TextPagesContainerProps extends ComponentProps {
  /**
   * The event bus
   */
  bus: EventBus,

  /** The flight planner*/
  planner: FlightPlanner,

  /** The facility loader */
  facLoader: FacilityLoader,

  /** The flight plan predictor */
  predictor: FlightPlanPredictor,

  /** The performance plan */
  performancePlan: PerformancePlanData,

  /** The MFD index */
  mfdIndex: number,
}

/**
 * Container for MFD text pages
 */
export class TextPagesContainer extends DisplayComponent<TextPagesContainerProps> {
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly pageRefs: { [k in WT21MfdTextPage]: NodeReference<MfdTextPageComponent> } = {
    [WT21MfdTextPage.TakeoffRef]: FSComponent.createRef<MfdTextPageComponent>(),
    [WT21MfdTextPage.ApproachRef]: FSComponent.createRef<MfdTextPageComponent>(),
    [WT21MfdTextPage.Progress]: FSComponent.createRef<MfdTextPageComponent>(),
    [WT21MfdTextPage.NavStatus]: FSComponent.createRef<MfdTextPageComponent>(),
    [WT21MfdTextPage.PosSummary]: FSComponent.createRef<MfdTextPageComponent>(),
    [WT21MfdTextPage.PosReport]: FSComponent.createRef<MfdTextPageComponent>(),
    [WT21MfdTextPage.VorStatus]: FSComponent.createRef<MfdTextPageComponent>(),
    [WT21MfdTextPage.GnssStatus]: FSComponent.createRef<MfdTextPageComponent>(),
  };

  private currentPage: NodeReference<MfdTextPageComponent> = this.pageRefs[WT21MfdTextPage.TakeoffRef];

  private readonly mfdSettingManager = MFDUserSettings.getAliasedManager(this.props.bus);

  private visibleForElectricity = Subject.create(false);
  private visibleForMode = Subject.create(false);

  /** Show the MFD HSI based on electricity status. */
  public electricityShow(): void {
    this.visibleForElectricity.set(true);
  }

  /** Hide the MFD HSI based on electricity status. */
  public electricityHide(): void {
    this.visibleForElectricity.set(false);
  }

  /** Show the MFD HSI based on MFD mode. */
  public modeShow(): void {
    this.visibleForMode.set(true);
  }

  /** Hide the MFD HSI based on MFD mode. */
  public modeHide(): void {
    this.visibleForMode.set(false);
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.mfdSettingManager.getSetting('mfdDisplayMode').sub((mode) => {
      if (mode === MfdDisplayMode.Map) {
        this.modeHide();
      } else {
        this.modeShow();
      }
    }, true);

    const currentPage = this.mfdSettingManager.getSetting('mfdSelectedTextPage').value;

    const pageRef = this.pageRefs[currentPage];

    if (pageRef) {
      this.currentPage = pageRef;
    }

    MappedSubject.create(this.visibleForElectricity, this.visibleForMode).sub(([visibleForElectricity, visibleForMode]) => {
      const shown = visibleForElectricity && visibleForMode;

      this.containerRef.instance.classList.toggle('hidden', !shown);
    }, true);

    this.mfdSettingManager.whenSettingChanged('mfdSelectedTextPage').handle((page) => {
      const newPageRef = this.pageRefs[page];

      if (this.currentPage) {
        this.currentPage.instance.hide();
      }

      this.currentPage = newPageRef;

      this.currentPage.instance.show();
    });
  }

  /** @inheritDoc */
  render(): VNode | null {
    return (
      <div ref={this.containerRef}>
        <TORefPage ref={this.pageRefs[WT21MfdTextPage.TakeoffRef]} bus={this.props.bus} mfdIndex={this.props.mfdIndex} performancePlan={this.props.performancePlan} />
        <APPRefPage ref={this.pageRefs[WT21MfdTextPage.ApproachRef]} bus={this.props.bus} mfdIndex={this.props.mfdIndex} />
        <ProgressPage
          ref={this.pageRefs[WT21MfdTextPage.Progress]}
          bus={this.props.bus}
          mfdIndex={this.props.mfdIndex}
          planner={this.props.planner}
          facLoader={this.props.facLoader}
          predictor={this.props.predictor}
          performancePlan={this.props.performancePlan}
        />
        <NavStatusPage
          ref={this.pageRefs[WT21MfdTextPage.NavStatus]}
          bus={this.props.bus}
          mfdIndex={this.props.mfdIndex}
          planner={this.props.planner}
        />
        <PosSummaryPage ref={this.pageRefs[WT21MfdTextPage.PosSummary]} bus={this.props.bus} mfdIndex={this.props.mfdIndex} />
        <PosReportPage
          ref={this.pageRefs[WT21MfdTextPage.PosReport]}
          bus={this.props.bus}
          mfdIndex={this.props.mfdIndex}
          planner={this.props.planner}
          facLoader={this.props.facLoader}
          predictor={this.props.predictor}
          performancePlan={this.props.performancePlan}
        />
        <VORDMEStatusPage ref={this.pageRefs[WT21MfdTextPage.VorStatus]} bus={this.props.bus} mfdIndex={this.props.mfdIndex} />
        <GNSSStatusPage ref={this.pageRefs[WT21MfdTextPage.GnssStatus]} bus={this.props.bus} mfdIndex={this.props.mfdIndex} />
      </div>
    );
  }
}