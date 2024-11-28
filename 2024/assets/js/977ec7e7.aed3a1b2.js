"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["244597"],{545044:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>a,default:()=>h,assets:()=>l,toc:()=>c,frontMatter:()=>o});var s=JSON.parse('{"id":"api/garminsdk/type-aliases/GarminExcessiveDescentRateModuleOptions","title":"Type Alias: GarminExcessiveDescentRateModuleOptions","description":"GarminExcessiveDescentRateModuleOptions: object","source":"@site/docs/api/garminsdk/type-aliases/GarminExcessiveDescentRateModuleOptions.md","sourceDirName":"api/garminsdk/type-aliases","slug":"/api/garminsdk/type-aliases/GarminExcessiveDescentRateModuleOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminExcessiveDescentRateModuleOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GarminExcessiveDescentRateAlert","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminExcessiveDescentRateAlert"},"next":{"title":"GarminExistingUserWaypointsArrayOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/GarminExistingUserWaypointsArrayOptions"}}'),t=i("785893"),r=i("250065");let o={},a="Type Alias: GarminExcessiveDescentRateModuleOptions",l={},c=[{value:"Type declaration",id:"type-declaration",level:2},{value:"functionAsGpws?",id:"functionasgpws",level:3},{value:"inhibitFlags?",id:"inhibitflags",level:3},{value:"triggerDebounce?",id:"triggerdebounce",level:3},{value:"triggerHysteresis?",id:"triggerhysteresis",level:3},{value:"untriggerDebounce?",id:"untriggerdebounce",level:3},{value:"untriggerHysteresis?",id:"untriggerhysteresis",level:3},{value:"Defined in",id:"defined-in",level:2}];function d(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",strong:"strong",...(0,r.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"type-alias-garminexcessivedescentratemoduleoptions",children:"Type Alias: GarminExcessiveDescentRateModuleOptions"})}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"GarminExcessiveDescentRateModuleOptions"}),": ",(0,t.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["Configuration options for ",(0,t.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/GarminExcessiveDescentRateModule",children:"GarminExcessiveDescentRateModule"}),"."]}),"\n",(0,t.jsx)(n.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,t.jsx)(n.h3,{id:"functionasgpws",children:"functionAsGpws?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"functionAsGpws"}),": ",(0,t.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["Whether alerting should function as a GPWS alert. If ",(0,t.jsx)(n.code,{children:"true"}),", then radar altimeter data (up to 2500 feet AGL) will\nbe used to measure height above terrain, and alerting will be inhibited when the ",(0,t.jsx)(n.code,{children:"GarminTawsStatus.GpwsFailed"}),"\nstatus is active. If ",(0,t.jsx)(n.code,{children:"false"}),", then GPS altitude in conjunction with terrain database ground elevation will be used\nto measure height above terrain, and alerting will be inhibited when the ",(0,t.jsx)(n.code,{children:"GarminTawsStatus.TawsFailed"})," or\n",(0,t.jsx)(n.code,{children:"GarminTawsStatus.TawsNotAvailable"})," statuses are active. Defaults to ",(0,t.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,t.jsx)(n.h3,{id:"inhibitflags",children:"inhibitFlags?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"inhibitFlags"}),": ",(0,t.jsx)(n.code,{children:"Iterable"}),"<",(0,t.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The inhibit flags that should inhibit alerting. If not defined, then no flags will inhibit alerting."}),"\n",(0,t.jsx)(n.h3,{id:"triggerdebounce",children:"triggerDebounce?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"triggerDebounce"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The consecutive amount of time, in milliseconds, that the conditions for one of the module's alerts must be met\nbefore the alert is triggered. Defaults to ",(0,t.jsx)(n.code,{children:"2000"}),"."]}),"\n",(0,t.jsx)(n.h3,{id:"triggerhysteresis",children:"triggerHysteresis?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"triggerHysteresis"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The amount of time, in milliseconds, after an alert becomes triggered before it can be untriggered. Defaults to\n",(0,t.jsx)(n.code,{children:"5000"}),"."]}),"\n",(0,t.jsx)(n.h3,{id:"untriggerdebounce",children:"untriggerDebounce?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"untriggerDebounce"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The consecutive amount of time, in milliseconds, that the conditions for one of the module's alerts must not be\nmet before the alert is untriggered. Defaults to ",(0,t.jsx)(n.code,{children:"2000"}),"."]}),"\n",(0,t.jsx)(n.h3,{id:"untriggerhysteresis",children:"untriggerHysteresis?"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"optional"})," ",(0,t.jsx)(n.strong,{children:"untriggerHysteresis"}),": ",(0,t.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The amount of time, in milliseconds, after an alert becomes untriggered before it can be triggered. Defaults to\n",(0,t.jsx)(n.code,{children:"0"}),"."]}),"\n",(0,t.jsx)(n.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(n.p,{children:"src/garminsdk/terrain/modules/edr/GarminExcessiveDescentRateModule.ts:11"})]})}function h(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return a},a:function(){return o}});var s=i(667294);let t={},r=s.createContext(t);function o(e){let n=s.useContext(r);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:o(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);