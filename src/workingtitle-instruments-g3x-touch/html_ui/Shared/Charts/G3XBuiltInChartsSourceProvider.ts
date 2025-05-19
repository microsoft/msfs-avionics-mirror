import { G3XBuiltInChartsSourceIds } from './G3XBuiltInChartsSourceIds';
import { G3XChartsSourceFactory } from './G3XChartsSource';
import { G3XFaaChartsSource } from './G3XFaaChartsSource';
import { G3XLidoChartsSource } from './G3XLidoChartsSource';

/**
 * A provider of built-in G3X Touch electronic charts sources.
 */
export class G3XBuiltInChartsSourceProvider {
  /**
   * Gets an array of factories for all built-in G3X Touch electronic charts sources.
   * @returns An array of factories for all built-in G3X Touch electronic charts sources.
   */
  public getSources(): G3XChartsSourceFactory[] {
    return [
      {
        uid: G3XBuiltInChartsSourceIds.Lido,
        createSource: () => new G3XLidoChartsSource(),
      },
      {
        uid: G3XBuiltInChartsSourceIds.Faa,
        createSource: () => new G3XFaaChartsSource(),
      },
    ];
  }
}
