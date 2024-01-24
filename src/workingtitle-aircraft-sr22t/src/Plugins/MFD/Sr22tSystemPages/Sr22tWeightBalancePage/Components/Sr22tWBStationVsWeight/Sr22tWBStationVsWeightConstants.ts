/** Utility class to store constant for StationVsWeight diagram */
export class Sr22tWBStationVsWeightConstants {
  public static readonly DIAGRAM_WIDTH = 400; //pixels
  public static readonly DIAGRAM_HEIGHT = 210; //pixels
  public static readonly DIAGRAM_HEIGHT_ZOOMED = 480; //pixels
  public static readonly DIAGRAM_WEIGHT_MAX = 4100; //pounds
  public static readonly DIAGRAM_WEIGHT_MIN = 1900; //pounds
  public static readonly DIAGRAM_STATION_MAX = 153; //inches
  public static readonly DIAGRAM_STATION_MIN = 133; //inches
  public static readonly DIAGRAM_WEIGHT_STEPS_KG = [870, 970, 1088, 1197, 1306, 1415, 1524, 1632, 1741, 1850];
  public static readonly DIAGRAM_WEIGHT_STEPS_LB = [1920, 2160, 2400, 2640, 2880, 3120, 3360, 3600, 3840, 4080];
  public static readonly DIAGRAM_STATION_STEPS_CM = [340, 345, 351, 356, 361, 366, 371, 376, 381, 386];
  public static readonly DIAGRAM_STATION_STEPS_IN = [134, 136, 138, 140, 142, 144, 146, 148, 150, 152];
}
