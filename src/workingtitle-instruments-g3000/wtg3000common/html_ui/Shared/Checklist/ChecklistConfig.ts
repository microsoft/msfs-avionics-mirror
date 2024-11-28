import { ResolvableConfig } from '../Config/Config';
import { G3000ChecklistSetDef } from './G3000ChecklistDefinition';
import { G3000ChecklistDOMParser } from './G3000ChecklistDOMParser';

/**
 * A configuration object which defines checklist options.
 */
export class ChecklistConfig implements ResolvableConfig<(timeout: number) => Promise<G3000ChecklistSetDef | undefined>> {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** The URL of the file from which to parse the checklist definition. */
  public readonly checklistFileURL?: string;

  /**
   * Creates a new ChecklistConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element !== undefined) {
      if (element.tagName !== 'Checklist') {
        throw new Error(`Invalid ChecklistConfig definition: expected tag name 'Checklist' but was '${element.tagName}'`);
      }

      const checklistFilePathElement = element.querySelector(':scope>File');
      if (checklistFilePathElement && checklistFilePathElement.textContent) {
        const url = checklistFilePathElement.textContent;
        try {
          new URL(url);
          this.checklistFileURL = url;
        } catch {
          console.warn(`Invalid ChecklistConfig definition: malformed checklist file path ${url}`);
        }
      }
    }
  }

  /** @inheritDoc */
  public resolve(): (timeout: number) => Promise<G3000ChecklistSetDef | undefined> {
    if (this.checklistFileURL === undefined) {
      return () => Promise.resolve(undefined);
    } else {
      return (timeout: number) => {
        return new Promise<G3000ChecklistSetDef | undefined>(resolve => {
          const request = new XMLHttpRequest();
          request.addEventListener('readystatechange', () => {
            if (request.readyState === XMLHttpRequest.DONE) {
              if (request.status === 200) {
                try {
                  const document = new DOMParser().parseFromString(request.responseText, 'text/xml');

                  // Detect parsing errors and emit them to the console to aid in debugging.
                  const errorElements = document.querySelectorAll('parsererror');
                  if (errorElements.length > 0) {
                    console.error('ChecklistConfig: one or more XML parsing errors were encountered when parsing the checklist file:');
                    for (const element of errorElements) {
                      console.error(element.textContent ?? '');
                    }
                  }

                  const rootElement = document.querySelector('Checklist');
                  if (rootElement) {
                    const def = new G3000ChecklistDOMParser().parse(rootElement, {
                      discardEmptyGroups: true,
                      discardEmptyLists: true,
                      discardEmptyBranches: true
                    });

                    if (def.groups.length > 0) {
                      resolve(def);
                    } else {
                      console.warn('ChecklistConfig: checklist file does not define any groups with non-empty checklists. Discarding checklist support.');
                    }
                  }
                } catch (e) {
                  // noop
                  console.error(e);
                }
              } else {
                console.error(`ChecklistConfig: failed to retrieve checklist file with status: ${request.statusText}`);
              }

              resolve(undefined);
            }
          });

          request.addEventListener('timeout', () => resolve(undefined));
          request.addEventListener('abort', () => resolve(undefined));
          request.addEventListener('error', () => resolve(undefined));

          request.timeout = timeout;
          // We retrieve the file as text instead of XML so that we can parse the XML with DOMParser. DOMParser has
          // better error-reporting behavior than XMLHttpRequest, which just sets responseXML to `null` with a generic
          // DOM Exception 11 status when there is an error parsing the XML.
          request.responseType = 'text';
          request.open('GET', this.checklistFileURL as string);
          request.send();
        });
      };
    }
  }
}
