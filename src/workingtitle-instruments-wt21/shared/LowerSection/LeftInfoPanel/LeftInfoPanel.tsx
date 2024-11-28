import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { InstrumentConfig, WT21InstrumentType } from '../../Config';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';
import { ElapsedTime } from '../../DCP/ElapsedTime';
import { GuiDialog, GuiDialogProps } from '../../UI/GuiDialog';
import { FormatSwitch } from '../RightInfoPanel/FormatSwitch';
import { WaypointAlerter } from '../WaypointAlerter';
import { BearingPointerDataFields } from './BearingPointerDataFields';
import { ElapsedTimeDisplay } from './ElapsedTimeDisplay';
import { NavSourceDataField } from './NavSourceDataField';
import { NavSourcePreset } from './NavSourcePreset';

/** @inheritdoc */
interface LeftInfoPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The instrument configuration object */
  instrumentConfig: InstrumentConfig;

  /** The elapsed time state */
  elapsedTime?: ElapsedTime;

  /** A subscribable to the active menu */
  activeMenu?: Subscribable<GuiDialog<GuiDialogProps> | null>;

  /** A waypoint alerter instance that controls display of waypoint alert flashing. */
  waypointAlerter: WaypointAlerter;
}

/** The LeftInfoPanel component. */
export class LeftInfoPanel extends DisplayComponent<LeftInfoPanelProps> {
  private readonly navSourcePresetRef = FSComponent.createRef<NavSourcePreset>();
  private readonly bearingPointerDataFieldsRef = FSComponent.createRef<BearingPointerDataFields>();

  private readonly isUsingSoftkeys = this.props.instrumentConfig.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.activeMenu?.sub(x => {
      const isPfdMenuVisible = !!x;
      this.navSourcePresetRef.instance.setVisibility(!isPfdMenuVisible);
      this.bearingPointerDataFieldsRef.instance.setVisibility(!isPfdMenuVisible);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <NavSourceDataField bus={this.props.bus} waypointAlerter={this.props.waypointAlerter} />

        {this.props.instrumentConfig.instrumentType === WT21InstrumentType.Mfd && this.isUsingSoftkeys && (
          <FormatSwitch bus={this.props.bus} instrumentConfig={this.props.instrumentConfig} format="upper" orientation="left" />
        )}

        {this.props.instrumentConfig.instrumentType === WT21InstrumentType.Pfd && (
          <NavSourcePreset
            bus={this.props.bus}
            ref={this.navSourcePresetRef}
            displayUnitLayout={this.props.instrumentConfig.displayUnitConfig.displayUnitLayout}
          />
        )}

        <BearingPointerDataFields bus={this.props.bus} ref={this.bearingPointerDataFieldsRef} />
        {this.props.elapsedTime &&
          <ElapsedTimeDisplay
            elapsedTimeText={this.props.elapsedTime.elapsedTimeText}
            isVisible={this.props.elapsedTime.elapsedTimeIsVisibile}
            displayUnitLayout={this.props.instrumentConfig.displayUnitConfig.displayUnitLayout}
          />
        }
      </>
    );
  }
}
