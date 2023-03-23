import {
  DisplayComponent, FSComponent, VNode,
  ComponentProps, Subject, Subscription,
} from '@microsoft/msfs-sdk';
import { GtcService, GtcViewEntry } from '../../GtcService/GtcService';
import './TitleBar.css';

/** The properties for the TitleBar component. */
interface TitleBarProps extends ComponentProps {
  /** The GtcService instance */
  gtcService: GtcService;
}

/** The TitleBar component. */
export class TitleBar extends DisplayComponent<TitleBarProps> {
  private readonly titleBarRef = FSComponent.createRef<HTMLDivElement>();
  private readonly titleInnerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly title1Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly title2Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly title1 = Subject.create('');
  private readonly title2 = Subject.create('');
  private readonly minWidth = this.props.gtcService.orientation === 'horizontal' ? 375 : 175;
  private readonly margin = this.props.gtcService.orientation === 'horizontal' ? 0 : -25;
  private showTitle1 = true;

  private readonly title: Subject<string> = Subject.create('');
  private titleSubscription?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.gtcService.activeView.sub((view: GtcViewEntry): void => {
      this.titleSubscription?.destroy();
      this.titleSubscription = view.ref.title.pipe(this.title);
    });

    this.title.sub(title => {
      this.showTitle1 = !this.showTitle1;

      if (this.showTitle1) {
        this.title1.set(title ?? '');
        this.titleInnerRef.instance.style.width = Math.max(this.minWidth, this.title1Ref.instance.clientWidth + this.margin) + 'px';
      } else {
        this.title2.set(title ?? '');
        this.titleInnerRef.instance.style.width = Math.max(this.minWidth, this.title2Ref.instance.clientWidth + this.margin) + 'px';
      }

      this.titleBarRef.instance.classList.toggle('empty-title', title === undefined);
      this.titleBarRef.instance.classList.toggle('show-title-1', this.showTitle1);
      this.titleBarRef.instance.classList.toggle('show-title-2', !this.showTitle1);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.titleBarRef} class="gtc-view-title empty-title">
        <div class="gtc-view-title-left"></div>
        <div ref={this.titleInnerRef} class="gtc-view-title-inner">
          <div ref={this.title1Ref} class="gtc-view-title-inner-text title-1">{this.title1}</div>
          <div ref={this.title2Ref} class="gtc-view-title-inner-text title-2">{this.title2}</div>
        </div>
        <div class="gtc-view-title-right"></div>
      </div>
    );
  }
}