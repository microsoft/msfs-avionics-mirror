"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["672681"],{138236:function(e,n,i){i.r(n),i.d(n,{metadata:()=>t,contentTitle:()=>o,default:()=>u,assets:()=>a,toc:()=>d,frontMatter:()=>l});var t=JSON.parse('{"id":"plugins/adding-plugin-support","title":"Adding Plugin Support For Your Instrument","description":"The Plugin API is included as part of the MSFS SDK library (@microsoft/msfs-sdk). In order to use the API, the first step is to make sure your instrument imports @microsoft/msfs-sdk. Once the library is imported, you can start using the Plugin API classes.","source":"@site/docs/plugins/adding-plugin-support.md","sourceDirName":"plugins","slug":"/plugins/adding-plugin-support","permalink":"/msfs-avionics-mirror/2024/docs/plugins/adding-plugin-support","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_label":"Adding Plugin Support","sidebar_position":2},"sidebar":"sidebar","previous":{"title":"Overview","permalink":"/msfs-avionics-mirror/2024/docs/plugins/overview"},"next":{"title":"Creating Plugins","permalink":"/msfs-avionics-mirror/2024/docs/plugins/creating-plugins"}}'),s=i("785893"),r=i("250065");let l={sidebar_label:"Adding Plugin Support",sidebar_position:2},o="Adding Plugin Support For Your Instrument",a={},d=[{value:"Plugin API Basics",id:"plugin-api-basics",level:2},{value:"Setting Up <code>PluginSystem</code>",id:"setting-up-pluginsystem",level:2},{value:"Passing Data to Plugins",id:"passing-data-to-plugins",level:2},{value:"Calling Methods on Plugins",id:"calling-methods-on-plugins",level:2},{value:"Retrieving Data from Plugins",id:"retrieving-data-from-plugins",level:2},{value:"Handling Plugins for Multi-Instrument Avionics Systems",id:"handling-plugins-for-multi-instrument-avionics-systems",level:2}];function c(e){let n={a:"a",admonition:"admonition",code:"code",em:"em",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"adding-plugin-support-for-your-instrument",children:"Adding Plugin Support For Your Instrument"})}),"\n",(0,s.jsxs)(n.p,{children:["The Plugin API is included as part of the MSFS SDK library (",(0,s.jsx)(n.code,{children:"@microsoft/msfs-sdk"}),"). In order to use the API, the first step is to make sure your instrument imports ",(0,s.jsx)(n.code,{children:"@microsoft/msfs-sdk"}),". Once the library is imported, you can start using the Plugin API classes."]}),"\n",(0,s.jsx)(n.h2,{id:"plugin-api-basics",children:"Plugin API Basics"}),"\n",(0,s.jsxs)(n.p,{children:["The core of the Plugin API consists of two classes: ",(0,s.jsx)(n.code,{children:"PluginSystem"})," and ",(0,s.jsx)(n.code,{children:"AvionicsPlugin"}),". The former is responsible for loading and managing plugins for an instrument, while the latter is an abstract class that is extended to create individual plugins."]}),"\n",(0,s.jsx)(n.p,{children:"The basic process by which plugins are handled by an instrument is outlined below:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["The instrument creates an instance of ",(0,s.jsx)(n.code,{children:"PluginSystem"}),"."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"PluginSystem"})," is used to load plugins. When a plugin is loaded, it is instantiated as a subclass of ",(0,s.jsx)(n.code,{children:"AvionicsPlugin"})," and optionally data is passed from the instrument to the plugin."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"PluginSystem"})," is used to call methods on the loaded plugins to execute plugin-specific functions and/or retrieve data from plugins."]}),"\n"]}),"\n",(0,s.jsxs)(n.h2,{id:"setting-up-pluginsystem",children:["Setting Up ",(0,s.jsx)(n.code,{children:"PluginSystem"})]}),"\n",(0,s.jsxs)(n.p,{children:["The first step for any instrument looking to support plugins is to create an instance of ",(0,s.jsx)(n.code,{children:"PluginSystem"}),". This can be done at any time, but should typically be done during instrument initialization. The ",(0,s.jsx)(n.code,{children:"connectedCallback()"})," method of your instrument class is a good candidate:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"import { AvionicsPlugin, PluginSystem } from '@microsoft/msfs-sdk';\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  // Don't worry about the type parameters for now; we'll get to those later.\r\n  private pluginSystem?: PluginSystem<AvionicsPlugin<void>, void>;\r\n\r\n  // ...\r\n\r\n  public connectedCallback(): void {\r\n    super.connectedCallback();\r\n\r\n    this.initPlugins();\r\n  }\r\n\r\n  public initPlugins(): void {\r\n    // Don't worry about the type parameters for now; we'll get to those later.\r\n    this.pluginSystem = new PluginSystem<AvionicsPlugin<void>, void>();\r\n  }\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsx)(n.admonition,{type:"warning",children:(0,s.jsxs)(n.p,{children:["There should be at most ",(0,s.jsx)(n.strong,{children:"one"})," instance of ",(0,s.jsx)(n.code,{children:"PluginSystem"})," created per instrument."]})}),"\n",(0,s.jsxs)(n.p,{children:["Once ",(0,s.jsx)(n.code,{children:"PluginSystem"})," is created, the next step is to load the plugins for your instrument. ",(0,s.jsx)(n.code,{children:"PluginSystem"})," makes this easy; all you have to do is call two methods while providing some basic information:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"import { AvionicsPlugin, PluginSystem } from '@microsoft/msfs-sdk';\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  // Don't worry about the type parameters for now; we'll get to those later.\r\n  private pluginSystem?: PluginSystem<AvionicsPlugin<void>, void>;\r\n\r\n  // ...\r\n\r\n  public connectedCallback(): void {\r\n    super.connectedCallback();\r\n\r\n    this.initPlugins();\r\n  }\r\n\r\n  public async initPlugins(): Promise<void> {\r\n    this.pluginSystem = new PluginSystem<AvionicsPlugin<void>, void>();\r\n\r\n    await this.pluginSystem.addScripts(this.xmlConfig, this.templateID, (target: string) => false);\r\n    await this.pluginSystem.startSystem();\r\n  }\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"addScripts()"})," method prepares a list of plugins to load from Javascript (.js) files. It takes in three arguments: (1) the XML document object generated for the airplane's ",(0,s.jsx)(n.code,{children:"panel.xml"})," (available as the ",(0,s.jsx)(n.code,{children:"xmlConfig"})," property on ",(0,s.jsx)(n.code,{children:"BaseInstrument"})," after ",(0,s.jsx)(n.code,{children:"connectedCallback()"})," is called), (2) the ID of the instrument, which is defined by the ",(0,s.jsx)(n.code,{children:"templateID"})," getter on ",(0,s.jsx)(n.code,{children:"BaseInstrument"})," with an optional index suffix if one is defined in ",(0,s.jsx)(n.code,{children:"panel.cfg"}),", and (3) a function that filters ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/plugins/overview#global-vs-airplane-plugins",children:"global plugins"})," based on their declared ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/plugins/creating-plugins#loading-global-plugins",children:"targets"}),"."]}),"\n",(0,s.jsxs)(n.p,{children:["Once ",(0,s.jsx)(n.code,{children:"addScripts()"})," is called, calling ",(0,s.jsx)(n.code,{children:"startSystem()"})," will cause the system to load and instantiate the plugins."]}),"\n",(0,s.jsxs)(n.p,{children:["Note that ",(0,s.jsx)(n.code,{children:"initPlugins()"})," in the above example was turned into an ",(0,s.jsx)(n.code,{children:"async"})," method so that we could ",(0,s.jsx)(n.code,{children:"await"})," the calls to ",(0,s.jsx)(n.code,{children:"addScripts()"})," and ",(0,s.jsx)(n.code,{children:"startSystem()"}),". This is important. Both methods are asynchronous and must be called in order. Calling ",(0,s.jsx)(n.code,{children:"startSystem()"})," before ",(0,s.jsx)(n.code,{children:"addScripts()"})," is finished executing will cause some or all plugins to not be loaded correctly."]}),"\n",(0,s.jsx)(n.h2,{id:"passing-data-to-plugins",children:"Passing Data to Plugins"}),"\n",(0,s.jsxs)(n.p,{children:["You will often want to provide plugins with certain data or references to objects in order to allow them to interact properly with your instrument. For example, if you use ",(0,s.jsx)(n.code,{children:"EventBus"})," in your instrument, it's generally a good idea to provide plugins a reference to the instrument's ",(0,s.jsx)(n.code,{children:"EventBus"})," instance to allow communication between the instrument and plugins. You can pass any arbitrary data from the instrument to plugins using a ",(0,s.jsx)(n.em,{children:"binder"}),". A binder is just an object with an interface that both the instrument and the plugins have agreed upon in advance. The binder is created on the instrument, then passed to the plugins when they are instantiated:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"import { AvionicsPlugin, PluginSystem } from '@microsoft/msfs-sdk';\r\n\r\nexport interface MyPluginBinder {\r\n  readonly bus: EventBus;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private readonly bus = new EventBus();\r\n\r\n  private pluginSystem?: PluginSystem<AvionicsPlugin<MyPluginBinder>, MyPluginBinder>;\r\n\r\n  // ...\r\n\r\n  public connectedCallback(): void {\r\n    super.connectedCallback();\r\n\r\n    this.initPlugins();\r\n  }\r\n\r\n  public async initPlugins(): Promise<void> {\r\n    this.pluginSystem = new PluginSystem<AvionicsPlugin<MyPluginBinder>, MyPluginBinder>();\r\n\r\n    await this.pluginSystem.addScripts(this.xmlConfig, this.templateID, (target: string) => false);\r\n    await this.pluginSystem.startSystem({ bus: this.bus });\r\n  }\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["In the example, we have declared the binder interface ",(0,s.jsx)(n.code,{children:"MyPluginBinder"}),". We also specify that our ",(0,s.jsx)(n.code,{children:"PluginSystem"})," uses binders that implement ",(0,s.jsx)(n.code,{children:"MyPluginBinder"})," by including ",(0,s.jsx)(n.code,{children:"MyPluginBinder"})," as the second type parameter on our instance of ",(0,s.jsx)(n.code,{children:"PluginSystem"}),". ",(0,s.jsx)(n.code,{children:"MyPluginBinder"})," is also used as the type parameter on ",(0,s.jsx)(n.code,{children:"AvionicsPlugin"}),", which declares that all plugins loaded by this instance of ",(0,s.jsx)(n.code,{children:"PluginSystem"})," should expect a binder that implements ",(0,s.jsx)(n.code,{children:"MyPluginBinder"}),". Now all loaded plugins will be able to access a reference to the instrument's ",(0,s.jsx)(n.code,{children:"EventBus"})," instance via the binder."]}),"\n",(0,s.jsx)(n.admonition,{type:"tip",children:(0,s.jsxs)(n.p,{children:["Because the binder is just a regular object, it can be mutated like any other object. In almost all cases, this would not be desired behavior. Declaring all properties on the binder interface as ",(0,s.jsx)(n.code,{children:"readonly"})," signals to everyone involved that they should not mutate the binder."]})}),"\n",(0,s.jsx)(n.h2,{id:"calling-methods-on-plugins",children:"Calling Methods on Plugins"}),"\n",(0,s.jsxs)(n.p,{children:["When you want your instrument to execute certain plugin-specific code, you can use ",(0,s.jsx)(n.code,{children:"PluginSystem"})," to call methods on plugins that it has loaded. However, the ",(0,s.jsx)(n.code,{children:"AvionicsPlugin"})," class does not by itself declare any methods that are callable by ",(0,s.jsx)(n.code,{children:"PluginSystem"})," (it defines several publically accessible methods, but they are for internal use only). Therefore, if your instrument requires that plugins implement certain methods, you must declare your own plugin interface that extends ",(0,s.jsx)(n.code,{children:"AvionicsPlugin"}),"."]}),"\n",(0,s.jsxs)(n.p,{children:["For example, the following code defines a plugin interface that requires an ",(0,s.jsx)(n.code,{children:"onUpdate()"})," method that is called whenever the instrument is updated:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"import { AvionicsPlugin, PluginSystem } from '@microsoft/msfs-sdk';\r\n\r\nexport interface MyPlugin extends AvionicsPlugin<void> {\r\n  /**\r\n   * Called when the instrument is updated.\r\n   * @param currentTime The current operating system timestamp.\r\n   */\r\n  onUpdate(currentTime: number): void;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private pluginSystem?: PluginSystem<MyPlugin, void>;\r\n\r\n  // ...\r\n\r\n  public connectedCallback(): void {\r\n    super.connectedCallback();\r\n\r\n    this.initPlugins();\r\n  }\r\n\r\n  public async initPlugins(): Promise<void> {\r\n    this.pluginSystem = new PluginSystem<MyPlugin, void>();\r\n\r\n    await this.pluginSystem.addScripts(this.xmlConfig, this.templateID, (target: string) => false);\r\n    await this.pluginSystem.startSystem();\r\n  }\r\n\r\n  public Update(): void {\r\n    super.Update();\r\n\r\n    const time = Date.now();\r\n\r\n    this.pluginSystem!.callPlugins((plugin: MyPlugin) => {\r\n      plugin.onUpdate(time);\r\n    });\r\n  }\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["In the example, ",(0,s.jsx)(n.code,{children:"callPlugins()"})," is used to call the ",(0,s.jsx)(n.code,{children:"onUpdate()"})," method on plugins. The callback function passed to ",(0,s.jsx)(n.code,{children:"callPlugins()"})," is executed once for every loaded plugin. You may have noticed that there are no checks to see if the asynchronous ",(0,s.jsx)(n.code,{children:"addScripts()"})," and ",(0,s.jsx)(n.code,{children:"startSystem()"})," have finished executing before we attempt to call ",(0,s.jsx)(n.code,{children:"onUpdate()"}),". This is because ",(0,s.jsx)(n.code,{children:"callPlugins()"})," simply iterates over all loaded plugins; if a plugin has not finished loaded it will not be enumerated by ",(0,s.jsx)(n.code,{children:"callPlugins()"}),". In the case of an update callback, there is little harm in simply not triggering the callback until the plugin has loaded. However, for other use cases where you need the plugins to ",(0,s.jsx)(n.em,{children:"exist"})," before executing a method, you will need to ensure ",(0,s.jsx)(n.code,{children:"startSystem()"})," has finished loading plugins before using ",(0,s.jsx)(n.code,{children:"callPlugins()"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"retrieving-data-from-plugins",children:"Retrieving Data from Plugins"}),"\n",(0,s.jsxs)(n.p,{children:["If your instrument needs to retrieve data from plugins, you can use ",(0,s.jsx)(n.code,{children:"callPlugins()"})," to call methods on plugins that return data. For example, the following code delegates the rendering of a specific display component to plugins:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"import { AvionicsPlugin, PluginSystem } from '@microsoft/msfs-sdk';\r\n\r\nexport interface MyPlugin extends AvionicsPlugin<void> {\r\n  /**\r\n   * Renders a component.\r\n   * @returns The rendered component, or null if this plugin does not support rendering the component.\r\n   */\r\n  renderComponent(): VNode | null;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private pluginSystem?: PluginSystem<MyPlugin, void>;\r\n\r\n  // ...\r\n\r\n  public connectedCallback(): void {\r\n    super.connectedCallback();\r\n\r\n    this.initPlugins();\r\n  }\r\n\r\n  public async initPlugins(): Promise<void> {\r\n    this.pluginSystem = new PluginSystem<MyPlugin, void>();\r\n\r\n    await this.pluginSystem.addScripts(this.xmlConfig, this.templateID, (target: string) => false);\r\n    await this.pluginSystem.startSystem();\r\n\r\n    let pluginComponent: VNode | null = null;\r\n\r\n    // Call renderComponent() for each plugin until one of them returns a non-null value, then render that value into\r\n    // the instrument. If all plugins return null, then the component will not be rendered.\r\n    this.pluginSystem!.callPlugins((plugin: MyPlugin) => {\r\n      pluginComponent ??= plugin.renderComponent();\r\n    });\r\n\r\n    FSComponent.render(\r\n      (\r\n        <div>\r\n          {/* ... */}\r\n          {pluginComponent}\r\n          {/* ... */}\r\n        </div>\r\n      ),\r\n      this.instrument.getChildById('Electricity')\r\n    );\r\n  }\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsx)(n.admonition,{type:"tip",children:(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"callPlugins()"})," always executes its callback once for each loaded plugin. If you need only one copy of a particular piece of data and you don't have total control over how many plugins are loaded for your instrument (which will be true most of the time), remember to consider how to deal with potentially multiple plugins responding to your call for data."]})}),"\n",(0,s.jsx)(n.h2,{id:"handling-plugins-for-multi-instrument-avionics-systems",children:"Handling Plugins for Multi-Instrument Avionics Systems"}),"\n",(0,s.jsxs)(n.p,{children:["When creating an avionics system that has multiple instruments (e.g., PFD, MFD, CDU), keep in mind that plugins are loaded on a ",(0,s.jsx)(n.em,{children:"per-instrument"})," basis. This means that different instruments can end up loading different sets of plugins. You may also choose to specify different binder and plugin interfaces for different instruments."]})]})}function u(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(c,{...e})}):c(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return l}});var t=i(667294);let s={},r=t.createContext(s);function l(e){let n=t.useContext(r);return t.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);