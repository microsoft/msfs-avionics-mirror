/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/utils/xmllogic" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/baseinstrument" />

import { UUID } from '../../utils';
import { Annunciation, AnnunciationType } from './Annunciaton';

/** Create a list of annunciations from the instrument XML config. */
export class XMLAnnunciationFactory {
  private instrument: BaseInstrument;

  /**
   * Create an XMLAnnunciationFactory.
   * @param instrument The instrument that holds this engine display.
   */
  public constructor(instrument: BaseInstrument) {
    this.instrument = instrument;
  }

  /**
   * Parse an panel.xml configuration
   * @param document The configuration as an XML document.
   * @returns An array of Annunciations.
   */
  public parseConfig(document: Document): Array<Annunciation> {
    const annunciations = new Array<Annunciation>();
    const configs = document.getElementsByTagName('Annunciations');
    if (configs.length == 0) {
      return annunciations;
    }

    const config = configs[0];

    for (const ann of config.children) {
      let type: AnnunciationType;
      let suffix: string | undefined;

      const uuid = UUID.GenerateUuid();

      // Priority type that this alert has.
      const typeElem = ann.getElementsByTagName('Type');
      if (typeElem.length == 0) {
        continue;
      }
      switch (typeElem[0].textContent) {
        case 'Warning':
          type = AnnunciationType.Warning; break;
        case 'Caution':
          type = AnnunciationType.Caution; break;
        case 'Advisory':
          type = AnnunciationType.Advisory; break;
        case 'SafeOp':
          type = AnnunciationType.SafeOp; break;
        default:
          continue;
      }

      // The actual text shown when the alert is displayed.
      const textElem = ann.getElementsByTagName('Text');
      if (textElem.length == 0 || textElem[0].textContent == null) {
        continue;
      }

      const text = textElem[0].textContent;
      // Get the XML logic condition for state control.
      const condElem = ann.getElementsByTagName('Condition');
      if (condElem.length == 0) {
        continue;
      }

      for (const condition of condElem) {
        const logic = new CompositeLogicXMLElement(this.instrument, condition);

        // A suffix put on the text when it's shown.
        const suffElem = condition.getAttribute('Suffix');
        if (suffElem !== null) {
          suffix = suffElem;
        } else {
          suffix = undefined;
        }

        annunciations.push(new Annunciation(type, text, logic, suffix, uuid));
      }
    }

    return annunciations;
  }
}