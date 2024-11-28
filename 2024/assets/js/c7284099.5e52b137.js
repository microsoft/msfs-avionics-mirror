"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["451178"],{889991:function(e,n,i){i.r(n),i.d(n,{metadata:()=>s,contentTitle:()=>t,default:()=>h,assets:()=>c,toc:()=>a,frontMatter:()=>l});var s=JSON.parse('{"id":"api/g3xtouchcommon/interfaces/MfdPageNavBarProps","title":"Interface: MfdPageNavBarProps","description":"Component props for MfdPageNavBar.","source":"@site/docs/api/g3xtouchcommon/interfaces/MfdPageNavBarProps.md","sourceDirName":"api/g3xtouchcommon/interfaces","slug":"/api/g3xtouchcommon/interfaces/MfdPageNavBarProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/MfdPageNavBarProps","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"MfdPageContainerProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/MfdPageContainerProps"},"next":{"title":"MfdPageProps","permalink":"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/interfaces/MfdPageProps"}}'),d=i("785893"),r=i("250065");let l={},t="Interface: MfdPageNavBarProps",c={},a=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"children?",id:"children",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"labelWidth",id:"labelwidth",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"maxLabelsPerListPage",id:"maxlabelsperlistpage",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"onPageSelected()",id:"onpageselected",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"pageDefs",id:"pagedefs",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"pageSelectDialogKey",id:"pageselectdialogkey",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"ref?",id:"ref",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"selectedPageIconSrc",id:"selectedpageiconsrc",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"selectedPageKey",id:"selectedpagekey",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"selectedPageTitle",id:"selectedpagetitle",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"uiService",id:"uiservice",level:3},{value:"Defined in",id:"defined-in-10",level:4}];function o(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"interface-mfdpagenavbarprops",children:"Interface: MfdPageNavBarProps"})}),"\n",(0,d.jsxs)(n.p,{children:["Component props for ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/MfdPageNavBar",children:"MfdPageNavBar"}),"."]}),"\n",(0,d.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsx)(n.li,{children:(0,d.jsx)(n.code,{children:"ComponentProps"})}),"\n"]}),"\n",(0,d.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(n.h3,{id:"children",children:"children?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"children"}),": ",(0,d.jsx)(n.code,{children:"DisplayChildren"}),"[]"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The children of the display component."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"ComponentProps.children"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:122"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"labelwidth",children:"labelWidth"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"labelWidth"}),": ",(0,d.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The width of the each page label, in pixels, in the navigation bar's page list."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:42"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"maxlabelsperlistpage",children:"maxLabelsPerListPage"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"maxLabelsPerListPage"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The maximum number of page labels to show simultaneously in the navigation bar's page list."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:45"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"onpageselected",children:"onPageSelected()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"onPageSelected"}),": (",(0,d.jsx)(n.code,{children:"pageDef"}),") => ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A function which is called when a page is selected through the navigation bar."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"pageDef"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/MfdPageDefinition",children:(0,d.jsx)(n.code,{children:"MfdPageDefinition"})}),">"]}),(0,d.jsx)(n.td,{children:"The definition for the selected page."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:54"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"pagedefs",children:"pageDefs"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"pageDefs"}),": ",(0,d.jsx)(n.code,{children:"Iterable"}),"<",(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/type-aliases/MfdPageDefinition",children:(0,d.jsx)(n.code,{children:"MfdPageDefinition"})}),">>"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"An iterable of definitions for the navigation bar's selectable pages in the order in which their labels should\nappear in the navigation bar's page list."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:27"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"pageselectdialogkey",children:"pageSelectDialogKey"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"pageSelectDialogKey"}),": ",(0,d.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The key of the page select dialog to open when the navigation bar is pressed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:48"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"ref",children:"ref?"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"optional"})," ",(0,d.jsx)(n.strong,{children:"ref"}),": ",(0,d.jsx)(n.code,{children:"NodeReference"}),"<",(0,d.jsx)(n.code,{children:"any"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"A reference to the display component."}),"\n",(0,d.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"ComponentProps.ref"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/components/FSComponent.ts:125"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selectedpageiconsrc",children:"selectedPageIconSrc"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectedPageIconSrc"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The file path to the selected page's icon image asset."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:39"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selectedpagekey",children:"selectedPageKey"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectedPageKey"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The key of the selected page."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:33"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"selectedpagetitle",children:"selectedPageTitle"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"selectedPageTitle"}),": ",(0,d.jsx)(n.code,{children:"Subscribable"}),"<",(0,d.jsx)(n.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The selected page's title."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:36"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"uiservice",children:"uiService"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"uiService"}),": ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/g3xtouchcommon/classes/UiService",children:(0,d.jsx)(n.code,{children:"UiService"})})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"The UI service instance."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/workingtitle-instruments-g3x-touch/html_ui/MFD/Components/PageNavigation/MfdPageNavBar.tsx:30"})]})}function h(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return t},a:function(){return l}});var s=i(667294);let d={},r=s.createContext(d);function l(e){let n=s.useContext(r);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:l(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);