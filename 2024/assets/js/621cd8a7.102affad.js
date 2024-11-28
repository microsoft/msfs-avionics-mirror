"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["538757"],{455444:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>o,default:()=>h,assets:()=>t,toc:()=>c,frontMatter:()=>l});var s=JSON.parse('{"id":"api/g3000common/classes/TerrainSystemConfig","title":"Class: TerrainSystemConfig","description":"A configuration object which defines options related to terrain alerting systems.","source":"@site/docs/api/g3000common/classes/TerrainSystemConfig.md","sourceDirName":"api/g3000common/classes","slug":"/api/g3000common/classes/TerrainSystemConfig","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/TerrainSystemConfig","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"TerrainSystemAnnunciation","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/TerrainSystemAnnunciation"},"next":{"title":"TestingUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/TestingUtils"}}'),r=i("785893"),d=i("250065");let l={},o="Class: TerrainSystemConfig",t={},c=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new TerrainSystemConfig()",id:"new-terrainsystemconfig",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"isResolvableConfig",id:"isresolvableconfig",level:3},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"moduleConfigs",id:"moduleconfigs",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"pfdAnnuncOptions",id:"pfdannuncoptions",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"primaryInhibitFlagDefs",id:"primaryinhibitflagdefs",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"settingsPageInhibitDefs",id:"settingspageinhibitdefs",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"touchdownCallouts?",id:"touchdowncallouts",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"type",id:"type",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"resolve()",id:"resolve",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Implementation of",id:"implementation-of-1",level:4},{value:"Defined in",id:"defined-in-8",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-terrainsystemconfig",children:"Class: TerrainSystemConfig"})}),"\n",(0,r.jsx)(n.p,{children:"A configuration object which defines options related to terrain alerting systems."}),"\n",(0,r.jsx)(n.h2,{id:"implements",children:"Implements"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/interfaces/ResolvableConfig",children:(0,r.jsx)(n.code,{children:"ResolvableConfig"})}),"<(",(0,r.jsx)(n.code,{children:"bus"}),", ",(0,r.jsx)(n.code,{children:"fms"}),", ",(0,r.jsx)(n.code,{children:"dataProvider"}),") => ",(0,r.jsx)(n.code,{children:"TerrainSystem"})," | ",(0,r.jsx)(n.code,{children:"null"}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-terrainsystemconfig",children:"new TerrainSystemConfig()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new TerrainSystemConfig"}),"(",(0,r.jsx)(n.code,{children:"baseInstrument"}),", ",(0,r.jsx)(n.code,{children:"element"}),"): ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/TerrainSystemConfig",children:(0,r.jsx)(n.code,{children:"TerrainSystemConfig"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Creates a new TerrainSystemConfig from a configuration document element."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"baseInstrument"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"BaseInstrument"})}),(0,r.jsxs)(n.td,{children:["The ",(0,r.jsx)(n.code,{children:"BaseInstrument"})," element associated with the configuration."]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"element"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"undefined"})," | ",(0,r.jsx)(n.code,{children:"Element"})]}),(0,r.jsx)(n.td,{children:"The configuration document element from which to parse the configuration object."})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/TerrainSystemConfig",children:(0,r.jsx)(n.code,{children:"TerrainSystemConfig"})})}),"\n",(0,r.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:108"}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"isresolvableconfig",children:"isResolvableConfig"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"isResolvableConfig"}),": ",(0,r.jsx)(n.code,{children:"true"})," = ",(0,r.jsx)(n.code,{children:"true"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Flags this object as a ResolvableConfig."}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/interfaces/ResolvableConfig",children:(0,r.jsx)(n.code,{children:"ResolvableConfig"})}),".",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/interfaces/ResolvableConfig#isresolvableconfig",children:(0,r.jsx)(n.code,{children:"isResolvableConfig"})})]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:77"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"moduleconfigs",children:"moduleConfigs"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"moduleConfigs"}),": readonly ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/interfaces/TerrainSystemModuleConfig",children:(0,r.jsx)(n.code,{children:"TerrainSystemModuleConfig"})}),"[]"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Configuration objects defining the modules to be included by the terrain system."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:83"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"pfdannuncoptions",children:"pfdAnnuncOptions"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"pfdAnnuncOptions"}),": ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/type-aliases/PfdTerrainSystemAnnuncOptions",children:(0,r.jsx)(n.code,{children:"PfdTerrainSystemAnnuncOptions"})}),">"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Options for PFD terrain system annunciations."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:101"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"primaryinhibitflagdefs",children:"primaryInhibitFlagDefs"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"primaryInhibitFlagDefs"}),": ",(0,r.jsx)(n.code,{children:"ReadonlyMap"}),"<",(0,r.jsx)(n.code,{children:"string"}),", ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/type-aliases/TerrainSystemModulePrimaryInhibitFlagDef",children:(0,r.jsx)(n.code,{children:"TerrainSystemModulePrimaryInhibitFlagDef"})}),">>"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"A map of terrain system alerts to their associated primary inhibit flag definitions."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:92"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"settingspageinhibitdefs",children:"settingsPageInhibitDefs"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"settingsPageInhibitDefs"}),": readonly ",(0,r.jsx)(n.code,{children:"Readonly"}),"<",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/type-aliases/TerrainSystemSettingsPageInhibitDef",children:(0,r.jsx)(n.code,{children:"TerrainSystemSettingsPageInhibitDef"})}),">[]"]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"An array of definitions for all GTC Terrain Settings page inhibit toggles. The definitions are in order of\ndecreasing priority."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:98"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"touchdowncallouts",children:"touchdownCallouts?"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.code,{children:"optional"})," ",(0,r.jsx)(n.strong,{children:"touchdownCallouts"}),": ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/classes/TouchdownCalloutsConfig",children:(0,r.jsx)(n.code,{children:"TouchdownCalloutsConfig"})})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["A config which defines options for touchdown callouts, or ",(0,r.jsx)(n.code,{children:"undefined"})," if the terrain system does not support\ntouchdown callouts."]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:89"}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"type",children:"type"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"readonly"})," ",(0,r.jsx)(n.strong,{children:"type"}),": ",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/type-aliases/G3000TerrainSystemType",children:(0,r.jsx)(n.code,{children:"G3000TerrainSystemType"})})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"The terrain system type."}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:80"}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"resolve",children:"resolve()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"resolve"}),"(): (",(0,r.jsx)(n.code,{children:"bus"}),", ",(0,r.jsx)(n.code,{children:"fms"}),", ",(0,r.jsx)(n.code,{children:"dataProvider"}),") => ",(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"TerrainSystem"})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Resolves this config to a value."}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"Function"})}),"\n",(0,r.jsx)(n.p,{children:"This config's resolved value."}),"\n",(0,r.jsx)(n.h5,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter"}),(0,r.jsx)(n.th,{children:"Type"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"bus"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"EventBus"})})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"fms"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"Fms"}),"<",(0,r.jsx)(n.code,{children:'""'}),">"]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"dataProvider"})}),(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"TerrainSystemDataProvider"})})]})]})]}),"\n",(0,r.jsx)(n.h5,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"null"})," | ",(0,r.jsx)(n.code,{children:"TerrainSystem"})]}),"\n",(0,r.jsx)(n.h4,{id:"implementation-of-1",children:"Implementation of"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/interfaces/ResolvableConfig",children:(0,r.jsx)(n.code,{children:"ResolvableConfig"})}),".",(0,r.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3000common/interfaces/ResolvableConfig#resolve",children:(0,r.jsx)(n.code,{children:"resolve"})})]}),"\n",(0,r.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,r.jsx)(n.p,{children:"src/workingtitle-instruments-g3000/html_ui/Shared/Terrain/TerrainSystemConfig.ts:376"})]})}function h(e={}){let{wrapper:n}={...(0,d.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return l}});var s=i(667294);let r={},d=s.createContext(r);function l(e){let n=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);