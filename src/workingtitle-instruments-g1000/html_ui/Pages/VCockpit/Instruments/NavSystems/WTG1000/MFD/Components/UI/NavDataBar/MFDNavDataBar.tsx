import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { DateTimeUserSettingTypes, DefaultNavDataBarFieldModelFactory, Fms, NavDataBar, NavDataFieldGpsValidity, NavDataBarSettingTypes, NextGenNavDataBarFieldRenderer, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { UiPage } from '../../../../Shared/UI/UiPage';

import '../../../../Shared/UI/NavDataField/NavDataField.css';
import './MFDNavDataBar.css';

/**
 * Component props for NavDataBar.
 */
export interface MFDNavDataBarProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The FMS. */
  fms: Fms;

  /** A user setting manager for the settings that control the data bar's field types. */
  dataBarSettingManager: UserSettingManager<NavDataBarSettingTypes>;

  /** A user setting manager for measurement units. */
  unitsSettingManager: UnitsUserSettingManager;

  /** A user setting manager for date/time settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** The update frequency of the data fields, in hertz. */
  updateFreq: number;

  /** A subscribable which provides the current open page. */
  openPage: Subscribable<UiPage | null>;
}

/**
 * An MFD navigation data bar. Displays four navigation data fields in addition to the title of the current open MFD
 * page.
 */
export class MFDNavDataBar extends DisplayComponent<MFDNavDataBarProps> {
  private static readonly FIELD_COUNT = 4;

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='nav-data-bar-container'>
        <NavDataBar
          bus={this.props.bus}
          fieldCount={MFDNavDataBar.FIELD_COUNT}
          modelFactory={new DefaultNavDataBarFieldModelFactory(this.props.bus, this.props.fms, Subject.create(NavDataFieldGpsValidity.Valid))}
          fieldRenderer={new NextGenNavDataBarFieldRenderer(this.props.unitsSettingManager, this.props.dateTimeSettingManager)}
          dataBarSettingManager={this.props.dataBarSettingManager}
          updateFreq={this.props.updateFreq}
        />
        <PageTitle openPage={this.props.openPage} />
      </div>
    );
  }
}

/**
 * Component props for PageTitle.
 */
interface PageTitleProps extends ComponentProps {
  /** A subscribable which provides the current open page. */
  openPage: Subscribable<UiPage | null>;
}

/**
 * Displays the title of the current open MFD page.
 */
class PageTitle extends DisplayComponent<PageTitleProps> {
  private readonly textSub = Subject.create('');
  private oldPage: UiPage | null = null;

  private readonly titleHandler = (title: string): void => { this.textSub.set(title); };

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.openPage.sub(this.onOpenPageChanged.bind(this), true);
  }

  /**
   * Responds to changes in the currently open page.
   * @param page The new open page.
   */
  private onOpenPageChanged(page: UiPage | null): void {
    this.oldPage?.title.unsub(this.titleHandler);
    page && page.title.sub(this.titleHandler, true);
    this.oldPage = page;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='nav-data-bar-page-title'>{this.textSub}</div>
    );
  }
}