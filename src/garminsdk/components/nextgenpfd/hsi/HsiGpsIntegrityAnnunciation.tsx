import { ComponentProps, DebounceTimer, DisplayComponent, FSComponent, ObjectSubject, SetSubject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

/**
 * Display modes for {@link HsiGpsIntegrityAnnunciation}.
 */
export enum HsiGpsIntegrityAnnunciationMode {
  Ok = 'Ok',
  GpsNotUsed = 'GpsNotUsed',
  UnableRnp = 'UnableRnp',
  GpsLoi = 'GpsLoi'
}

/**
 * Component props for HsiGpsIntegrityAnnunciation.
 */
export interface HsiGpsIntegrityAnnunciationProps extends ComponentProps {
  /** The mode to display. */
  mode: Subscribable<HsiGpsIntegrityAnnunciationMode>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin HSI GPS integrity annunciation.
 */
export class HsiGpsIntegrityAnnunciation extends DisplayComponent<HsiGpsIntegrityAnnunciationProps> {
  private static readonly OK_SHOW_DURATION = 5000; // milliseconds

  private static readonly MODE_TEXT = {
    [HsiGpsIntegrityAnnunciationMode.Ok]: 'GPS\nINTEG\nOK',
    [HsiGpsIntegrityAnnunciationMode.GpsNotUsed]: 'GPS\nNOT\nUSED',
    [HsiGpsIntegrityAnnunciationMode.UnableRnp]: 'UNABLE\nRNP',
    [HsiGpsIntegrityAnnunciationMode.GpsLoi]: 'GPS LOI'
  };

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['hsi-gps-annunc']);

  private readonly text = this.props.mode.map(mode => HsiGpsIntegrityAnnunciation.MODE_TEXT[mode]);

  private readonly okShowTimer = new DebounceTimer();

  private modeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.modeSub = this.props.mode.sub(mode => {
      if (mode === HsiGpsIntegrityAnnunciationMode.Ok) {
        this.rootCssClass.add('hsi-gps-annunc-ok');

        this.rootStyle.set('display', '');
        this.okShowTimer.schedule(() => { this.rootStyle.set('display', 'none'); }, HsiGpsIntegrityAnnunciation.OK_SHOW_DURATION);
      } else {
        this.rootCssClass.delete('hsi-gps-annunc-ok');

        this.okShowTimer.clear();
        this.rootStyle.set('display', '');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.okShowTimer.clear();

    this.text.destroy();

    this.modeSub?.destroy();

    super.destroy();
  }
}