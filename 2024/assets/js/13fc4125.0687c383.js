"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["405510"],{598715:function(e,i,n){n.r(i),n.d(i,{metadata:()=>s,contentTitle:()=>a,default:()=>h,assets:()=>t,toc:()=>d,frontMatter:()=>l});var s=JSON.parse('{"id":"api/framework/type-aliases/GPSSatelliteTimingOptions","title":"Type Alias: GPSSatelliteTimingOptions","description":"GPSSatelliteTimingOptions: object","source":"@site/docs/api/framework/type-aliases/GPSSatelliteTimingOptions.md","sourceDirName":"api/framework/type-aliases","slug":"/api/framework/type-aliases/GPSSatelliteTimingOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GPSSatelliteTimingOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GPSSatComputerOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GPSSatComputerOptions"},"next":{"title":"GpsSynchronizerOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GpsSynchronizerOptions"}}'),o=n("785893"),r=n("250065");let l={},a="Type Alias: GPSSatelliteTimingOptions",t={},d=[{value:"Type declaration",id:"type-declaration",level:2},{value:"acquisitionTime?",id:"acquisitiontime",level:3},{value:"acquisitionTimeout?",id:"acquisitiontimeout",level:3},{value:"acquisitionTimeRange?",id:"acquisitiontimerange",level:3},{value:"acquisitionTimeRangeWithEphemeris?",id:"acquisitiontimerangewithephemeris",level:3},{value:"acquisitionTimeWithEphemeris?",id:"acquisitiontimewithephemeris",level:3},{value:"almanacDownloadTime?",id:"almanacdownloadtime",level:3},{value:"almanacExpireTime?",id:"almanacexpiretime",level:3},{value:"ephemerisDownloadTime?",id:"ephemerisdownloadtime",level:3},{value:"ephemerisExpireTime?",id:"ephemerisexpiretime",level:3},{value:"sbasCorrectionDownloadTime?",id:"sbascorrectiondownloadtime",level:3},{value:"sbasCorrectionDownloadTimeRange?",id:"sbascorrectiondownloadtimerange",level:3},{value:"sbasEphemerisDownloadTime?",id:"sbasephemerisdownloadtime",level:3},{value:"sbasEphemerisDownloadTimeRange?",id:"sbasephemerisdownloadtimerange",level:3},{value:"unreachableExpireTime?",id:"unreachableexpiretime",level:3},{value:"Defined in",id:"defined-in",level:2}];function c(e){let i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",strong:"strong",...(0,r.a)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(i.header,{children:(0,o.jsx)(i.h1,{id:"type-alias-gpssatellitetimingoptions",children:"Type Alias: GPSSatelliteTimingOptions"})}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.strong,{children:"GPSSatelliteTimingOptions"}),": ",(0,o.jsx)(i.code,{children:"object"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["Options describing the timings of ",(0,o.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GPSSatellite",children:"GPSSatellite"})," state changes."]}),"\n",(0,o.jsx)(i.h2,{id:"type-declaration",children:"Type declaration"}),"\n",(0,o.jsx)(i.h3,{id:"acquisitiontime",children:"acquisitionTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"acquisitionTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The average time required to acquire a satellite signal without valid ephemeris data, in milliseconds. Defaults to\n",(0,o.jsx)(i.code,{children:"30000"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"acquisitiontimeout",children:"acquisitionTimeout?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"acquisitionTimeout"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The amount of time spent searching for a satellite signal, in milliseconds, before the satellite is declared\nunreachable. Defaults to ",(0,o.jsx)(i.code,{children:"60000"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"acquisitiontimerange",children:"acquisitionTimeRange?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"acquisitionTimeRange"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The difference between the maximum and minimum time required to acquire a satellite signal without valid ephemeris\ndata, in milliseconds. The range is centered on the average (",(0,o.jsx)(i.code,{children:"acquisitionTime"}),"). Defaults to ",(0,o.jsx)(i.code,{children:"15000"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"acquisitiontimerangewithephemeris",children:"acquisitionTimeRangeWithEphemeris?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"acquisitionTimeRangeWithEphemeris"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The difference between the maximum and minimum time required to acquire a satellite signal with valid ephemeris\ndata, in milliseconds. The range is centered on the average (",(0,o.jsx)(i.code,{children:"acquisitionTimeWithEphemeris"}),"). Defaults to ",(0,o.jsx)(i.code,{children:"5000"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"acquisitiontimewithephemeris",children:"acquisitionTimeWithEphemeris?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"acquisitionTimeWithEphemeris"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The average time required to acquire a satellite signal with valid ephemeris data, in milliseconds. Defaults to\n",(0,o.jsx)(i.code,{children:"15000"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"almanacdownloadtime",children:"almanacDownloadTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"almanacDownloadTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The time required to download a complete almanac from a non-SBAS satellite, in milliseconds. Defaults to ",(0,o.jsx)(i.code,{children:"750000"}),"\n(12.5 minutes)."]}),"\n",(0,o.jsx)(i.h3,{id:"almanacexpiretime",children:"almanacExpireTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"almanacExpireTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The amount of elapsed time (bidirectional) required for a downloaded almanac to expire, in milliseconds. Defaults\nto ",(0,o.jsx)(i.code,{children:"7776000000"})," (90 days)."]}),"\n",(0,o.jsx)(i.h3,{id:"ephemerisdownloadtime",children:"ephemerisDownloadTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"ephemerisDownloadTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The time required to download ephemeris data from a non-SBAS satellite, in milliseconds. Defaults to ",(0,o.jsx)(i.code,{children:"30000"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"ephemerisexpiretime",children:"ephemerisExpireTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"ephemerisExpireTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The amount of elapsed time (bidirectional) required for ephemeris data to expire, in milliseconds. Defaults to\n",(0,o.jsx)(i.code,{children:"7200000"})," (2 hours)."]}),"\n",(0,o.jsx)(i.h3,{id:"sbascorrectiondownloadtime",children:"sbasCorrectionDownloadTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"sbasCorrectionDownloadTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The average time required to download differential correction data from an SBAS satellite, in milliseconds.\nDefaults to ",(0,o.jsx)(i.code,{children:"150500"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"sbascorrectiondownloadtimerange",children:"sbasCorrectionDownloadTimeRange?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"sbasCorrectionDownloadTimeRange"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The difference between the maximum and minimum time required to download differential correction data from an SBAS\nsatellite, in milliseconds. The range is centered on the average (",(0,o.jsx)(i.code,{children:"sbasCorrectionDownloadTime"}),"). Defaults to\n",(0,o.jsx)(i.code,{children:"149500"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"sbasephemerisdownloadtime",children:"sbasEphemerisDownloadTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"sbasEphemerisDownloadTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The average time required to download ephemeris data from an SBAS satellite, in milliseconds. Defaults to\n",(0,o.jsx)(i.code,{children:"60500"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"sbasephemerisdownloadtimerange",children:"sbasEphemerisDownloadTimeRange?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"sbasEphemerisDownloadTimeRange"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The difference between the maximum and minimum time required to download ephemeris data from an SBAS satellite,\nin milliseconds. The range is centered on the average (",(0,o.jsx)(i.code,{children:"sbasEphemerisDownloadTime"}),"). Defaults to ",(0,o.jsx)(i.code,{children:"59500"}),"."]}),"\n",(0,o.jsx)(i.h3,{id:"unreachableexpiretime",children:"unreachableExpireTime?"}),"\n",(0,o.jsxs)(i.blockquote,{children:["\n",(0,o.jsxs)(i.p,{children:[(0,o.jsx)(i.code,{children:"optional"})," ",(0,o.jsx)(i.strong,{children:"unreachableExpireTime"}),": ",(0,o.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,o.jsxs)(i.p,{children:["The amount of elapsed time (bidirectional), in milliseconds, required for a satellite that was previously declared\nunreachable to be considered eligible for tracking again. Defaults to ",(0,o.jsx)(i.code,{children:"3600000"})," (1 hour)."]}),"\n",(0,o.jsx)(i.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,o.jsx)(i.p,{children:"src/sdk/instruments/GPSSat.ts:229"})]})}function h(e={}){let{wrapper:i}={...(0,r.a)(),...e.components};return i?(0,o.jsx)(i,{...e,children:(0,o.jsx)(c,{...e})}):c(e)}},250065:function(e,i,n){n.d(i,{Z:function(){return a},a:function(){return l}});var s=n(667294);let o={},r=s.createContext(o);function l(e){let i=s.useContext(r);return s.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function a(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:l(e.components),s.createElement(r.Provider,{value:i},e.children)}}}]);