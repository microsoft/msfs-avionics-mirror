import { FSComponent } from '@microsoft/msfs-sdk';

import { Sr22tChecklist, Sr22tChecklistCategory, Sr22tChecklistItemType } from '../Sr22tChecklist';

export enum Sr22tChecklistIdentificationNames {
  PartIdentification = 'Part Identification',
}

/** A utility class to generate crew alerting checklist data. */
export class Sr22tChecklistIdentification {
  /**
   * Generates the checklist identification data.
   * @returns An array of checklist identification data.
   **/
  public static getChecklists(): Sr22tChecklist[] {
    return [
      new Sr22tChecklist(
        Sr22tChecklistIdentificationNames.PartIdentification,
        Sr22tChecklistCategory.ChecklistIdentification,
        [
          {
            type: Sr22tChecklistItemType.Text,
            text: () => <div class="sr22t-checklist-text">Airframe Make & Model: Cirrus SR22T w/ FIKI</div>,
          },
          {
            type: Sr22tChecklistItemType.Text,
            text: () => <div class="sr22t-checklist-text">Applicability: Software 2647.M0 & Subs</div>,
          },
          {
            type: Sr22tChecklistItemType.Text,
            text: () => <div class="sr22t-checklist-text">Cirrus Part Number: 38412-503</div>,
          },
        ],
        true
      )
    ];
  }
}
