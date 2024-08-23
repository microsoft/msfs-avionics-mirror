import { HSIFormat } from './MapUserSettings';

/**
 * A class for checking support of map modes against the map format.
 */
export class MapFormatSupportMatrix {
  private static readonly supportMatrix = new Map<string, boolean[]>(
    [
      ['ROSE', [false, false, false, false]],
      ['ARC', [false, true, true, false]],
      ['PPOS', [true, true, true, false]],
      ['PLAN', [true, false, false, true]],
      ['TCAS', [false, false, false, false]],
    ]
  );

  /**
   * Checks support for a map mode against the format.
   * @param format The map format to check.
   * @param layer The map mode. 0=map 1=terr 2=wx 3=nexrad
   * @returns True if the map format supports the mode, false otherwise.
   */
  public isSupported(format: HSIFormat, layer: number): boolean {
    const matrix = MapFormatSupportMatrix.supportMatrix.get(format);
    return matrix !== undefined ? matrix[layer] : false;
  }
}