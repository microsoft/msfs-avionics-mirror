import {
  ComponentProps, DebounceTimer, DisplayComponent, EventBus, FSComponent, SetSubject, Subject, Subscribable,
  SubscribableSet, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { GarminVNavTrackAlertType } from '../../../autopilot/vnav/GarminVNavDataEvents';
import { UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { NavDataField } from '../../navdatafield/NavDataField';
import { NavDataFieldGpsValidity } from '../../navdatafield/NavDataFieldModel';
import { NavStatusBoxDataProvider } from './NavStatusBoxDataProvider';
import { NavStatusBoxFieldModel, NavStatusBoxFieldModelFactory } from './NavStatusBoxFieldModel';
import { NavStatusBoxFieldRenderer } from './NavStatusBoxFieldRenderer';
import { NavStatusBoxFieldType } from './NavStatusBoxFieldType';
import { NavStatusBoxLegDisplay } from './NavStatusBoxLegDisplay';

/**
 * Component props for NavStatusBox.
 */
export interface NavStatusBoxProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The field types to display with the status box. */
  fieldTypes: readonly [NavStatusBoxFieldType, NavStatusBoxFieldType];

  /** A data provider for the status box. */
  dataProvider: NavStatusBoxDataProvider;

  /** The current GPS data validity state. */
  gpsValidity: Subscribable<NavDataFieldGpsValidity>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the status box should be decluttered. */
  declutter: Subscribable<boolean>;

  /** CSS class(es) to add to the status box's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD navigation status box.
 */
export class NavStatusBox extends DisplayComponent<NavStatusBoxProps> {
  private static readonly RESERVED_CSS_CLASSES = ['nav-status', 'nav-status-gps-loi'];

  private static readonly VERTICAL_TRACK_ALERT_TEXT: Record<GarminVNavTrackAlertType, string> = {
    [GarminVNavTrackAlertType.TodOneMinute]: 'TOD within 1 minute',
    [GarminVNavTrackAlertType.BodOneMinute]: 'BOD within 1 minute',
    [GarminVNavTrackAlertType.TocOneMinute]: 'TOC within 1 minute',
    [GarminVNavTrackAlertType.BocOneMinute]: 'BOC within 1 minute',
  };

  private static readonly VERTICAL_TRACK_ALERT_DURATION = 10000; // milliseconds

  private readonly legRef = FSComponent.createRef<NavStatusBoxLegDisplay>();

  private readonly rootCssClass = SetSubject.create(['nav-status']);
  private readonly rootDisplay = Subject.create('none');

  private readonly modelFactory = new NavStatusBoxFieldModelFactory(this.props.bus, this.props.gpsValidity);
  private readonly fieldRenderer = new NavStatusBoxFieldRenderer(this.props.unitsSettingManager);

  private readonly fieldModels: NavStatusBoxFieldModel<any>[] = [];
  private readonly fieldInstances: NavDataField<any>[] = [];
  private readonly fieldDisplay = Subject.create('');

  private readonly verticalTrackAlertDisplay = Subject.create('none');
  private readonly verticalTrackAlertText = Subject.create('');
  private readonly verticalTrackAlertDebounceTimer = new DebounceTimer();
  private readonly hideVerticalTrackAlertFunc = this.setVerticalTrackAlertVisibility.bind(this, false);

  private cssClassSub?: Subscription;
  private declutterSub?: Subscription;
  private gpsValiditySub?: Subscription;
  private verticalTrackAlertSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.gpsValiditySub = this.props.gpsValidity.sub(validity => {
      this.rootCssClass.toggle('nav-status-gps-loi', validity !== NavDataFieldGpsValidity.Valid);
    }, false, true);

    this.verticalTrackAlertSub = this.props.dataProvider.verticalTrackAlert.on(this.onVerticalTrackAlert.bind(this));

    this.declutterSub = this.props.declutter.sub(this.onDeclutterChanged.bind(this), true);
  }

  /**
   * Responds to when whether this box is decluttered changes.
   * @param declutter Whether this box is decluttered.
   */
  private onDeclutterChanged(declutter: boolean): void {
    if (declutter) {
      this.rootDisplay.set('none');
      this.legRef.instance.pause();
      this.gpsValiditySub!.pause();
      this.verticalTrackAlertSub!.pause();
      this.verticalTrackAlertDebounceTimer.clear();
      this.setVerticalTrackAlertVisibility(false);
    } else {
      this.rootDisplay.set('');
      this.legRef.instance.resume();
      this.gpsValiditySub!.resume(true);
      this.verticalTrackAlertSub!.resume();
    }
  }

  /**
   * Responds to when a vertical track alert is issued.
   * @param source The source of the alert event.
   * @param type The type of alert that was issued.
   */
  private onVerticalTrackAlert(source: void, type: GarminVNavTrackAlertType): void {
    this.verticalTrackAlertText.set(NavStatusBox.VERTICAL_TRACK_ALERT_TEXT[type]);
    this.setVerticalTrackAlertVisibility(true);
    this.verticalTrackAlertDebounceTimer.schedule(this.hideVerticalTrackAlertFunc, NavStatusBox.VERTICAL_TRACK_ALERT_DURATION);
  }

  /**
   * Sets the visibility of this box's vertical track alert indication.
   * @param visible Whether to set the vertical track alert indication to be visible.
   */
  private setVerticalTrackAlertVisibility(visible: boolean): void {
    if (visible) {
      this.fieldDisplay.set('none');
      this.verticalTrackAlertDisplay.set('');
    } else {
      this.verticalTrackAlertDisplay.set('none');
      this.fieldDisplay.set('');
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, NavStatusBox.RESERVED_CSS_CLASSES);
    } else {
      if (this.props.class !== undefined && this.props.class.length > 0) {
        const classesToAdd = FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !NavStatusBox.RESERVED_CSS_CLASSES.includes(classToAdd));

        for (const classToAdd of classesToAdd) {
          this.rootCssClass.add(classToAdd);
        }
      }
    }

    return (
      <div class={this.rootCssClass} style={{ 'display': this.rootDisplay }}>
        <NavStatusBoxLegDisplay
          ref={this.legRef}
          dataProvider={this.props.dataProvider}
          unitsSettingManager={this.props.unitsSettingManager}
        />
        <div class='nav-status-fields'>
          {
            this.props.fieldTypes.map((type, index) => {
              const model = this.modelFactory.create(type);
              const field = this.fieldRenderer.render(type, model);

              this.fieldModels.push(model);
              this.fieldInstances.push(field.instance as NavDataField<any>);

              return (
                <div class={`nav-status-field-slot nav-status-field-slot-${index + 1}`} style={{ 'display': this.fieldDisplay }}>
                  {field}
                </div>
              );
            })
          }
          <div class='nav-status-vertical-track-alert' style={{ 'display': this.verticalTrackAlertDisplay }}>
            {this.verticalTrackAlertText}
          </div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.legRef.getOrDefault()?.destroy();

    for (const instance of this.fieldInstances) {
      instance.destroy();
    }
    for (const model of this.fieldModels) {
      model.destroy();
    }

    this.declutterSub?.destroy();
    this.cssClassSub?.destroy();
    this.gpsValiditySub?.destroy();
    this.verticalTrackAlertSub?.destroy();

    super.destroy();
  }
}