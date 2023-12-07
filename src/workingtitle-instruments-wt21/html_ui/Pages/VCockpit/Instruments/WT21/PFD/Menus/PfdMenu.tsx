/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ArraySubject, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { MapUserSettings } from '../../Shared/Map/MapUserSettings';
import { PopupMenu } from '../../Shared/Menus/Components/PopupMenu';
import { PopupMenuSection } from '../../Shared/Menus/Components/PopupMenuSection';
import { RadioBox } from '../../Shared/Menus/Components/Radiobox';
import { RadioList } from '../../Shared/Menus/Components/RadioList';
import { SelectInput } from '../../Shared/Menus/Components/SelectInput';
import { SubmenuLink } from '../../Shared/Menus/Components/SubmenuLink';
import { WT21CourseNeedleNavIndicator } from '../../Shared/Navigation/WT21NavIndicators';
import { GuiDialog, GuiDialogProps } from '../../Shared/UI/GuiDialog';

/** @inheritdoc */
interface PfdMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Used to sync active nav source. */
  courseNeedle: WT21CourseNeedleNavIndicator;
}

/** The PfdMenu component. */
export class PfdMenu extends GuiDialog<PfdMenuProps> {
  private readonly formatOption = Subject.create<number>(0);
  private readonly navSrcOption = Subject.create<number>(0);
  private readonly rangeOption = Subject.create<number>(0);
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.props.bus, 'PFD');

  private readonly navSourcesOrder = ['FMS1', 'NAV1', 'NAV2'] as const;
  private readonly navSources = ArraySubject.create<string>(['FMS1', 'VOR1', 'VOR2']);
  private readonly ranges = ArraySubject.create<string>(['5', '10', '25', '50', '100', '200', '300', '600']);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.linkFormatSetting();
    this.linkRangeSetting();
    this.linkNavSource();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkFormatSetting(): void {
    const hsiFormatSetting = this.mapSettingsManager.getSetting('hsiFormat');
    this.formatOption.sub(x => {
      hsiFormatSetting.value = MapUserSettings.hsiFormatsPFD[x];
    });

    this.mapSettingsManager.whenSettingChanged('hsiFormat').handle(x => {
      this.formatOption.set(MapUserSettings.hsiFormatsPFD.indexOf(x));
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkRangeSetting(): void {
    const mapRangeSetting = this.mapSettingsManager.getSetting('mapRange');
    // TODO Handle when range 600 is not available (also handle in DcpController)
    this.rangeOption.sub(x => {
      mapRangeSetting.value = MapUserSettings.mapRanges[x];
    });

    this.mapSettingsManager.whenSettingChanged('mapRange').handle(x => {
      this.rangeOption.set(MapUserSettings.mapRanges.indexOf(x));
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkNavSource(): void {
    this.navSrcOption.sub(x => {
      const newSourceName = this.navSourcesOrder[x];
      this.props.courseNeedle.setNewSource(newSourceName);
    });

    this.props.courseNeedle.source.sub(x => {
      this.navSrcOption.set(this.navSourcesOrder.indexOf(x!.name as typeof this.navSourcesOrder[number]));
    }, true);

    this.props.courseNeedle.isLocalizer.sub(x => {
      if (x) {
        this.navSources.set(['FMS1', 'LOC1', 'LOC2']);
      } else {
        this.navSources.set(['FMS1', 'VOR1', 'VOR2']);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupMenu label='PFD MENU' class="pfd-popup-menu">
          <PopupMenuSection label='FORMAT'>
            <RadioList dataRef={this.formatOption}>
              <RadioBox name="frmt" label='ROSE'></RadioBox>
              <RadioBox name="frmt" label='ARC'></RadioBox>
              <RadioBox name="frmt" label='PPOS'></RadioBox>
            </RadioList>
          </PopupMenuSection>

          {/* <PopupMenuSection label='SPEEDS'>
            <CheckBoxSelect label='V1' />
            <CheckBoxSelect label='VR' />
            <CheckBoxSelect label='V2' />
            <CheckBoxSelect label='VT' />
          </PopupMenuSection>

          <PopupMenuSection label='MINIMUMS'>
            <RadioList dataRef={this.formatOption}>
              <RadioBoxSelect name="mins" label='OFF'></RadioBoxSelect>
              <RadioBoxSelect name="mins" label='BARO'></RadioBoxSelect>
              <RadioBoxSelect name="mins" label='RA'></RadioBoxSelect>
            </RadioList>
          </PopupMenuSection> */}

          <PopupMenuSection label='CONTROLS'>
            <SelectInput label='NAV-SRC' data={this.navSources} dataRef={this.navSrcOption} />
            <SelectInput label='RANGE' data={this.ranges} dataRef={this.rangeOption} />
          </PopupMenuSection>

          <PopupMenuSection>
            <SubmenuLink label='BRG SRC' viewId='BrgSrcMenu' viewService={this.props.viewService} />
            <SubmenuLink label='CONFIG' viewId='PfdConfigMenu' viewService={this.props.viewService} />
            <SubmenuLink label='OVERLAYS' viewId='PfdOverlaysMenu' viewService={this.props.viewService} />
            <SubmenuLink label='RADAR' viewId='RadarMenu' disabled={true} viewService={this.props.viewService} />
            <SubmenuLink label='REFS' viewId='PfdRefsMenu' viewService={this.props.viewService} />
            <SubmenuLink label='TAWS' viewId='TawsMenu' disabled={true} viewService={this.props.viewService} />
            <SubmenuLink label='BARO SET' viewId='PfdBaroSetMenu' viewService={this.props.viewService} />
          </PopupMenuSection>
        </PopupMenu>
      </>
    );
  }
}