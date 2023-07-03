"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[5025],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>v});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=c(n),h=a,v=m["".concat(l,".").concat(h)]||m[h]||u[h]||i;return n?r.createElement(v,o(o({ref:t},p),{},{components:n})):r.createElement(v,o({ref:t},p))}));function v(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=h;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[m]="string"==typeof e?e:a,o[1]=s;for(var c=2;c<i;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}h.displayName="MDXCreateElement"},30243:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>c});var r=n(87462),a=(n(67294),n(3905));const i={sidebar_position:2},o="Key Events",s={unversionedId:"interacting-with-msfs/key-events",id:"interacting-with-msfs/key-events",title:"Key Events",description:"Introduction",source:"@site/docs/interacting-with-msfs/key-events.md",sourceDirName:"interacting-with-msfs",slug:"/interacting-with-msfs/key-events",permalink:"/msfs-avionics-mirror/docs/interacting-with-msfs/key-events",draft:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"sidebar",previous:{title:"SimVars",permalink:"/msfs-avionics-mirror/docs/interacting-with-msfs/simvars"},next:{title:"Receiving H Events",permalink:"/msfs-avionics-mirror/docs/interacting-with-msfs/receiving-h-events"}},l={},c=[{value:"Introduction",id:"introduction",level:2},{value:"Initiating A Key Event",id:"initiating-a-key-event",level:2},{value:"Listening For A Key Event",id:"listening-for-a-key-event",level:2},{value:"More Information",id:"more-information",level:2}],p={toc:c},m="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"key-events"},"Key Events"),(0,a.kt)("h2",{id:"introduction"},"Introduction"),(0,a.kt)("p",null,"Key Events represent the MSFS control binding system: all controls that are bindable though the simulator controls menu are available to also be driven and read via code. Examples of things you can bind in the controls menu would be pressing various autopilot buttons, moving your trim axis, turning on an engine starter, and the like."),(0,a.kt)("p",null,"All of these events have names within MSFS and we can use the names to interact with those events within Javascript."),(0,a.kt)("h2",{id:"initiating-a-key-event"},"Initiating A Key Event"),(0,a.kt)("p",null,"In the Javascript framework, key events are run by using the SimVar class, and prefixing the key event name with a ",(0,a.kt)("strong",{parentName:"p"},"K:")," (which gives key events their alternate name, K events). For example, to send the simulator the event to increase the flaps position:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"//Will do the same thing as if the button bound to 'Flaps Increase' in the\n//menu was pressed\nSimVar.SetSimVarValue('K:FLAPS_INCR', 'number', 0);\n")),(0,a.kt)("p",null,"For events that don't take a value, the second two parameters are ignored. But, some key events ",(0,a.kt)("em",{parentName:"p"},"do")," take a value (such as a control axis):"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"SimVar.SetSimVarValue('K:AXIS_ELEVATOR_SET', 'number', -8225);\n")),(0,a.kt)("h2",{id:"listening-for-a-key-event"},"Listening For A Key Event"),(0,a.kt)("p",null,"For many addons, it can be beneficial to also be notified when a key event has been received by the simulator, and then take appropriate action. This could be augmenting some action the sim is already taking, or even blocking the sim from recieving the event altogether and entirely replacing behavior."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"//The key intercept manager requires a EventBus to publish to\nconst eventBus = new EventBus();\n\n//Get the key intercept manager\nconst manager = await KeyInterceptManager.getManager(eventBus);\n\n//Set the AP nav hold key event to be intercepted, but still pass through to the sim\nmanager.interceptKey('AP_NAV1_HOLD', true);\n\n//Set the AP master on/off key event to be intercepted, but _not_ pass through to the sim\nmanager.interceptKey('AP_MASTER', false);\n\nconst subscriber = eventBus.getSubscriber<KeyEvents>();\nsubscriber.on('key_intercept').handle(keyData => {\n  switch (keyData.key) {\n    case 'AP_NAV1_HOLD':\n      console.log('Toggled autopilot nav hold!');\n      break;\n    case 'AP_MASTER':\n      console.log('Toggled autopilot master!');\n      break;\n  }\n});\n")),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"If you have set the key intercept to ",(0,a.kt)("em",{parentName:"p"},"not")," pass through to the simulator, the simulator will not respond to the key event in any way: from the inside of the simulator's perspective, the key event was never sent. This is a very powerful tool for crafting custom behavior for many complex systems, but requires some care.")),(0,a.kt)("h2",{id:"more-information"},"More Information"),(0,a.kt)("p",null,"For more information about the key event IDs that are available and what they do, please see the ",(0,a.kt)("a",{parentName:"p",href:"https://docs.flightsimulator.com/html/index.htm#t=Programming_Tools%2FSimVars%2FEvent_IDs.htm"},"MSFS SDK Documentation"),"."))}u.isMDXComponent=!0}}]);