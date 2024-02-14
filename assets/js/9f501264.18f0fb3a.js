"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[78167],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>h});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),u=p(n),m=i,h=u["".concat(s,".").concat(m)]||u[m]||c[m]||r;return n?a.createElement(h,o(o({ref:t},d),{},{components:n})):a.createElement(h,o({ref:t},d))}));function h(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<r;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},27220:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var a=n(87462),i=(n(67294),n(3905));const r={sidebar_label:"panel.xml Basics",sidebar_position:3},o="G3X `panel.xml` Basics",l={unversionedId:"g3xtouch/panel-xml-basics",id:"g3xtouch/panel-xml-basics",title:"G3X `panel.xml` Basics",description:"Introduction",source:"@site/docs/g3xtouch/panel-xml-basics.md",sourceDirName:"g3xtouch",slug:"/g3xtouch/panel-xml-basics",permalink:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-basics",draft:!1,tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_label:"panel.xml Basics",sidebar_position:3},sidebar:"sidebar",previous:{title:"Instrument Setup",permalink:"/msfs-avionics-mirror/docs/g3xtouch/instrument-setup"},next:{title:"panel.xml Tag Documentation",permalink:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation"}},s={},p=[{value:"Introduction",id:"introduction",level:2},{value:"File Structure",id:"file-structure",level:2},{value:"Tag Scope",id:"tag-scope",level:2},{value:"Global vs. Instrument-Specific Options",id:"global-vs-instrument-specific-options",level:2},{value:"Required vs. Optional Tags",id:"required-vs-optional-tags",level:2},{value:"Option Inheritance",id:"option-inheritance",level:2},{value:"Redundant Tags",id:"redundant-tags",level:2},{value:"Numeric Tags and Operators",id:"numeric-tags-and-operators",level:2}],d={toc:p},u="wrapper";function c(e){let{components:t,...n}=e;return(0,i.kt)(u,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"g3x-panelxml-basics"},"G3X ",(0,i.kt)("inlineCode",{parentName:"h1"},"panel.xml")," Basics"),(0,i.kt)("h2",{id:"introduction"},"Introduction"),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," file allows developers to configure their aircraft-specific G3X Touch installation. A basic understanding of the XML language is recommended when working with ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml"),"."),(0,i.kt)("h2",{id:"file-structure"},"File Structure"),(0,i.kt)("p",null,"Below is an example of a simple ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," file:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},"<PlaneHTMLConfig>\n\n  <G3X>\n  </G3X>\n\n  <Instrument>\n    <Name>G3XTouch_1</Name>\n  </Instrument>\n\n  <Instrument>\n    <Name>G3XTouch_2</Name>\n  </Instrument>\n\n</PlaneHTMLConfig>\n")),(0,i.kt)("p",null,"The file contains the root tag ",(0,i.kt)("inlineCode",{parentName:"p"},"<PlaneHTMLConfig>")," under which all other tags must be placed. All options for the G3X Touch are located either within the ",(0,i.kt)("inlineCode",{parentName:"p"},"<G3X>")," tag or within one of the G3X Touch ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tags."),(0,i.kt)("p",null,"There can only be one ",(0,i.kt)("inlineCode",{parentName:"p"},"<G3X>")," tag. If there are multiple copies, then all of them except the first will be ignored."),(0,i.kt)("p",null,"There is one ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag for each JS/HTML instrument in the plane. The ",(0,i.kt)("inlineCode",{parentName:"p"},"<Name>")," tag identifies the specific instrument referenced by its parent ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag. Only those ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tags that declare a proper G3X Touch name will be parsed by the G3X Touch. In the above example, there are two declared G3X Touch instruments."),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"G3X Touch instrument names are standardized to the following format: ",(0,i.kt)("inlineCode",{parentName:"p"},"G3XTouch_[index]"),", where ",(0,i.kt)("inlineCode",{parentName:"p"},"index")," is 1, 2, 3, etc.")),(0,i.kt)("h2",{id:"tag-scope"},"Tag Scope"),(0,i.kt)("p",null,"Each tag parsed by the G3X Touch has a required ",(0,i.kt)("strong",{parentName:"p"},"scope"),", defined as the parent under which it must be placed. If a tag is placed in an incorrect scope, it may not be parsed at all or it may be interpreted as a different type of tag with the same name. Therefore, it is important to ensure that all tags are defined in the correct scope."),(0,i.kt)("p",null,"The ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation"},"tags documentation"),' details the scope of each tag. When the scope is listed as "Global", this means the tag should be placed directly under the ',(0,i.kt)("inlineCode",{parentName:"p"},"<G3X>"),' tag. When the scope is listed as "Instrument", this means the tag should be placed directly under a G3X Touch ',(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag."),(0,i.kt)("h2",{id:"global-vs-instrument-specific-options"},"Global vs. Instrument-Specific Options"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," options can either be global or specific to a particular instrument. Tags that are descendants of an ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag define options specific to the instrument referenced by their parent ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag. Tags that are not descendants of any ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag define global options."),(0,i.kt)("p",null,"Certain instrument-specific tags can be defined globally by placing them them in the global scope (directly under the ",(0,i.kt)("inlineCode",{parentName:"p"},"<G3X>")," tag) instead of under an ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag. When doing so, the option will apply to ",(0,i.kt)("em",{parentName:"p"},"all")," instruments that support the option. If an instrument-specific tag is defined both globally and within a ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag, then the version defined within the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag will override the global one."),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"Not all instrument-specific tags can be defined globally. Please refer to the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation"},"tags documentation")," to find which ones can be defined globally and which ones cannot.")),(0,i.kt)("h2",{id:"required-vs-optional-tags"},"Required vs. Optional Tags"),(0,i.kt)("p",null,"Tags and attributes can either be required or optional. Required tags/attributes must be explicitly defined for ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," to be successfully parsed. If a required tag/attribute is missing, the G3X Touch will throw a Javascript error during initialization with a message describing what was missing. Optional tags/attributes do not have to be explicitly defined, and omitting these will have no adverse effects. When an optional tag/attribute is omitted, the option it defines will revert to a default value."),(0,i.kt)("p",null,"The ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3xtouch/panel-xml-tag-documentation"},"tags documentation")," details which tags and attributes are required and which are optional, as well as the default values for optional tags/attributes."),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"If the G3X Touch detects that an optional attribute or tag was not formatted correctly (e.g. a mis-spelled option, an out-of-bounds numeral, etc), it will emit a console warning and revert the option to its default value. Therefore, during development it is recommended that you monitor the console output of all instruments to ensure that ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml")," is being parsed cleanly.")),(0,i.kt)("h2",{id:"option-inheritance"},"Option Inheritance"),(0,i.kt)("p",null,"Certain complex instrument-specific option tags support a basic form of inheritance. This allows you to define similar, but not identical, options in multiple instruments without needing to duplicate the entire tag subtree for each instrument. Here is an example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},'<G3X>\n  <AirspeedIndicator id="base-airspeed">\n    <Scale min="30" max="999" window="60" major-tick-interval="10" minor-tick-factor="2">\n  </AirspeedIndicator>\n</G3X>\n\n<Instrument>\n  <Name>G3XTouch_1</Name>\n\n  <AirspeedIndicator inherit="base-airspeed" />\n    <VSpeedBugs>\n      <Bug name="r" label="R" />\n    </VSpeedBugs>\n  </AirspeedIndicator>\n</Instrument>\n\n<Instrument>\n  <Name>G3XTouch_2</Name>\n\n  <AirspeedIndicator inherit="base-airspeed" />\n    <VSpeedBugs>\n      <Bug name="ref" label="REF" />\n    </VSpeedBugs>\n  </AirspeedIndicator>\n</Instrument>\n')),(0,i.kt)("p",null,"Here, the two ",(0,i.kt)("inlineCode",{parentName:"p"},"<AirspeedIndicator>")," tags defined for the ",(0,i.kt)("inlineCode",{parentName:"p"},"G3XTouch_1")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"G3XTouch_2")," instruments both inherit from the globally defined ",(0,i.kt)("inlineCode",{parentName:"p"},"<AirspeedIndicator>")," tag. Inheritance is enabled for these tags by the presence of the ",(0,i.kt)("inlineCode",{parentName:"p"},"inherit")," attribute, which defines the ID of the tag from which they inherit (in this case: ",(0,i.kt)("inlineCode",{parentName:"p"},"base-airspeed"),")."),(0,i.kt)("p",null,"When inheriting, a tag copies all descendants and attributes that it does not explicitly define itself from the source tag. In the example, the two instrument-specific ",(0,i.kt)("inlineCode",{parentName:"p"},"<AirspeedIndicator>")," tags inherit the ",(0,i.kt)("inlineCode",{parentName:"p"},"<Scale>")," tag from ",(0,i.kt)("inlineCode",{parentName:"p"},"#base-airspeed"),". The instrument-specific ",(0,i.kt)("inlineCode",{parentName:"p"},"<AirspeedIndicator>")," tags also define their own (different) ",(0,i.kt)("inlineCode",{parentName:"p"},"<VSpeedBugs>")," tags. If ",(0,i.kt)("inlineCode",{parentName:"p"},"#base-airspeed")," had defined its own ",(0,i.kt)("inlineCode",{parentName:"p"},"<VSpeedBugs>")," tag, it would not be inherited by the instrument-specific tags."),(0,i.kt)("h2",{id:"redundant-tags"},"Redundant Tags"),(0,i.kt)("p",null,"When you define multiple copies of a tag that is meant to be a singleton, only the first instance of the tag (in tree order) will apply. Take the following example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},'<Instrument>\n  <Name>G3XTouch_1</Name>\n\n  <AirspeedIndicator id="base-airspeed">\n    <Scale min="30" window="60">\n  </AirspeedIndicator>\n\n  <AirspeedIndicator id="base-airspeed">\n    <Scale min="20" window="70">\n  </AirspeedIndicator>\n</Instrument>\n')),(0,i.kt)("p",null,"Of the two ",(0,i.kt)("inlineCode",{parentName:"p"},"<AirspeedIndicator>")," tags defined for ",(0,i.kt)("inlineCode",{parentName:"p"},"G3XTouch_1"),", only the top one will apply. As a result, the PFD will have an airspeed indicator with a minimum value of 30 knots and a window size of 60 knots."),(0,i.kt)("h2",{id:"numeric-tags-and-operators"},"Numeric Tags and Operators"),(0,i.kt)("p",null,"Certain G3X Touch-specific tags define numeric values. One such tag is the generic ",(0,i.kt)("inlineCode",{parentName:"p"},"<Number>"),", which is a numeric tag that returns a constant value equal to its content (for example, ",(0,i.kt)("inlineCode",{parentName:"p"},"<Number>0</Number>")," returns a value of zero). Other numeric tags may return values with more complicated logic."),(0,i.kt)("p",null,"Numeric tags can be used together with numeric operator tags to generate computed numeric values. Each numeric operator tag accepts one or more numeric tags as children (the operands) and outputs the result of the operation as a new numeric value. Numeric operators also are considered numeric tags, so they can be used as operands of other numeric operator tags."),(0,i.kt)("p",null,"The available numeric operator tags are:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Operator"),(0,i.kt)("th",{parentName:"tr",align:null},"Operand Count"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"<Min>")),(0,i.kt)("td",{parentName:"tr",align:null},"One or More"),(0,i.kt)("td",{parentName:"tr",align:null},"Returns the minimum value among all operands.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"<Max>")),(0,i.kt)("td",{parentName:"tr",align:null},"One or More"),(0,i.kt)("td",{parentName:"tr",align:null},"Returns the maximum value among all operands.")))),(0,i.kt)("p",null,"The following are examples of numeric operator usage:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},"\x3c!-- Always returns 0 --\x3e\n<Min>\n  <Number>0</Number>\n  <Number>5</Number>\n  <Number>10</Number>\n</Min>\n\n\x3c!-- Always returns 100 --\x3e\n<Max>\n  <Number>10</Number>\n  <Min>\n    <Number>100</Number>\n    <Number>1000</Number>\n  </Min>\n</Max>\n")))}c.isMDXComponent=!0}}]);