import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { GroupBox, List, MFDPageMenuDialog } from '@microsoft/msfs-wtg1000';

import './Sr22tChecklistPageMenuDialog.css';

/** The SR22T checklist page menu dialog. */
export class Sr22tChecklistPageMenuDialog extends MFDPageMenuDialog {
  public readonly title = Subject.create(this.props.title);

  /**
   * Sets the item style to fit two lines if necessary
   * @param isTwoLines Whether or not the item should be two lines high
   */
  public setItemTwoLines(isTwoLines: boolean): void {
    this.viewContainerRef.instance.classList.toggle('checklist-incomplete-dialog', isTwoLines);
  }

  /** @inheritDoc */
  public render(): VNode {
    let className = 'popout-dialog mfd-pagemenu checklist-dialog';
    if (this.props.class !== undefined) {
      className += ` ${this.props.class}`;
    }

    return (
      <div class={className} ref={this.viewContainerRef}>
        <h1>{this.title}</h1>
        <GroupBox title="Options" class='mfd-pagemenu-options'>
          <div class="mfd-pagemenu-listcontainer" ref={this.listContainerRef}>
            <List class='mfd-pagemenu-list' ref={this.listRef} onRegister={this.register} data={this.menuItemsSubject} renderItem={this.renderItem} scrollContainer={this.listContainerRef} />
          </div>
        </GroupBox>
        <div class='mfd-pagemenu-backmessage'>
          Press the FMS CRSR knob to return to base page
        </div>
      </div>
    );
  }
}
