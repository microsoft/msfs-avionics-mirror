import { ComponentProps, DebounceTimer, DisplayComponent, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { TrafficSystemType } from '@microsoft/msfs-garminsdk';

import { AvionicsConfig, DisplayPaneControlGtcIndex } from '@microsoft/msfs-wtg3000-common';

import { ButtonBar } from '../Components/ButtonBar/ButtonBar';
import { GtcNavComTopBar } from '../Components/GtcNavComTopBar/GtcNavComTopBar';
import { LabelBar, LabelBarPluginHandlers } from '../Components/LabelBar/LabelBar';
import { TitleBar } from '../Components/TitleBar/TitleBar';
import { GtcNavComHome } from '../Pages/NavComHome/GtcNavComHome';
import { GtcService, GtcViewStackContainer, GtcViewStackKey, GtcViewStackRefs } from './GtcService';

import './GtcContainer.css';

/** The props for GtcContainer. */
export interface GtcContainerProps extends ComponentProps {
  /** The GtcService instance. */
  gtcService: GtcService;

  /** The instrument's general configuration object. */
  config: AvionicsConfig;

  /**
   * An array of plugin label bar handlers. The array should be ordered such that the handlers appear in the order in
   * which their parent plugins were loaded.
   */
  pluginLabelBarHandlers: readonly Readonly<LabelBarPluginHandlers>[];
}

/** Top level GTC component. */
export class GtcContainer extends DisplayComponent<GtcContainerProps> {
  private readonly gtcMainRef = FSComponent.createRef<HTMLDivElement>();

  private readonly containerRefs: Partial<Record<GtcViewStackKey, NodeReference<DisplayComponent<any> & GtcViewStackContainer>>> = {};

  private readonly noPaneSelectedRef = FSComponent.createRef<HTMLDivElement>();
  private readonly navComHeaderRef = FSComponent.createRef<GtcNavComHome>();

  /** @inheritdoc*/
  public onAfterRender(): void {
    const viewStackRefs: GtcViewStackRefs = {};
    for (const [key, ref] of Object.entries(this.containerRefs)) {
      viewStackRefs[key as GtcViewStackKey] = ref.instance;
    }

    this.props.gtcService.onGtcContainerRendered(viewStackRefs);

    this.props.gtcService.activeControlMode.sub(x => {
      this.gtcMainRef.instance.classList.toggle('gtc-pfd-control-mode', x === 'PFD');
      this.gtcMainRef.instance.classList.toggle('gtc-mfd-control-mode', x === 'MFD');
      this.gtcMainRef.instance.classList.toggle('gtc-navcom-control-mode', x === 'NAV_COM');
    }, true);

    // This prevents right mouse clicks from reaching child DOM elements.
    this.gtcMainRef.instance.addEventListener('mousedown', this.filterMouseEvent, { capture: true });
    this.gtcMainRef.instance.addEventListener('mouseup', this.filterMouseEvent, { capture: true });

    if (this.props.gtcService.hasMfdMode) {
      this.props.gtcService.selectedDisplayPane.sub(this.updateNoSelectedPaneOverlay, true);
      this.props.gtcService.activeControlMode.sub(this.updateNoSelectedPaneOverlay, true);
    }

    this.navComHeaderRef.getOrDefault() && this.props.gtcService.navComEventHandler.set(this.navComHeaderRef.instance);
  }

  /**
   * Stops propogation of mouse events that were not for the left mouse button.
   * Mainly prevents interacting with the GTC with right mouse button clicks.
   * @param event The mouse event.
   */
  private readonly filterMouseEvent = (event: MouseEvent): void => {
    if (event.button !== 0) {
      event.stopPropagation();
    }
  };

  private readonly updateNoSelectedPaneOverlay = (): void => {
    const pane = this.props.gtcService.selectedDisplayPane.get();
    const mode = this.props.gtcService.activeControlMode.get();
    this.noPaneSelectedRef.instance.classList.toggle('hidden', mode !== 'MFD' || pane !== -1);
  };

  /** @inheritdoc*/
  public render(): VNode {
    const leftOrRight = this.props.gtcService.displayPaneControlIndex ===
      DisplayPaneControlGtcIndex.LeftGtc ? 'left' : 'right';

    return (
      <div
        ref={this.gtcMainRef}
        class={`gtc-main gtc-${leftOrRight} gtc-${this.props.gtcService.orientation}`}
      >
        {this.props.gtcService.orientation === 'horizontal' &&
          <div class="horizontal-side-bar-background" />
        }
        {this.props.gtcService.orientation === 'vertical' &&
          <GtcNavComTopBar gtcService={this.props.gtcService}>
            <GtcNavComHome
              ref={this.navComHeaderRef}
              gtcService={this.props.gtcService}
              controlMode='NAV_COM'
              tcasIsSupported={this.props.config.traffic.type === TrafficSystemType.TcasII}
            />
          </GtcNavComTopBar>
        }
        <div id="gtc-view-container">
          {this.props.gtcService.hasPfdMode && (
            <DefaultGtcViewStackContainer
              ref={this.containerRefs[GtcViewStackKey.Pfd] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
              class="gtc-main-view-stack gtc-pfd-view-stack"
            />
          )}
          {this.props.gtcService.hasMfdMode &&
            <>
              <DefaultGtcViewStackContainer
                ref={this.containerRefs[GtcViewStackKey.Mfd1] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
                class="gtc-main-view-stack gtc-mfd-1-view-stack"
              />
              <DefaultGtcViewStackContainer
                ref={this.containerRefs[GtcViewStackKey.Mfd2] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
                class="gtc-main-view-stack gtc-mfd-2-view-stack"
              />
              <DefaultGtcViewStackContainer
                ref={this.containerRefs[GtcViewStackKey.Mfd3] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
                class="gtc-main-view-stack gtc-mfd-3-view-stack"
              />
              <DefaultGtcViewStackContainer
                ref={this.containerRefs[GtcViewStackKey.Mfd4] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
                class="gtc-main-view-stack gtc-mfd-4-view-stack"
              />
            </>
          }
          {this.props.gtcService.hasNavComMode && (
            <DefaultGtcViewStackContainer
              ref={this.containerRefs[GtcViewStackKey.NavCom] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
              class="gtc-main-view-stack gtc-navcom-view-stack"
            />
          )}
          {this.props.gtcService.hasMfdMode &&
            <div ref={this.noPaneSelectedRef} id="gtc-no-selected-pane">
              Cross Side GTC in Full Screen Mode
            </div>
          }

          {this.props.gtcService.hasPfdMode && (
            <DefaultGtcViewStackContainer
              ref={this.containerRefs[GtcViewStackKey.PfdOverlay] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
              class="gtc-overlay-view-stack gtc-pfd-overlay-view-stack"
            />
          )}
          {this.props.gtcService.hasMfdMode && (
            <DefaultGtcViewStackContainer
              ref={this.containerRefs[GtcViewStackKey.MfdOverlay] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
              class="gtc-overlay-view-stack gtc-mfd-overlay-view-stack"
            />
          )}
          {this.props.gtcService.hasNavComMode && (
            <DefaultGtcViewStackContainer
              ref={this.containerRefs[GtcViewStackKey.NavComOverlay] = FSComponent.createRef<DefaultGtcViewStackContainer>()}
              class="gtc-overlay-view-stack gtc-navcom-overlay-view-stack"
            />
          )}
        </div>
        <TitleBar gtcService={this.props.gtcService} />
        <ButtonBar gtcService={this.props.gtcService} supportCasAcknowledge={this.props.config.message.includeCas} />
        <LabelBar gtcService={this.props.gtcService} pluginHandlers={this.props.pluginLabelBarHandlers} />
      </div>
    );
  }
}

/**
 * Component props for GtcViewStackContainer.
 */
interface GtcViewStackContainerProps extends ComponentProps {
  /** CSS class(es) to apply to the root of the container. */
  class?: string;
}

/**
 * A container for a GTC view stack.
 */
class DefaultGtcViewStackContainer extends DisplayComponent<GtcViewStackContainerProps> implements GtcViewStackContainer {
  private static readonly HIDE_DELAY = 1000; // milliseconds

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly visibilityDebounce = new DebounceTimer();

  private readonly hide = (): void => { this.rootRef.instance.classList.add('hidden'); };

  /** @inheritdoc */
  public setVisible(visible: boolean): void {
    if (visible) {
      this.visibilityDebounce.clear();

      this.rootRef.instance.classList.remove('hidden');
      this.rootRef.instance.classList.remove('gtc-view-stack-close-animation');
      this.rootRef.instance.classList.add('gtc-view-stack-open-animation');
    } else {
      this.rootRef.instance.classList.remove('gtc-view-stack-open-animation');
      this.rootRef.instance.classList.add('gtc-view-stack-close-animation');

      // Delay hiding to allow close animation to play.
      this.visibilityDebounce.schedule(this.hide, DefaultGtcViewStackContainer.HIDE_DELAY);
    }
  }

  /** @inheritdoc */
  public renderView(view: VNode): void {
    FSComponent.render(view, this.rootRef.instance);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class={`gtc-view-stack ${this.props.class ?? ''}`} />
    );
  }
}
