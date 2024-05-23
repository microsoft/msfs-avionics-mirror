import { MutableSubscribable, Subscribable } from '../sub/Subscribable';

/**
 * Contains performance data tied to a flight plan
 */
export type PerformancePlan = { [k: string]: MutableSubscribable<any, any> }

/**
 * Utils for performance plans
 */
export class PerformancePlanUtils {
  /**
   * Serializes a plan
   *
   * @param plan the plan to serialize
   *
   * @returns the serialized JSON string
   */
  public static serialize<P extends PerformancePlan>(plan: P): string {
    const tmpObj: Record<string, string> = {};

    Object.keys(plan).forEach((key: string) => {
      tmpObj[key] = (plan[key as keyof P] as Subscribable<any>).get();
    });

    return JSON.stringify(tmpObj);
  }

  /**
   * Deserializes a serialized performance plan into a plan
   *
   * @param data the serialized data string
   * @param plan the plan to deserialize into
   */
  public static deserializeInto<P extends PerformancePlan>(data: string, plan: P): void {
    const customData = JSON.parse(data);

    Object.keys(customData).forEach((key) => {
      const value = customData[key];

      if (value !== undefined) {
        (plan[key as keyof P] as unknown as MutableSubscribable<any>).set(value);
      }
    });
  }
}
