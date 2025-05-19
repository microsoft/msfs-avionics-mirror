import { Subscription } from '@microsoft/msfs-sdk';

import { G3XChartsSource } from './G3XChartsSource';
import { G3XChartsUserSettingManager } from '../Settings/G3XChartsUserSettings';

/**
 * A manager for G3X Touch electronic charts.
 */
export class G3XChartsManager {
  private chartSourcesSet?: Set<string>;

  private isAlive = true;

  private preferredSourceSub?: Subscription;

  /**
   * Creates a new instance of G3XChartsManager.
   * @param settingManager A manager for electronic charts user settings.
   */
  public constructor(private readonly settingManager: G3XChartsUserSettingManager) {
  }

  /**
   * Starts automatic reconciliation of the preferred charts source with the available charts sources. If the preferred
   * charts source is set to an undefined value or one that references a non-existent source, then the preferred charts
   * source will be reset to the first available charts source. This method does nothing if this manager is not
   * initialized.
   * @param chartsSources All available electronic charts sources.
   * @throws Error if this manager has been destroyed.
   */
  public startReconcilePreferredSource(chartsSources: Iterable<G3XChartsSource>): void {
    if (!this.isAlive) {
      throw new Error('G3XChartsManager::reconcilePreferredSource(): cannot manipulate a dead manager');
    }

    if (this.chartSourcesSet) {
      return;
    }

    this.chartSourcesSet = new Set(Array.from(chartsSources).map(source => source.uid));

    if (this.chartSourcesSet.size > 0) {
      const defaultSource = this.chartSourcesSet.keys().next().value!;

      const preferredSourceSetting = this.settingManager.getSetting('chartsPreferredSource_g3x');

      this.preferredSourceSub = preferredSourceSetting.sub(source => {
        if (!this.chartSourcesSet!.has(source)) {
          preferredSourceSetting.set(defaultSource);
        }
      }, true);
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.preferredSourceSub?.destroy();
  }
}
