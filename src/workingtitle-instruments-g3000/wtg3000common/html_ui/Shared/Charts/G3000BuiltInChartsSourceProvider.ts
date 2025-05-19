import { G3000BuiltInChartsSourceIds } from './G3000BuiltInChartsSourceIds';
import { G3000ChartsSourceFactory } from './G3000ChartsSource';
import { G3000FaaChartsSource } from './G3000FaaChartsSource';
import { G3000LidoChartsSource } from './G3000LidoChartsSource';

/**
 * A provider of built-in G3000 electronic charts sources.
 */
export class G3000BuiltInChartsSourceProvider {
  /**
   * Gets an array of factories for all built-in G3000 electronic charts sources.
   * @returns An array of factories for all built-in G3000 electronic charts sources.
   */
  public getSources(): G3000ChartsSourceFactory[] {
    return [
      {
        uid: G3000BuiltInChartsSourceIds.Lido,
        createSource: () => new G3000LidoChartsSource(),
      },
      {
        uid: G3000BuiltInChartsSourceIds.Faa,
        createSource: () => new G3000FaaChartsSource(),
      },
    ];
  }
}
