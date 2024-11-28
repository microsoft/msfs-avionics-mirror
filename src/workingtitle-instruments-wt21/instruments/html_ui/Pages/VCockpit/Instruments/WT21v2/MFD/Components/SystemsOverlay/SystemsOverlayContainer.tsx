import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, NodeReference, PluginSystem, Subject, VNode
} from '@microsoft/msfs-sdk';

import { WT21PluginBinder } from '@microsoft/msfs-wt21-shared';

import { WT21MfdAvionicsPlugin } from '../../WT21MfdAvionicsPlugin';
import { CcpControlEvents } from '../../CCP/CcpControlEvents';
import { SystemsPageComponent } from './SystemsPageComponent';

import './SystemsOverlayContainer.css';

/** The properties for the SystemsOverlayContainer component. */
interface SystemsOverlayContainerProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;

  /** The plugin system */
  pluginSystem: PluginSystem<WT21MfdAvionicsPlugin, WT21PluginBinder>
}

/** The SystemsOverlayContainer component. */
export class SystemsOverlayContainer extends DisplayComponent<SystemsOverlayContainerProps> {
  private readonly systemsOverlayRef = FSComponent.createRef<HTMLDivElement>();
  private readonly systemPagesRefs: NodeReference<DisplayComponent<any> & SystemsPageComponent>[] = [];

  private readonly title = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<CcpControlEvents>().on('ccp_sys_state').whenChanged().handle(state => {
      this.systemsOverlayRef.instance.classList.toggle('hidden', state === 'off');

      for (let i = 0; i < this.systemPagesRefs.length; i++) {
        const ref = this.systemPagesRefs[i];

        ref.instance.setVisibility(state === `${i + 1}`);
      }

      state !== 'off' && this.title.set(`SYSTEMS ${state}/2`);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    const systemPagesVNodes: VNode[] = [];
    this.props.pluginSystem.callPlugins((it) => {
      const renderedSystemsPages = it.renderSystemPages?.();

      if (renderedSystemsPages && renderedSystemsPages.length > 0 && systemPagesVNodes.length === 0) {
        systemPagesVNodes.length = 0;
        systemPagesVNodes.push(...renderedSystemsPages.map((page) => page.vnode));

        this.systemPagesRefs.length = 0;
        this.systemPagesRefs.push(...renderedSystemsPages.map((page) => page.ref));
      }
    });

    return (
      <div class="systems-overlay-container hidden" ref={this.systemsOverlayRef}>
        <div class="systems-overlay-title">{this.title}</div>
        {...systemPagesVNodes}
      </div>
    );
  }
}
