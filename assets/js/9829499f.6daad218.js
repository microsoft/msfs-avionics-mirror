"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[93390],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>u});var o=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,o,r=function(e,n){if(null==e)return{};var t,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)t=a[o],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)t=a[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=o.createContext({}),c=function(e){var n=o.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},d=function(e){var n=c(e.components);return o.createElement(s.Provider,{value:n},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},f=o.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=c(t),f=r,u=p["".concat(s,".").concat(f)]||p[f]||m[f]||a;return t?o.createElement(u,i(i({ref:n},d),{},{components:t})):o.createElement(u,i({ref:n},d))}));function u(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,i=new Array(a);i[0]=f;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[p]="string"==typeof e?e:r,i[1]=l;for(var c=2;c<a;c++)i[c]=t[c];return o.createElement.apply(null,i)}return o.createElement.apply(null,t)}f.displayName="MDXCreateElement"},24207:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>i,default:()=>m,frontMatter:()=>a,metadata:()=>l,toc:()=>c});var o=t(87462),r=(t(67294),t(3905));const a={sidebar_position:7},i="Refs and the Component Lifecycle",l={unversionedId:"getting-started/refs-and-component-lifecycle",id:"getting-started/refs-and-component-lifecycle",title:"Refs and the Component Lifecycle",description:"Calling Components and Elements Directly",source:"@site/docs/getting-started/refs-and-component-lifecycle.md",sourceDirName:"getting-started",slug:"/getting-started/refs-and-component-lifecycle",permalink:"/msfs-avionics-mirror/docs/getting-started/refs-and-component-lifecycle",draft:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"sidebar",previous:{title:"Using the Event Bus",permalink:"/msfs-avionics-mirror/docs/getting-started/using-the-event-bus"},next:{title:"SimVars",permalink:"/msfs-avionics-mirror/docs/interacting-with-msfs/simvars"}},s={},c=[{value:"Calling Components and Elements Directly",id:"calling-components-and-elements-directly",level:2},{value:"Lifecycle Methods Available on DisplayComponent",id:"lifecycle-methods-available-on-displaycomponent",level:2},{value:"<code>constructor()</code>",id:"constructor",level:3},{value:"<code>onBeforeRender()</code>",id:"onbeforerender",level:3},{value:"<code>onAfterRender()</code>",id:"onafterrender",level:3},{value:"Adding Dynamic Styling to a Component With Ref and Lifecyle Methods",id:"adding-dynamic-styling-to-a-component-with-ref-and-lifecyle-methods",level:2}],d={toc:c},p="wrapper";function m(e){let{components:n,...t}=e;return(0,r.kt)(p,(0,o.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"refs-and-the-component-lifecycle"},"Refs and the Component Lifecycle"),(0,r.kt)("h2",{id:"calling-components-and-elements-directly"},"Calling Components and Elements Directly"),(0,r.kt)("p",null,"Many times, one needs to directly call the methods of a component or HTML element. This can be accomplished by using the special ",(0,r.kt)("inlineCode",{parentName:"p"},"ref")," prop which exists on all components and elements, and works in much the same way as React refs do."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"const elementRef = FSComponent.createRef<HTMLDivElement>();\nconst element = <div ref={elementRef}>Texty Goodness</div>;\n\nFSComponent.render(element, document.getElementById('TextyContainer'));\nelementRef.instance.classList.add('blink-red');\n")),(0,r.kt)("p",null,"By using the special ",(0,r.kt)("inlineCode",{parentName:"p"},"ref")," prop, the element or component will be assigned to the ",(0,r.kt)("inlineCode",{parentName:"p"},"instance")," property of that passed-in ref after (",(0,r.kt)("strong",{parentName:"p"},"and only after"),") the element is rendered."),(0,r.kt)("admonition",{type:"caution"},(0,r.kt)("p",{parentName:"admonition"},"A component or element's ",(0,r.kt)("inlineCode",{parentName:"p"},"ref")," will ",(0,r.kt)("strong",{parentName:"p"},"not")," be assigned until the element is rendered. If the ",(0,r.kt)("inlineCode",{parentName:"p"},"instance")," property is accessed before it has been assigned, an error will be thrown. You can instead use ",(0,r.kt)("inlineCode",{parentName:"p"},"getOrDefault()")," if you would like to get either the instance or ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined"),". This method will not throw an error, and is therefore a good choice in areas where you don't know if rendering will yet be complete and would like to check on your own.")),(0,r.kt)("h2",{id:"lifecycle-methods-available-on-displaycomponent"},"Lifecycle Methods Available on DisplayComponent"),(0,r.kt)("p",null,"Also like React, FSComponent components have a few lifecycle methods which can be used to run code at specific times in the rendering cycle of a component."),(0,r.kt)("h3",{id:"constructor"},(0,r.kt)("inlineCode",{parentName:"h3"},"constructor()")),(0,r.kt)("p",null,"In FSComponent, component constructors are called as soon as the JSX elements are created, prior to starting the render cycle. Components are created from the bottom of the tree up."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"constructor(props: TextyComponentProps) {\n  super(props);\n\n  console.log('Getting constructed...');\n}\n")),(0,r.kt)("h3",{id:"onbeforerender"},(0,r.kt)("inlineCode",{parentName:"h3"},"onBeforeRender()")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"onBeforeRender()")," method is called on a component immediately before the component's ",(0,r.kt)("inlineCode",{parentName:"p"},"render()")," method is called. This can be good for code that doesn't really fit into a normal constructor but needs to run before the component's rendering starts."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"public onBeforeRender(): void {\n  super.onBeforeRender();\n\n  console.log('Just before rendering.');\n}\n")),(0,r.kt)("h3",{id:"onafterrender"},(0,r.kt)("inlineCode",{parentName:"h3"},"onAfterRender()")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"onAfterRender()")," method is called on a component when the entire tree underneath it and its own ",(0,r.kt)("inlineCode",{parentName:"p"},"render()")," method have finished. Any code called from here, and after, is guaranteed to have access to any component or element refs, since they will all have been rendered. This method also has access to the virtual DOM node that resulted from its rendering, which is useful for a number of virtual DOM inspection purposes."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"public onAfterRender(node: VNode): void {\n  super.onAfterRender(node);\n\n  console.log(`I have ${node.children.length} children.`);\n}\n")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"It is good practice to call ",(0,r.kt)("inlineCode",{parentName:"p"},"super")," within the two lifecycle methods, just as one would for a constructor.")),(0,r.kt)("h2",{id:"adding-dynamic-styling-to-a-component-with-ref-and-lifecyle-methods"},"Adding Dynamic Styling to a Component With Ref and Lifecyle Methods"),(0,r.kt)("p",null,"One of the most common ways of using both of these concepts in the framework is to change the styling of an element in a component dynamically due to changes in incoming data."),(0,r.kt)("p",null,"In ",(0,r.kt)("inlineCode",{parentName:"p"},"MyComponent"),", add a field for a ref to the display div to the top of the class:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"private readonly elementRef = FSComponent.createRef<HTMLDivElement>();\n")),(0,r.kt)("p",null,"And hook it up to the display div by adding the ref prop to that element in the ",(0,r.kt)("inlineCode",{parentName:"p"},"render()")," method:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"<div ref={this.elementRef} class='my-component'>{this.indicatedAirspeed} IAS</div>\n")),(0,r.kt)("p",null,"Then, subscribe to the ",(0,r.kt)("inlineCode",{parentName:"p"},"indicatedAirspeed")," value and use the following code to toggle a class on or off by adding the following to the lifecycle method ",(0,r.kt)("inlineCode",{parentName:"p"},"onAfterRender()"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"public onAfterRender(node: VNode): void {\n  super.onAfterRender(node);\n\n  this.indicatedAirspeed.sub(airspeed => {\n    if (airspeed > 40) {\n      this.elementRef.instance.classList.add('alert');\n    } else {\n      this.elementRef.instance.classList.remove('alert');\n    }\n  });\n}\n")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"We use the lifecycle method ",(0,r.kt)("inlineCode",{parentName:"p"},"onAfterRender()")," here because we are accessing a ref instance, which is guaranteed to be available when and after ",(0,r.kt)("inlineCode",{parentName:"p"},"onAfterRender()")," is called.")),(0,r.kt)("p",null,"Finally, we can add some styling to this ",(0,r.kt)("inlineCode",{parentName:"p"},"alert")," class in our ",(0,r.kt)("inlineCode",{parentName:"p"},"MyComponent.css"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-css"},".alert {\n  color: white;\n  background-color: red;\n}\n")),(0,r.kt)("p",null,"Upon rebuild/resync, we should now see the styling of our airspeed value change when it is above 40 knots."))}m.isMDXComponent=!0}}]);