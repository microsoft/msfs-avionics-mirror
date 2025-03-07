import { ApproachProcedure, ApproachUtils, ChartMetadata, ChartProcedureIdentifier, Procedure, RunwayUtils } from '@microsoft/msfs-sdk';

import { Epic2ChartListType } from './Epic2ChartTypes';

/** A utility class for Epic2 charts */
export class Epic2ChartUtils {
  /**
   * Returns whether a given procedure matches a chart procedure identifier
   *
   * @param proc the procedure
   * @param ident the chart identifier to check against
   *
   * @returns a boolean
   */
  public static procedureMatchesIdentifier(
    proc: Procedure | ApproachProcedure,
    ident: ChartProcedureIdentifier,
  ): boolean {
    if ('approachType' in proc) {
      if (!ident.approachIdentifier) {
        return false;
      }

      const typeMatch = ApproachUtils.typeToName(proc.approachType) === (ident.approachIdentifier.type as string);
      const runwayMatch =
        RunwayUtils.getRunwayNameString(proc.runwayNumber, proc.runwayDesignator) ===
        ident.approachIdentifier.runway.number + ident.approachIdentifier.runway.designator;
      const suffixMatch = proc.approachSuffix === ident.approachIdentifier.suffix;

      return typeMatch && runwayMatch && suffixMatch;
    } else {
      if (ident.approachIdentifier) {
        return false;
      }

      return proc.name === ident.ident;
    }
  }


  /**
   * Picks the autoselect chart for a given procedure
   * @param charts The charts to filter from
   * @param procedure The procedure selected in the flight plan
   * @returns The chart metadata for the selected chart
   */
  public static selectAutoChartForProcedure(charts: readonly Epic2ChartListType[], procedure: Procedure | ApproachProcedure): ChartMetadata | null {
    const matchingCharts = charts.filter(({ chart }) => chart.procedures.filter((chartProc) => Epic2ChartUtils.procedureMatchesIdentifier(procedure, chartProc)).length > 0);

    if (matchingCharts.length > 0) {
      return matchingCharts[0].chart;
    }

    return null;
  }
}
