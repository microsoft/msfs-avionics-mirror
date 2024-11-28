/* eslint-disable no-inner-declarations */
import { ObjectSubject } from '../sub/ObjectSubject';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { MutableSubscribableMap, SubscribableMap, SubscribableMapEventType } from '../sub/SubscribableMap';
import { MutableSubscribableSet, SubscribableSet, SubscribableSetEventType } from '../sub/SubscribableSet';
import { Subscription } from '../sub/Subscription';

/**
 * An interface that describes a virtual DOM node.
 */
export interface VNode {
  /** The created instance of the node. */
  instance: NodeInstance;

  /**
   * The root DOM node of this VNode
   * @type {Node}
   * @memberof VNode
   */
  root?: Node;

  /** Any properties to apply to the node. */
  props: any;

  /** The children of this node. */
  children: VNode[] | null;
}

/** A union of possible types of a VNode instance. */
export type NodeInstance = HTMLElement | SVGElement | DisplayComponent<any> | string | number | null | Subscribable<any>;

/** A union of possible child element types. */
type DisplayChildren = VNode | string | number | Subscribable<any> | (VNode | string | number | Subscribable<any>)[] | null;

/** A releative render position. */
export enum RenderPosition {
  Before,
  After,
  In
}

/** Mapped length undefined tuple to a tuple of Contexts. */
export type ContextTypes<T extends unknown[]> = {
  [Index in keyof T]: Context<T[Index]>
}

/** Mapped length undefined tuple to a tuple of context subscriptions. */
export type ContextSubcriptions<T extends unknown[]> = {
  [Index in keyof T]: Subscribable<T[Index]>
}

/**
 * A display component in the component framework.
 * @typedef P The type of properties for this component.
 * @typedef C The type of context that this component might have.
 */
export abstract class DisplayComponent<P, Contexts extends unknown[] = []> {

  /** The properties of the component. */
  public props: P & ComponentProps;

  /** The context on this component, if any. */
  public context?: [...ContextSubcriptions<Contexts>] = undefined;

  /** The type of context for this component, if any. */
  public readonly contextType?: readonly [...ContextTypes<Contexts>] = undefined;

  /**
   * Creates an instance of a DisplayComponent.
   * @param props The propertis of the component.
   */
  constructor(props: P) {
    this.props = props as P & ComponentProps;
  }

  /**
   * A callback that is called before the component is rendered.
   */
  public onBeforeRender(): void { return; }

  /**
   * A callback that is called after the component is rendered.
   * @param node The component's VNode.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void { return; }

  /**
   * Renders the component.
   * @returns A JSX element to be rendered.
   */
  public abstract render(): VNode | null;

  /**
   * Destroys this component.
   */
  public destroy(): void { return; }

  /**
   * Gets a context data subscription from the context collection.
   * @param context The context to get the subscription for.
   * @returns The requested context.
   * @throws An error if no data for the specified context type could be found.
   */
  protected getContext(context: ContextTypes<Contexts>[number]): ContextSubcriptions<Contexts>[number] {
    if (this.context !== undefined && this.contextType !== undefined) {
      const index = this.contextType.indexOf(context);
      return this.context[index];
    }

    throw new Error('Could not find the provided context type.');
  }
}

/**
 * Base properties for display components.
 */
export class ComponentProps {

  /** The children of the display component. */
  public children?: DisplayChildren[];

  /** A reference to the display component. */
  public ref?: NodeReference<any>;
}

/**
 * A constructor signature for a DisplayComponent.
 */
export type DisplayComponentFactory<P extends ComponentProps, Contexts extends Context<unknown>[] = []> = new (props: P) => DisplayComponent<P, Contexts>;

/**
 * A type for the Fragment function.
 */
export type FragmentFactory = (props: ComponentProps) => DisplayChildren[] | undefined;

/**
 * A reference to a component or element node.
 */
export class NodeReference<T extends (DisplayComponent<any> | HTMLElement | SVGElement)> {

  /** The internal reference instance. */
  private _instance: T | null = null;

  /**
   * The instance of the element or component.
   * @returns The instance of the element or component.
   */
  public get instance(): T {
    if (this._instance !== null) {
      return this._instance;
    }

    throw new Error('Instance was null.');
  }

  /**
   * Sets the value of the instance.
   */
  public set instance(val: T) {
    this._instance = val;
  }

  /**
   * Gets the instance, or null if the instance is not populated.
   * @returns The component or element instance.
   */
  public getOrDefault(): T | null {
    return this._instance;
  }
}

/**
 * Provides a context of data that can be passed down to child components via a provider.
 */
export class Context<T> {
  /**
   * The provider component that can be set to a specific context value.
   * @param props The props of the provider component.
   * @returns A new context provider.
   */
  public readonly Provider = (props: ContextProviderProps<T>): ContextProvider<T> => new ContextProvider<T>(props, this);

  /**
   * Creates an instance of a Context.
   * @param defaultValue The default value of this context.
   */
  constructor(public readonly defaultValue: T) { }
}

/**
 * Props on the ContextProvider component.
 */
interface ContextProviderProps<T> extends ComponentProps {

  /** The value of the context underneath this provider. */
  value: T;
}

/**
 * A provider component that can be set to a specific context value.
 */
class ContextProvider<T> extends DisplayComponent<ContextProviderProps<T>> {

  /**
   * Creates an instance of a ContextProvider.
   * @param props The props on the component.
   * @param parent The parent context instance for this provider.
   */
  constructor(props: ContextProviderProps<T>, public readonly parent: Context<T>) {
    super(props);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    const children = this.props.children ?? [];
    return FSComponent.buildComponent(FSComponent.Fragment, this.props, ...children);
  }
}

/**
 * A record of class names which can be bound to an HTML element's `class` attribute through JSX. Each of the record's
 * keys defines a class name, and the key's value is a boolean or boolean-valued `Subscribable` that determines whether
 * the class name appears in the element's class list.
 */
export interface ToggleableClassNameRecord {
  [className: string]: boolean | Subscribable<boolean>;
}

/**
 * A record of styles which can be bound an HTML element's `style` attribute through JSX. Each of the record's keys
 * defines a style name, and the key's value is a string or `undefined` or a similarly valued `Subscribable` that
 * determines the value of the style. If a style's value is `undefined`, then that style will not appear in the
 * element's `style` attribute (equivalent to setting the style value to the empty string).
 */
export interface StyleRecord {
  [styleName: string]: string | Subscribable<string | undefined> | undefined;
}

/**
 * The FS component namespace.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FSComponent {

  /**
   * Definitions for JSX transpilation.
   */
  // eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
  export namespace JSX {
    /**
     * The intrinsic DOM elements that can be defined.
     */
    export interface IntrinsicElements {
      [elemName: string]: {
        [attrName: string]: any | Subscribable<any>;

        /**
         * The {@link NodeReference} passed to this prop will have its `instance` field updated
         * with a reference to the rendered DOM element once rendered.
         */
        ref?: NodeReference<any>;

        /**
         * When a {@link SubscribableMap} is used, then the `style` attribute will be bound to the map such that when
         * a key-value pair is added to or removed from the map, it will also be added or removed from the element's
         * style list (the key is used as the style name and the value is used as the style value).
         *
         * When an {@link ObjectSubject} is used, then the `style` attribute will be bound to the subject such that
         * each property in the subject's object value will be added to the element's style list (the property name is
         * used as the style name and the property value is used as the style value) and any changes in the values of
         * the property will be reflected in the style list as well.
         *
         * When a {@link StyleRecord} is used, each record property will be added to the element's style list (the
         * property name is used as the style name and the property value is used as the style value). Additionally, if
         * the property value is a {@link Subscribable}, then the value of the corresponding style will be bound to the
         * subscribable's value.
         */
        style?: string | Subscribable<string> | SubscribableMap<string, string> | ObjectSubject<any> | StyleRecord;

        /**
         * When a {@link SubscribableSet<string>} (such as `SetSubject`) is used,
         * the {@link SubscribableSet} will be bound to the `class` attribute,
         * such that when a string is added or removed from the set,
         * it will be added or removed from the element's classList.
         *
         * When a {@link ToggleableClassNameRecord} is used,
         * fields with `true` will be added to the classList,
         * fields with `false` will not be added,
         * and fields with a {@link Subscribable<boolean>} will be subscribed to,
         * such that when the value changes, it will be added or removed from the classList.
         */
        class?: string | Subscribable<string> | SubscribableSet<string> | ToggleableClassNameRecord;
      };
    }
  }

  /**
   * Valid SVG element tags.
   */
  const svgTags = {
    'circle': true,
    'clipPath': true,
    'color-profile': true,
    'cursor': true,
    'defs': true,
    'desc': true,
    'ellipse': true,
    'g': true,
    'image': true,
    'line': true,
    'linearGradient': true,
    'marker': true,
    'mask': true,
    'path': true,
    'pattern': true,
    'polygon': true,
    'polyline': true,
    'radialGradient': true,
    'rect': true,
    'stop': true,
    'svg': true,
    'text': true,
    'tspan': true,
  };

  /**
   * A fragment of existing elements with no specific root.
   * @param props The fragment properties.
   * @returns The fragment children.
   */
  export function Fragment(props: ComponentProps): DisplayChildren[] | undefined {
    return props.children;
  }

  /**
   * Builds a JSX based FSComponent.
   * @param type The DOM element tag that will be built.
   * @param props The properties to apply to the DOM element.
   * @param children Any children of this DOM element.
   * @returns The JSX VNode for the component or element.
   */
  // eslint-disable-next-line no-inner-declarations
  export function buildComponent<T extends DisplayComponentFactory<P>
    | keyof HTMLElementTagNameMap
    | keyof SVGElementTagNameMap
    | FragmentFactory, P extends ComponentProps>(
      type: T,
      props: P | null,
      ...children: DisplayChildren[]): VNode | null {
    let vnode: VNode | null = null;

    if (typeof type === 'string') {

      let element: HTMLElement | SVGElement;
      if ((svgTags as any)[type] !== undefined) {
        element = document.createElementNS('http://www.w3.org/2000/svg', type as keyof SVGElementTagNameMap);
      } else {
        element = document.createElement(type as keyof HTMLElementTagNameMap);
      }

      if (props !== null) {
        for (const key in props) {
          if (key === 'ref' && props.ref !== undefined) {
            props.ref.instance = element;
          } else {
            const prop = (props as any)[key];
            if (key === 'class' && typeof prop === 'object' && 'isSubscribableSet' in prop) {
              // Bind CSS classes to a subscribable set
              (prop as SubscribableSet<string>).sub((set, eventType, modifiedKey) => {
                if (eventType === SubscribableSetEventType.Added) {
                  element.classList.add(modifiedKey);
                } else {
                  element.classList.remove(modifiedKey);
                }
              }, true);
            } else if (key === 'style' && typeof prop === 'object' && 'isSubscribableMap' in prop) {
              // Bind CSS styles to a subscribable map.
              (prop as SubscribableMap<string, string>).sub((map, eventType, modifiedKey, modifiedValue) => {
                switch (eventType) {
                  case SubscribableMapEventType.Added:
                  case SubscribableMapEventType.Changed:
                    element.style.setProperty(modifiedKey, modifiedValue);
                    break;
                  case SubscribableMapEventType.Deleted:
                    element.style.setProperty(modifiedKey, null);
                    break;
                }
              }, true);
            } else if (typeof prop === 'object' && 'isSubscribable' in prop) {
              if (key === 'style' && prop instanceof ObjectSubject) {
                // Bind CSS styles to an object subject.
                prop.sub((v: any, style: string | number | symbol, newValue: any) => {
                  element.style.setProperty(style.toString(), newValue);
                }, true);
              } else {
                // Bind an attribute to a subscribable.

                const ns = getNamespaceToSetAttributeWith(key);

                if (ns !== null) {
                  prop.sub((v: any) => {
                    element.setAttributeNS(ns, key, v);
                  }, true);
                } else {
                  prop.sub((v: any) => {
                    element.setAttribute(key, v);
                  }, true);
                }
              }
            } else if (key === 'class' && typeof prop === 'object') {
              // Bind CSS classes to an object of key value pairs where the values can be boolean | Subscribable<boolean>
              for (const className in prop) {
                if (className.trim().length === 0) {
                  continue;
                }
                const value = prop[className];
                if (typeof value === 'object' && 'isSubscribable' in value) {
                  value.sub((showClass: boolean) => {
                    element.classList.toggle(className, !!showClass);
                  }, true);
                } else {
                  element.classList.toggle(className, !!value);
                }
              }
            } else if (key === 'style' && typeof prop === 'object') {
              // Bind styles to an object of key value pairs
              for (const style in prop) {
                if (style.trim().length === 0) {
                  continue;
                }
                const value = prop[style] as StyleRecord[string];
                if (typeof value === 'object' && 'isSubscribable' in value) {
                  value.sub(newValue => {
                    element.style.setProperty(style, newValue ?? '');
                  }, true);
                } else {
                  element.style.setProperty(style, value ?? '');
                }
              }
            } else {
              const ns = getNamespaceToSetAttributeWith(key);

              if (ns !== null) {
                element.setAttributeNS(ns, key, prop);
              } else {
                element.setAttribute(key, prop);
              }
            }
          }
        }
      }

      vnode = {
        instance: element,
        props: props,
        children: null
      };

      vnode.children = createChildNodes(vnode, children);
    } else if (typeof type === 'function') {
      if (children !== null && props === null) {
        props = {
          children: children
        } as P;
      } else if (props !== null) {
        props.children = children;
      }

      if (typeof type === 'function' && type.name === Fragment.name) {
        let fragmentChildren = (type as FragmentFactory)(props as any);

        //Handle the case where the single fragment children is an array of nodes passsed down from above
        while (fragmentChildren && fragmentChildren.length === 1 && Array.isArray(fragmentChildren[0])) {
          fragmentChildren = fragmentChildren[0];
        }

        vnode = {
          instance: null,
          props,
          children: null
        };

        if (fragmentChildren) {
          vnode.children = createChildNodes(vnode, fragmentChildren);
        }
      } else {
        let instance: DisplayComponent<P>;
        const pluginSystem = ((window as any)._pluginSystem) as PluginSystem<any, any> | undefined;

        try {
          instance = (type as any)(props as any);
        } catch {
          let pluginInstance: DisplayComponent<P> | undefined = undefined;
          if (pluginSystem !== undefined) {
            pluginInstance = pluginSystem.onComponentCreating(type as DisplayComponentFactory<P>, props);
          }

          if (pluginInstance !== undefined) {
            instance = pluginInstance;
          } else {
            instance = new (type as DisplayComponentFactory<P>)(props as any);
          }

        }

        if (props !== null && props.ref !== null && props.ref !== undefined) {
          props.ref.instance = instance;
        }

        if (instance.contextType !== undefined) {
          instance.context = (instance.contextType as readonly any[]).map(c => Subject.create<any>(c.defaultValue)) as any;
        }

        if (pluginSystem !== undefined) {
          pluginSystem.onComponentCreated(instance);
        }

        vnode = {
          instance,
          props,
          children: [instance.render() as VNode]
        };
      }
    }

    return vnode;
  }

  /**
   * Returns the namespace to use for setting an attribute, or null if none
   *
   * @param attribute the attribute to set
   *
   * @returns a string or null
   */
  function getNamespaceToSetAttributeWith(attribute: string): string | null {
    if (attribute.startsWith('xlink:')) {
      return 'http://www.w3.org/1999/xlink';
    }

    return null;
  }

  /**
   * Creates the collection of child VNodes.
   * @param parent The parent VNode.
   * @param children The JSX children to convert to nodes.
   * @returns A collection of child VNodes.
   */
  export function createChildNodes(parent: VNode, children: DisplayChildren[]): VNode[] | null {
    let vnodes: VNode[] | null = null;
    if (children !== null && children !== undefined && children.length > 0) {
      vnodes = [];

      for (const child of children) {
        if (child !== null) {
          if (child instanceof Array) {
            const arrayNodes = createChildNodes(parent, child);

            if (arrayNodes !== null) {
              vnodes.push(...arrayNodes);
            }
          } else if (typeof child === 'object') {
            if ('isSubscribable' in child) {
              const node: VNode = {
                instance: child,
                children: null,
                props: null,
                root: undefined,
              };
              child.sub((v) => {
                if (node.root !== undefined) {
                  // TODO workaround. gotta find a solution for the text node vanishing when text is empty
                  node.root.nodeValue = (v === '' || v === null || v === undefined)
                    ? ' '
                    : v.toString();
                } else {
                  // for debugging
                  // console.warn('Subject has no node!');
                }
              });
              vnodes.push(node);
            } else {
              vnodes.push(child);
            }
          } else if (typeof child === 'string' || typeof child === 'number') {
            vnodes.push(createStaticContentNode(child));
          }
        }
      }
    }

    return vnodes;
  }

  /**
   * Creates a static content VNode.
   * @param content The content to create a node for.
   * @returns A static content VNode.
   */
  export function createStaticContentNode(content: string | number): VNode {
    return {
      instance: content,
      children: null,
      props: null
    };
  }

  /**
   * Renders a VNode to a DOM element.
   * @param node The node to render.
   * @param element The DOM element to render to.
   * @param position The RenderPosition to put the item in.
   */
  export function render(node: VNode, element: HTMLElement | SVGElement | null, position = RenderPosition.In): void {
    if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
      if (element !== null) {
        insertNode(node, position, element);
      }
    } else if (node.children && node.children.length > 0 && element !== null) {
      const componentInstance = node.instance as DisplayComponent<any> | null;

      if (componentInstance !== null && componentInstance.onBeforeRender !== undefined) {
        componentInstance.onBeforeRender();
      }

      if (position === RenderPosition.After) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          if (node.children[i] === undefined || node.children[i] === null) {
            continue;
          }
          insertNode(node.children[i], position, element);
        }
      } else {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i] === undefined || node.children[i] === null) {
            continue;
          }
          insertNode(node.children[i], position, element);
        }
      }

      const instance = node.instance;
      if (instance instanceof ContextProvider) {
        visitNodes(node, (n: VNode): boolean => {
          if (n === undefined || n === null) {
            return false;
          }
          const nodeInstance = n.instance as DisplayComponent<any> | null;

          if (nodeInstance !== null && nodeInstance.contextType !== undefined) {
            const contextSlot = (nodeInstance.contextType as readonly any[]).indexOf(instance.parent);

            if (contextSlot >= 0) {
              if (nodeInstance.context === undefined) {
                nodeInstance.context = [];
              }

              (nodeInstance.context as Subject<any>[])[contextSlot].set(instance.props.value);
            }

            if (nodeInstance instanceof ContextProvider && nodeInstance !== instance && nodeInstance.parent === instance.parent) {
              return true;
            }
          }

          return false;
        });
      }

      if (componentInstance !== null && componentInstance.onAfterRender !== undefined) {
        const pluginSystem = ((window as any)._pluginSystem) as PluginSystem<any, any> | undefined;
        componentInstance.onAfterRender(node);

        if (pluginSystem !== undefined) {
          pluginSystem.onComponentRendered(node);
        }
      }
    }
  }

  /**
   * Inserts a node into the DOM.
   * @param node The node to insert.
   * @param position The position to insert the node in.
   * @param element The element to insert relative to.
   */
  function insertNode(node: VNode, position: RenderPosition, element: HTMLElement | SVGElement): void {
    if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
      switch (position) {
        case RenderPosition.In:
          element.appendChild(node.instance);
          node.root = element.lastChild ?? undefined;
          break;
        case RenderPosition.Before:
          element.insertAdjacentElement('beforebegin', node.instance);
          node.root = element.previousSibling ?? undefined;
          break;
        case RenderPosition.After:
          element.insertAdjacentElement('afterend', node.instance);
          node.root = element.nextSibling ?? undefined;
          break;
      }
      if (node.children !== null) {
        for (const child of node.children) {
          insertNode(child, RenderPosition.In, node.instance);
        }
      }
    } else if (
      typeof node.instance === 'string'
      || (
        typeof node.instance === 'object'
        && node.instance !== null &&
        'isSubscribable' in node.instance
      )
    ) {
      let toRender: string;

      if (typeof node.instance === 'string') {
        toRender = node.instance;
      } else {
        toRender = node.instance.get();

        if (toRender === '') {
          toRender = ' '; // prevent disappearing text node
        }
      }

      switch (position) {
        case RenderPosition.In:
          element.insertAdjacentHTML('beforeend', toRender);
          node.root = element.lastChild ?? undefined;
          break;
        case RenderPosition.Before:
          element.insertAdjacentHTML('beforebegin', toRender);
          node.root = element.previousSibling ?? undefined;
          break;
        case RenderPosition.After:
          element.insertAdjacentHTML('afterend', toRender);
          node.root = element.nextSibling ?? undefined;
          break;
      }
    } else if (Array.isArray(node)) {
      if (position === RenderPosition.After) {
        for (let i = node.length - 1; i >= 0; i--) {
          render(node[i], element, position);
        }
      } else {
        for (let i = 0; i < node.length; i++) {
          render(node[i], element, position);
        }
      }
    } else {
      render(node, element, position);
    }
  }

  /**
   * Render a node before a DOM element.
   * @param node The node to render.
   * @param element The element to render boeore.
   */
  export function renderBefore(node: VNode, element: HTMLElement | SVGElement | null): void {
    render(node, element, RenderPosition.Before);
  }

  /**
   * Render a node after a DOM element.
   * @param node The node to render.
   * @param element The element to render after.
   */
  export function renderAfter(node: VNode, element: HTMLElement | SVGElement | null): void {
    render(node, element, RenderPosition.After);
  }

  /**
   * Remove a previously rendered element.  Currently, this is just a simple
   * wrapper so that all of our high-level "component maniuplation" state is kept
   * in the FSComponent API, but it's not doing anything other than a simple
   * remove() on the element.   This can probably be enhanced.
   * @param element The element to remove.
   */
  export function remove(element: HTMLElement | SVGElement | null): void {
    if (element !== null) {
      element.remove();
    }
  }

  /**
   * Creates a component or element node reference.
   * @returns A new component or element node reference.
   */
  export function createRef<T extends (DisplayComponent<any, any> | HTMLElement | SVGElement)>(): NodeReference<T> {
    return new NodeReference<T>();
  }

  /**
   * Creates a new context to hold data for passing to child components.
   * @param defaultValue The default value of this context.
   * @returns A new context.
   */
  export function createContext<T>(defaultValue: T): Context<T> {
    return new Context<T>(defaultValue);
  }

  /**
   * Visits VNodes with a supplied visitor function within the given children tree.
   * @param node The node to visit.
   * @param visitor The visitor function to inspect VNodes with. Return true if the search should stop at the visited
   * node and not proceed any further down the node's children.
   */
  export function visitNodes(node: VNode, visitor: (node: VNode) => boolean): void {
    if (node === undefined || node === null) {
      return;
    }

    const stopVisitation = visitor(node);

    if (!stopVisitation && node.children !== undefined && node.children !== null) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (Array.isArray(child)) {
          for (let childIndex = 0; childIndex < child.length; childIndex++) {
            visitNodes(child[childIndex], visitor);
          }
        } else {
          visitNodes(child, visitor);
        }
      }
    }

    return;
  }

  /**
   * Parses a space-delimited CSS class string into an array of CSS classes.
   * @param classString A space-delimited CSS class string.
   * @param filter A function which filters parsed classes. For each class, the function should return `true` if the
   * class should be included in the output array and `false` otherwise.
   * @returns An array of CSS classes derived from the specified CSS class string.
   */
  export function parseCssClassesFromString(classString: string, filter?: (cssClass: string) => boolean): string[] {
    return classString.split(' ').filter(str => str !== '' && (filter === undefined || filter(str)));
  }

  /**
   * Binds a {@link MutableSubscribableSet} to a subscribable set of CSS classes. CSS classes added to and removed from
   * the subscribed set will also be added to and removed from the bound set, with the exception of a set of reserved
   * classes. The presence or absence of any of the reserved classes in the bound set is not affected by the subscribed
   * set.
   * @param setToBind The set to bind.
   * @param classesToSubscribe A set of CSS classes to which to subscribe.
   * @param reservedClasses An iterable of reserved classes.
   * @returns The newly created subscription to the subscribed CSS class set.
   */
  export function bindCssClassSet(
    setToBind: MutableSubscribableSet<string>,
    classesToSubscribe: SubscribableSet<string>,
    reservedClasses: Iterable<string>
  ): Subscription;
  /**
   * Binds a {@link MutableSubscribableSet} to a record of CSS classes. CSS classes toggled in the record will also be
   * added to and removed from the bound set, with the exception of a set of reserved classes. The presence or absence
   * of any of the reserved classes in the bound set is not affected by the subscribed record.
   * @param setToBind The set to bind.
   * @param classesToSubscribe A record of CSS classes to which to subscribe.
   * @param reservedClasses An iterable of reserved classes.
   * @returns The newly created subscriptions to the CSS class record.
   */
  export function bindCssClassSet(
    setToBind: MutableSubscribableSet<string>,
    classesToSubscribe: ToggleableClassNameRecord,
    reservedClasses: Iterable<string>
  ): Subscription[];
  /**
   * Binds a {@link MutableSubscribableSet} to a subscribable set or a record of CSS classes. CSS classes toggled in
   * subscribed set or record will also be added to and removed from the bound set, with the exception of a set of
   * reserved classes. The presence or absence of any of the reserved classes in the bound set is not affected by the
   * subscribed set or record.
   * @param setToBind The set to bind.
   * @param classesToSubscribe A set or record of CSS classes to which to subscribe.
   * @param reservedClasses An iterable of reserved classes.
   * @returns The newly created subscription to the CSS class set, or an array of new subscriptions to the CSS class
   * record.
   */
  export function bindCssClassSet(
    setToBind: MutableSubscribableSet<string>,
    classesToSubscribe: SubscribableSet<string> | ToggleableClassNameRecord,
    reservedClasses: Iterable<string>
  ): Subscription | Subscription[];
  // eslint-disable-next-line jsdoc/require-jsdoc
  export function bindCssClassSet(
    setToBind: MutableSubscribableSet<string>,
    classesToSubscribe: SubscribableSet<string> | ToggleableClassNameRecord,
    reservedClasses: Iterable<string>
  ): Subscription | Subscription[] {
    const reservedClassSet = new Set(reservedClasses);

    if (classesToSubscribe.isSubscribableSet === true) {
      return bindCssClassSetToSubscribableSet(setToBind, classesToSubscribe as SubscribableSet<string>, reservedClassSet);
    } else {
      return bindCssClassSetToRecord(setToBind, classesToSubscribe as ToggleableClassNameRecord, reservedClassSet);
    }
  }

  /**
   * Binds a {@link MutableSubscribableSet} to a subscribable set of CSS classes. CSS classes added to and removed from
   * the subscribed set will also be added to and removed from the bound set, with the exception of a set of reserved
   * classes. The presence or absence of any of the reserved classes in the bound set is not affected by the subscribed
   * set.
   * @param setToBind The set to bind.
   * @param classesToSubscribe A set of CSS classes to which to subscribe.
   * @param reservedClassSet A set of reserved classes.
   * @returns The newly created subscription to the subscribed CSS class set.
   */
  function bindCssClassSetToSubscribableSet(
    setToBind: MutableSubscribableSet<string>,
    classesToSubscribe: SubscribableSet<string>,
    reservedClassSet: Set<string>
  ): Subscription {
    if (reservedClassSet.size === 0) {
      return classesToSubscribe.sub((set, type, key) => {
        if (type === SubscribableSetEventType.Added) {
          setToBind.add(key);
        } else {
          setToBind.delete(key);
        }
      }, true);
    } else {
      return classesToSubscribe.sub((set, type, key) => {
        if (reservedClassSet.has(key)) {
          return;
        }

        if (type === SubscribableSetEventType.Added) {
          setToBind.add(key);
        } else {
          setToBind.delete(key);
        }
      }, true);
    }
  }

  /**
   * Binds a {@link MutableSubscribableSet} to a record of CSS classes. CSS classes toggled in the record will also be
   * added to and removed from the bound set, with the exception of a set of reserved classes. The presence or absence
   * of any of the reserved classes in the bound set is not affected by the subscribed record.
   * @param setToBind The set to bind.
   * @param classesToSubscribe A record of CSS classes to which to subscribe.
   * @param reservedClassSet A set of reserved classes.
   * @returns The newly created subscriptions to the CSS class record.
   */
  function bindCssClassSetToRecord(
    setToBind: MutableSubscribableSet<string>,
    classesToSubscribe: ToggleableClassNameRecord,
    reservedClassSet: Set<string>
  ): Subscription[] {
    const subs: Subscription[] = [];

    for (const cssClass in classesToSubscribe) {
      if (reservedClassSet.has(cssClass)) {
        continue;
      }

      const value = classesToSubscribe[cssClass];
      if (typeof value === 'object') {
        subs.push(value.sub(setToBind.toggle.bind(setToBind, cssClass), true));
      } else if (value === true) {
        setToBind.add(cssClass);
      } else {
        setToBind.delete(cssClass);
      }
    }

    return subs;
  }

  /**
   * Adds CSS classes to a {@link ToggleableClassNameRecord}.
   * @param record The CSS class record to which to add the new classes. The record will be mutated as classes are
   * added.
   * @param classesToAdd The CSS classes to add to the record, as a space-delimited class string, an iterable of
   * individual class names, or a {@link ToggleableClassNameRecord}.
   * @param allowOverwrite Whether to allow the new classes to overwrite existing entries in the CSS class record.
   * Defaults to `true`.
   * @param filter A function which filters the classes to add. For each class, the function should return `true` if
   * the class should be included in the record and `false` otherwise.
   * @returns The mutated CSS class record, after the new classes have been added.
   */
  export function addCssClassesToRecord(
    record: ToggleableClassNameRecord,
    classesToAdd: string | Iterable<string> | ToggleableClassNameRecord,
    allowOverwrite = true,
    filter?: (cssClass: string) => boolean
  ): ToggleableClassNameRecord {
    if (classesToAdd === '') {
      return record;
    }

    if (typeof classesToAdd === 'string') {
      classesToAdd = FSComponent.parseCssClassesFromString(classesToAdd, filter);
      filter = undefined;
    }

    if (typeof (classesToAdd as any)[Symbol.iterator] === 'function') {
      for (const cssClass of classesToAdd as Iterable<string>) {
        if ((allowOverwrite || record[cssClass] === undefined) && (!filter || filter(cssClass))) {
          record[cssClass] = true;
        }
      }
    } else {
      for (const cssClass in classesToAdd as ToggleableClassNameRecord) {
        if ((allowOverwrite || record[cssClass] === undefined) && (!filter || filter(cssClass))) {
          record[cssClass] = (classesToAdd as ToggleableClassNameRecord)[cssClass];
        }
      }
    }

    return record;
  }

  /**
   * Binds a {@link MutableSubscribableMap} to a subscribable map of CSS styles. Modifications to the CSS styles in the
   * subscribed map will be reflected in the bound map, with the exception of a set of reserved styles. The values of
   * any of the reserved styles in the bound map is not affected by the subscribed map.
   * @param mapToBind The map to bind.
   * @param stylesToSubscribe A key-value map of CSS styles to which to subscribe.
   * @param reservedStyles An iterable of reserved styles.
   * @returns The newly created subscription to the subscribed CSS style map.
   */
  export function bindStyleMap(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: SubscribableMap<string, string>,
    reservedStyles: Iterable<string>
  ): Subscription;
  /**
   * Binds a {@link MutableSubscribableMap} to an {@link ObjectSubject} of CSS styles. Modifications to the CSS styles
   * in the subject will be reflected in the bound map, with the exception of a set of reserved styles. The values of
   * any of the reserved styles in the bound map is not affected by the subscribed subject.
   * @param mapToBind The map to bind.
   * @param stylesToSubscribe An ObjectSubject of CSS styles to which to subscribe.
   * @param reservedStyles An iterable of reserved styles.
   * @returns The newly created subscription to the CSS style ObjectSubject.
   */
  export function bindStyleMap(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: ObjectSubject<Record<string, any>>,
    reservedStyles: Iterable<string>
  ): Subscription;
  /**
   * Binds a {@link MutableSubscribableMap} to a record of CSS styles. Modifications to the CSS styles in the record
   * will be reflected in the bound map, with the exception of a set of reserved styles. The values of any of the
   * reserved styles in the bound map is not affected by the subscribed record.
   * @param mapToBind The map to bind.
   * @param stylesToSubscribe A record of CSS styles to which to subscribe.
   * @param reservedStyles An iterable of reserved styles.
   * @returns The newly created subscriptions to the CSS style record.
   */
  export function bindStyleMap(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: StyleRecord,
    reservedStyles: Iterable<string>
  ): Subscription[];
  /**
   * Binds a {@link MutableSubscribableSet} to a subscribable set or a record of CSS classes. CSS classes toggled in
   * subscribed set or record will also be added to and removed from the bound set, with the exception of a set of
   * reserved classes. The presence or absence of any of the reserved classes in the bound set is not affected by the
   * subscribed set or record.
   * @param mapToBind The set to bind.
   * @param stylesToSubscribe A set or record of CSS classes to which to subscribe.
   * @param reservedStyles An iterable of reserved classes.
   * @returns The newly created subscription to the CSS class set, or an array of new subscriptions to the CSS class
   * record.
   */
  export function bindStyleMap(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: SubscribableMap<string, string> | ObjectSubject<Record<string, any>> | StyleRecord,
    reservedStyles: Iterable<string>
  ): Subscription | Subscription[];
  // eslint-disable-next-line jsdoc/require-jsdoc
  export function bindStyleMap(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: SubscribableMap<string, string> | ObjectSubject<Record<string, any>> | StyleRecord,
    reservedStyles: Iterable<string>
  ): Subscription | Subscription[] {
    const reservedStyleSet = new Set(reservedStyles);

    if ((stylesToSubscribe as any).isSubscribableMap === true) {
      return bindStyleMapToSubscribableMap(mapToBind, stylesToSubscribe as SubscribableMap<string, string>, reservedStyleSet);
    } else if (stylesToSubscribe instanceof ObjectSubject) {
      return bindStyleMapToObjectSubject(mapToBind, stylesToSubscribe, reservedStyleSet);
    } else {
      return bindStyleMapToRecord(mapToBind, stylesToSubscribe as StyleRecord, reservedStyleSet);
    }
  }

  /**
   * Binds a {@link MutableSubscribableMap} to a subscribable map of CSS styles. Modifications to the CSS styles in the
   * subscribed map will be reflected in the bound map, with the exception of a set of reserved styles. The values of
   * any of the reserved styles in the bound map is not affected by the subscribed map.
   * @param mapToBind The map to bind.
   * @param stylesToSubscribe A key-value map of CSS styles to which to subscribe.
   * @param reservedStyleSet A set of reserved styles.
   * @returns The newly created subscription to the subscribed CSS style map.
   */
  function bindStyleMapToSubscribableMap(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: SubscribableMap<string, string>,
    reservedStyleSet: Set<string>
  ): Subscription {
    if (reservedStyleSet.size === 0) {
      return stylesToSubscribe.pipe(mapToBind);
    } else {
      return stylesToSubscribe.sub((set, type, key, value) => {
        if (reservedStyleSet.has(key)) {
          return;
        }

        switch (type) {
          case SubscribableMapEventType.Added:
          case SubscribableMapEventType.Changed:
            mapToBind.setValue(key, value);
            break;
          case SubscribableMapEventType.Deleted:
            mapToBind.delete(key);
            break;
        }
      }, true);
    }
  }

  /**
   * Binds a {@link MutableSubscribableMap} to an {@link ObjectSubject} of CSS styles. Modifications to the CSS styles
   * in the subject will be reflected in the bound map, with the exception of a set of reserved styles. The values of
   * any of the reserved styles in the bound map is not affected by the subscribed subject.
   * @param mapToBind The map to bind.
   * @param stylesToSubscribe An ObjectSubject of CSS styles to which to subscribe.
   * @param reservedStyleSet A set of reserved styles.
   * @returns The newly created subscription to the CSS style ObjectSubject.
   */
  function bindStyleMapToObjectSubject(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: ObjectSubject<Record<string, any>>,
    reservedStyleSet: Set<string>
  ): Subscription {
    return stylesToSubscribe.sub((obj, style, value) => {
      if (reservedStyleSet.has(style)) {
        return;
      }

      if (value) {
        mapToBind.setValue(style, value);
      } else {
        mapToBind.delete(style);
      }
    }, true);
  }

  /**
   * Binds a {@link MutableSubscribableMap} to a record of CSS styles. Modifications to the CSS styles in the record
   * will be reflected in the bound map, with the exception of a set of reserved styles. The values of any of the
   * reserved styles in the bound map is not affected by the subscribed record.
   * @param mapToBind The map to bind.
   * @param stylesToSubscribe A record of CSS styles to which to subscribe.
   * @param reservedStyleSet A set of reserved styles.
   * @returns The newly created subscriptions to the CSS style record.
   */
  function bindStyleMapToRecord(
    mapToBind: MutableSubscribableMap<string, string>,
    stylesToSubscribe: StyleRecord,
    reservedStyleSet: Set<string>
  ): Subscription[] {
    const subs: Subscription[] = [];

    for (const style in stylesToSubscribe) {
      if (reservedStyleSet.has(style)) {
        continue;
      }

      const value = stylesToSubscribe[style];
      if (typeof value === 'object') {
        subs.push(value.sub(styleValue => {
          if (styleValue) {
            mapToBind.setValue(style, styleValue);
          } else {
            mapToBind.delete(style);
          }
        }, true));
      } else if (value) {
        mapToBind.setValue(style, value);
      } else {
        mapToBind.delete(style);
      }
    }

    return subs;
  }

  /**
   * Traverses a VNode tree in depth-first order and destroys the first {@link DisplayComponent} encountered in each
   * branch of the tree.
   * @param root The root of the tree to traverse.
   */
  export function shallowDestroy(root: VNode): void {
    FSComponent.visitNodes(root, node => {
      if (node !== root && node.instance instanceof DisplayComponent) {
        node.instance.destroy();
        return true;
      }

      return false;
    });
  }

  /**
   * An empty callback handler.
   */
  export const EmptyHandler = (): void => { return; };
}

/**
 * An interface for global plugin definitions.
 */
interface GlobalJsPlugin {
  /** The target instrument.  */
  target: string;
  /** The VFS path to the plugin */
  path: string;
}

/**
 * An interface for a list of global plugin definitions
 */
interface GlobalJsPlugins {
  /**
   * The array of plugin definitions.
   */
  plugins: GlobalJsPlugin[]
}

// global type to check if the listener is available in the sim build
declare const PluginsListener: any;

/**
 * A system that handles the registration and boostrapping of plugin scripts.
 */
export class PluginSystem<T extends AvionicsPlugin<B>, B> {
  private readonly scripts: string[] = [];
  private readonly plugins: T[] = [];

  /** The avionics specific plugin binder to inject into each plugin. */
  public binder?: B;

  /** An event subscribable that publishes when a new component is about to be created. */
  public readonly creatingHandlers: ((constructor: DisplayComponentFactory<any>, props: any) => DisplayComponent<any> | undefined)[] = [];

  /** An event subscribable that publishes when a new component is created. */
  public readonly createdHandlers: ((component: DisplayComponent<any>) => void)[] = [];

  /** An event subscribable that publishes when a component has finished rendering. */
  public readonly renderedHandlers: ((node: VNode) => void)[] = [];

  private pluginViewListener: ViewListener.ViewListener | undefined;

  private readonly initViewListenerPromise: Promise<void>;

  /**
   * Ctor
   */
  constructor() {
    this.initViewListenerPromise = new Promise<void>((resolve) => {
      this.pluginViewListener = RegisterViewListener('JS_LISTENER_PLUGINS', () => {
        resolve();
      });
    });
  }

  /**
   * Adds plugin scripts to load to the system.
   * @param document The panel.xml document to load scripts from.
   * @param instrumentId The ID of the instrument.
   * @param globalPluginTargetFunc A function that returns true if a global plugin should be loaded.
   * @example
   * await this.pluginSystem.addScripts(this.instrument.xmlConfig, this.instrument.templateID, (target) => {
   *   return target === this.instrument.templateID;
   * });
   */
  public async addScripts(document: XMLDocument, instrumentId: string, globalPluginTargetFunc: (target: string) => boolean): Promise<void> {
    let pluginTags: HTMLCollectionOf<Element> | undefined = undefined;

    await this.initViewListenerPromise;
    // check if the listener exists
    if (typeof PluginsListener !== 'undefined') {
      // wait for init of the plugin viewlistener
      if (this.pluginViewListener !== undefined) {
        // get global plugins
        const pluginsResp = await this.pluginViewListener.call('GET_PLUGINS');
        const globalPlugins: GlobalJsPlugins = pluginsResp;
        for (let i = 0; i < globalPlugins.plugins.length; i++) {
          const plugin = globalPlugins.plugins[i];
          if (globalPluginTargetFunc(plugin.target) === true) {
            const scriptUri = plugin.path;
            if (scriptUri !== null) {
              this.scripts.push(scriptUri);
            }
          }
        }
      }
    }

    // get from panel.xml
    const instrumentConfigs = document.getElementsByTagName('Instrument');
    for (let i = 0; i < instrumentConfigs.length; i++) {
      const el = instrumentConfigs.item(i);

      if (el !== null) {
        const nameEl = el.getElementsByTagName('Name');
        if (nameEl.length > 0 && nameEl[0].textContent === instrumentId) {
          pluginTags = el.getElementsByTagName('Plugin');
        }
      }
    }

    if (pluginTags !== undefined) {
      for (let i = 0; i < pluginTags.length; i++) {
        const scriptUri = pluginTags[i].textContent;
        if (scriptUri !== null) {
          this.scripts.push(scriptUri);
        }
      }
    }
  }

  /**
   * Starts the plugin system with the included avionics specific plugin binder.
   * @param binder The plugin binder to pass to the individual plugins.
   */
  public async startSystem(binder: B): Promise<void> {
    (window as any)._pluginSystem = this;
    this.binder = binder;

    const loadPromises: Promise<void>[] = [];

    for (const script of this.scripts) {
      const scriptTag = document.createElement('script');
      scriptTag.src = script;
      scriptTag.async = false;

      document.head.append(scriptTag);
      loadPromises.push(new Promise<void>((resolve, reject) => {
        scriptTag.onload = (): void => resolve();
        scriptTag.onerror = (ev): void => reject(ev);
      }).catch(e => console.error(e)));
    }

    await Promise.all(loadPromises).then(() => {
      for (const plugin of this.plugins) {
        plugin.onInstalled();
      }
    });
  }

  /**
   * Adds a plugin to the plugin system.
   * @param plugin The plugin to add.
   */
  public addPlugin(plugin: T): void {
    this.plugins.push(plugin);
  }

  /**
   * Runs the provided function on all of the registered plugins.
   * @param fun The function to run.
   * @param reverseOrder Whether to iterate through plugins in reverse order. Defaults to `false`.
   */
  public callPlugins(fun: (plugin: T) => void, reverseOrder = false): void {
    if (reverseOrder) {
      for (let i = this.plugins.length - 1; i >= 0; i--) {
        fun(this.plugins[i]);
      }
    } else {
      for (let i = 0; i < this.plugins.length; i++) {
        fun(this.plugins[i]);
      }
    }
  }

  /**
   * Subscribes a handler to the component creating hook.
   * @param handler The handler to subscribe.
   */
  public subscribeOnComponentCreating(handler: (constructor: DisplayComponentFactory<any>, props: any) => DisplayComponent<any> | undefined): void {
    this.creatingHandlers.push(handler);
  }

  /**
   * A hook that allows plugins to replace components that are about to be created with their own implementations.
   * @param constructor The display component constructor that is going to be used.
   * @param props The component props that will be passed into the component.
   * @returns Returns either the display component that will replace, or undefined if the component should not be replaced.
   */
  public onComponentCreating(constructor: DisplayComponentFactory<any>, props: any): DisplayComponent<any> | undefined {
    let component: DisplayComponent<any> | undefined = undefined;
    for (let i = 0; i < this.creatingHandlers.length; i++) {
      component = this.creatingHandlers[i](constructor, props);
      if (component !== undefined) {
        return component;
      }
    }

    return undefined;
  }

  /**
   * Subscribes a handler to the component created hook.
   * @param handler The handler to subscribe.
   */
  public subscribeOnComponentCreated(handler: (component: DisplayComponent<any>) => void): void {
    this.createdHandlers.push(handler);
  }

  /**
   * A hook that allows plugins to observe components as they are created.
   * @param component The component that was created.
   */
  public onComponentCreated(component: DisplayComponent<any>): void {
    for (let i = 0; i < this.createdHandlers.length; i++) {
      this.createdHandlers[i](component);
    }
  }

  /**
   * Subscribes a handler to the component rendered hook.
   * @param handler The handler to subscribe.
   */
  public subscribeOnComponentRendered(handler: (node: VNode) => void): void {
    this.renderedHandlers.push(handler);
  }

  /**
   * A hook that allows plugins to observe built VNodes after they are rendered.
   * @param node The node that was rendered.
   */
  public onComponentRendered(node: VNode): void {
    for (let i = 0; i < this.renderedHandlers.length; i++) {
      this.renderedHandlers[i](node);
    }
  }
}

/**
 * A plugin that is created and managed by the plugin system.
 */
export abstract class AvionicsPlugin<T> {
  /**
   * Creates an instance of a Plugin.
   * @param binder The avionics specific plugin binder to accept from the system.
   */
  constructor(protected readonly binder: T) { }

  /**
   * A callback run when the plugin has been installed.
   */
  public abstract onInstalled(): void;

  /**
   * An optional hook called when a component is about to be created. Returning a component causes
   * that component to be used instead of the one that was to be created, and returning undefined
   * will cause the original component to be created. If this hook is present, it will be called
   * for EVERY component instantiation, so be sure to ensure that this code is well optimized.
   */
  public onComponentCreating?: (constructor: DisplayComponentFactory<any>, props: any) => DisplayComponent<any> | undefined;

  /**
   * An optional hook called when a component is created. If this hook is present,
   * it will be called for EVERY component instantiation, so be sure to ensure
   * that this code is well optimized.
   */
  public onComponentCreated?: (component: DisplayComponent<any>) => void;

  /**
   * An optional hook called when a component has completed rendering. If this hook
   * is present, it will be called for EVERY component render completion, so be sure
   * to ensure that this code is well optimized.
   */
  public onComponentRendered?: (node: VNode) => void;

  /**
   * Loads a CSS file into the instrument.
   * @param uri The URI to the CSS file.
   */
  protected async loadCss(uri: string): Promise<void> {
    const linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = uri;

    document.head.append(linkTag);
    return new Promise<void>((resolve) => {
      linkTag.onload = (): void => resolve();
    });
  }
}

/**
 * Registers a plugin with the plugin system.
 * @param plugin The plugin to register.
 */
export function registerPlugin<T>(plugin: new (binder: T) => AvionicsPlugin<T>): void {
  const pluginSystem = (window as any)._pluginSystem as PluginSystem<AvionicsPlugin<T>, T>;
  if (pluginSystem.binder !== undefined) {
    const instance = new plugin(pluginSystem.binder);
    pluginSystem.addPlugin(instance);

    if (instance.onComponentCreating !== undefined) {
      pluginSystem.subscribeOnComponentCreating(instance.onComponentCreating);
    }

    if (instance.onComponentCreated !== undefined) {
      pluginSystem.subscribeOnComponentCreated(instance.onComponentCreated);
    }

    if (instance.onComponentRendered !== undefined) {
      pluginSystem.subscribeOnComponentRendered(instance.onComponentRendered);
    }
  }
}

const Fragment = FSComponent.Fragment;
export { Fragment };
