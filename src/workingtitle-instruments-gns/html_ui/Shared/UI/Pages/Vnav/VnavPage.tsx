import {
  FocusPosition, FSComponent, MappedSubject, NodeReference, NumberUnitSubject, Subject, Subscribable, Unit,
  UnitFamily, UnitType, UserSetting, VNode,
} from '@microsoft/msfs-sdk';

import { UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { MenuDefinition, MenuEntry, Page, ViewService } from '../Pages';
import { InteractionEvent } from '../../InteractionEvent';
import { GNSUiControl } from '../../GNSUiControl';
import { OptionDialog } from '../../Controls/OptionDialog';
import { GNSNumberUnitInput } from '../../Controls/GNSNumberUnitInput';
import { GNSDigitInput } from '../../Controls/GNSDigitInput';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { SelectableText } from '../../Controls/SelectableText';
import {
  GnsVnavRefMode, GnsVnavSettingsManager, GnsVnavTargetAltitudeMode,
} from '../../../Navigation/Vnav/GnsVnavSettings';
import { GnsVnavEvents, GnsVnavRefLegOption, GnsVnavStatusType } from '../../../Navigation/Vnav/GnsVnavEvents';

import './VnavPage.css';

/**
 * VNAV Page
 */
export class VnavPage extends Page {
  private readonly root = FSComponent.createRef<GNSUiControl>();

  private readonly targetAltitudeModeSelectorRef = FSComponent.createRef<SelectableText>();
  private readonly targetAltitudeModeDialogRef = FSComponent.createRef<OptionDialog>();
  private readonly refLegSelectorRef = FSComponent.createRef<SelectableText>();
  private readonly refLegDialogRef = FSComponent.createRef<OptionDialog>();
  private readonly refModeSelectorRef = FSComponent.createRef<SelectableText>();
  private readonly refModeDialogRef = FSComponent.createRef<OptionDialog>();

  private readonly unitsSettingsManager = UnitsUserSettings.getManager(this.props.bus);
  private readonly gnsVnavSettingsManager = GnsVnavSettingsManager.getManager(this.props.bus);

  private readonly vnavCanBeUsed = Subject.create(false);
  private readonly aglSupportedForCurrentLeg = Subject.create(false);

  private readonly targetAltitudeModeSelectionEnabled = MappedSubject.create(
    ([vnavCanBeUsed, aglSupportForCurrentLeg]) => vnavCanBeUsed && aglSupportForCurrentLeg,
    this.vnavCanBeUsed, this.aglSupportedForCurrentLeg,
  );

  private readonly refModeConstrainedForCurrentLeg = Subject.create(false);

  private readonly refModeSelectionEnabled = MappedSubject.create(
    ([vnavCanBeUsed, refModeConstrainedForCurrentLeg]) => vnavCanBeUsed && !refModeConstrainedForCurrentLeg,
    this.vnavCanBeUsed, this.refModeConstrainedForCurrentLeg,
  );

  private readonly anyLegsAvailable = Subject.create(false);

  private readonly targetAltitudeSetting = this.gnsVnavSettingsManager.getSetting('target_altitude');
  private readonly targetAltitudeModeSetting = this.gnsVnavSettingsManager.getSetting('target_altitude_mode');
  private readonly refDistanceSetting = this.gnsVnavSettingsManager.getSetting('ref_distance');
  private readonly refModeSetting = this.gnsVnavSettingsManager.getSetting('ref_mode');
  private readonly refLegIndexSetting = this.gnsVnavSettingsManager.getSetting('ref_leg_index');
  private readonly vsProfileSetting = this.gnsVnavSettingsManager.getSetting('profile_vs');
  private readonly messagesOnSetting = this.gnsVnavSettingsManager.getSetting('messages_on');

  private readonly targetAltitudeNumberUnit = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly refDistanceNumberUnit = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));
  private readonly vsProfileNumberUnit = NumberUnitSubject.create(UnitType.FPM.createNumber(0));
  private readonly vsRequired = NumberUnitSubject.create(UnitType.FPM.createNumber(0));

  private readonly availableLegs: GnsVnavRefLegOption[] = [];

  private readonly targetAltitudeModeText = Subject.create('');
  private readonly refModeText = Subject.create('');
  private readonly refLegText = Subject.create('');

  private readonly statusText = Subject.create('');
  private readonly statusValue = Subject.create('');

  private readonly menu = new VnavPageMenu(
    this.messagesOnSetting,
    () => this.messagesOnSetting.set(!this.messagesOnSetting.get()),
    () => this.gnsVnavSettingsManager.getAllSettings().forEach((setting) => setting.resetToDefault()),
  );

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();
    this.root.instance.blur();
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.targetAltitudeModeDialogRef.instance.setItems([
      'Above Wpt',
      'MSL',
    ], false);
    this.refModeDialogRef.instance.setItems([
      'Before',
      'After',
    ], false);

    this.handleClosePopup(this.targetAltitudeModeDialogRef);
    this.handleClosePopup(this.refModeDialogRef);
    this.handleClosePopup(this.refLegDialogRef);

    this.setupNumberUnitSubject(this.targetAltitudeSetting, UnitType.FOOT, this.targetAltitudeNumberUnit, this.unitsSettingsManager.altitudeUnits);
    this.setupNumberUnitSubject(this.refDistanceSetting, UnitType.NMILE, this.refDistanceNumberUnit, this.unitsSettingsManager.distanceUnitsLarge);
    this.setupNumberUnitSubject(this.vsProfileSetting, UnitType.FPM, this.vsProfileNumberUnit, this.unitsSettingsManager.verticalSpeedUnits);

    this.targetAltitudeModeSetting.sub((value) => {
      this.targetAltitudeModeText.set(value === GnsVnavTargetAltitudeMode.Msl ? 'MSL' : 'Above Wpt');
    }, true);

    this.refModeSetting.sub((value) => {
      this.refModeText.set(value === GnsVnavRefMode.Before ? 'Before' : 'After');
    }, true);

    this.vnavCanBeUsed.sub(() => this.refLegText.set(this.calculateRefLegText()));
    this.refLegIndexSetting.sub(() => this.refLegText.set(this.calculateRefLegText()));

    const sub = this.props.bus.getSubscriber<GnsVnavEvents>();

    sub.on('gnsvnav_has_input_data').whenChanged().handle((canBeUsed) => {
      this.vnavCanBeUsed.set(canBeUsed);
    });

    sub.on('gnsvnav_agl_available').whenChanged().handle((isAvailable) => {
      this.aglSupportedForCurrentLeg.set(isAvailable);
    });

    sub.on('gnsvnav_forced_ref_mode').whenChanged().handle((forcedRefMode) => {
      if (forcedRefMode === null) {
        this.refModeConstrainedForCurrentLeg.set(false);
      } else {
        this.refModeConstrainedForCurrentLeg.set(true);
      }
    });

    sub.on('gnsvnav_available_ref_legs').whenChanged().handle((legs) => {
      this.handleNewLegsAvailable(legs);
    });
    this.handleNewLegsAvailable([]);

    sub.on('gnsvnav_vsr').whenChanged().handle((vsr) => {
      this.vsRequired.set(vsr, this.unitsSettingsManager.verticalSpeedUnits.get());
    });

    sub.on('gnsvnav_status').whenChanged().handle((data) => {
      if (data) {
        const [type, value] = data;

        switch (type) {
          case GnsVnavStatusType.BeginDescentIn: {
            const formattedTime = Utils.SecondsToDisplayDuration(value, true, true, false);

            this.statusText.set('Begin Descent in');
            this.statusValue.set(formattedTime);
            break;
          }
          case GnsVnavStatusType.DescendToTarget: {
            this.statusText.set('Descend to target');
            this.statusValue.set('');
            break;
          }
          default:
            this.statusText.set('');
            this.statusValue.set('');
        }
      }
    });

    // Hook up target altitude mode selection enabled

    this.targetAltitudeModeSelectionEnabled.sub((enabled) => {
      this.targetAltitudeModeSelectorRef.instance.setDisabled(!enabled);
    }, true);

    // Hook up ref mode selection enabled

    this.refModeSelectionEnabled.sub((enabled) => {
      this.refModeSelectorRef.instance.setDisabled(!enabled);
    }, true);

    // Hook up ref leg selection enabled

    this.anyLegsAvailable.sub((enabled) => {
      this.refLegSelectorRef.instance.setDisabled(!enabled);
    }, true);
  }

  /**
   * Sets up for keeping a user setting, a number unit subject, and a unit subject in sync
   *
   * @param setting              the setting to get values from
   * @param settingCanonicalUnit the canonical unit of the setting to get values from
   * @param numberUnitSub        the number unit subject
   * @param unitSettingSub       a subscription to the unit to use for the number unit subject
   */
  private setupNumberUnitSubject(
    setting: UserSetting<any>,
    settingCanonicalUnit: Unit<any>,
    numberUnitSub: NumberUnitSubject<any, any>,
    unitSettingSub: Subscribable<Unit<any>>,
  ): void {
    setting.sub((value) => {
      const converted = unitSettingSub.get().convertFrom(value, settingCanonicalUnit);

      numberUnitSub.set(converted);
    }, true);

    unitSettingSub.sub((unit) => {
      const currentValue = numberUnitSub.get();
      const converted = unit.convertFrom(currentValue.number, currentValue.unit);

      numberUnitSub.set(unit.createNumber(converted));
    }, true);
  }

  /**
   * Handles new possible legs being recieved from the controller
   *
   * @param legs the available legs
   */
  private handleNewLegsAvailable(legs: GnsVnavRefLegOption[]): void {
    // TODO this is called too often
    this.availableLegs.length = 0;
    this.availableLegs.push(...legs);

    this.anyLegsAvailable.set(legs.length > 0);

    this.refLegText.set(this.calculateRefLegText());

    this.refLegDialogRef.instance.setItems(legs.map((it) => it.ident), false);
  }

  /**
   * Figure out the ref leg text to be displayed
   *
   * @returns string
   */
  private calculateRefLegText(): string {
    const vnavCanBeUsed = this.vnavCanBeUsed.get();
    const refLegIndex = this.refLegIndexSetting.get();

    if (!vnavCanBeUsed || refLegIndex === -1 || !this.anyLegsAvailable.get()) {
      return '_____';
    }

    const matching = this.availableLegs.find((leg) => leg.index === refLegIndex);

    // If there is no matching leg found, the index wasn't -1 and there are still available legs,
    // we return the same value as was previously set. This replicates trainer behaviour, where the
    // previously used leg's ident remains even after the lag was passed.
    return matching?.ident ?? this.refLegText.get();
  }

  /** @inheritDoc */
  onInteractionEvent(evt: InteractionEvent): boolean {
    if (this.targetAltitudeModeDialogRef.instance.isFocused) {
      const handled = this.targetAltitudeModeDialogRef.instance.onInteractionEvent(evt);

      if (handled) {
        return true;
      }
    }

    if (this.refLegDialogRef.instance.isFocused) {
      const handled = this.refLegDialogRef.instance.onInteractionEvent(evt);

      if (handled) {
        return true;
      }
    }

    if (this.refModeDialogRef.instance.isFocused) {
      const handled = this.refModeDialogRef.instance.onInteractionEvent(evt);

      if (handled) {
        return true;
      }
    }

    if (evt === InteractionEvent.RightKnobPush) {
      if (this.root.instance.isFocused) {
        this.root.instance.blur();
      } else {
        this.root.instance.focus(FocusPosition.First);
      }
      return true;
    }

    if (evt === InteractionEvent.VNAV) {
      ViewService.back();
      return true;
    }

    if (evt === InteractionEvent.MENU) {
      ViewService.menu(this.menu);
      return true;
    }

    if (this.root.instance.isFocused) {
      const handled = this.root.instance.onInteractionEvent(evt);

      if (handled) {
        return true;
      }
    }

    return super.onInteractionEvent(evt);
  }

  /**
   * Handles opening a popup
   *
   * @param popup the popup to open
   *
   * @returns true
   */
  private handleOpenPopup(popup: NodeReference<OptionDialog>): boolean {
    this.root.instance.blur();
    popup.instance.openPopout(0);
    popup.instance.focus(FocusPosition.First);
    return true;
  }

  /**
   * Handles closing a popup
   *
   * @param popup the popup to close
   *
   * @returns true
   */
  private handleClosePopup(popup: NodeReference<OptionDialog>): boolean {
    popup.instance.closePopout();
    popup.instance.blur();
    this.root.instance.focus(FocusPosition.MostRecent);
    return true;
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div ref={this.el} id="vnav-page" class="page hide-element">
        <GNSUiControl ref={this.root} isolateScroll>
          <h2 class="page-header">VERTICAL NAVIGATION</h2>

          <div class="vnav-page-target-altitude">
            <h2 class="cyan">TARGET ALTITUDE</h2>
            <div class="databox full-width">
              <div class="vnav-page-entry-altitude-value-container">
                <GNSNumberUnitInput
                  data={this.targetAltitudeNumberUnit as unknown as NumberUnitSubject<UnitFamily.Distance>}
                  displayUnit={this.unitsSettingsManager.altitudeUnits}
                  digitizer={(value, signValues, digitValues): void => {
                    digitValues[0].set(Math.floor(value / 10_000) * 10_000);
                    digitValues[1].set(Math.floor(value % 10_000 / 1_000) * 1_000);
                    digitValues[2].set(Math.floor(value % 1000 / 100) * 100);
                    digitValues[3].set(Math.floor(value % 100 / 10) * 10);
                    digitValues[4].set(Math.floor(value % 10));
                  }}
                  editOnActivate={false}
                  activateOnClr={true}
                  class='vnav-page-entry-altitude-value'
                  renderInactiveValue={(value): VNode => (
                    <div>
                      {value.toFixed(0)}
                      <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.altitudeUnits} />
                    </div>
                  )}
                  onInputAccepted={(v): void => {
                    const converted = this.unitsSettingsManager.altitudeUnits.get().convertTo(v, UnitType.FOOT);

                    this.targetAltitudeSetting.set(converted);
                  }}
                >
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10000} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
                  <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.altitudeUnits} />
                </GNSNumberUnitInput>
              </div>

              <span class="vnav-page-entry-altitude-type">
                <SelectableText
                  ref={this.targetAltitudeModeSelectorRef}
                  data={this.targetAltitudeModeText}
                  onRightInnerDec={this.handleOpenPopup.bind(this, this.targetAltitudeModeDialogRef)}
                  onRightInnerInc={this.handleOpenPopup.bind(this, this.targetAltitudeModeDialogRef)}
                />
              </span>
            </div>
          </div>

          <div class="vnav-page-target-position">
            <h2 class="cyan">TARGET POSITION</h2>
            <div class="databox full-width">
              <div class="vnav-page-entry-position-distance-value-container">
                <GNSNumberUnitInput
                  data={this.refDistanceNumberUnit as unknown as NumberUnitSubject<UnitFamily.Distance>}
                  displayUnit={this.unitsSettingsManager.distanceUnitsLarge}
                  digitizer={(value, signValues, digitValues): void => {
                    const scaled = value * 10;

                    // The value is encoded as a three-digit integer, so we manually extract here
                    const fixedValue = Array.from(scaled.toFixed(0));

                    if (fixedValue.length === 3) {
                      const digitOne = parseInt(fixedValue[0]);
                      const digitTwo = parseInt(fixedValue[1]);
                      const digitThree = parseInt(fixedValue[2]);

                      digitValues[0].set(digitOne * 100);
                      digitValues[1].set(digitTwo * 10);
                      digitValues[2].set(digitThree);
                    } else if (fixedValue.length === 2) {
                      const digitOne = parseInt(fixedValue[0]);
                      const digitTwo = parseInt(fixedValue[1]);

                      digitValues[0].set(0);
                      digitValues[1].set(digitOne * 10);
                      digitValues[2].set(digitTwo);
                    }
                  }}
                  editOnActivate={false}
                  activateOnClr={true}
                  class='vnav-page-entry-position-distance-value'
                  renderInactiveValue={(value): VNode => (
                    <div>
                      {(value / 10).toFixed(1)}
                      <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.distanceUnitsLarge} />
                    </div>
                  )}
                  onInputAccepted={(v): void => {
                    const scaled = v / 10;
                    const converted = this.unitsSettingsManager.distanceUnitsLarge.get().convertTo(scaled, UnitType.NMILE);

                    this.refDistanceSetting.set(converted);
                  }}
                >
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
                  <span>.</span>
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
                  <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.distanceUnitsLarge} />
                </GNSNumberUnitInput>
              </div>

              <span class="vnav-page-entry-position-distance-type">
                <SelectableText
                  ref={this.refModeSelectorRef}
                  data={this.refModeText}
                  onRightInnerDec={this.handleOpenPopup.bind(this, this.refModeDialogRef)}
                  onRightInnerInc={this.handleOpenPopup.bind(this, this.refModeDialogRef)}
                />
              </span>

              <span class="vnav-page-entry-position-distance-ref">
                <SelectableText
                  ref={this.refLegSelectorRef}
                  data={this.refLegText}
                  onRightInnerDec={this.handleOpenPopup.bind(this, this.refLegDialogRef)}
                  onRightInnerInc={this.handleOpenPopup.bind(this, this.refLegDialogRef)}
                />
              </span>
            </div>
          </div>

          <div id="vnav-page-vs" class="vnav-vs-profile-vsr">
            <div style="width: 41%">
              <h2 class="cyan vnav-page-vs-profile">VS PROFILE</h2>
              <div class="vnav-page-entry-vs-profile-container databox full-width">
                <GNSNumberUnitInput
                  data={this.vsProfileNumberUnit as unknown as NumberUnitSubject<UnitFamily.Speed>}
                  displayUnit={this.unitsSettingsManager.verticalSpeedUnits}
                  digitizer={(value, signValues, digitValues): void => {
                    digitValues[0].set(Math.floor(Math.abs(value) / 1_000) * 1_000);
                    digitValues[1].set(Math.floor(Math.abs(value) % 1000 / 100) * 100);
                    digitValues[2].set(Math.floor(Math.abs(value) % 100 / 10) * 10);
                    digitValues[3].set(Math.floor(Math.abs(value) % 10));
                  }}
                  editOnActivate={false}
                  activateOnClr={true}
                  class='vnav-page-entry-vs-profile'
                  renderInactiveValue={(value): VNode => (
                    <div>
                      {value.toFixed(0)}
                      <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.verticalSpeedUnits} />
                    </div>
                  )}
                  onInputAccepted={(v): void => {
                    const converted = this.unitsSettingsManager.distanceUnitsLarge.get().convertTo(v, UnitType.NMILE);

                    this.vsProfileSetting.set(converted);
                  }}
                >
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
                  <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
                  <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.verticalSpeedUnits} />
                </GNSNumberUnitInput>
              </div>
            </div>
            <div style="width: 41%">
              <h2 class="cyan">VSR</h2>
              <div class="databox full-width">
                <div class="vnav-page-entry-vs-required">
                  {this.vsRequired.map((it) => {
                    if (it.number === Number.MAX_SAFE_INTEGER) {
                      return '_____';
                    } else {
                      return it.number.toFixed(0);
                    }
                  })}
                  <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.verticalSpeedUnits} />
                </div>
              </div>
            </div>
          </div>

          {this.props.gnsType === 'wt530' && (
            <div style="margin-top: 13px;">
              <h2 class="cyan">STATUS</h2>
              <div class="databox full-width vnav-page-status-container">
                <span>{this.statusText}</span>
                <span>{this.statusValue}</span>
              </div>
            </div>
          )}
        </GNSUiControl>

        <OptionDialog
          ref={this.targetAltitudeModeDialogRef}
          class="vnav-page-ref-target-altitude-mode-dialog"
          label="REFERENCE"
          onSelected={(index): void => {
            this.targetAltitudeModeSetting.set(index === 0 ? GnsVnavTargetAltitudeMode.Agl : GnsVnavTargetAltitudeMode.Msl);

            this.handleClosePopup(this.targetAltitudeModeDialogRef);
          }}
        />

        <OptionDialog
          ref={this.refLegDialogRef}
          class="vnav-page-ref-leg-dialog"
          label="WAYPOINT"
          onSelected={(index): void => {
            this.refLegIndexSetting.set(this.availableLegs[index].index);

            this.handleClosePopup(this.refLegDialogRef);
          }}
        />

        <OptionDialog
          ref={this.refModeDialogRef}
          class="vnav-page-ref-mode-dialog"
          label="POSITION"
          onSelected={(index): void => {
            this.refModeSetting.set(index === 0 ? GnsVnavRefMode.Before : GnsVnavRefMode.After);

            this.handleClosePopup(this.refModeDialogRef);
          }}
        />
      </div>
    );
  }
}

/**
 * Menu for the VNAV page
 */
class VnavPageMenu extends MenuDefinition {
  /** @inheritDoc */
  constructor(
    private readonly vnavMessagesOn: Subscribable<boolean>,
    private readonly onToggleVnavMessages: () => void,
    private readonly onRestoreDefaults: () => void,
  ) {
    super();

    this.vnavMessagesOn.sub((on) => {
      this.vnavMessagesEntryText.set(`VNAV Messages ${on ? 'Off' : 'On'}?`);
    });
  }

  private readonly vnavMessagesEntryText = Subject.create('VNAV Messages On?');

  public readonly entries: readonly MenuEntry[] = [
    { label: this.vnavMessagesEntryText, disabled: false, action: this.onToggleVnavMessages },
    { label: 'Restore Defaults?', disabled: false, action: this.onRestoreDefaults },
  ];
}