import { ApproachIdentifier, ApproachUtils, ChartProcedureType, FaaChartType } from '@microsoft/msfs-sdk';

import { GarminChartsPageData } from './GarminChartsTypes';

/**
 * A utility class for working with FAA charts in a Garmin context.
 */
export class GarminFaaChartsUtils {
  private static readonly CONT_REGEX = /, CONT.\d+/;
  private static readonly ILS_CATEGORY_REGEX = /\((SA )?CAT (I|II|III)(?: - (II|III))?\)/;

  /**
   * Gets the primary airport diagram chart page from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @returns The primary airport diagram chart page from the specified array, or `undefined` if no such page could be
   * found.
   */
  public static getAirportDiagramPage(pages: readonly GarminChartsPageData[]): GarminChartsPageData | undefined {
    const apdPages = pages.filter(page => page.metadata.type === FaaChartType.Apd);

    let airportDiagramPageData: GarminChartsPageData | undefined = undefined;
    let nameLength = Infinity;

    for (const pageData of apdPages) {
      if (pageData.metadata.name === 'AIRPORT DIAGRAM') {
        return pageData;
      }

      if (pageData.metadata.name.length < nameLength) {
        airportDiagramPageData = pageData;
        nameLength = pageData.metadata.name.length;
      }
    }

    return airportDiagramPageData;
  }

  /**
   * Gets the primary chart page associated with a departure procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param departureName The name of the departure procedure.
   * @returns The primary chart page associated with the specified departure procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  public static getDeparturePage(
    pages: readonly GarminChartsPageData[],
    departureName: string
  ): GarminChartsPageData | undefined {
    return GarminFaaChartsUtils.getDepartureArrivalPage(pages, ChartProcedureType.Sid, departureName);
  }

  /**
   * Gets the primary chart page associated with an arrival procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param arrivalName The name of the arrival procedure.
   * @returns The primary chart page associated with the specified arrival procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  public static getArrivalPage(
    pages: readonly GarminChartsPageData[],
    arrivalName: string
  ): GarminChartsPageData | undefined {
    return GarminFaaChartsUtils.getDepartureArrivalPage(pages, ChartProcedureType.Star, arrivalName);
  }

  /**
   * Gets the primary chart page associated with a departure or arrival procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param chartProcedureType The chart procedure type associated with the procedure.
   * @param procedureName The name of the procedure.
   * @returns The primary chart page associated with the specified procedure from the specified array, or undefined if
   * no such page could be found.
   */
  private static getDepartureArrivalPage(
    pages: readonly GarminChartsPageData[],
    chartProcedureType: ChartProcedureType.Sid | ChartProcedureType.Star,
    procedureName: string
  ): GarminChartsPageData | undefined {
    let result: GarminChartsPageData | undefined;
    let isResultNameMatch = false;

    // Set up a regex to search for the name of the procedure minus the procedure number. There should only be charts
    // for one iteration of a procedure at any given time.

    const indexOfNumber = procedureName.search(/[^\d]\d+$/) + 1;
    const nameRegex = new RegExp(
      indexOfNumber > 0
        ? procedureName.substring(0, indexOfNumber)
        : procedureName,
      'i'
    );

    for (const page of pages) {
      // Do not consider pages that are not the first page of the chart.
      if (page.pageIndex > 0) {
        continue;
      }

      // Do not consider pages with ", CONT.n" (where n is a number) in their names. These are the second, third, etc.
      // pages of a procedure chart.
      if (GarminFaaChartsUtils.CONT_REGEX.test(page.metadata.name)) {
        continue;
      }

      // If we have a name match, then set the current page as the new result if the current result does not have a
      // name match or if the current page's name is shorter than the current result's name.
      if (nameRegex.test(page.metadata.name)) {
        if (!result || !isResultNameMatch || page.metadata.name.length < result.metadata.name.length) {
          result = page;
          isResultNameMatch = true;
        }
      }

      // If we don't have a result yet, then check if the procedure is one of the current page's associated procedures.
      // If so, then set the current page as the new result.
      if (!result) {
        for (const procedure of page.metadata.procedures) {
          if (
            procedure.type === chartProcedureType
            && nameRegex.test(procedure.ident)
          ) {
            result = page;
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Gets the primary chart page associated with an approach procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param approachIdentifier The identifier for the approach procedure.
   * @returns The primary chart page associated with the specified approach procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  public static getApproachPage(
    pages: readonly GarminChartsPageData[],
    approachIdentifier: Readonly<ApproachIdentifier>
  ): GarminChartsPageData | undefined {
    let isIls = false;

    // If the runway has a designator character of "L", "C", or "R", then allow a match to the runway number followed
    // by an arbitrary-length "/"-delimited list of L/C/R designator characters that contain the designator of the
    // desired runway. If the runway does not have an "L", "C", or "R" designator, then only allow exact matches to
    // the runway name.

    let runwayDesignator: string;
    switch (approachIdentifier.runway.designator) {
      case 'L':
        runwayDesignator = 'L(?:\\/C)?(?:\\/R)?';
        break;
      case 'C':
        runwayDesignator = '(?:L\\/)?C(?:\\/R)?';
        break;
      case 'R':
        runwayDesignator = '(?:L\\/)?(?:C\\/)?R';
        break;
      default:
        runwayDesignator = approachIdentifier.runway.designator;
    }

    const runwayName = `${approachIdentifier.runway.number}${runwayDesignator}`;

    // Match suffixes that are separated from the approach name by a space if the approach has a runway, or by a hyphen
    // if the approach has no runway (e.g. "RNAV Z 18" or "RNAV-A").
    const suffixSeparator = runwayName.length > 0 ? ' ' : '-';
    const approachNameSuffix = approachIdentifier.suffix.length > 0 ? `${suffixSeparator}${approachIdentifier.suffix}` : '';

    let approachName: string;
    let alternateApproachName: string | undefined;

    switch (ApproachUtils.nameToType(approachIdentifier.type)) {
      case ApproachType.APPROACH_TYPE_ILS:
        // Match any of the following:
        // 1. ILS [suffix]
        // 2. ILS/DME [suffix]
        // 3. [1. or 2.] OR LOC
        // 4. [1. or 2.] OR LOC [A-Z]
        // 5. [1. or 2.] OR LOC/DME
        // 6. [1. or 2.] OR LOC/DME [A-Z]
        approachName = `ILS(?:\\/DME)?${approachNameSuffix}(?: OR LOC(?:\\/DME)?(?:${suffixSeparator}[A-Z])?)?`;
        isIls = true;
        break;
      case ApproachType.APPROACH_TYPE_LOCALIZER:
        // Match any of the following:
        // 1. LOC [suffix]
        // 2. LOC/DME [suffix]
        // 3. ILS OR [1. or 2.]
        // 4. ILS [A-Z] OR [1. or 2.] 
        // 5. ILS/DME OR [1. or 2.]
        // 6. ILS/DME [A-Z] OR [1. or 2.]
        approachName = `(?:ILS(?:\\/DME)?(?:${suffixSeparator}[A-Z])? OR )?LOC(?:\\/DME)?${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_LDA:
        // Match any of the following:
        // 1. LDA [suffix]
        approachName = `LDA${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
        // Match any of the following:
        // 1. LOC BC [suffix]
        approachName = `LOC BC${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_VOR: {
        // Match any of the following:
        // (preferred)
        // 1. VOR [suffix]
        // 2. VOR [suffix] OR GPS
        // 3. VOR [suffix] OR GPS [A-Z]
        // 4. VOR OR TACAN [suffix]
        // (alternate)
        // 1. VOR/DME [suffix]
        // 2. VOR/DME [suffix] OR GPS
        // 3. VOR/DME [suffix] OR GPS [A-Z]
        // 4. VOR/DME OR TACAN [suffix]
        const gpsOption = `(?: OR GPS(?:${suffixSeparator}[A-Z])?)?`;
        approachName = `(?:VOR${approachNameSuffix}${gpsOption}|VOR OR TACAN${approachNameSuffix})`;
        alternateApproachName = `(?:VOR\\/DME${approachNameSuffix}${gpsOption}|VOR\\/DME OR TACAN${approachNameSuffix})`;
        break;
      }
      case ApproachType.APPROACH_TYPE_VORDME: {
        // Match any of the following:
        // (preferred)
        // 1. VOR/DME [suffix]
        // 2. VOR/DME [suffix] OR GPS
        // 3. VOR/DME [suffix] OR GPS [A-Z]
        // 4. VOR/DME OR TACAN [suffix]
        // (alternate)
        // 1. VOR [suffix]
        // 2. VOR [suffix] OR GPS
        // 3. VOR [suffix] OR GPS [A-Z]
        // 4. VOR OR TACAN [suffix]
        const gpsOption = `(?: OR GPS(?:${suffixSeparator}[A-Z])?)?`;
        approachName = `(?:VOR\\/DME${approachNameSuffix}${gpsOption}|VOR\\/DME OR TACAN${approachNameSuffix})`;
        alternateApproachName = `(?:VOR${approachNameSuffix}${gpsOption}|VOR OR TACAN${approachNameSuffix})`;
        break;
      }
      case ApproachType.APPROACH_TYPE_NDB:
        // Match any of the following:
        // (preferred)
        // 1. NDB [suffix]
        // (alternate)
        // 1. NDB/DME [suffix]
        approachName = `NDB${approachNameSuffix}`;
        alternateApproachName = `NDB\\/DME${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_NDBDME:
        // Match any of the following:
        // (preferred)
        // 1. NDB/DME [suffix]
        // (alternate)
        // 1. NDB [suffix]
        approachName = `NDB\\/DME${approachNameSuffix}`;
        alternateApproachName = `NDB${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_RNAV:
        // Match any of the following:
        // 1. RNAV (GPS) [suffix]
        // 2. RNAV (GNSS) [suffix]
        // 3. RNAV (RNP) [suffix]
        // 4. RNP [suffix]
        approachName = `(?:RNAV \\((?:GPS|GNSS|RNP)\\)${approachNameSuffix}|RNP${approachNameSuffix})`;
        break;
      case ApproachType.APPROACH_TYPE_GPS:
        // Match any of the following:
        // 1. GPS [suffix]
        // 2. VOR OR GPS [suffix]
        // 3. VOR [A-Z] OR GPS [suffix]
        // 4. VOR/DME OR GPS [suffix]
        // 5. VOR/DME [A-Z] OR GPS [suffix]
        approachName = `(?:VOR(?:\\/DME)?(?:${suffixSeparator}[A-Z])? OR )?GPS${approachNameSuffix}`;
        break;
      default:
        return undefined;
    }

    // If a runway exists, then match the runway name prefixed by "RWY". If a runway does not exist, then ensure that
    // we do not match a runway name-like string.
    const approachNameEnd = runwayName.length > 0
      ? ` RWY ${runwayName}(?: |$)`
      : '(?: (?!RWY)|$)';

    const approachNameRegex = new RegExp(`^${approachName}${approachNameEnd}`, 'i');
    const alternateApproachNameRegex = alternateApproachName ? new RegExp(`^${alternateApproachName}${approachNameEnd}`, 'i') : undefined;

    let result: GarminChartsPageData | undefined;
    let isResultNameMatch = false;
    let isResultAlternateNameMatch = false;

    let resultIlsCategory: number | undefined;
    let isResultIlsSpecialAuthorization: boolean | undefined;

    for (const page of pages) {
      // Do not consider pages that are not the first page of the chart.
      if (page.pageIndex > 0) {
        continue;
      }

      if (approachNameRegex.test(page.metadata.name)) {
        if (isIls) {
          // If we have a name match and the approach is ILS, then we must check whether the chart has ILS category
          // specifications.

          const match = page.metadata.name.match(GarminFaaChartsUtils.ILS_CATEGORY_REGEX);
          let lowestIlsCategory = 1;
          let isSpecialAuthorization = false;

          if (match) {
            lowestIlsCategory = GarminFaaChartsUtils.getIlsLowestCategory(match);
            isSpecialAuthorization = GarminFaaChartsUtils.isIlsSpecialAuthorization(match);
          }

          if (isSpecialAuthorization || lowestIlsCategory > 1) {
            if (
              !isResultNameMatch
              || resultIlsCategory === undefined
              || resultIlsCategory > lowestIlsCategory
              || (
                resultIlsCategory === lowestIlsCategory
                && (
                  isResultIlsSpecialAuthorization === undefined
                  || (!isSpecialAuthorization && isResultIlsSpecialAuthorization)
                )
              )
            ) {
              result = page;
              isResultNameMatch = true;
              resultIlsCategory = lowestIlsCategory;
              isResultIlsSpecialAuthorization = isSpecialAuthorization;
            }
          } else {
            // If the chart applies to category I without special authorization, then immediately return the page.
            return page;
          }
        } else {
          // If we have a name match and the approach is not ILS, then immediately return the page.
          return page;
        }
      }

      // If we don't have a name-match result yet, then check if there is an alternate name match. If so, then set the
      // current page as the result. Note that ILS approaches cannot match an alternate name, so we don't need to worry
      // about ILS categories here.
      if (!isResultNameMatch && !isResultAlternateNameMatch && alternateApproachNameRegex) {
        if (alternateApproachNameRegex.test(page.metadata.name)) {
          result = page;
          isResultAlternateNameMatch = true;
        }
      }

      // If we don't have a result yet, then check if the approach is one of the current page's associated procedures.
      // If so, then set the current page as the new result.
      if (!result) {
        for (const procedure of page.metadata.procedures) {
          if (
            procedure.type === ChartProcedureType.Approach
            && ApproachUtils.identifierEquals(procedure.approachIdentifier, approachIdentifier)
          ) {
            result = page;
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Gets the lowest ILS category defined by an ILS category regex match.
   * @param match An ILS category regex match array result.
   * @returns The lowest ILS category defined by an ILS category regex match.
   */
  private static getIlsLowestCategory(match: RegExpMatchArray): number {
    switch (match[2]) {
      case 'II':
        return 2;
      case 'III':
        return 3;
      default:
        return 1;
    }
  }

  /**
   * Checks whether an ILS category regex match defines a special authorization flag.
   * @param match An ILS category regex match array result.
   * @returns Whether the specified ILS category regex match defines a special authorization flag.
   */
  private static isIlsSpecialAuthorization(match: RegExpMatchArray): boolean {
    return match[1] !== undefined;
  }
}
