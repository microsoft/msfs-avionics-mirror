"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[98865],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>h});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),s=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),u=s(n),c=r,h=u["".concat(p,".").concat(c)]||u[c]||d[c]||i;return n?a.createElement(h,o(o({ref:t},m),{},{components:n})):a.createElement(h,o({ref:t},m))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=c;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[u]="string"==typeof e?e:r,o[1]=l;for(var s=2;s<i;s++)o[s]=n[s];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},82826:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var a=n(87462),r=(n(67294),n(3905));const i={sidebar_label:"Instrument Setup",sidebar_position:2},o="G3X Touch Instrument Setup",l={unversionedId:"g3xtouch/instrument-setup",id:"g3xtouch/instrument-setup",title:"G3X Touch Instrument Setup",description:"GDUs",source:"@site/docs/g3xtouch/instrument-setup.md",sourceDirName:"g3xtouch",slug:"/g3xtouch/instrument-setup",permalink:"/msfs-avionics-mirror/docs/g3xtouch/instrument-setup",draft:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_label:"Instrument Setup",sidebar_position:2},sidebar:"sidebar",previous:{title:"Overview",permalink:"/msfs-avionics-mirror/docs/g3xtouch/overview"},next:{title:"Model Behaviors",permalink:"/msfs-avionics-mirror/docs/g3xtouch/model-behaviors"}},p={},s=[{value:"GDUs",id:"gdus",level:2},{value:"<code>panel.cfg</code>",id:"panelcfg",level:2},{value:"<code>panel.xml</code>",id:"panelxml",level:2}],m={toc:s},u="wrapper";function d(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"g3x-touch-instrument-setup"},"G3X Touch Instrument Setup"),(0,r.kt)("h2",{id:"gdus"},"GDUs"),(0,r.kt)("p",null,"The G3X Touch consists of one or more display units called ",(0,r.kt)("strong",{parentName:"p"},"GDUs"),'. The real-world units come in two different form factors: 10.6" landscape (GDU 460-series) and 7" portrait (GDU 470-series). Currently, the G3X Touch package only supports the 10.6" landscape (GDU 460) format.'),(0,r.kt)("p",null,"Each GDU is represented in the sim by one Javascript/HTML instrument."),(0,r.kt)("h2",{id:"panelcfg"},(0,r.kt)("inlineCode",{parentName:"h2"},"panel.cfg")),(0,r.kt)("p",null,"To set up your aircraft's ",(0,r.kt)("inlineCode",{parentName:"p"},"panel.cfg")," for the G3X Touch, add one VCockpit entry for each GDU. Load the following HTML file for each instrument:"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"NavSystems/G3XTouch/G3XTouch.html")),(0,r.kt)("p",null,"Each instrument ",(0,r.kt)("em",{parentName:"p"},"must")," be indexed (even if there is only one G3X Touch instrument in your aircraft). Indexes start at 1 and increment by 1 for each additional instrument."),(0,r.kt)("p",null,"Each instrument should also be defined with a specific window size:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"GDU format"),(0,r.kt)("th",{parentName:"tr",align:null},"Width (px)"),(0,r.kt)("th",{parentName:"tr",align:null},"Height (px)"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"460"),(0,r.kt)("td",{parentName:"tr",align:null},"1280"),(0,r.kt)("td",{parentName:"tr",align:null},"768")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"470 (",(0,r.kt)("strong",{parentName:"td"},"not supported"),")"),(0,r.kt)("td",{parentName:"tr",align:null},"N/A"),(0,r.kt)("td",{parentName:"tr",align:null},"N/A")))),(0,r.kt)("p",null,"Here is an example of a full set of G3X Touch VCockpit entries, with two GDUs (note that the texture names are arbitrary; you are free to use names that are different from the ones in this example):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"[VCockpit01]\nsize_mm=1280,768\npixel_size=1280,768\ntexture=G3X_1\nhtmlgauge00=NavSystems/G3XTouch/G3XTouch.html?Index=1, 0,0,1280,768\n\n[VCockpit02]\nsize_mm=1280,768\npixel_size=1280,768\ntexture=G3X_2\nhtmlgauge00=NavSystems/G3XTouch/G3XTouch.html?Index=2, 0,0,1280,768\n")),(0,r.kt)("h2",{id:"panelxml"},(0,r.kt)("inlineCode",{parentName:"h2"},"panel.xml")),(0,r.kt)("p",null,"In addition to the above, you must declare all GDUs in the aircraft's ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-basics"},(0,r.kt)("inlineCode",{parentName:"a"},"panel.xml"))," file using the ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#gdudefs"},(0,r.kt)("inlineCode",{parentName:"a"},"<GduDefs>"))," tag. GDUs that are not properly declared in ",(0,r.kt)("inlineCode",{parentName:"p"},"panel.xml")," will fail to initialize and throw a Javascript runtime error."),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"panel.xml")," is also where you define the instrument type of each GDU. There are two instrument types: PFD and MFD. Both instrument types ultimately have the same functions and primarily differ in what information they present in their two panes:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Main Pane (always visible)"),(0,r.kt)("th",{parentName:"tr",align:null},"Splitscreen Pane (only visible in Splitscreen mode)"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"PFD"),(0,r.kt)("td",{parentName:"tr",align:null},"PFD display"),(0,r.kt)("td",{parentName:"tr",align:null},"MFD information (maps, flight plan, waypoint information, etc.)")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"MFD"),(0,r.kt)("td",{parentName:"tr",align:null},"MFD information (maps, flight plan, waypoint information, etc.)"),(0,r.kt)("td",{parentName:"tr",align:null},"PFD display or navigation map")))),(0,r.kt)("p",null,"Configuring the instrument type for GDUs is done via the ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation#gdu-gdudefs"},(0,r.kt)("inlineCode",{parentName:"a"},"<Gdu>"))," tag. For example, to declare two GDUs and designate the first as a PFD and the second as an MFD, you would create the following tags in ",(0,r.kt)("inlineCode",{parentName:"p"},"panel.xml"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-xml"},'<GduDefs count="2">\n  <Gdu index="1" type="PFD" type-index="1">\n  </Gdu>\n\n  <Gdu index="2" type="MFD" type-index="1">\n  </Gdu>\n<GduDefs>\n')),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"index")," attribute on each ",(0,r.kt)("inlineCode",{parentName:"p"},"<Gdu>")," tag references the GDU/instrument index (as declared in ",(0,r.kt)("inlineCode",{parentName:"p"},"panel.cfg"),"). The ",(0,r.kt)("inlineCode",{parentName:"p"},"type")," attribute defines the instrument type. The ",(0,r.kt)("inlineCode",{parentName:"p"},"type-index")," defines the index of the GDU within all GDUs of the same instrument type (in the above example, the GDUs are defined as PFD",(0,r.kt)("strong",{parentName:"p"},"1")," and MFD",(0,r.kt)("strong",{parentName:"p"},"1"),"). The combination of ",(0,r.kt)("inlineCode",{parentName:"p"},"type")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"type-index")," should be unique for each GDU."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"The assignment of a GDU's type and type index affects the behavior of GDU reversionary mode."),(0,r.kt)("p",{parentName:"admonition"},"For the purposes of reversionary mode, each GDU is assigned a ",(0,r.kt)("strong",{parentName:"p"},"cognate"),". The cognate of GDU ",(0,r.kt)("em",{parentName:"p"},"A")," is the GDU ",(0,r.kt)("em",{parentName:"p"},"X")," that satisfies the following two conditions: (1) ",(0,r.kt)("em",{parentName:"p"},"X"),"'s type is the opposite of ",(0,r.kt)("em",{parentName:"p"},"A"),"'s type, and (2) ",(0,r.kt)("em",{parentName:"p"},"X"),"'s type index is the largest type index less than or equal to ",(0,r.kt)("em",{parentName:"p"},"A"),"'s type index among all GDUs with the same type as ",(0,r.kt)("em",{parentName:"p"},"X"),". Note that cognate relationships are not necessarily symmetric; ",(0,r.kt)("em",{parentName:"p"},"X")," being the cognate of ",(0,r.kt)("em",{parentName:"p"},"A")," does not guarantee that ",(0,r.kt)("em",{parentName:"p"},"A")," is the cognate of ",(0,r.kt)("em",{parentName:"p"},"X"),"."),(0,r.kt)("p",{parentName:"admonition"},"A GDU will enter reversionary mode when its cognate is not operating normally (either powered off or failed). If a GDU cannot be assigned a cognate, then it will never enter reversionary mode.")))}d.isMDXComponent=!0}}]);