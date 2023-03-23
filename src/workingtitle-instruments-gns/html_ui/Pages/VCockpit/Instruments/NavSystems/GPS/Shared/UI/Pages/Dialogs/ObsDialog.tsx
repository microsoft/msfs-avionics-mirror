import {
  ConsumerSubject, ControlPublisher, FSComponent, NavEvents, NavProcSimVars, NumberUnitSubject, SimVarValueType,
  Subject, Unit, UnitFamily, UnitType, VNode, MappedSubject,
} from '@microsoft/msfs-sdk';

import { ObsSuspModes } from '@microsoft/msfs-garminsdk';

import { GNSDigitInput } from '../../Controls/GNSDigitInput';
import { GNSGenericNumberInput } from '../../Controls/GNSGenericNumberInput';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GNSNumberUnitInput } from '../../Controls/GNSNumberUnitInput';
import { SelectableText } from '../../Controls/SelectableText';
import { PageProps, ViewService } from '../Pages';
import { Dialog } from './Dialog';
import { GnsObsEvents } from '../../../Navigation/GnsObsEvents';
import { InteractionEvent } from '../../InteractionEvent';

import './ObsDialog.css';

/**
 * OBS dialog
 */
export class ObsDialog extends Dialog {
  private readonly courseInput = FSComponent.createRef<GNSGenericNumberInput>();

  private readonly cancelObsPrompt = FSComponent.createRef<HTMLSpanElement>();

  private readonly controlPublisher = new ControlPublisher(this.props.bus);

  private readonly angleUnit = Subject.create<Unit<UnitFamily.Angle>>(UnitType.DEGREE);

  private readonly course = NumberUnitSubject.create(UnitType.DEGREE.createNumber(0));

  private readonly obsMode = ConsumerSubject.create(null, ObsSuspModes.NONE);

  private readonly navObsValue = ConsumerSubject.create(null, 0);

  /** @inheritDoc */
  constructor(props: PageProps) {
    super(props);

    const sub = this.props.bus.getSubscriber<GnsObsEvents & NavProcSimVars & NavEvents>();

    this.obsMode.setConsumer(sub.on('obs_susp_mode'));
    this.navObsValue.setConsumer(sub.on('nav_obs_1'));

    // Sync NAV OBS with GPS OBS VALUE if OBS is enabled
    MappedSubject.create(this.obsMode, this.navObsValue).sub(([obsMode, navObsValue]) => {
      if (obsMode === ObsSuspModes.OBS) {
        this.course.set(UnitType.DEGREE.createNumber(navObsValue));
        this.handleSetObsCourse(navObsValue);
      }
    });

    // Show "CANCEL OBS?" prompt when OBS is active
    this.obsMode.sub((mode) => {
      if (mode === ObsSuspModes.OBS) {
        this.cancelObsPrompt.instance.style.visibility = 'visible';
      } else {
        this.cancelObsPrompt.instance.style.visibility = 'hidden';
      }
    });
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.FPL || evt === InteractionEvent.VNAV || evt === InteractionEvent.PROC || evt === InteractionEvent.DirectTo || evt === InteractionEvent.OBS) {
      ViewService.back();

      if (evt === InteractionEvent.OBS) {
        return true;
      }
    }

    return super.onInteractionEvent(evt);
  }

  /**
   * Handles the 'CANCEL OBS?' prompt being activated
   *
   * @returns true
   */
  private handleCancelObs(): boolean {
    SimVar.SetSimVarValue('K:GPS_OBS_OFF', SimVarValueType.Bool, true);
    this.controlPublisher.publishEvent('suspend_sequencing', false);
    ViewService.back();
    return true;
  }

  /**
   * Handles the OBS course value being set
   *
   * @param value the new OBS course selected
   */
  private handleSetObsCourse(value: number): void {
    SimVar.SetSimVarValue('K:GPS_OBS_SET', SimVarValueType.Degree, value);
  }

  /**
   * Handles the OBS course field being changed
   *
   * @param value the new OBS course selected
   */
  private handleChangeObsField(value: number): void {
    this.handleSetObsCourse(value);

    const obsMode = this.obsMode.get();

    const isObsModeActive = obsMode === ObsSuspModes.OBS;

    if (!isObsModeActive) {
      SimVar.SetSimVarValue('K:GPS_OBS_ON', 'Boolean', true);
    }
  }

  /** @inheritDoc */
  protected renderDialog(): VNode | null {
    return (
      <div class="obs-dialog">
        <h2 class="obs-dialog-title cyan">
          SELECT OBS COURSE
        </h2>

        <div class="aux-table obs-dialog-table">
          <h2 class="obs-dialog-table-crs cyan">CRS</h2>

          <GNSNumberUnitInput
            ref={this.courseInput}
            data={this.course as unknown as NumberUnitSubject<UnitFamily.Angle>}
            displayUnit={this.angleUnit}
            digitizer={(value, signValues, digitValues): void => {
              digitValues[0].set(Math.floor((value)));
              digitValues[1].set(Math.floor((value % 10)));
            }}
            editOnActivate={false}
            class=''
            renderInactiveValue={(value): VNode => (
              <div>
                {value.toFixed(0).padStart(3, '0')}
                <GNSVerticalUnitDisplay unit={this.angleUnit} />
              </div>
            )}
            onInputAccepted={(v): void => this.handleChangeObsField(v)}
          >
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={36} increment={1} scale={10} wrap={true} formatter={(v) => v.toFixed(0).padStart(2, '0')} />
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} formatter={(v) => v.toFixed(0)} />
            <GNSVerticalUnitDisplay unit={this.angleUnit} />
          </GNSNumberUnitInput>

          <h2 class="obs-dialog-table-from">FROM ABV</h2>
        </div>

        <span ref={this.cancelObsPrompt}>
          <SelectableText class="obs-action-text" data={Subject.create('CANCEL OBS?')} selectedClass="selected-white" onEnt={this.handleCancelObs.bind(this)} />
        </span>
      </div>
    );
  }
}