"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[98865],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>h});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=a.createContext({}),p=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=p(e.components);return a.createElement(l.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),d=p(n),c=i,h=d["".concat(l,".").concat(c)]||d[c]||u[c]||r;return n?a.createElement(h,o(o({ref:t},m),{},{components:n})):a.createElement(h,o({ref:t},m))}));function h(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=c;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[d]="string"==typeof e?e:i,o[1]=s;for(var p=2;p<r;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},82826:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>u,frontMatter:()=>r,metadata:()=>s,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const r={sidebar_label:"Instrument Setup",sidebar_position:2},o="G3X Touch Instrument Setup",s={unversionedId:"g3xtouch/instrument-setup",id:"g3xtouch/instrument-setup",title:"G3X Touch Instrument Setup",description:"GDUs",source:"@site/docs/g3xtouch/instrument-setup.md",sourceDirName:"g3xtouch",slug:"/g3xtouch/instrument-setup",permalink:"/msfs-avionics-mirror/docs/g3xtouch/instrument-setup",draft:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_label:"Instrument Setup",sidebar_position:2},sidebar:"sidebar",previous:{title:"Overview",permalink:"/msfs-avionics-mirror/docs/g3xtouch/overview"},next:{title:"Model Behaviors",permalink:"/msfs-avionics-mirror/docs/g3xtouch/model-behaviors"}},l={},p=[{value:"GDUs",id:"gdus",level:2},{value:"<code>panel.cfg</code>",id:"panelcfg",level:2},{value:"<code>panel.xml</code>",id:"panelxml",level:2},{value:"Bing Map Instances",id:"bing-map-instances",level:2}],m={toc:p},d="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(d,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"g3x-touch-instrument-setup"},"G3X Touch Instrument Setup"),(0,i.kt)("h2",{id:"gdus"},"GDUs"),(0,i.kt)("p",null,"The G3X Touch consists of one or more display units called ",(0,i.kt)("strong",{parentName:"p"},"GDUs"),'. The real-world units come in two different form factors: 10.6" landscape (GDU 460-series) and 7" portrait (GDU 470-series). Currently, the G3X Touch package only supports the 10.6" landscape (GDU 460) format.'),(0,i.kt)("p",null,"Each GDU is represented in the sim by one Javascript/HTML instrument."),(0,i.kt)("h2",{id:"panelcfg"},(0,i.kt)("inlineCode",{parentName:"h2"},"panel.cfg")),(0,i.kt)("p",null,"To set up your aircraft's ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.cfg")," for the G3X Touch, add one VCockpit entry for each GDU. Load the following HTML file for each instrument:"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"NavSystems/G3XTouch/G3XTouch.html")),(0,i.kt)("p",null,"Each instrument ",(0,i.kt)("em",{parentName:"p"},"must")," be indexed (even if there is only one G3X Touch instrument in your aircraft). Indexes start at 1 and increment by 1 for each additional instrument."),(0,i.kt)("p",null,"Each instrument has a specific desired window size that depends on the format of the GDU:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"GDU format"),(0,i.kt)("th",{parentName:"tr",align:null},"Width (px)"),(0,i.kt)("th",{parentName:"tr",align:null},"Height (px)"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"460"),(0,i.kt)("td",{parentName:"tr",align:null},"1280"),(0,i.kt)("td",{parentName:"tr",align:null},"768")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"470 (",(0,i.kt)("strong",{parentName:"td"},"not supported"),")"),(0,i.kt)("td",{parentName:"tr",align:null},"N/A"),(0,i.kt)("td",{parentName:"tr",align:null},"N/A")))),(0,i.kt)("p",null,"Here is an example of a full set of G3X Touch VCockpit entries, with two GDUs (note that the texture names are arbitrary; you are free to use names that are different from the ones in this example):"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"[VCockpit01]\nsize_mm=1280,768\npixel_size=1280,768\ntexture=G3X_1\nhtmlgauge00=NavSystems/G3XTouch/G3XTouch.html?Index=1, 0,0,1280,768\n\n[VCockpit02]\nsize_mm=1280,768\npixel_size=1280,768\ntexture=G3X_2\nhtmlgauge00=NavSystems/G3XTouch/G3XTouch.html?Index=2, 0,0,1280,768\n")),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"When the cockpit 3D model uses a GDU screen texture that is not the correct 16:9 aspect ratio for the G3X Touch (this can be a common issue when converting from the legacy AS3X avionics, which uses a 16:10 aspect ratio), it is recommended to follow the rules below:"),(0,i.kt)("ul",{parentName:"admonition"},(0,i.kt)("li",{parentName:"ul"},"Specify the instrument's window size in the texture's aspect ratio (e.g. if the texture's aspect ratio is 16:10, the window size should also be 16:10). This prevents non-uniform stretching from happening."),(0,i.kt)("li",{parentName:"ul"},"Ensure the window size is at least as large as the desired window size for the GDU. Specifying a smaller window size will result in the rendered screen area being clipped.")),(0,i.kt)("p",{parentName:"admonition"},"If the specified window size is larger than the desired window size, the G3X Touch will only render to an area equal to the desired window size. This rendered area will be horizontally and vertically centered in the window. For example, if the window size for a GDU 460 is set to 1920x1080, then the actual rendered area will be a 1280x768 box with its top-left corner at x=320, y=156. Everything outside the rendered area will be transparent (and so will take on the color of the texture's background)."),(0,i.kt)("p",{parentName:"admonition"},"The sim's VCockpit system allows you to make the window size different from the instrument gauge size and offset the instrument gauge within the window. It is ",(0,i.kt)("strong",{parentName:"p"},"not")," recommended to use this feature. Having different instrument gauge and window sizes breaks the highlighting used by the sim's assisted checklist system.")),(0,i.kt)("h2",{id:"panelxml"},(0,i.kt)("inlineCode",{parentName:"h2"},"panel.xml")),(0,i.kt)("p",null,"In addition to the above, you must declare all GDUs in the aircraft's ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-basics"},(0,i.kt)("inlineCode",{parentName:"a"},"panel.xml"))," file using the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#gdudefs"},(0,i.kt)("inlineCode",{parentName:"a"},"<GduDefs>"))," tag. GDUs that are not properly declared in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," will fail to initialize and throw a Javascript runtime error."),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," is also where you define the instrument type of each GDU. There are two instrument types: PFD and MFD. Both instrument types ultimately have the same functions and primarily differ in what information they present in their two panes:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Main Pane (always visible)"),(0,i.kt)("th",{parentName:"tr",align:null},"Splitscreen Pane (only visible in Splitscreen mode)"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"PFD"),(0,i.kt)("td",{parentName:"tr",align:null},"PFD display"),(0,i.kt)("td",{parentName:"tr",align:null},"MFD information (maps, flight plan, waypoint information, etc.)")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"MFD"),(0,i.kt)("td",{parentName:"tr",align:null},"MFD information (maps, flight plan, waypoint information, etc.)"),(0,i.kt)("td",{parentName:"tr",align:null},"PFD display or navigation map")))),(0,i.kt)("p",null,"Configuring the instrument type for GDUs is done via the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#gdu-gdudefs"},(0,i.kt)("inlineCode",{parentName:"a"},"<Gdu>"))," tag. For example, to declare two GDUs and designate the first as a PFD and the second as an MFD, you would create the following tags in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},'<GduDefs count="2">\n  <Gdu index="1" type="PFD" type-index="1">\n  </Gdu>\n\n  <Gdu index="2" type="MFD" type-index="1">\n  </Gdu>\n<GduDefs>\n')),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"index")," attribute on each ",(0,i.kt)("inlineCode",{parentName:"p"},"<Gdu>")," tag references the GDU/instrument index (as declared in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.cfg"),"). The ",(0,i.kt)("inlineCode",{parentName:"p"},"type")," attribute defines the instrument type. The ",(0,i.kt)("inlineCode",{parentName:"p"},"type-index")," defines the index of the GDU within all GDUs of the same instrument type (in the above example, the GDUs are defined as PFD",(0,i.kt)("strong",{parentName:"p"},"1")," and MFD",(0,i.kt)("strong",{parentName:"p"},"1"),"). The combination of ",(0,i.kt)("inlineCode",{parentName:"p"},"type")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"type-index")," should be unique for each GDU."),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"The assignment of a GDU's type and type index affects the behavior of GDU reversionary mode."),(0,i.kt)("p",{parentName:"admonition"},"For the purposes of reversionary mode, each GDU is assigned a ",(0,i.kt)("strong",{parentName:"p"},"cognate"),". The cognate of GDU ",(0,i.kt)("em",{parentName:"p"},"A")," is the GDU ",(0,i.kt)("em",{parentName:"p"},"X")," that satisfies the following two conditions: (1) ",(0,i.kt)("em",{parentName:"p"},"X"),"'s type is the opposite of ",(0,i.kt)("em",{parentName:"p"},"A"),"'s type, and (2) ",(0,i.kt)("em",{parentName:"p"},"X"),"'s type index is the largest type index less than or equal to ",(0,i.kt)("em",{parentName:"p"},"A"),"'s type index among all GDUs with the same type as ",(0,i.kt)("em",{parentName:"p"},"X"),". Note that cognate relationships are not necessarily symmetric; ",(0,i.kt)("em",{parentName:"p"},"X")," being the cognate of ",(0,i.kt)("em",{parentName:"p"},"A")," does not guarantee that ",(0,i.kt)("em",{parentName:"p"},"A")," is the cognate of ",(0,i.kt)("em",{parentName:"p"},"X"),"."),(0,i.kt)("p",{parentName:"admonition"},"A GDU will enter reversionary mode when its cognate is not operating normally (either powered off or failed). If a GDU cannot be assigned a cognate, then it will never enter reversionary mode.")),(0,i.kt)("h2",{id:"bing-map-instances"},"Bing Map Instances"),(0,i.kt)("p",null,"The G3X Touch uses Bing map instances provided by the sim to draw the terrain and weather layers for moving maps and to draw the SVT (synthetic vision) display. The sim restricts the total number of Bing map instances used by an airplane to ten. Each G3X Touch GDU by default uses four Bing map instances. Additionally, the sim's VFR Map panel uses one Bing map instance. This means that an airplane can have at most two default G3X Touch GDUs and still stay under the Bing map instance limit, assuming the only instance used by non-G3X code is the VFR Map."),(0,i.kt)("p",null,"For airplanes with more than two G3X Touch GDUs or those that include non-G3X instruments that use additional Bing map instances, compromises must be made to stay under the ten-instance limit. The G3X Touch provides the option to disable certain features to reduce the number of Bing map instances per GDU. These optimizations can be configured using the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#bingmapopt"},(0,i.kt)("inlineCode",{parentName:"a"},"<BingMapOpt>"))," tag in ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml"),"."),(0,i.kt)("p",null,"Bing map optimizations can be applied globally to all GDUs or on a per-GDU basis (see ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-basics#global-vs-instrument-specific-options"},"here")," for an explanation on how to apply a tag globally versus to a specific instrument). There are two optimizations available, and each reduces the number of used Bing map instances by one per GDU:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Disable the PFD Inset Map and the PFD Map Page."),(0,i.kt)("li",{parentName:"ul"},"Disable the PFD SVT (synthetic vision) display.")),(0,i.kt)("p",null,"When an optimization is applied, users will not be able to select or enable the features disabled by the optimization. The option for the features will still be accessible and visible in the G3X Touch's menus but will be marked as disabled. When enabling these optimizations for your airplane, it is recommended to clearly communicate to your users that the corresponding features are not available by design."))}u.isMDXComponent=!0}}]);