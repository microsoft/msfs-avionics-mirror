import {
  ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, ReadonlyFloat64Array, SetSubject, Subject,
  Subscribable, SubscribableMapFunctions, SubscribableSet, Subscription, ToggleableClassNameRecord, UserSettingManager, VNode, Vec2Math
} from '@microsoft/msfs-sdk';

import { PfdInsetUserSettingTypes } from '../../../../Shared/Settings/PfdUserSettings';
import { UiService } from '../../../../Shared/UiSystem/UiService';
import { AbstractPfdInset } from './AbstractPfdInset';
import { PfdInset } from './PfdInset';
import { PfdInsetDefinition } from './PfdInsetDefinition';
import { PfdInsetEntry, PfdInsetSizeMode } from './PfdInsetTypes';

import './PfdInsetContainer.css';

/**
 * Component props for PfdInsetContainer.
 */
export interface PfdInsetContainerProps extends ComponentProps {
  /** The side to which the container belongs. */
  side: 'left' | 'right';

  /** An iterable of registered PFD inset definitions. */
  registeredInsetDefs: Iterable<Readonly<PfdInsetDefinition>>;

  /** The UI service instance. */
  uiService: UiService;

  /** A manager for PFD inset user settings. */
  pfdInsetSettingManager: UserSettingManager<PfdInsetUserSettingTypes>;

  /** CSS class(es) to apply to the root element of the container. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An entry describing a rendered PFD inset.
 */
type InsetEntry<T extends PfdInset = PfdInset> = {
  /** The key of the inset. */
  key: string;

  /** A reference to the inset. */
  inset: T;

  /** Whether the inset is visible. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A container for PFD insets.
 */
export class PfdInsetContainer extends DisplayComponent<PfdInsetContainerProps> {
  private static readonly RESERVED_CSS_CLASSES = [
    'pfd-inset-container',
    'pfd-inset-container-left',
    'pfd-inset-container-right',
    'pfd-inset-container-full',
    'pfd-inset-container-narrow-eis',
    'pfd-inset-container-wide-eis',
    'hidden'
  ];

  private static readonly DIMENSIONS: Record<PfdInsetSizeMode, ReadonlyFloat64Array> = {
    [PfdInsetSizeMode.Full]: Vec2Math.create(350, 270),
    [PfdInsetSizeMode.NarrowEis]: Vec2Math.create(294, 270),
    [PfdInsetSizeMode.WideEis]: Vec2Math.create(274, 270),
  };

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rootCssClass = SetSubject.create(['pfd-inset-container', `pfd-inset-container-${this.props.side}`, 'pfd-inset-container-full']);

  private readonly registeredInsetDefs = new Map<string, Readonly<PfdInsetDefinition>>();
  private readonly insetEntryMap = new Map<string, InsetEntry>();

  private readonly _activeInsetEntry = Subject.create<InsetEntry | null>(null);
  /** This container's current active inset, or `null` if there is no active inset. */
  public readonly activeInsetEntry = this._activeInsetEntry as Subscribable<PfdInsetEntry | null>;

  private sizeMode = PfdInsetSizeMode.Full;
  private dimensions = PfdInsetContainer.DIMENSIONS[PfdInsetSizeMode.Full];

  private isAlive = true;
  private _isAwake = false;

  private needOpen = false;

  private cssClassSub?: Subscription | Subscription[];
  private selectedInsetSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    for (const def of this.props.registeredInsetDefs) {
      this.registeredInsetDefs.set(def.key, def);
    }

    this.selectedInsetSub = this.props.pfdInsetSettingManager.getSetting(`pfdInset${this.props.side === 'left' ? 'Left' : 'Right'}Key`)
      .sub(this.onSelectedInsetKeyChanged.bind(this), true);
  }

  /**
   * Checks whether this container is awake.
   * @returns Whether this container is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /**
   * Wakes this container. This will open the active inset (if one exists).
   * @throws Error if this container has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('PfdInsetContainer: cannot wake a dead container');
    }

    if (this._isAwake) {
      return;
    }

    this._isAwake = true;

    this.needOpen = true;
  }

  /**
   * Puts this container to sleep. This will close the active inset (if one exists).
   * @throws Error if this container has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('PfdInsetContainer: cannot sleep a dead container');
    }

    if (!this._isAwake) {
      return;
    }

    this._isAwake = false;

    const activeInsetEntry = this._activeInsetEntry.get();
    if (activeInsetEntry) {
      this.closeInset(activeInsetEntry);
    }

    this.updateVisibility();
  }

  /**
   * Sets the size of this container.
   * @param sizeMode The new size mode.
   * @throws Error if this container has been destroyed.
   */
  public setSize(sizeMode: PfdInsetSizeMode): void {
    if (!this.isAlive) {
      throw new Error('PfdInsetContainer: cannot set the size of a dead container');
    }

    if (sizeMode === this.sizeMode) {
      return;
    }

    this.rootCssClass.toggle('pfd-inset-container-full', sizeMode === PfdInsetSizeMode.Full);
    this.rootCssClass.toggle('pfd-inset-container-narrow-eis', sizeMode === PfdInsetSizeMode.NarrowEis);
    this.rootCssClass.toggle('pfd-inset-container-wide-eis', sizeMode === PfdInsetSizeMode.WideEis);

    this.sizeMode = sizeMode;
    this.dimensions = PfdInsetContainer.DIMENSIONS[sizeMode];

    if (this._isAwake) {
      this._activeInsetEntry.get()?.inset.onResize(this.sizeMode, this.dimensions);
    }
  }

  /**
   * Updates this container.
   * @param time The current real (operating system) time, as a Javascript timestamp in milliseconds.
   * @throws Error if this container has been destroyed.
   */
  public update(time: number): void {
    if (!this.isAlive) {
      throw new Error('PfdInsetContainer: cannot update a dead container');
    }

    if (!this._isAwake) {
      return;
    }

    if (this.needOpen) {
      // This is the first update since the container was last awakened. Therefore we need to check if there is an
      // active inset and if so, open the inset.

      this.needOpen = false;

      this.updateVisibility();

      const activeInsetEntry = this._activeInsetEntry.get();
      if (activeInsetEntry) {
        this.openInset(activeInsetEntry);
      }
    }

    this._activeInsetEntry.get()?.inset.onUpdate(time);
  }

  /**
   * Responds to when the selected PFD inset key changes.
   * @param key The new selected PFD inset key.
   */
  private onSelectedInsetKeyChanged(key: string): void {
    // Render the inset if it hasn't already been rendered.
    if (key !== '' && !this.insetEntryMap.has(key)) {
      this.insetEntryMap.set(key, this.renderInset(key));
    }

    const activeInsetEntry = this._activeInsetEntry.get();
    if (activeInsetEntry) {
      activeInsetEntry.isVisible.set(false);

      if (this._isAwake) {
        this.closeInset(activeInsetEntry);
      }
    }

    if (key === '') {
      this._activeInsetEntry.set(null);
    } else {
      const insetEntry = this.insetEntryMap.get(key) ?? null;
      this._activeInsetEntry.set(insetEntry);

      if (insetEntry) {
        insetEntry.isVisible.set(true);

        if (this._isAwake) {
          this.openInset(insetEntry);
        }
      }
    }

    this.updateVisibility();
  }

  /**
   * Updates this container's visibility.
   */
  private updateVisibility(): void {
    const isVisible = this._isAwake && this._activeInsetEntry.get() !== null;
    this.rootCssClass.toggle('hidden', !isVisible);
  }

  /**
   * Renders an inset.
   * @param key The key of the inset to render.
   * @returns An entry for the rendered inset.
   */
  private renderInset(key: string): InsetEntry {
    const node = this.registeredInsetDefs.get(key)?.factory?.(this.props.side, this.props.uiService)
      ?? (<EmptyPfdInset side={this.props.side} uiService={this.props.uiService} />);

    const isVisible = Subject.create<boolean>(false);

    FSComponent.render(
      <PfdInsetWrapper isVisible={isVisible}>{node}</PfdInsetWrapper>,
      this.rootRef.instance,
    );

    const inset = node.instance as PfdInset;

    return {
      key: key,
      inset,
      isVisible
    };
  }

  /**
   * Opens an inset.
   * @param entry The entry for the inset to open.
   */
  private openInset(entry: InsetEntry): void {
    entry.inset.onOpen(this.sizeMode, this.dimensions);
  }

  /**
   * Closes an inset.
   * @param entry The entry for the inset to close.
   */
  private closeInset(entry: InsetEntry): void {
    entry.inset.onClose();
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, PfdInsetContainer.RESERVED_CSS_CLASSES);
    } else if (this.props.class !== undefined) {
      for (const cssClass of FSComponent.parseCssClassesFromString(this.props.class).filter(val => !PfdInsetContainer.RESERVED_CSS_CLASSES.includes(val))) {
        this.rootCssClass.add(cssClass);
      }
    }

    return (
      <div ref={this.rootRef} class={this.rootCssClass} >
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    if (Array.isArray(this.cssClassSub)) {
      for (const sub of this.cssClassSub) {
        sub.destroy();
      }
    } else {
      this.cssClassSub?.destroy();
    }

    this.selectedInsetSub?.destroy();

    for (const entry of this.insetEntryMap.values()) {
      entry.inset.destroy();
    }

    super.destroy();
  }
}

/**
 * An empty PFD inset which renders nothing.
 */
class EmptyPfdInset extends AbstractPfdInset {
  /** @inheritdoc */
  public render(): null {
    return null;
  }
}

/**
 * Component props for PfdInsetWrapper.
 */
interface PfdInsetWrapperProps extends ComponentProps {
  /** Whether the wrapper is visible. */
  isVisible: Subscribable<boolean>;
}

/**
 * A wrapper for a PFD inset.
 */
class PfdInsetWrapper extends DisplayComponent<PfdInsetWrapperProps> {
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