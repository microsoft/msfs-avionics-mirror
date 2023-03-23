
import { ArraySubject, FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GNSUiControlList, GNSUiControlListProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuEntry, Page } from '../Pages';
import { PageMenuItem } from '../PageMenu/PageMenuItem';
import { MenuItemInformation } from './MenuItemInformation';

import './AuxPageItems.css';

/**
 * Utility page for Aux group of pages
 */
export class AuxUtility extends Page {

  private page2OptionsArray430: MenuEntry[] = [
    {
      label: 'Checklists', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Flight Timers', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Trip Statistics', disabled: true, action: (): void => {

      }
    },
    {
      label: 'RAIM Prediction', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Sunrise / Sunset', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Software Versions', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Database Versions', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Terrain Database Versions', disabled: true, action: (): void => {

      }
    }
  ];

  private page2OptionsArray530: MenuEntry[] = [
    {
      label: 'Checklists', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Flight Timers', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Trip Statistics', disabled: true, action: (): void => {

      }
    },
    {
      label: 'RAIM Prediction', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Software Versions', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Datebase Versions', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Terrain Database Versions', disabled: true, action: (): void => {

      }
    },

  ];
  private page2Options530 = ArraySubject.create(this.page2OptionsArray530);
  private page2Options430 = ArraySubject.create(this.page2OptionsArray430);

  private readonly auxUtilityMenuItems = FSComponent.createRef<GNSUiControlList<MenuItemInformation, GNSUiControlListProps<MenuItemInformation>>>();


  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.RightKnobPush) {
      const list = this.auxUtilityMenuItems.instance;
      if (!list.isFocused) {
        list.focus(FocusPosition.MostRecent);
      } else {
        list.blur();
      }
      return true;
    } else if (evt === InteractionEvent.ENT) {
      //get the current event then render the new page
      const list = this.auxUtilityMenuItems.instance;
      const optionSelected = list.getFocusedIndex();
      switch (optionSelected) {
        case 0:
          //TODO Fuel Planning Page
          break;
        case 1:
          //TODO Trip planning page
          break;
        case 2:
          //TODO THIS PAGE ?? lol wut
          break;
        case 3:
          //TODO Scheduler page
          break;
        case 4:
          //TODO make it greyed out also
          break;
        case 5:
          //TODO make it greyed out also
          break;
        case 6:
          //TODO make it greyed out also
          break;
      }

    }


    let handled = false;
    if (this.auxUtilityMenuItems.instance.isFocused) {

      handled = this.auxUtilityMenuItems.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else if (([InteractionEvent.RightOuterInc, InteractionEvent.RightOuterDec, InteractionEvent.RightInnerDec, InteractionEvent.RightInnerInc].includes(evt))) {
      return this.auxUtilityMenuItems.instance.isFocused;
    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /**
   * Picks the next page to be loaded
   * @param listMenuItem the menuEntry
   * @returns if the page has been loaded
   */
  public onListItemSelected = (listMenuItem: PageMenuItem): boolean => {
    const menuEntry = listMenuItem.props.data;
    if (menuEntry !== null) {
      if (menuEntry.action instanceof Subject) {
        const action = menuEntry.action.get();
        action();
      } else {
        menuEntry.action();
      }
    }
    return true;
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page aux-page hide-element' ref={this.el}>
        <div class='aux-page-header'>
          <h2>UTILITY</h2>
        </div>
        <div class='aux-table aux-table-full-width aux-table-full-height'>
          <GNSUiControlList<MenuEntry, GNSUiControlListProps<MenuEntry>>
            data={this.props.gnsType === 'wt430' ? this.page2Options430 : this.page2Options530}
            renderItem={(data: MenuEntry): VNode => <PageMenuItem data={data} onSelected={this.onListItemSelected} />}
            ref={this.auxUtilityMenuItems}
            hideScrollbar={true}
            class="aux-page-menu-list"
          />
        </div>
      </div>
    );
  }
}
