import {
  ArraySubject, ArrayUtils, ComputedSubject, EventBus, FSComponent, MappedSubject, MappedSubscribable, MinimumsControlEvents, MinimumsEvents,
  MinimumsMode, NumberUnitSubject, Subject, Unit, UnitFamily, UnitType, UserSetting, VNode
} from '@microsoft/msfs-sdk';

import { VSpeedUserSettingUtils } from '@microsoft/msfs-garminsdk';

import { ContextMenuDialog, ContextMenuItemDefinition } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { MenuItemDefinition } from '../../../../Shared/UI/Dialogs/PopoutMenuItem';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { G1000ControlList, G1000UiControl } from '../../../../Shared/UI/G1000UiControl';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { NumberInput } from '../../../../Shared/UI/UIControls/NumberInput';
import { SelectControl } from '../../../../Shared/UI/UIControls/SelectControl';
import { ArrowControl } from '../../../../Shared/UI/UiControls2/ArrowControl';
import { DigitInput } from '../../../../Shared/UI/UiControls2/DigitInput';
import { G1000UiControlWrapper } from '../../../../Shared/UI/UiControls2/G1000UiControlWrapper';
import { UiView, UiViewProps } from '../../../../Shared/UI/UiView';
import { UnitsUserSettingManager } from '../../../../Shared/Units/UnitsUserSettings';
import { VSpeedDefinition, VSpeedGroup } from '../../../../Shared/VSpeed/VSpeed';
import { VSpeedUserSettingManager } from '../../../../Shared/VSpeed/VSpeedUserSettings';
import { PFDPageMenuDialog } from '../PFDPageMenuDialog';
import { Timer, TimerMode } from './Timer';
import { TimerInput } from './TimerInput';

import './TimerRef.css';

/**
 * The properties on the timer ref popout component.
 */
interface TimerRefProps extends UiViewProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** A user setting manager. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether this instance of the G1000 has a Radio Altimeter. */
  hasRadioAltimeter: boolean;
}

/**
 * An entry describing a reference V-speed that can be edited through the TimerRef menu.
 */
type VSpeedEntry = {
  /** The V-speed definition. */
  definition: VSpeedDefinition;

  /** The user setting controlling whether the V-speed bug is shown on the airspeed indicator. */
  showSetting: UserSetting<boolean>;

  /** The user setting controlling the default value of the V-speed. */
  defaultValueSetting: UserSetting<number>;

  /** The user setting controlling the user-defined value of the V-speed. */
  userValueSetting: UserSetting<number>;

  /** The current active value of the V-speed. */
  activeValue: MappedSubscribable<number>;

  /** Whether the active value of the V-speed differs from the default value. */
  isEdited: MappedSubscribable<boolean>;
};

/**
 * The PFD timer ref popout.
 */
export class TimerRef extends UiView<TimerRefProps> {
  private static readonly VSPEED_GROUP_COMPARATOR = (a: VSpeedGroup, b: VSpeedGroup): number => {
    // Default group ('') goes before all other groups.
    if (a.name === '') {
      return -1;
    } else if (b.name === '') {
      return 1;
    } else {
      return 0;
    }
  };

  public popoutRef = FSComponent.createRef<UiView>();
  private readonly containerRef = FSComponent.createRef<HTMLElement>();

  private readonly minsToggleComponent = FSComponent.createRef<ArrowToggle>();
  private readonly minsInputComponent = FSComponent.createRef<NumberInput>();

  private readonly vSpeedGroups = Array.from(this.props.vSpeedSettingManager.vSpeedGroups.values()).sort(TimerRef.VSPEED_GROUP_COMPARATOR);

  private readonly vSpeedRowData = ArraySubject.create(
    ArrayUtils.flatMap(this.vSpeedGroups, group => {
      return group.name === '' ? group.vSpeedDefinitions : [group.name, ...group.vSpeedDefinitions];
    }).map(row => {
      if (typeof row === 'string') {
        return row;
      }

      const definition = row;
      const activeValue = VSpeedUserSettingUtils.activeValue(definition.name, this.props.vSpeedSettingManager, false, true);

      return {
        definition,
        showSetting: this.props.vSpeedSettingManager.getSetting(`vSpeedShow_${definition.name}`),
        defaultValueSetting: this.props.vSpeedSettingManager.getSetting(`vSpeedDefaultValue_${definition.name}`),
        userValueSetting: this.props.vSpeedSettingManager.getSetting(`vSpeedUserValue_${definition.name}`),
        activeValue,
        isEdited: MappedSubject.create(
          ([activeVal, defaultVal]) => activeVal !== defaultVal,
          activeValue,
          this.props.vSpeedSettingManager.getSetting(`vSpeedDefaultValue_${definition.name}`)
        )
      } as VSpeedEntry;
    })
  );

  private readonly menuItems: MenuItemDefinition[] = [
    {
      id: 'enable-all',
      renderContent: (): VNode => <span>All References On</span>,
      isEnabled: true,
      action: this.setShowVSpeedBugs.bind(this, true, undefined)
    },
    {
      id: 'disable-all',
      renderContent: (): VNode => <span>All References Off</span>,
      isEnabled: true,
      action: this.setShowVSpeedBugs.bind(this, false, undefined)
    },
    {
      id: 'restore-defaults',
      renderContent: (): VNode => <span>Restore Defaults</span>,
      isEnabled: true,
      action: this.resetVSpeeds.bind(this, undefined)
    },
    ...ArrayUtils.flatMap(this.vSpeedGroups.filter(group => group.name !== ''), group => {
      return [
        {
          id: `enable-all-${group.name}`,
          renderContent: (): VNode => <span>{group.name} References On</span>,
          isEnabled: true,
          action: this.setShowVSpeedBugs.bind(this, true, group.name)
        },
        {
          id: `disable-all-${group.name}`,
          renderContent: (): VNode => <span>{group.name} References Off</span>,
          isEnabled: true,
          action: this.setShowVSpeedBugs.bind(this, false, group.name)
        },
        {
          id: `restore-defaults-${group.name}`,
          renderContent: (): VNode => <span>Restore {group.name} Defaults</span>,
          isEnabled: true,
          action: this.resetVSpeeds.bind(this, group.name)
        }
      ];
    })
  ];

  private readonly minsRef = Subject.create(0);
  private readonly timerComponentRef = FSComponent.createRef<TimerInput>();
  private readonly upDownItems = ArraySubject.create<string>();
  private readonly buttonRef = FSComponent.createRef<ActionButton>();
  private readonly upDownControlRef = FSComponent.createRef<SelectControl<string>>();
  private timerButtonSubject = Subject.create('Start?');

  private controlPub = this.props.bus.getPublisher<MinimumsControlEvents>();

  /**
   * Callback to handle when Timer changes the mode after reaching 0.
   * @param mode is the TimerMode
   */
  private onTimerModeChanged = (mode: TimerMode): void => {
    this.upDownControlRef.instance.SelectedValue.set(mode);
  };

  /**
   * Callback to handle when Timer value changes.
   * @param seconds is the new timer time value in seconds.
   */
  private onTimerValueChanged = (seconds: number): void => {
    if (!this.timerComponentRef.instance.getIsActivated()) {
      this.timerComponentRef.instance.setInput(seconds);
    }
  };

  public timer = new Timer(this.props.bus, this.onTimerModeChanged, this.onTimerValueChanged);

  // minimums
  private readonly minimumsSubscriber = this.props.bus.getSubscriber<MinimumsEvents>();
  private readonly decisionHeight = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly decisionAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly minimumsSubject = Subject.create(0);
  private readonly minimumsUnit = ComputedSubject.create<Unit<UnitFamily.Distance>, string>(
    UnitType.FOOT, (u) => { return u === UnitType.METER ? 'M' : 'FT'; }
  );
  private minsToggleOptions = ['Off', 'BARO', 'RA', 'TEMP COMP'];

  /** @inheritDoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.CLR:
        this.close();
        return true;
      case FmsHEvent.MENU:
        this.onMenu();
        return true;
    }
    return false;
  }

  /**
   * An event called when the menu button is pressed.
   * @returns True if the event was handled in this section.
   */
  public onMenu(): boolean {
    // console.log('called menu');
    const dialog = this.props.viewService.open('PageMenuDialog', true) as PFDPageMenuDialog;
    dialog.setMenuItems(this.menuItems);

    return true;
  }

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    if (this.props.hasRadioAltimeter) {
      this.minsToggleOptions = ['Off', 'BARO', 'RA'];
    } else {
      this.minsToggleOptions = ['Off', 'BARO'];
    }
    this.minsToggleComponent.instance.props.options = this.minsToggleOptions;

    this.upDownItems.set(['Up', 'Dn']);

    this.minimumsUnit.set(this.props.unitsSettingManager.altitudeUnits.get());

    this.minimumsSubscriber.on('set_da_distance_unit').whenChanged().handle(unit => {
      this.minimumsUnit.set(unit === 'meters' ? UnitType.METER : UnitType.FOOT);
    });

    this.minimumsSubscriber.on('minimums_mode').whenChanged().handle(this.handleMinimumsTypeSet);

    this.minimumsSubscriber.on('decision_altitude_feet').whenChanged().handle((da) => {
      this.decisionAltitude.set(da, UnitType.FOOT);
    });
    this.minimumsSubscriber.on('decision_height_feet').whenChanged().handle((dh) => {
      this.decisionHeight.set(dh, UnitType.FOOT);
    });

    this.decisionAltitude.sub(v => {
      if (this.minsRef.get() === MinimumsMode.BARO) {
        this.minimumsSubject.set(Math.round(v.asUnit(this.minimumsUnit.getRaw())));
      }
    });

    this.decisionHeight.sub(v => {
      if (this.minsRef.get() === MinimumsMode.RA) {
        this.minimumsSubject.set(Math.round(v.asUnit(this.minimumsUnit.getRaw())));
      }
    });
  }

  private handleMinimumsTypeSet = (type: number): void => {
    this.minsInputComponent.instance.setIsEnabled(type !== MinimumsMode.OFF);
    this.minsRef.set(type);
    switch (type) {
      case MinimumsMode.BARO:
        this.minimumsSubject.set(Math.round(this.decisionAltitude.get().asUnit(this.minimumsUnit.getRaw())));
        break;
      case MinimumsMode.RA:
        this.minimumsSubject.set(Math.round(this.decisionHeight.get().asUnit(this.minimumsUnit.getRaw())));
        break;
      case MinimumsMode.OFF:
        this.minimumsSubject.set(0);
        break;
    }
  };

  /**
   * Resets V-speeds to their default values.
   * @param groupName The name of the V-speed group containing the V-speeds to reset. If not defined, then the change
   * will be applied to all V-speeds in every group.
   */
  private resetVSpeeds(groupName?: string): void {
    let currentGroup = '';
    for (const row of this.vSpeedRowData.getArray()) {
      if (typeof row === 'string') {
        currentGroup = row;
        continue;
      }

      if (groupName === undefined || groupName === currentGroup) {
        row.userValueSetting.value = -1;
      }
    }
  }

  /**
   * Sets whether to show V-speed bugs.
   * @param show Whether to show the bugs.
   * @param groupName The name of the V-speed group containing the V-speeds to show or hide. If not defined, then the
   * change will be applied to all V-speeds in every group.
   */
  private setShowVSpeedBugs(show: boolean, groupName?: string): void {
    let currentGroup = '';
    for (const row of this.vSpeedRowData.getArray()) {
      if (typeof row === 'string') {
        currentGroup = row;
        continue;
      }

      if (groupName === undefined || groupName === currentGroup) {
        row.showSetting.value = show;
      }
    }
  }

  /**
   * Callback to handle when Timer Button is Pressed.
   */
  public onTimerButtonPressed = (): void => {
    if (this.timerComponentRef.instance.getTimerState()) {
      this.timerComponentRef.instance.stopTimer();
      this.timerButtonSubject.set('Reset?');
    } else if (this.timerComponentRef.instance.getTimerResetState()) {
      this.timerComponentRef.instance.resetTimer();
      this.timerButtonSubject.set('Start?');
    } else {
      this.timerComponentRef.instance.startTimer();
      this.timerButtonSubject.set('Stop?');
    }
  };

  // ---- TOGGLE MINIMUMS CALLBACK
  private onMinimumsRefOptionSelected = (index: number): void => {
    this.minsRef.set(index);
    this.controlPub.pub('set_minimums_mode', index, true, true);
  };

  // ---- CHANGE MINIMUMS VALUE CALLBACK
  private updateMinimumsValue = (): void => {
    const raw = this.minimumsSubject.get();
    const converted = this.minimumsUnit.getRaw() == UnitType.METER ? UnitType.FOOT.convertFrom(raw, UnitType.METER) : raw;
    switch (this.minsRef.get()) {
      case MinimumsMode.BARO:
        this.controlPub.pub('set_decision_altitude_feet', converted, true, true);
        break;
      case MinimumsMode.RA:
        this.controlPub.pub('set_decision_height_feet', converted, true, true);
        break;
    }
  };

  // ---- UpDown Menu Item Select CALLBACK
  private onUpDownMenuSelected = (index: number): void => {
    if (index === 1) {
      this.timer.mode = TimerMode.DOWN;
    } else {
      this.timer.mode = TimerMode.UP;
    }
  };

  // ---- UpDown Menu Item List Build
  private buildUpDownMenuItems = (item: string, index: number): ContextMenuItemDefinition => {
    return { id: index.toString(), renderContent: (): VNode => <span>{item}</span>, estimatedWidth: item.length * ContextMenuDialog.CHAR_WIDTH };
  };

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='popout-dialog' ref={this.viewContainerRef}>
        <div ref={this.containerRef} class="timerref-container">
          <div class="timerref-timer-title">Timer</div>
          <TimerInput ref={this.timerComponentRef} timer={this.timer} onRegister={this.register} />
          <SelectControl viewService={this.props.viewService} ref={this.upDownControlRef} onRegister={this.register} class="timerref-timer-updown" outerContainer={this.viewContainerRef} data={this.upDownItems} onItemSelected={this.onUpDownMenuSelected} buildMenuItem={this.buildUpDownMenuItems} />
          <ActionButton class="timerref-timer-button" onRegister={this.register} ref={this.buttonRef} text={this.timerButtonSubject} onExecute={this.onTimerButtonPressed} />

          <hr class="timerref-hr1" />
          <div class='timerref-ref-container'>
            <G1000UiControlWrapper onRegister={this.register}>
              <G1000ControlList
                data={this.vSpeedRowData}
                renderItem={row => {
                  if (typeof row === 'string') {
                    return (
                      <G1000UiControl requireChildFocus>
                        <div class='timerref-ref-row timerref-ref-header'>{row}</div>
                      </G1000UiControl>
                    );
                  } else {
                    const entry = row;
                    const inputValue = Subject.create(0);

                    entry.activeValue.pipe(inputValue);

                    MappedSubject.create(
                      ([inputVal, defaultVal]) => inputVal === defaultVal ? -1 : inputVal,
                      inputValue,
                      entry.defaultValueSetting
                    ).pipe(entry.userValueSetting);

                    return (
                      <G1000UiControl>
                        <div class='timerref-ref-row timerref-ref-entry'>
                          <div class='timerref-ref-title'>{entry.definition.label}</div>
                          <div class='timerref-ref-value'>
                            <DigitInput
                              value={inputValue}
                              minValue={0}
                              maxValue={999}
                              increment={1}
                              scale={1}
                              wrap={false}
                            />
                            <span class='timerref-ref-unit'>KT<span class="timerref-ref-asterisk">{entry.isEdited.map(isEdited => isEdited ? '*' : '')}</span></span>
                          </div>
                          <ArrowControl
                            value={entry.showSetting}
                            options={[false, true]}
                            renderValue={value => value ? 'On' : 'Off'}
                            class='timerref-ref-toggle'
                          />
                        </div>
                      </G1000UiControl>
                    );
                  }
                }}
                hideScrollbar={this.vSpeedRowData.length <= 4}
                class='timerref-ref-list'
              />
            </G1000UiControlWrapper>
          </div>
          <hr class="timerref-hr2" />

          <div class="timerref-mins-title">MINS</div>
          <ArrowToggle ref={this.minsToggleComponent} class="timerref-mins-toggle" onRegister={this.register} onOptionSelected={this.onMinimumsRefOptionSelected} options={this.minsToggleOptions} dataref={this.minsRef} />
          <div class="timerref-mins-value">
            <NumberInput ref={this.minsInputComponent} onRegister={this.register} quantize={true} onValueChanged={this.updateMinimumsValue} dataSubject={this.minimumsSubject} minValue={0} maxValue={16000} increment={10} wrap={false} defaultDisplayValue={'_ _ _ _ _'} class='timerref-ref-number' />
            <span class="size12">{this.minimumsUnit}</span>
          </div>
          <div class="timerref-temp-comp-container">
            <div class="temp-comp-title">Temp At</div>
            <div class="temp-comp-dest">_ _ _ _ _ _</div>
            <div class="temp-comp-temp">_ _ _°<span class="size12">C</span></div>
            <div class="temp-comp-corrected-alt">_ _ _ _ _ _<span class="size12">FT</span></div>
            <div class="temp-comp-snowflake">
              <svg>
                <path d='M 0 0 l 10 0 l 0 10 l -10 0 z' fill="white" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
