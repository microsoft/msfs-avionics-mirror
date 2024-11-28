import { ConsumerSubject, EventBus, KeyEventManager, UserSettingManager } from '@microsoft/msfs-sdk';
import { DefaultHeadingDataProvider } from '../Instruments';
import { Epic2ApPanelEvents } from './Epic2ApPanelPublisher';
import { HeadingFormat, PfdAllUserSettingTypes } from '../Settings';

/** The controller syncs the autopilot's selected heading to current heading in response to sync H event. */
export class Epic2HeadingSyncController {
  private isInit = false;
  private keyEventManager?: KeyEventManager;
  private readonly keyEventManagerReadyPromise: Promise<KeyEventManager>;
  /** Whether track mode is selected, heading mode selected when false, or null when invalid. */
  private readonly isTrackModeSelected = ConsumerSubject.create<boolean | null>(null, false);

  /**
   * Creates a new instance of Epic2HeadingSyncController.
   * @param bus The event bus.
   * @param headingDataProvider The heading data provider to synchronize heading when requested.
   * @param settingsManager The settings manager to pass to altitude preselect system.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly headingDataProvider: DefaultHeadingDataProvider,
    private readonly settingsManager: UserSettingManager<PfdAllUserSettingTypes>
  ) {
    this.isTrackModeSelected.setConsumer(bus.getSubscriber<Epic2ApPanelEvents>().on('epic2_ap_hdg_trk_selector'));
    this.headingDataProvider = headingDataProvider;
    this.settingsManager = settingsManager;

    this.keyEventManagerReadyPromise = new Promise((resolve) => {
      KeyEventManager.getManager(bus).then(manager => {
        this.keyEventManager = manager;
        resolve(manager);
      });
    });
  }

  /** Synchronize heading bug to the current aircraft heading */
  sync(): void {
    const headingFormat = this.settingsManager.getSetting('headingFormat').get();
    let heading: number | null;

    // todo true/magnetic info in HeadingDataProvider
    if (this.isTrackModeSelected.get()) {
      heading = headingFormat === HeadingFormat.True
        ? this.headingDataProvider.trueTrack.get()
        : this.headingDataProvider.magneticTrack.get();
    } else {
      heading = headingFormat === HeadingFormat.True
        ? this.headingDataProvider.trueHeading.get()
        : this.headingDataProvider.magneticHeading.get();
    }

    heading && this.keyEventManager!.triggerKey('HEADING_BUG_SET', true, heading, 1);
  }

  /** Initializes this controller */
  public async init(): Promise<void> {
    if (this.isInit) {
      return;
    }
    this.isInit = true;
    await this.keyEventManagerReadyPromise;
  }
}
