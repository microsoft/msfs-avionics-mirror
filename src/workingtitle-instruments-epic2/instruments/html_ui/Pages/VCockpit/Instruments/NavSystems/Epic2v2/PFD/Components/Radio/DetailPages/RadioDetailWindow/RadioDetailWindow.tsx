import { DisplayComponent, FSComponent, VNode, ComponentProps, EventBus } from '@microsoft/msfs-sdk';
import { DisplayUnitIndices, NavComUserSettingManager } from '@microsoft/msfs-epic2-shared';
import { DetailPagesController, RadioSubWindowDetailPage } from '../DetailPagesController';
import { AdfDetailPage } from '../AdfDetailPage/AdfDetailPage';
import { BaseDetailPage } from '../BaseDetailPage';
import { ComDetailPage } from '../ComDetailPage';
import { DmeDetailPage } from '../DmeDetailPage';
import { NavDetailPage } from '../NavDetailPage/NavDetailPage';
import { TrafficDetailPage } from '../TrafficDetailPage';
import { XpdrDetailPage } from '../XpdrDetailPage';

import './RadioDetailWindow.css';

/** The properties for the {@link RadioDetailWindow} component. */
interface RadioDetailWindowProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** Display unit index. */
  duIndex: DisplayUnitIndices;
  /** Controls which Radio Management Detail Page to show in the subwindow and its display data. */
  detailPagesController: DetailPagesController;
  /** The settings manager to use. */
  readonly settings: NavComUserSettingManager;
}

/** The RadioDetailWindow component. */
export class RadioDetailWindow extends DisplayComponent<RadioDetailWindowProps> {

  private readonly radioDetailCom1Ref = FSComponent.createRef<BaseDetailPage<any>>();
  private readonly radioDetailCom2Ref = FSComponent.createRef<BaseDetailPage<any>>();
  private readonly radioDetailNav1Ref = FSComponent.createRef<BaseDetailPage<any>>();
  private readonly radioDetailNav2Ref = FSComponent.createRef<BaseDetailPage<any>>();
  private readonly radioDetailAdf1Ref = FSComponent.createRef<BaseDetailPage<any>>();
  private readonly radioDetailDmeRef = FSComponent.createRef<BaseDetailPage<any>>();
  private readonly radioDetailXpdrRef = FSComponent.createRef<BaseDetailPage<any>>();
  private readonly radioDetailTcasRef = FSComponent.createRef<BaseDetailPage<any>>();

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="radio-detail-window" ref={this.props.ref}>
        <ComDetailPage
          type={RadioSubWindowDetailPage.COM1}
          ref={this.radioDetailCom1Ref}
          bus={this.props.bus}
          index={1}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
        <ComDetailPage
          type={RadioSubWindowDetailPage.COM2}
          ref={this.radioDetailCom2Ref}
          bus={this.props.bus}
          index={2}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
        <NavDetailPage
          type={RadioSubWindowDetailPage.NAV1}
          ref={this.radioDetailNav1Ref}
          bus={this.props.bus}
          index={1}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
        <NavDetailPage
          type={RadioSubWindowDetailPage.NAV2}
          ref={this.radioDetailNav2Ref}
          bus={this.props.bus}
          index={2}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
        <AdfDetailPage
          type={RadioSubWindowDetailPage.ADF}
          ref={this.radioDetailAdf1Ref}
          bus={this.props.bus}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
        <DmeDetailPage
          type={RadioSubWindowDetailPage.DME}
          ref={this.radioDetailDmeRef}
          bus={this.props.bus}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
        <XpdrDetailPage
          type={RadioSubWindowDetailPage.XPDR}
          ref={this.radioDetailXpdrRef}
          bus={this.props.bus}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
        <TrafficDetailPage
          type={RadioSubWindowDetailPage.TCAS}
          ref={this.radioDetailTcasRef}
          bus={this.props.bus}
          controller={this.props.detailPagesController}
          settings={this.props.settings}
        />
      </div>
    );
  }
}
