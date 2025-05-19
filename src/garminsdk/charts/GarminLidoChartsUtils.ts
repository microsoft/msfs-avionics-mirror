import { ApproachIdentifier, ApproachUtils, ChartProcedureType, LidoChartType, RunwayIdentifier } from '@microsoft/msfs-sdk';

import { GarminChartsPageData } from './GarminChartsTypes';

/**
 * A utility class for working with LIDO charts in a Garmin context.
 */
export class GarminLidoChartsUtils {
  /**
   * Gets the primary airport diagram chart page from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @returns The primary airport diagram chart page from the specified array, or `undefined` if no such page could be
   * found.
   */
  public static getAirportDiagramPage(pages: readonly GarminChartsPageData[]): GarminChartsPageData | undefined {
    const agcPages = pages.filter(page => page.metadata.type === LidoChartType.Agc);

    let airportDiagramPageData: GarminChartsPageData | undefined = undefined;
    let nameLength = Infinity;

    for (const pageData of agcPages) {
      if (pageData.metadata.name === 'AGC') {
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
   * @param enrouteTransitionName The name of the procedure's enroute transition, or the empty string if the enroute
   * transition is not specified.
   * @param runway The identifier of the runway associated with the procedure's runway transition, or the empty
   * identifier if the runway transition is not specified.
   * @returns The primary chart page associated with the specified departure procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  public static getDeparturePage(
    pages: readonly GarminChartsPageData[],
    departureName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): GarminChartsPageData | undefined {
    return GarminLidoChartsUtils.getDepartureArrivalPage(pages, ChartProcedureType.Sid, departureName, enrouteTransitionName, runway);
  }

  /**
   * Gets the primary chart page associated with an arrival procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param arrivalName The name of the arrival procedure.
   * @param enrouteTransitionName The name of the procedure's enroute transition, or the empty string if the enroute
   * transition is not specified.
   * @param runway The identifier of the runway associated with the procedure's runway transition, or the empty
   * identifier if the runway transition is not specified.
   * @returns The primary chart page associated with the specified arrival procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  public static getArrivalPage(
    pages: readonly GarminChartsPageData[],
    arrivalName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): GarminChartsPageData | undefined {
    return GarminLidoChartsUtils.getDepartureArrivalPage(pages, ChartProcedureType.Star, arrivalName, enrouteTransitionName, runway);
  }

  /**
   * Gets the primary chart page associated with a departure or arrival procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param chartProcedureType The chart procedure type associated with the procedure.
   * @param procedureName The name of the procedure.
   * @param enrouteTransitionName The name of the procedure's enroute transition, or the empty string if the enroute
   * transition is not specified.
   * @param runway The identifier of the runway associated with the procedure's runway transition, or the empty
   * identifier if the runway transition is not specified.
   * @returns The primary chart page associated with the specified procedure from the specified array, or undefined if
   * no such page could be found.
   */
  private static getDepartureArrivalPage(
    pages: readonly GarminChartsPageData[],
    chartProcedureType: ChartProcedureType.Sid | ChartProcedureType.Star,
    procedureName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): GarminChartsPageData | undefined {
    let result: GarminChartsPageData | undefined;
    let isResultNameMatch = false;

    // Set up a regex to search for the name of the procedure plus the procedure number, separated by an optional
    // space.

    const indexOfNumber = procedureName.search(/[^\d]\d+$/) + 1;
    const nameRegex = new RegExp(
      indexOfNumber > 0
        ? `${procedureName.substring(0, indexOfNumber)} ?${procedureName.substring(indexOfNumber)}`
        : procedureName,
      'i'
    );

    for (const page of pages) {
      // Do not consider pages that are not the first page of the chart.
      if (page.pageIndex > 0) {
        continue;
      }

      // If a runway transition is specified, then do not consider pages that define at least one associated runway
      // and none of the associated runways match the runway transition.
      if (
        runway.number !== ''
        && page.metadata.runways.length > 0
        && !page.metadata.runways.find(query => query.number === runway.number && query.designator === runway.designator)
      ) {
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
    // Only allow exact matches to the runway name.
    const runwayName = `${approachIdentifier.runway.number}${approachIdentifier.runway.designator}`;

    // Match suffixes that are separated from the approach name by a space.
    const approachNameSuffix = approachIdentifier.suffix.length > 0 ? ` ${approachIdentifier.suffix}` : '';

    let approachName: string;
    let alternateApproachName: string | undefined;

    switch (ApproachUtils.nameToType(approachIdentifier.type)) {
      case ApproachType.APPROACH_TYPE_ILS:
        // Match any of the following:
        // 1. ILS [suffix]
        // 2. ILS DME [suffix]
        // 3. [1. or 2.] [OR or /] LOC
        // 4. [1. or 2.] [OR or /] LOC [A-Z]
        // 5. [1. or 2.] [OR or /] LOC DME
        // 6. [1. or 2.] [OR or /] LOC DME [A-Z]
        approachName = `ILS(?: DME)?${approachNameSuffix}(?: (?:OR|\\/) LOC(?: DME)?(?: [A-Z])?)?`;
        break;
      case ApproachType.APPROACH_TYPE_LOCALIZER:
        // Match any of the following:
        // 1. LOC [suffix]
        // 2. LOC DME [suffix]
        // 3. ILS [OR or /] [1. or 2.]
        // 4. ILS [A-Z] [OR or /] [1. or 2.] 
        // 5. ILS DME [OR or /] [1. or 2.]
        // 6. ILS DME [A-Z] [OR or /] [1. or 2.]
        approachName = `(?:ILS(?: DME)?(?: [A-Z])? (?:OR|\\/) )?LOC(?: DME)?${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_LDA:
        // Match any of the following:
        // 1. LDA [suffix]
        approachName = `LDA${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
        // Match any of the following:
        // 1. LOC BACK CRS [suffix]
        approachName = `LOC BACK CRS${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_VOR: {
        // Match any of the following:
        // (preferred)
        // 1. VOR [suffix]
        // 2. VOR [suffix] [OR or /] GPS
        // 3. VOR [suffix] [OR or /] GPS [A-Z]
        // (alternate)
        // 1. VOR DME [suffix]
        // 2. VOR DME [suffix] [OR or /] GPS
        // 3. VOR DME [suffix] [OR or /] GPS [A-Z]
        const gpsOption = '(?: (?:OR|\\/) GPS(?: [A-Z])?)?';
        approachName = `VOR${approachNameSuffix}${gpsOption}`;
        alternateApproachName = `VOR DME${approachNameSuffix}${gpsOption}`;
        break;
      }
      case ApproachType.APPROACH_TYPE_VORDME: {
        // Match any of the following:
        // (preferred)
        // 1. VOR DME [suffix]
        // 2. VOR DME [suffix] [OR or /] GPS
        // 3. VOR DME [suffix] [OR or /] GPS [A-Z]
        // (alternate)
        // 1. VOR [suffix]
        // 2. VOR [suffix] [OR or /] GPS
        // 3. VOR [suffix] [OR or /] GPS [A-Z]
        const gpsOption = '(?: (?:OR|\\/) GPS(?: [A-Z])?)?';
        approachName = `VOR DME${approachNameSuffix}${gpsOption}`;
        alternateApproachName = `VOR${approachNameSuffix}${gpsOption}`;
        break;
      }
      case ApproachType.APPROACH_TYPE_NDB:
        // Match any of the following:
        // (preferred)
        // 1. NDB [suffix]
        // (alternate)
        // 1. NDB DME [suffix]
        approachName = `NDB${approachNameSuffix}`;
        alternateApproachName = `NDB DME${approachNameSuffix}`;
        break;
      case ApproachType.APPROACH_TYPE_NDBDME:
        // Match any of the following:
        // (preferred)
        // 1. NDB DME [suffix]
        // (alternate)
        // 1. NDB [suffix]
        approachName = `NDB DME${approachNameSuffix}`;
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
        // 2. VOR [OR or /] GPS [suffix]
        // 3. VOR [A-Z] [OR or /] GPS [suffix]
        // 4. VOR DME [OR or /] GPS [suffix]
        // 5. VOR DME [A-Z] [OR or /] GPS [suffix]
        approachName = `(?:VOR(?: DME)?(?: [A-Z])? (?:OR|\\/) )?GPS${approachNameSuffix}`;
        break;
      default:
        return undefined;
    }

    const anyRunwayName = '\\d\\d[a-zA-Z]?';

    // If a runway exists, then match the runway name by itself or within an arbitrary-length list of "/"-delimited
    // runway names. If a runway does not exist, then ensure that we do not match a runway name-like string.
    const approachNameEnd = runwayName.length > 0
      ? ` (?:${anyRunwayName}\\/)*${runwayName}(?:\\/${anyRunwayName})*(?: |$)`
      : `(?: (?!${anyRunwayName})|$)`;

    const approachNameRegex = new RegExp(`^${approachName}${approachNameEnd}`, 'i');
    const alternateApproachNameRegex = alternateApproachName ? new RegExp(`^${alternateApproachName}${approachNameEnd}`, 'i') : undefined;

    let result: GarminChartsPageData | undefined;
    let isResultAlternateNameMatch = false;

    for (const page of pages) {
      // Do not consider pages that are not the first page of the chart.
      if (page.pageIndex > 0) {
        continue;
      }

      // If we have a name match, then immediately return the current page.
      if (approachNameRegex.test(page.metadata.name)) {
        return page;
      }

      // If we don't have a name-match result yet, then check if there is an alternate name match. If so, then set the
      // current page as the result.
      if (!isResultAlternateNameMatch && alternateApproachNameRegex) {
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
}
