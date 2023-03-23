import {
  BasicNavAngleUnit, DurationDisplay, DurationDisplayFormat, FSComponent, HoldUtils, LegTurnDirection,
  MappedSubject, NavMath, NumberFormatter, Subject, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import {
  BearingDisplay, Fms, NumberUnitDisplay, ToggleTouchButton, UnitsDistanceSettingMode, UnitsUserSettings,
} from '@microsoft/msfs-garminsdk';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcDialogResult, GtcDialogView } from '../../Dialog/GtcDialogView';
import { GtcListDialogParams } from '../../Dialog/GtcListDialog';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcInteractionEvent, GtcViewKeys } from '../../GtcService';
import { GtcCourseDialog } from '../../Dialog/GtcCourseDialog';
import { GtcDurationDialogMSS } from '../../Dialog/GtcDurationDialogMSS';
import { GtcDistanceDialog } from '../../Dialog/GtcDistanceDialog';
import { HoldController } from './HoldController';
import { HoldCourseDirection, HoldInfo, HoldInput, HoldLegMode, HoldStore, LeftOrRight } from './HoldStore';
import './GtcHoldPage.css';

/**
 * A request input for {@link GtcHoldPage}.
 */
export interface GtcHoldPageInput extends HoldInput {
  /** The GTC view title to display with the page. Defaults to `'Hold at Waypoint'` */
  title?: string;
}

/**
 * A request result returned by {@link GtcHoldPage}.
 */
export type GtcHoldPageOutput = HoldInfo | 'cancel-hold';

const BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
const DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

/** The properties for the {@link GtcHoldPage} component. */
export interface GtcHoldPageProps extends GtcViewProps {
  /** The FMS. */
  fms: Fms;
}

/**
 * A GTC hold page.
 */
export class GtcHoldPage extends GtcView<GtcHoldPageProps> implements GtcDialogView<GtcHoldPageInput, GtcHoldPageOutput> {
  private thisNode?: VNode;

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly store = new HoldStore();
  private readonly controller = new HoldController(this.store, this.props.fms);

  public readonly legName = this.store.input.map(input => {
    return input?.legName ?? '';
  });

  private readonly holdDescription = MappedSubject.create(([course, holdCourseDirection, legName]) => {
    const actualCourse = holdCourseDirection === HoldCourseDirection.Inbound
      ? course.number
      : NavMath.normalizeHeading(course.number + 180);
    const direction = HoldUtils.getDirectionString(actualCourse);

    return `Hold ${direction.toUpperCase()} of ${legName}`;
  }, this.store.course, this.store.holdCourseDirection, this.legName);

  private readonly cancelButtonLabel = this.legName.map(legName => `Cancel Hold at\n${legName}`);

  private readonly showOnMap = Subject.create(false);

  private resolveFunction?: (value: GtcDialogResult<GtcHoldPageOutput>) => void;
  private resultObject: GtcDialogResult<GtcHoldPageOutput> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._sidebarState.slot1.set('cancel');

    this.store.isExistingHold.sub(isExistingHold => {
      this._sidebarState.enterButtonLabel.set(isExistingHold ? 'Save' : 'Create');
    }, true);

    this.store.isEditableHold.sub(isEditableHold => {
      this._sidebarState.slot5.set(isEditableHold ? 'enterEnabled' : null);
    }, true);
  }

  /** @inheritdoc */
  public request(input: GtcHoldPageInput): Promise<GtcDialogResult<GtcHoldPageOutput>> {
    if (!this.isAlive) {
      throw new Error('GtcHoldPage: cannot request from a dead dialog');
    }

    return new Promise(resolve => {
      this.cleanupRequest();
      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this._title.set(input.title ?? 'Hold at Waypoint');

      this.controller.reset();
      this.store.input.set(input);
    });
  }

  /** @inheritdoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.resolve();
        return true;
    }

    return false;
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Attempts to resolve the current request.
   */
  private resolve(): void {
    if (this.store.isEditableHold.get()) {
      const course = this.store.course.get();
      const courseUnitCopy = BasicNavAngleUnit.create(course.unit.isMagnetic(), course.unit.magVar);

      this.resultObject = {
        wasCancelled: false,
        payload: {
          holdCourseDirection: this.store.holdCourseDirection.get(),
          legDistance: this.store.legDistance.get().copy(),
          legMode: this.store.legMode.get(),
          legTime: this.store.legTime.get().copy(),
          turnDirection: this.store.turnDirection.get(),
          course: courseUnitCopy.createNumber(course.number),
        },
      };

      this.props.gtcService.goBack();
    } else {
      this.props.gtcService.goBack();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="gtc-hold-page">
        <div class="row top-row">
          <div class="column">
            <GtcListSelectTouchButton
              gtcService={this.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              label="Turn"
              isEnabled={this.store.isEditableHold}
              state={this.store.turnDirection}
              renderValue={state => state === 1 ? 'Left' : 'Right'}
              listParams={(state): GtcListDialogParams<LeftOrRight> => ({
                inputData: [{
                  value: LegTurnDirection.Left,
                  labelRenderer: () => 'Left',
                }, {
                  value: LegTurnDirection.Right,
                  labelRenderer: () => 'Right',
                }],
                title: 'Select Turn Direction',
                selectedValue: state.get(),
              })}
            />
            {/* TODO */}
            <GtcTouchButton
              label={'Hold at\nP.POS'}
              isEnabled={false}
            />
          </div>
          <div class="gtc-panel">
            <div class="gtc-panel-title">Direction</div>
            <div class="column">
              <GtcListSelectTouchButton
                gtcService={this.gtcService}
                listDialogKey={GtcViewKeys.ListDialog1}
                state={this.store.holdCourseDirection}
                isEnabled={this.store.isEditableHold}
                class="no-label"
                listParams={(state): GtcListDialogParams<HoldCourseDirection> => ({
                  inputData: [{
                    value: HoldCourseDirection.Inbound,
                    labelRenderer: () => 'Inbound',
                  }, {
                    value: HoldCourseDirection.Outbound,
                    labelRenderer: () => 'Outbound',
                  }],
                  title: 'Select Course Direction',
                  selectedValue: state.get(),
                })}
              />
              <GtcTouchButton
                class="touch-button-value"
                isEnabled={this.store.isEditableHold}
                onPressed={async () => {
                  const result = await this.gtcService.openPopup<GtcCourseDialog>(GtcViewKeys.CourseDialog).ref.request({
                    title: 'Course',
                    initialValue: this.store.course.get().number
                  });

                  if (result.wasCancelled) { return; }

                  this.store.course.set(result.payload);
                }}
              >
                <div class="touch-button-label">Course</div>
                <BearingDisplay
                  displayUnit={this.unitsSettingManager.navAngleUnits}
                  formatter={BEARING_FORMATTER}
                  value={this.store.course}
                  class="touch-button-value-value"
                />
              </GtcTouchButton>
            </div>
          </div>
          <div class="gtc-panel">
            <div class="gtc-panel-title">Leg Length</div>
            <div class="column">
              <GtcListSelectTouchButton
                gtcService={this.gtcService}
                listDialogKey={GtcViewKeys.ListDialog1}
                state={this.store.legMode}
                isEnabled={this.store.isEditableHold}
                class="no-label"
                listParams={(state): GtcListDialogParams<HoldLegMode> => ({
                  inputData: [{
                    value: HoldLegMode.Distance,
                    labelRenderer: () => 'Distance',
                  }, {
                    value: HoldLegMode.Time,
                    labelRenderer: () => 'Time',
                  }],
                  title: 'Select Leg Mode',
                  selectedValue: state.get(),
                })}
              />
              <GtcTouchButton
                class="touch-button-value"
                isEnabled={this.store.isEditableHold}
                isVisible={this.store.legMode.map(x => x === HoldLegMode.Time)}
                onPressed={async () => {
                  const result = await this.gtcService.openPopup<GtcDurationDialogMSS>(GtcViewKeys.DurationDialogMSS1).ref.request({
                    initialValue: this.store.legTime.get().asUnit(UnitType.SECOND),
                    min: 30,
                    max: 599,
                    title: 'Enter Leg Time',
                  });

                  if (result.wasCancelled) { return; }

                  this.store.legTime.set(result.payload, UnitType.SECOND);
                }}
              >
                <div class="touch-button-label">Leg Time</div>
                <DurationDisplay
                  value={this.store.legTime}
                  class="touch-button-value-value"
                  options={{
                    format: DurationDisplayFormat.mm_ss,
                  }}
                />
              </GtcTouchButton>
              <GtcTouchButton
                class="touch-button-value"
                isEnabled={this.store.isEditableHold}
                isVisible={this.store.legMode.map(x => x === HoldLegMode.Distance)}
                onPressed={async () => {
                  if (this.unitsSettingManager.getSetting('unitsDistance').value === UnitsDistanceSettingMode.Metric) {
                    const result = await this.gtcService.openPopup<GtcDistanceDialog>(GtcViewKeys.DistanceDialog1).ref.request({
                      initialValue: this.store.legDistance.get().asUnit(UnitType.KILOMETER),
                      unitType: UnitType.KILOMETER,
                      minimumValue: 1.9,
                      maximumValue: 185.0,
                      title: 'Enter Leg Distance',
                    });

                    if (result.wasCancelled) { return; }

                    this.store.legDistance.set(result.payload.value, UnitType.KILOMETER);
                  } else {
                    const result = await this.gtcService.openPopup<GtcDistanceDialog>(GtcViewKeys.DistanceDialog1).ref.request({
                      initialValue: this.store.legDistance.get().asUnit(UnitType.NMILE),
                      unitType: UnitType.NMILE,
                      minimumValue: 1.0,
                      maximumValue: 99.9,
                      title: 'Enter Leg Distance',
                    });

                    if (result.wasCancelled) { return; }

                    this.store.legDistance.set(result.payload.value, UnitType.NMILE);
                  }
                }}
              >
                <div class="touch-button-label">Leg Distance</div>
                <NumberUnitDisplay
                  class="touch-button-value-value"
                  value={this.store.legDistance}
                  displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                  formatter={DISTANCE_FORMATTER}
                />
              </GtcTouchButton>
            </div>
          </div>
        </div>
        <div class="hold-description">{this.holdDescription}</div>
        {/* TODO */}
        <GtcTouchButton
          class="expect-button touch-button-value"
          isEnabled={false}
        >
          <div class="touch-button-label">Expect Further Clearance</div>
          <div class="touch-button-value-value">__:__ <span style="font-size: 0.75em;">UTC</span></div>
        </GtcTouchButton>
        <div class="row bottom-row">
          <GtcTouchButton
            label={this.cancelButtonLabel}
            isEnabled={this.store.isCancelButtonEnabled}
            onPressed={async () => {
              const accepted = await GtcDialogs.openMessageDialog(this.gtcService, `Cancel Hold at ${this.legName.get()}?`);

              if (!accepted) { return; }

              this.resultObject = {
                wasCancelled: false,
                payload: 'cancel-hold',
              };

              this.props.gtcService.goBack();
            }}
          />
          {/* TODO */}
          <ToggleTouchButton
            label="Show On Map"
            state={this.showOnMap}
            isEnabled={false}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}