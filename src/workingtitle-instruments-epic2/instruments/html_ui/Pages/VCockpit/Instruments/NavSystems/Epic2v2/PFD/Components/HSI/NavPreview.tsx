import { ComponentProps, ComputedSubject, DisplayComponent, EventBus, FSComponent, NumberFormatter, VNode } from '@microsoft/msfs-sdk';

import { NavComUserSettingManager, NavigationSourceDataProvider } from '@microsoft/msfs-epic2-shared';

import './NavPreview.css';

/** The nav preview props. */
export interface NavPreviewProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The heading data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
  /** The nav com settings manager */
  settings: NavComUserSettingManager;
}

/** The Nav Preview component for crs/dme readout. */
export class NavPreview extends DisplayComponent<NavPreviewProps> {
  protected static readonly COURSE_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '' });
  protected static readonly DME_FORMATTER = NumberFormatter.create({ precision: 0.1, pad: 1, maxDigits: 4, nanString: '' });

  private readonly previewSource = ComputedSubject.create<string | null, string>(
    null, cn => (cn === null) ? '' : cn);

  private readonly previewCourse = this.props.navigationSourceDataProvider.ghostNeedle.get().course.map((v) => NavPreview.COURSE_FORMATTER(v ?? Number.NaN));

  private readonly dmePreviewSource = this.props.navigationSourceDataProvider.ghostNeedle.get().distance.map(
    distance => distance === null ? '' : NavPreview.DME_FORMATTER(distance)
  );

  private readonly dmePreviewNM = this.props.navigationSourceDataProvider.ghostNeedle.get().distance.map(
    distance => distance === null ? '' : 'NM'
  );

  private readonly dmePreviewH = this.props.navigationSourceDataProvider.ghostNeedle.get().distance.map(
    distance => distance === null ? '' : 'H'
  );

  private readonly isDme1HoldOn = this.props.settings.getSetting('dme1HoldOn');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.navigationSourceDataProvider.ghostNeedle.get().sourceLabel.sub((s) => {
      this.previewSource.set(s);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="nav-preview-container">
      <div class="preview-source-and-course-container">
        <div class="preview-source">{this.previewSource}</div>
        <div class="preview-course">{this.previewCourse}</div>
      </div>
      <div class="preview-source-dme-container">
        <div class="preview-dme-source">{this.dmePreviewSource}</div>
        <div class="preview-dme-unit">{this.dmePreviewNM}</div>
        <div class={{
          'preview-dme-hold': true,
          'dme-h-hidden': this.isDme1HoldOn.map(v => !v)
        }}>{this.dmePreviewH}</div>
      </div>

    </div>;
  }
}
