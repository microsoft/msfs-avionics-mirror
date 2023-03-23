import { ComponentProps, DisplayComponent, EventBus, FSComponent, ObjectSubject, SetSubject, Subscribable, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';
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

  private readonly legRef = FSComponent.createRef<NavStatusBoxLegDisplay>();

  private readonly rootCssClass = SetSubject.create(['nav-status']);

  private readonly rootStyle = ObjectSubject.create({
    'display': 'none'
  });

  private readonly modelFactory = new NavStatusBoxFieldModelFactory(this.props.bus, this.props.gpsValidity);
  private readonly fieldRenderer = new NavStatusBoxFieldRenderer(this.props.unitsSettingManager);

  private readonly fieldModels: NavStatusBoxFieldModel<any>[] = [];
  private readonly fieldInstances: NavDataField<any>[] = [];

  private declutterSub?: Subscription;
  private cssClassSub?: Subscription;
  private gpsValiditySub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const gpsValiditySub = this.gpsValiditySub = this.props.gpsValidity.sub(validity => {
      this.rootCssClass.toggle('nav-status-gps-loi', validity !== NavDataFieldGpsValidity.Valid);
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');
        this.legRef.instance.pause();
        gpsValiditySub.pause();
      } else {
        this.rootStyle.set('display', '');
        this.legRef.instance.resume();
        gpsValiditySub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
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
      <div class={this.rootCssClass} style={this.rootStyle}>
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
                <div class={`nav-status-field-slot nav-status-field-slot-${index + 1}`}>
                  {field}
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.legRef.getOrDefault()?.destroy();

    this.fieldInstances.forEach(field => { field.destroy(); });
    this.fieldModels.forEach(model => { model.destroy(); });

    this.declutterSub?.destroy();
    this.cssClassSub?.destroy();
    this.gpsValiditySub?.destroy();

    super.destroy();
  }
}