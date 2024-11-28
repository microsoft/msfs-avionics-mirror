"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["579055"],{409591:function(e,n,t){t.r(n),t.d(n,{metadata:()=>o,contentTitle:()=>a,default:()=>l,assets:()=>d,toc:()=>p,frontMatter:()=>s});var o=JSON.parse('{"id":"getting-started/adding-component-props","title":"Adding Component Props","description":"Defining Component Props","source":"@site/docs/getting-started/adding-component-props.md","sourceDirName":"getting-started","slug":"/getting-started/adding-component-props","permalink":"/msfs-avionics-mirror/2024/docs/getting-started/adding-component-props","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4},"sidebar":"sidebar","previous":{"title":"Styling Your Component","permalink":"/msfs-avionics-mirror/2024/docs/getting-started/styling-your-component"},"next":{"title":"Dealing With Dynamic Data","permalink":"/msfs-avionics-mirror/2024/docs/getting-started/dealing-with-dynamic-data"}}'),r=t("785893"),i=t("250065");let s={sidebar_position:4},a="Adding Component Props",d={},p=[{value:"Defining Component Props",id:"defining-component-props",level:2},{value:"Making and Referencing the Props Interface",id:"making-and-referencing-the-props-interface",level:2},{value:"Utilizing the Props",id:"utilizing-the-props",level:2},{value:"Setting the Prop Value",id:"setting-the-prop-value",level:2}];function c(e){let n={code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,i.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"adding-component-props",children:"Adding Component Props"})}),"\n",(0,r.jsx)(n.h2,{id:"defining-component-props",children:"Defining Component Props"}),"\n",(0,r.jsxs)(n.p,{children:["Just as in React, in FSComponent, components can take props that can be used to pass data or functions into them, making them more composable and able to take dependencies from their parent components. In order to define the props on a component, one must first make an interface that specifies what those properties will be. Let's define exactly what the text in our component should be via a prop, instead of hard-coding ",(0,r.jsx)(n.code,{children:"Hello World!"})," into the component itself."]}),"\n",(0,r.jsx)(n.h2,{id:"making-and-referencing-the-props-interface",children:"Making and Referencing the Props Interface"}),"\n",(0,r.jsxs)(n.p,{children:["Above the ",(0,r.jsx)(n.code,{children:"MyComponent"})," class, add the following interface definition:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"interface MyComponentProps extends ComponentProps {\r\n  text: string;\r\n}\n"})}),"\n",(0,r.jsxs)(n.p,{children:["and add ",(0,r.jsx)(n.code,{children:"ComponentProps"})," to the import from ",(0,r.jsx)(n.code,{children:"@microsoft/msfs-sdk"}),":"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"import { FSComponent, DisplayComponent, VNode, ComponentProps } from '@microsoft/msfs-sdk';\n"})}),"\n",(0,r.jsxs)(n.p,{children:["This will define a props interface that has a single property named ",(0,r.jsx)(n.code,{children:"text"}),", which takes a string. We can then tell the system that we would like to use this set of props in our component by adding it to our class's extension of ",(0,r.jsx)(n.code,{children:"DisplayComponent"}),", so:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"export class MyComponent extends DisplayComponent<any> {\n"})}),"\n",(0,r.jsx)(n.p,{children:"should become"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"export class MyComponent extends DisplayComponent<MyComponentProps> {\n"})}),"\n",(0,r.jsx)(n.h2,{id:"utilizing-the-props",children:"Utilizing the Props"}),"\n",(0,r.jsxs)(n.p,{children:["All component props appear in ",(0,r.jsx)(n.code,{children:"this.props"}),", just as they do in React. Therefore, we can now replace our ",(0,r.jsx)(n.code,{children:"Hello World!"})," text in our component with a prop reference:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"...\r\nreturn (\r\n  <div class='my-component'>{this.props.text}</div>\r\n);\r\n...\n"})}),"\n",(0,r.jsxs)(n.p,{children:["Now, when the component is rendered, it will reference the value of that prop and replace this ",(0,r.jsx)(n.code,{children:"{}"})," tag with the value."]}),"\n",(0,r.jsx)(n.h2,{id:"setting-the-prop-value",children:"Setting the Prop Value"}),"\n",(0,r.jsxs)(n.p,{children:["You may notice that your editor is now complaining, adding a red underline in ",(0,r.jsx)(n.code,{children:"MyInstrument.tsx"})," underneath ",(0,r.jsx)(n.code,{children:"MyComponent"}),". This is because in our interface, we defined a mandatory prop ",(0,r.jsx)(n.code,{children:"text"}),", but we have not yet provided a value for it. Let's do that now by changing that line and adding the prop:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"FSComponent.render(<MyComponent text='Hello MSFS!' />, document.getElementById('InstrumentContent'));\n"})}),"\n",(0,r.jsxs)(n.p,{children:["You can see that we added ",(0,r.jsx)(n.code,{children:"text='Hello MSFS!'"})," as a prop of the component. Props work a lot like HTML attibutes, and can be assigned values. After a rebuild/resync, you should see the text on your panel now reflect the prop value."]})]})}function l(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(c,{...e})}):c(e)}},250065:function(e,n,t){t.d(n,{Z:function(){return a},a:function(){return s}});var o=t(667294);let r={},i=o.createContext(r);function s(e){let n=o.useContext(i);return o.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),o.createElement(i.Provider,{value:n},e.children)}}}]);