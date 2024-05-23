import {
  ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, NodeReference, ReadonlyFloat64Array, SetSubject, Subject,
  Subscribable, SubscribableMapFunctions, SubscribableSet, Subscription, ToggleableClassNameRecord, VNode, Vec2Math
} from '@microsoft/msfs-sdk';

import { UiInteractionEvent, UiInteractionHandler } from '../../Shared/UiSystem/UiInteraction';
import { UiService } from '../../Shared/UiSystem/UiService';
import { UiViewOcclusionType } from '../../Shared/UiSystem/UiViewTypes';
import { AbstractMfdPage } from './AbstractMfdPage';
import { MfdPage } from './MfdPage';
import { MfdPageDefinition } from './MfdPageDefinition';
import { MfdPageEntry, MfdPageSizeMode } from './MfdPageTypes';

/**
 * Component props for {@link MfdPageContainer}.
 */
export interface MfdPageContainerProps extends ComponentProps {
  /** An iterable of registered MFD page definitions. */
  registeredPageDefs: Iterable<Readonly<MfdPageDefinition>>;

  /** The UI service instance. */
  uiService: UiService;

  /** A reference to the root element of the container of the container's parent UI view. */
  containerRef: NodeReference<HTMLElement>;

  /** The key of the selected page. */
  selectedPageKey: Subscribable<string>;

  /** A {@link MutableSubscribable} to which to write the selected page's title. */
  selectedPageTitle?: MutableSubscribable<string, any>;

  /** A {@link MutableSubscribable} to which to write the file path of the selected page's icon image asset. */
  selectedPageIconSrc?: MutableSubscribable<string, any>;

  /** CSS class(es) to apply to the root element of the container. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An entry describing a rendered MFD page.
 */
type PageEntry<T extends MfdPage = MfdPage> = {
  /** The key of the page. */
  key: string;

  /** A reference to the page. */
  page: T;

  /** Whether the page is visible. */
  isVisible: MutableSubscribable<boolean>;

  /** The subscription to the page's title. */
  titleSubscription: Subscription;

  /** The subscription to the file path of the page's icon's image asset. */
  iconSrcSubscription: Subscription;
}

/**
 * A container for MFD pages.
 */
export class MfdPageContainer extends DisplayComponent<MfdPageContainerProps> implements UiInteractionHandler {
  private static readonly RESERVED_CSS_CLASSES = [
    'mfd-page-container',
    'mfd-page-container-full',
    'mfd-page-container-half'
  ];

  private static readonly SELECTED_PAGE_DELAY = 250; // milliseconds

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rootCssClass = SetSubject.create(['mfd-page-container']);

  private readonly registeredPageDefs = new Map<string, Readonly<MfdPageDefinition>>();
  private readonly pageEntryMap = new Map<string, PageEntry>();

  private readonly _stagedPageEntry = Subject.create<PageEntry | null>(null);
  /** This container's current staged page, or `null` if there is no staged page. */
  public readonly stagedPageEntry = this._stagedPageEntry as Subscribable<MfdPageEntry | null>;

  private readonly _activePageEntry = Subject.create<PageEntry | null>(null);
  /** This container's current active page, or `null` if there is no active page. */
  public readonly activePageEntry = this._activePageEntry as Subscribable<MfdPageEntry | null>;

  private readonly selectedPageTitle = Subject.create<string>('');

  private readonly selectedPageIconSrc = Subject.create<string>('');

  private sizeMode = MfdPageSizeMode.Full;
  private readonly dimensions = Vec2Math.create();

  private isAlive = true;
  private _isAwake = false;
  private _isResumed = false;

  private selectedPageUpdateTime: number | undefined = undefined;
  private needOpen = false;

  private cssClassSub?: Subscription | Subscription[];
  private selectedPageSub?: Subscription;
  private selectedPageTitlePipe?: Subscription;
  private selectedPageIconSrcPipe?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    for (const def of this.props.registeredPageDefs) {
      this.registeredPageDefs.set(def.key, def);
    }

    this.selectedPageSub = this.props.selectedPageKey.sub(this.onSelectedPageKeyChanged.bind(this), true);

    this.selectedPageTitlePipe = this.props.selectedPageTitle && this.selectedPageTitle.pipe(this.props.selectedPageTitle);
    this.selectedPageIconSrcPipe = this.props.selectedPageIconSrc && this.selectedPageIconSrc.pipe(this.props.selectedPageIconSrc);
  }

  /**
   * Checks whether this container is awake.
   * @returns Whether this container is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /**
   * Checks whether this container is resumed.
   * @returns Whether this container is resumed.
   */
  public isResumed(): boolean {
    return this._isResumed;
  }

  /**
   * Wakes this container. This will open the active page (if one exists).
   * @throws Error if this container has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('MfdMainPageContainer: cannot wake a dead container');
    }

    if (this._isAwake) {
      return;
    }

    this._isAwake = true;

    this.needOpen = true;
  }

  /**
   * Puts this container to sleep. This will pause and close the active page (if one exists).
   * @throws Error if this container has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('MfdMainPageContainer: cannot sleep a dead container');
    }

    if (!this._isAwake) {
      return;
    }

    this.pause();

    this._isAwake = false;

    const activePageEntry = this._activePageEntry.get();
    if (activePageEntry) {
      this.closePage(activePageEntry);
    }
  }

  /**
   * Resumes this container. This will resume the active page (if one exists). Has no effect if this container is
   * asleep.
   * @throws Error if this container has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('MfdMainPageContainer: cannot resume a dead container');
    }

    if (!this._isAwake || this._isResumed) {
      return;
    }

    this._isResumed = true;

    if (!this.needOpen) {
      const activePageEntry = this._activePageEntry.get();
      if (activePageEntry) {
        this.resumePage(activePageEntry);
      }
    }
  }

  /**
   * Pauses this container. This will pause the active page (if one exists). Has no effect if this container is asleep.
   * @throws Error if this container has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('MfdMainPageContainer: cannot pause a dead container');
    }

    if (!this._isAwake || !this._isResumed) {
      return;
    }

    this._isResumed = false;

    const activePageEntry = this._activePageEntry.get();
    if (activePageEntry) {
      this.pausePage(activePageEntry);
    }
  }

  /**
   * Sets the size of this container.
   * @param sizeMode The new size mode.
   * @param dimensions The new dimensions, as `[width, height]` in pixels.
   * @throws Error if this container has been destroyed.
   */
  public setSize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    if (!this.isAlive) {
      throw new Error('MfdPageContainer: cannot set the size of a dead container');
    }

    if (sizeMode === this.sizeMode && Vec2Math.equals(dimensions, this.dimensions)) {
      return;
    }

    this.rootCssClass.toggle('mfd-page-container-full', sizeMode === MfdPageSizeMode.Full);
    this.rootCssClass.toggle('mfd-page-container-half', sizeMode === MfdPageSizeMode.Half);

    this.sizeMode = sizeMode;
    this.dimensions.set(dimensions);

    if (this._isAwake) {
      this._activePageEntry.get()?.page.onResize(this.sizeMode, this.dimensions);
    }
  }

  /**
   * Sets the type of occlusion applied to this container's parent UI view.
   * @param occlusionType The type of occlusion to set.
   * @throws Error if this container has been destroyed.
   */
  public setOcclusion(occlusionType: UiViewOcclusionType): void {
    if (!this.isAlive) {
      throw new Error('MfdMainPageContainer: cannot set the occlusion of a dead container');
    }

    if (this._isAwake) {
      this._activePageEntry.get()?.page.onOcclusionChange(occlusionType);
    }
  }

  /**
   * Updates this container.
   * @param time The current real (operating system) time, as a Javascript timestamp in milliseconds.
   * @throws Error if this container has been destroyed.
   */
  public update(time: number): void {
    if (!this.isAlive) {
      throw new Error('MfdMainPageContainer: cannot update a dead container');
    }

    if (!this._isAwake) {
      return;
    }

    if (this.selectedPageUpdateTime !== undefined) {
      // An update caused by changing the selected page has been pended.

      let shouldOpenPage: boolean;

      if (this.needOpen) {
        // This is the first update since the container was last awakened. Therefore we need to check if the currently
        // selected page is different from the staged and active pages. If so, then we need to hide and unstage the old
        // page (there is no need to close the old page because it is already closed from when the container was put to
        // sleep) and stage the selected page.

        this.needOpen = false;
        shouldOpenPage = true;

        const oldStagedPageEntry = this._stagedPageEntry.get();
        const oldActivePageEntry = this._activePageEntry.get();

        const pageEntry = this.pageEntryMap.get(this.props.selectedPageKey.get()) ?? null;

        if (oldActivePageEntry !== pageEntry) {
          this._activePageEntry.set(null);
          oldActivePageEntry?.isVisible.set(false);
        }

        if (oldStagedPageEntry !== pageEntry) {
          if (oldStagedPageEntry) {
            this._stagedPageEntry.set(null);
            this.unstagePage(oldStagedPageEntry);
          }

          this._stagedPageEntry.set(pageEntry);
          this.stagePage(pageEntry);
        }
      } else {
        // This is not the first update since the container was last awakened. Therefore the currently selected page is
        // already staged and we should open it if and only if the requisite delay has elapsed since the selected
        // page was last changed.

        if (time < this.selectedPageUpdateTime) {
          this.selectedPageUpdateTime = time;
        }
        shouldOpenPage = time - this.selectedPageUpdateTime >= MfdPageContainer.SELECTED_PAGE_DELAY;
      }

      if (shouldOpenPage) {
        this.selectedPageUpdateTime = undefined;

        const pageEntry = this.pageEntryMap.get(this.props.selectedPageKey.get());
        if (pageEntry) {
          this._activePageEntry.set(pageEntry);
          pageEntry.isVisible.set(true);
          this.openPage(pageEntry);

          if (this._isResumed) {
            this.resumePage(pageEntry);
          }
        } else {
          this._activePageEntry.set(null);
        }
      }
    } else if (this.needOpen) {
      // This is the first update since the container was last awakened. Therefore we need to check if there is an
      // active page and if so, open the page.

      this.needOpen = false;
      const activePageEntry = this._activePageEntry.get();
      if (activePageEntry) {
        this.openPage(activePageEntry);

        if (this._isResumed) {
          this.resumePage(activePageEntry);
        }
      }
    }

    this._activePageEntry.get()?.page.onUpdate(time);
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (!this._isAwake) {
      return false;
    }

    return this._activePageEntry.get()?.page.onUiInteractionEvent(event) ?? false;
  }

  /**
   * Responds to when the selected MFD page key changes.
   * @param key The new selected MFD page key.
   */
  private onSelectedPageKeyChanged(key: string): void {
    // If this container is awake, then we will hide, close and unstage the current active page, stage the selected
    // page, and pend an update to open the new selected page after the requisite delay has passed. The delay is
    // implemented in order to prevent scrolling through the selected pages from triggering a series of unnecessary
    // and potentially performance-intensive close/open callbacks on multiple pages.

    // If this container is not awake, then we will pend an update the next time this container is awakened to change
    // the staged and active pages, if necessary.

    this.selectedPageUpdateTime = Date.now();

    // Render the page if it hasn't already been rendered.
    if (!this.pageEntryMap.has(key)) {
      this.pageEntryMap.set(key, this.renderPage(key));
    }

    if (this._isAwake) {
      const activePageEntry = this._activePageEntry.get();
      if (activePageEntry) {
        this._activePageEntry.set(null);
        activePageEntry.isVisible.set(false);

        if (this._isResumed) {
          this.pausePage(activePageEntry);
        }

        this.closePage(activePageEntry);
      }

      const stagedPageEntry = this._stagedPageEntry.get();
      if (stagedPageEntry) {
        this.unstagePage(stagedPageEntry);
      }

      const pageEntry = this.pageEntryMap.get(key) ?? null;
      this._stagedPageEntry.set(pageEntry);
      this.stagePage(pageEntry);
    }
  }

  /**
   * Renders a page.
   * @param key The key of the page to render.
   * @returns An entry for the rendered view.
   */
  private renderPage(key: string): PageEntry {
    const node = this.registeredPageDefs.get(key)?.factory?.(this.props.uiService, this.props.containerRef)
      ?? (<EmptyMfdPage uiService={this.props.uiService} containerRef={this.props.containerRef} />);

    const isVisible = Subject.create<boolean>(false);

    FSComponent.render(
      <MfdPageWrapper isVisible={isVisible}>{node}</MfdPageWrapper>,
      this.rootRef.instance,
    );

    const page = node.instance as MfdPage;

    return {
      key: key,
      page,
      isVisible,
      titleSubscription: page.title.pipe(this.selectedPageTitle, true),
      iconSrcSubscription: page.iconSrc.pipe(this.selectedPageIconSrc, true)
    };
  }

  /**
   * Stages a page.
   * @param entry The entry for the page to stage.
   */
  private stagePage(entry: PageEntry | null): void {
    if (entry) {
      entry.titleSubscription.resume(true);
      entry.iconSrcSubscription.resume(true);
      entry.page.onStage();
    } else {
      this.selectedPageTitle.set('');
      this.selectedPageIconSrc.set('');
    }
  }

  /**
   * Unstages a page.
   * @param entry The entry for the page to unstage.
   */
  private unstagePage(entry: PageEntry): void {
    entry.titleSubscription.pause();
    entry.iconSrcSubscription.pause();
    entry.page.onUnstage();
  }

  /**
   * Opens a page.
   * @param entry The entry for the page to open.
   */
  private openPage(entry: PageEntry): void {
    entry.page.onOpen(this.sizeMode, this.dimensions);
  }

  /**
   * Closes a page.
   * @param entry The entry for the page to close.
   */
  private closePage(entry: PageEntry): void {
    entry.page.onClose();
  }

  /**
   * Resumes a page.
   * @param entry The entry for the page to resume.
   */
  private resumePage(entry: PageEntry): void {
    entry.page.onResume();
  }

  /**
   * Pauses a page.
   * @param entry The entry for the page to pause.
   */
  private pausePage(entry: PageEntry): void {
    entry.page.onPause();
  }

  /** @inheritDoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, MfdPageContainer.RESERVED_CSS_CLASSES);
    } else if (this.props.class !== undefined) {
      for (const cssClass of FSComponent.parseCssClassesFromString(this.props.class).filter(val => !MfdPageContainer.RESERVED_CSS_CLASSES.includes(val))) {
        this.rootCssClass.add(cssClass);
      }
    }

    return (
      <div ref={this.rootRef} class={this.rootCssClass} >
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    if (Array.isArray(this.cssClassSub)) {
      for (const sub of this.cssClassSub) {
        sub.destroy();
      }
    } else {
      this.cssClassSub?.destroy();
    }

    this.selectedPageSub?.destroy();
    this.selectedPageTitlePipe?.destroy();
    this.selectedPageIconSrcPipe?.destroy();

    for (const entry of this.pageEntryMap.values()) {
      entry.page.destroy();
    }

    super.destroy();
  }
}

/**
 * An empty page which renders nothing.
 */
class EmptyMfdPage extends AbstractMfdPage {
  /** @inheritDoc */
  public render(): null {
    return null;
  }
}

/**
 * Component props for {@link MfdPageWrapper}.
 */
interface MfdPageWrapperProps extends ComponentProps {
  /** Whether the wrapper is visible. */
  isVisible: Subscribable<boolean>;
}

/**
 * A wrapper for an MFD page.
 */
class MfdPageWrapper extends DisplayComponent<MfdPageWrapperProps> {
  private readonly hidden = this.props.isVisible.map(SubscribableMapFunctions.not());

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'hidden': this.hidden }} style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>
        {this.props.children}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.hidden.destroy();

    super.destroy();
  }
}