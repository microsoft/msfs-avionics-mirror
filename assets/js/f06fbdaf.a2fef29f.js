"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[9608],{3905:function(e,n,t){t.d(n,{Zo:function(){return c},kt:function(){return u}});var o=t(7294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function p(e,n){if(null==e)return{};var t,o,r=function(e,n){if(null==e)return{};var t,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)t=a[o],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)t=a[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=o.createContext({}),l=function(e){var n=o.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},c=function(e){var n=l(e.components);return o.createElement(s.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},m=o.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),m=l(t),u=r,f=m["".concat(s,".").concat(u)]||m[u]||d[u]||a;return t?o.createElement(f,i(i({ref:n},c),{},{components:t})):o.createElement(f,i({ref:n},c))}));function u(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,i=new Array(a);i[0]=m;var p={};for(var s in n)hasOwnProperty.call(n,s)&&(p[s]=n[s]);p.originalType=e,p.mdxType="string"==typeof e?e:r,i[1]=p;for(var l=2;l<a;l++)i[l]=t[l];return o.createElement.apply(null,i)}return o.createElement.apply(null,t)}m.displayName="MDXCreateElement"},1307:function(e,n,t){t.r(n),t.d(n,{assets:function(){return c},contentTitle:function(){return s},default:function(){return u},frontMatter:function(){return p},metadata:function(){return l},toc:function(){return d}});var o=t(7462),r=t(3366),a=(t(7294),t(3905)),i=["components"],p={sidebar_position:4},s="Adding Component Props",l={unversionedId:"getting-started/adding-component-props",id:"version-0.2.0/getting-started/adding-component-props",title:"Adding Component Props",description:"Defining Component Props",source:"@site/versioned_docs/version-0.2.0/getting-started/adding-component-props.md",sourceDirName:"getting-started",slug:"/getting-started/adding-component-props",permalink:"/msfs-avionics-mirror/docs/getting-started/adding-component-props",draft:!1,tags:[],version:"0.2.0",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"docsSidebar",previous:{title:"Styling Your Component",permalink:"/msfs-avionics-mirror/docs/getting-started/styling-your-component"},next:{title:"Dealing With Dynamic Data",permalink:"/msfs-avionics-mirror/docs/getting-started/dealing-with-dynamic-data"}},c={},d=[{value:"Defining Component Props",id:"defining-component-props",level:2},{value:"Making and Referencing the Props Interface",id:"making-and-referencing-the-props-interface",level:2},{value:"Utilizing the Props",id:"utilizing-the-props",level:2},{value:"Setting the Prop Value",id:"setting-the-prop-value",level:2}],m={toc:d};function u(e){var n=e.components,t=(0,r.Z)(e,i);return(0,a.kt)("wrapper",(0,o.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"adding-component-props"},"Adding Component Props"),(0,a.kt)("h2",{id:"defining-component-props"},"Defining Component Props"),(0,a.kt)("p",null,"Just as in React, in FSComponent, components can take props that can be used to pass data or functions into them, making them more composable and able to take dependencies from their parent components. In order to define the props on a component, one must first make an interface that specifies what those properties will be. Let's define exactly what the text in our component should be via a prop, instead of hard-coding ",(0,a.kt)("inlineCode",{parentName:"p"},"Hello World!")," into the component itself."),(0,a.kt)("h2",{id:"making-and-referencing-the-props-interface"},"Making and Referencing the Props Interface"),(0,a.kt)("p",null,"Above the ",(0,a.kt)("inlineCode",{parentName:"p"},"MyComponent")," class, add the following interface definition:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"interface MyComponentProps extends ComponentProps {\n  text: string;\n}\n")),(0,a.kt)("p",null,"and add ",(0,a.kt)("inlineCode",{parentName:"p"},"ComponentProps")," to the import from ",(0,a.kt)("inlineCode",{parentName:"p"},"msfssdk"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { FSComponent, DisplayComponent, VNode, ComponentProps } from 'msfssdk';\n")),(0,a.kt)("p",null,"This will define a props interface that has a single property named ",(0,a.kt)("inlineCode",{parentName:"p"},"text"),", which takes a string. We can then tell the system that we would like to use this set of props in our component by adding it to our class's extension of ",(0,a.kt)("inlineCode",{parentName:"p"},"DisplayComponent"),", so:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"export class MyComponent extends DisplayComponent<any> {\n")),(0,a.kt)("p",null,"should become"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"export class MyComponent extends DisplayComponent<MyComponentProps> {\n")),(0,a.kt)("h2",{id:"utilizing-the-props"},"Utilizing the Props"),(0,a.kt)("p",null,"All component props appear in ",(0,a.kt)("inlineCode",{parentName:"p"},"this.props"),", just as they do in React. Therefore, we can now replace our ",(0,a.kt)("inlineCode",{parentName:"p"},"Hello World!")," text in our component with a prop reference:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"...\nreturn (\n  <div class='my-component'>{this.props.text}</div>\n);\n...\n")),(0,a.kt)("p",null,"Now, when the component is rendered, it will reference the value of that prop and replace this ",(0,a.kt)("inlineCode",{parentName:"p"},"{}")," tag with the value."),(0,a.kt)("h2",{id:"setting-the-prop-value"},"Setting the Prop Value"),(0,a.kt)("p",null,"You may notice that your editor is now complaining, adding a red underline in ",(0,a.kt)("inlineCode",{parentName:"p"},"MyInstrument.tsx")," underneath ",(0,a.kt)("inlineCode",{parentName:"p"},"MyComponent"),". This is because in our interface, we defined a mandatory prop ",(0,a.kt)("inlineCode",{parentName:"p"},"text"),", but we have not yet provided a value for it. Let's do that now by changing that line and adding the prop:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"FSComponent.render(<MyComponent text='Hello MSFS!' />, document.getElementById('InstrumentContent'));\n")),(0,a.kt)("p",null,"You can see that we added ",(0,a.kt)("inlineCode",{parentName:"p"},"text='Hello MSFS!'")," as a prop of the component. Props work a lot like HTML attibutes, and can be assigned values. After a rebuild/resync, you should see the text on your panel now reflect the prop value."))}u.isMDXComponent=!0}}]);