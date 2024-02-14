"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[77690],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>c});var a=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function r(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var p=a.createContext({}),s=function(e){var n=a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):r(r({},n),e)),t},d=function(e){var n=s(e.components);return a.createElement(p.Provider,{value:n},e.children)},g="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},u=a.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),g=s(t),u=i,c=g["".concat(p,".").concat(u)]||g[u]||m[u]||o;return t?a.createElement(c,r(r({ref:n},d),{},{components:t})):a.createElement(c,r({ref:n},d))}));function c(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,r=new Array(o);r[0]=u;var l={};for(var p in n)hasOwnProperty.call(n,p)&&(l[p]=n[p]);l.originalType=e,l[g]="string"==typeof e?e:i,r[1]=l;for(var s=2;s<o;s++)r[s]=t[s];return a.createElement.apply(null,r)}return a.createElement.apply(null,t)}u.displayName="MDXCreateElement"},40721:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>r,default:()=>m,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var a=t(87462),i=(t(67294),t(3905));const o={sidebar_label:"Engine Display",sidebar_position:7},r="G3X Touch Engine Information Display",l={unversionedId:"g3xtouch/engine-display",id:"g3xtouch/engine-display",title:"G3X Touch Engine Information Display",description:"Introduction",source:"@site/docs/g3xtouch/engine-display.md",sourceDirName:"g3xtouch",slug:"/g3xtouch/engine-display",permalink:"/msfs-avionics-mirror/docs/g3xtouch/engine-display",draft:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_label:"Engine Display",sidebar_position:7},sidebar:"sidebar",previous:{title:"UI Framework",permalink:"/msfs-avionics-mirror/docs/g3xtouch/ui-framework"},next:{title:"panel.xml Engine Gauges",permalink:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-engine-gauges"}},p={},s=[{value:"Introduction",id:"introduction",level:2},{value:"EIS",id:"eis",level:2},{value:"EIS <code>panel.xml</code> Configuration",id:"eis-panelxml-configuration",level:3},{value:"EIS Plugin Configuration",id:"eis-plugin-configuration",level:3},{value:"MFD Engine Page",id:"mfd-engine-page",level:2},{value:"MFD Engine Page <code>panel.xml</code> Configuration",id:"mfd-engine-page-panelxml-configuration",level:3},{value:"MFD Engine Page Plugin Configuration",id:"mfd-engine-page-plugin-configuration",level:3}],d={toc:s},g="wrapper";function m(e){let{components:n,...o}=e;return(0,i.kt)(g,(0,a.Z)({},d,o,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"g3x-touch-engine-information-display"},"G3X Touch Engine Information Display"),(0,i.kt)("h2",{id:"introduction"},"Introduction"),(0,i.kt)("p",null,"The G3X Touch can display engine information in two places: the EIS display and the MFD engine page. The contents of both are airplane-specific and so must be configured on a per-airplane basis."),(0,i.kt)("p",null,"Both the EIS and engine page are optional features and can be omitted from the G3X Touch if desired. By default, the G3X Touch does not include either one of these displays. In order to include one or both, you must declare support for them in the airplane's ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-basics"},(0,i.kt)("inlineCode",{parentName:"a"},"panel.xml"))," file using the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#engine"},(0,i.kt)("inlineCode",{parentName:"a"},"<Engine>"))," tag."),(0,i.kt)("h2",{id:"eis"},"EIS"),(0,i.kt)("p",null,"The EIS is a strip that is displayed on the left or right side of the screen on GDU 460 displays and at the top of screen below the CNS data bar on GDU 470 displays."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"EIS",src:t(27105).Z,width:"90",height:"328"})),(0,i.kt)("p",null,"In order for the EIS to be included in the G3X Touch, the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#eis"},(0,i.kt)("inlineCode",{parentName:"a"},"<Eis>"))," tag must present in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml"),". Once included, the EIS is always visible on at least one GDU (the user can configure which GDU(s) the EIS appears on)."),(0,i.kt)("p",null,"The EIS has up to two display modes depending on whether the MFD engine page is included and open. The ",(0,i.kt)("em",{parentName:"p"},"default")," mode is active when the MFD engine page is either not included or is not open. The ",(0,i.kt)("em",{parentName:"p"},"combined")," mode is active when the MFD engine page is open. The EIS may display different content in each of these modes compared to the other."),(0,i.kt)("h3",{id:"eis-panelxml-configuration"},"EIS ",(0,i.kt)("inlineCode",{parentName:"h3"},"panel.xml")," Configuration"),(0,i.kt)("p",null,"The contents of the EIS can be configured in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," within the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," tag. For GDU 460 installations, this tag has a single required attribute, ",(0,i.kt)("inlineCode",{parentName:"p"},"size"),", which defines the width of the EIS:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Size"),(0,i.kt)("th",{parentName:"tr",align:null},"Width (px)"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"'narrow'"),(0,i.kt)("td",{parentName:"tr",align:null},"164")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"'wide'"),(0,i.kt)("td",{parentName:"tr",align:null},"212")))),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," tag supports two direct children tags: ",(0,i.kt)("inlineCode",{parentName:"p"},"<Default>")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"<Combined>"),". The former defines content that is displayed while the EIS is in default mode. The latter defines content that is displayed while the EIS is in combined mode. If the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Combined>")," tag is omitted entirely, then the content defined by the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Default>")," tag will be displayed for both modes. If ",(0,i.kt)("strong",{parentName:"p"},"both")," tags are omitted and content is defined directly under the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," tag, then the behavior is equivalent to defining the content under the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Default>")," tag and omitting the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Combined>")," tag."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},'\x3c!-- Both Default and Combined tags defined --\x3e\n<Eis size="narrow">\n  <Default>\n    \x3c!-- Content to display in default mode goes here --\x3e\n  </Default>\n  <Combined>\n    \x3c!-- Content to display in combined mode goes here --\x3e\n  </Combined>\n</Eis>\n\n\x3c!-- Only Default tag is defined --\x3e\n<Eis size="narrow">\n  <Default>\n    \x3c!-- Content to display in both default and combined modes goes here --\x3e\n  </Default>\n</Eis>\n\n\x3c!-- Neither Default nor Combined tag is defined --\x3e\n<Eis size="narrow">\n  \x3c!-- Content to display in both default and combined modes goes here --\x3e\n</Eis>\n')),(0,i.kt)("p",null,"The contents of the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Default>")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"<Combined>")," tags use the same syntax: zero or more gauge tags wrapped in optional row or column tags. For more details on how these tags work, please refer to the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-engine-gauges"},(0,i.kt)("em",{parentName:"a"},"G3X Touch Engine Gauges"))," page."),(0,i.kt)("p",null,"The direct child of the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Default>")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"<Combined>")," tags (or the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," tag if the former are omitted) is always a column tag. If a column tag is not explicitly defined here, then an implicit one is added. The implicit root column tag has a width of 100% and uses the ",(0,i.kt)("inlineCode",{parentName:"p"},"space-around")," justify content style:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},'\x3c!-- The following two Eis tags are equivalent. --\x3e\n\n\x3c!-- Implicit root column tag --\x3e\n<Eis size="narrow">\n  \x3c!-- Content --\x3e\n</Eis>\n\n\x3c!-- Explicit root column tag --\x3e\n<Eis size="narrow">\n  <Column>\n    <Style>\n      <Width>100%</Width>\n      <JustifyContent>space-around</JustifyContent>\n    </Style>\n\n    \x3c!-- Content --\x3e\n  </Column>\n</Eis>\n')),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"Use ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#definition-engine"},(0,i.kt)("inlineCode",{parentName:"a"},"<Definition>"))," and ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#usedefinition-engine"},(0,i.kt)("inlineCode",{parentName:"a"},"<UseDefinition>")),' tags to define macros that can be used to "copy and paste" XML content that is repeated within the ',(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"EnginePage")," tags.")),(0,i.kt)("h3",{id:"eis-plugin-configuration"},"EIS Plugin Configuration"),(0,i.kt)("p",null,"The contents of the EIS can be rendered using a plugin if the options provided by ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," are not adequate for your use case. This is done through the plugin's ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/plugins#rendereis"},(0,i.kt)("inlineCode",{parentName:"a"},"renderEis()"))," method. ",(0,i.kt)("strong",{parentName:"p"},"Plugin-rendered EIS content will replace any and all EIS content configured in ",(0,i.kt)("inlineCode",{parentName:"strong"},"panel.xml")),"."),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"Support for displaying an EIS must still be declared in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," via the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," tag before EIS contents can be rendered by plugin. The contents of the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," tag can be left empty if you are planning to use plugin-rendered EIS content.")),(0,i.kt)("p",null,"Plugins can subscribe to the ",(0,i.kt)("inlineCode",{parentName:"p"},"g3x_eis_engine_page_is_open")," event bus topic (defined in the ",(0,i.kt)("a",{parentName:"p",href:"https://microsoft.github.io/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/G3XEisEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"G3XEisEvents"))," interface) to determine when the MFD engine page is open and thus whether to display default or combined mode content."),(0,i.kt)("h2",{id:"mfd-engine-page"},"MFD Engine Page"),(0,i.kt)("p",null,"The MFD engine page is an ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/ui-framework#mfd-main-pages"},"MFD main page")," that displays engine-related information. The page optionally organizes displayed information into tabs. The engine page is also where the user interacts with the Lean Assist and Fuel Calculator functions, if supported."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"MFD Engine Page",src:t(71445).Z,width:"281",height:"335"})),(0,i.kt)("p",null,"In order for the MFD engine page to be included in the G3X Touch, the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#enginepage"},(0,i.kt)("inlineCode",{parentName:"a"},"<EnginePage>"))," tag must present in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml"),". Once included, the user will be able to select the engine page from the list of MFD main pages in the MFD pane."),(0,i.kt)("p",null,"For GDU 460 installations, the engine page has two formats depending on whether the MFD pane is being displayed in Fullscreen or Splitscreen mode. Care must be taken to ensure that the contents of the page are laid out properly in both formats."),(0,i.kt)("h3",{id:"mfd-engine-page-panelxml-configuration"},"MFD Engine Page ",(0,i.kt)("inlineCode",{parentName:"h3"},"panel.xml")," Configuration"),(0,i.kt)("p",null,"The contents of the MFD engine page can be configured in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," within the ",(0,i.kt)("inlineCode",{parentName:"p"},"<EnginePage>")," tag."),(0,i.kt)("p",null,"If you wish to organize information into tabs (which is required if you wish to support the Fuel Calculator function), then each direct child of ",(0,i.kt)("inlineCode",{parentName:"p"},"<EnginePage>")," should be a ",(0,i.kt)("inlineCode",{parentName:"p"},"<Tab>")," tag. Each ",(0,i.kt)("inlineCode",{parentName:"p"},"<Tab>")," tag has a ",(0,i.kt)("inlineCode",{parentName:"p"},"label")," attribute that defines the text label displayed for the tab. The order in which the tabs are defined in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," determines the order in which the tabs appear in the engine page."),(0,i.kt)("p",null,"Here is an example of an engine page configured to have two tabs, labeled 'Main' and 'Electrical':"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},'<EnginePage>\n  <Tab label="Main">\n  </Tab>\n  <Tab label="Electrical">\n  </Tab>\n</EnginePage>\n')),(0,i.kt)("p",null,"In order to support the Fuel Calculator function, you must define a tab with the ",(0,i.kt)("inlineCode",{parentName:"p"},"type")," attribute set to ",(0,i.kt)("inlineCode",{parentName:"p"},"'Fuel Calculator'"),". You may also define the optional ",(0,i.kt)("inlineCode",{parentName:"p"},"preset-fuel-1")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"preset-fuel-2")," attributes to have the tab display Fuel Preset buttons that allow the user to quickly set the amount of fuel remaining. The value of the preset fuel attributes should be the preset fuel amount in gallons."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},'<Tab\n  label="Fuel Calc"\n  type="Fuel Calculator"\n  preset-fuel-1="5"\n  preset-fuel-2="10"\n>\n</Tab>\n')),(0,i.kt)("p",null,"If you do not wish the engine page to have tabs, then omit any ",(0,i.kt)("inlineCode",{parentName:"p"},"<Tab>")," tags within ",(0,i.kt)("inlineCode",{parentName:"p"},"<EnginePage>"),"."),(0,i.kt)("p",null,"Engine page content within a tab, or within the entire page if omitting tabs, is defined using the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Fullscreen>")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"<Splitscreen>")," tags. The ",(0,i.kt)("inlineCode",{parentName:"p"},"<Fullscreen>")," tag defines the gauges that are displayed when the engine page is in Fullscreen mode, and the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Splitscreen>")," tag defines the gauges that are displayed when the engine page is in Splitscreen mode:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},"<EnginePage>\n  <Fullscreen>\n    \x3c!-- Content to display in Fullscreen mode goes here --\x3e\n  </Fullscreen>\n  <Splitscreen>\n    \x3c!-- Content to display in Splitscreen mode goes here --\x3e\n  </Splitscreen>\n</EnginePage>\n")),(0,i.kt)("p",null,"If both ",(0,i.kt)("inlineCode",{parentName:"p"},"<Fullscreen>")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"<Splitscreen>")," tags are omitted and content is definedt directly under the ",(0,i.kt)("inlineCode",{parentName:"p"},"<EnginePage>")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"<Tab>")," tag, then the content will be displayed in both Fullscreen and Splitscreen modes:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},"<EnginePage>\n  \x3c!-- Content to display in both Fullscreen and Splitscreen modes goes here --\x3e\n</EnginePage>\n")),(0,i.kt)("p",null,"The contents of the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Fullscreen>")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"<Splitscreen>")," tags use the same syntax: zero or more gauge tags wrapped in optional row or column tags. For more details on how these tags work, please refer to the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-engine-gauges"},(0,i.kt)("em",{parentName:"a"},"G3X Touch Engine Gauges"))," page."),(0,i.kt)("p",null,"The direct child of the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Fullscreen>")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"<Splitscreen>")," tags (or the ",(0,i.kt)("inlineCode",{parentName:"p"},"<EnginePage>"),"/",(0,i.kt)("inlineCode",{parentName:"p"},"<Tab>")," tag if the former are omitted) is always a column tag. If a column tag is not explicitly defined here, then an implicit one is added. The implicit root column tag has a width of 100% and uses the ",(0,i.kt)("inlineCode",{parentName:"p"},"space-around")," justify content style:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},"\x3c!-- The following two EnginePage tags are equivalent. --\x3e\n\n\x3c!-- Implicit root column tag --\x3e\n<EnginePage>\n  \x3c!-- Content --\x3e\n</EnginePage>\n\n\x3c!-- Explicit root column tag --\x3e\n<EnginePage>\n  <Column>\n    <Style>\n      <Width>100%</Width>\n      <JustifyContent>space-around</JustifyContent>\n    </Style>\n\n    \x3c!-- Content --\x3e\n  </Column>\n</EnginePage>\n")),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"Use ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#definition-engine"},(0,i.kt)("inlineCode",{parentName:"a"},"<Definition>"))," and ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#usedefinition-engine"},(0,i.kt)("inlineCode",{parentName:"a"},"<UseDefinition>")),' tags to define macros that can be used to "copy and paste" XML content that is repeated within the ',(0,i.kt)("inlineCode",{parentName:"p"},"<Eis>")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"EnginePage")," tags.")),(0,i.kt)("h3",{id:"mfd-engine-page-plugin-configuration"},"MFD Engine Page Plugin Configuration"),(0,i.kt)("p",null,"The MFD engine page can be rendered using a plugin if the options provided by ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," are not adequate for your use case. This is done by registering your own engine page under the ",(0,i.kt)("inlineCode",{parentName:"p"},"MfdMainPageKeys.Engine")," key through the plugin's ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/plugins#registermfdmainpages"},(0,i.kt)("inlineCode",{parentName:"a"},"registerMfdMainPages()"))," method. ",(0,i.kt)("strong",{parentName:"p"},"Any plugin-rendered engine page will completely replace the one configured in ",(0,i.kt)("inlineCode",{parentName:"strong"},"panel.xml")),"."),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"Support for displaying an engine page must still be declared in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," via the ",(0,i.kt)("inlineCode",{parentName:"p"},"<EnginePage>")," tag before plugins can register a custom engine page. The contents of the ",(0,i.kt)("inlineCode",{parentName:"p"},"<EnginePage>")," tag can be left empty if you are planning to use a plugin-rendered engine page.")),(0,i.kt)("p",null,"Plugin-rendered engine pages should publish the correct value to the ",(0,i.kt)("inlineCode",{parentName:"p"},"g3x_eis_engine_page_is_open")," event bus topic (defined in the ",(0,i.kt)("a",{parentName:"p",href:"https://microsoft.github.io/msfs-avionics-mirror/docs/g3xtouchcommon/interfaces/G3XEisEvents"},(0,i.kt)("inlineCode",{parentName:"a"},"G3XEisEvents"))," interface). The value should be ",(0,i.kt)("inlineCode",{parentName:"p"},"true")," when the engine page is open and ",(0,i.kt)("inlineCode",{parentName:"p"},"false")," when the engine page is closed. The value should be published with the a ",(0,i.kt)("inlineCode",{parentName:"p"},"sync")," argument of ",(0,i.kt)("inlineCode",{parentName:"p"},"false")," and a ",(0,i.kt)("inlineCode",{parentName:"p"},"cached")," argument of ",(0,i.kt)("inlineCode",{parentName:"p"},"true"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},"bus.getPublisher<G3XEisEvents>()\n  .pub('g3x_eis_engine_page_is_open', isOpen, false, true);\n")))}m.isMDXComponent=!0},27105:(e,n,t)=>{t.d(n,{Z:()=>a});const a=t.p+"assets/images/eis-cf35e4d35fab324400be0d498e74c8bb.jpg"},71445:(e,n,t)=>{t.d(n,{Z:()=>a});const a=t.p+"assets/images/mfd-engine-page-a32dead5688ad103bd73f327e9e4b05e.jpg"}}]);