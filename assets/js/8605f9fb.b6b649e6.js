"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[51789],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>g});var i=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,o=function(e,t){if(null==e)return{};var n,i,o={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=i.createContext({}),p=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=p(e.components);return i.createElement(s.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},d=i.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=p(n),d=o,g=c["".concat(s,".").concat(d)]||c[d]||m[d]||r;return n?i.createElement(g,a(a({ref:t},u),{},{components:n})):i.createElement(g,a({ref:t},u))}));function g(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,a=new Array(r);a[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[c]="string"==typeof e?e:o,a[1]=l;for(var p=2;p<r;p++)a[p]=n[p];return i.createElement.apply(null,a)}return i.createElement.apply(null,n)}d.displayName="MDXCreateElement"},75002:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>m,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var i=n(87462),o=(n(67294),n(3905));const r={sidebar_position:1},a="Setting Up Your Environment",l={unversionedId:"getting-started/setting-up-your-environment",id:"getting-started/setting-up-your-environment",title:"Setting Up Your Environment",description:"Prerequisites",source:"@site/docs/getting-started/setting-up-your-environment.md",sourceDirName:"getting-started",slug:"/getting-started/setting-up-your-environment",permalink:"/msfs-avionics-mirror/docs/getting-started/setting-up-your-environment",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"sidebar",previous:{title:"MSFS Avionics Framework",permalink:"/msfs-avionics-mirror/docs/intro"},next:{title:"Creating Your First Component",permalink:"/msfs-avionics-mirror/docs/getting-started/creating-your-first-component"}},s={},p=[{value:"Prerequisites",id:"prerequisites",level:2},{value:"Creating a Framework Project",id:"creating-a-framework-project",level:2},{value:"Installing the Framework Into Your Project",id:"installing-the-framework-into-your-project",level:2},{value:"Initializing Your TypeScript Project",id:"initializing-your-typescript-project",level:2},{value:"Installing and Configuring Rollup",id:"installing-and-configuring-rollup",level:2}],u={toc:p},c="wrapper";function m(e){let{components:t,...n}=e;return(0,o.kt)(c,(0,i.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"setting-up-your-environment"},"Setting Up Your Environment"),(0,o.kt)("h2",{id:"prerequisites"},"Prerequisites"),(0,o.kt)("p",null,"The examples in this documentation assume that you have already set up an MSFS project in the SDK/Dev mode, have an aircraft ",(0,o.kt)("inlineCode",{parentName:"p"},"panel.cfg")," appropriately created, or in use, and understand how to modify that config file to point at the example HTML avionics instrument."),(0,o.kt)("p",null,"You will also need ",(0,o.kt)("strong",{parentName:"p"},"Node 12+")," and ",(0,o.kt)("strong",{parentName:"p"},"npm")," installed on your machine, as well as a quality code editor. We recommend Visual Studio Code for this purpose."),(0,o.kt)("h2",{id:"creating-a-framework-project"},"Creating a Framework Project"),(0,o.kt)("p",null,"Create a folder in a convenient location that will house your project. For this tutorial, we will call it ",(0,o.kt)("inlineCode",{parentName:"p"},"my-avionics"),". After you have create that folder, navigate to it on the command line and create an npm project:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"> npm init -y\n")),(0,o.kt)("p",null,"After this command has finished, you should now have a ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json")," file in your ",(0,o.kt)("inlineCode",{parentName:"p"},"my-avionics")," folder."),(0,o.kt)("h2",{id:"installing-the-framework-into-your-project"},"Installing the Framework Into Your Project"),(0,o.kt)("admonition",{type:"tip"},(0,o.kt)("p",{parentName:"admonition"},"All our frameworks are now available for installation by ",(0,o.kt)("strong",{parentName:"p"},"npm"),", so it is no longer necessary to download and build them yourself.")),(0,o.kt)("p",null,"You can install the base avionics framework into your project by running the following:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"> npm install @microsoft/msfs-sdk @microsoft/msfs-types --save-dev\n")),(0,o.kt)("p",null,"Additional packages are available for certain avionics platforms.   Those working on Garmin avionics will want to install ",(0,o.kt)("inlineCode",{parentName:"p"},"@microsoft/msfs-garminsdk"),".  Other packages may be available for individual avionics, such as the G3000.  See individual system documentation for more on those."),(0,o.kt)("h2",{id:"initializing-your-typescript-project"},"Initializing Your TypeScript Project"),(0,o.kt)("p",null,"While it is possible to use the framework from plain vanilla Javascript, we highly recommend using TypeScript for development, and all the examples presented will assume that you are using TypeScript as your language of choice. To install TypeScript and initialize your TypeScript project:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"> npm install typescript --save-dev\n> npx tsc --init\n")),(0,o.kt)("p",null,"This will create a ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," that contains the compilation options for TypeScript for this project. We will want to adjust some of the options within this file. Ensure that your ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," has the following options set:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "compilerOptions": {\n    "incremental": true, /* Enables incremental builds */\n    "target": "es2017", /* Specifies the ES2017 target, compatible with Coherent GT */\n    "module": "es2015", /* Ensures that modules are at least es2015 */\n    "strict": true, /* Enables strict type checking, highly recommended but optional */\n    "esModuleInterop": true, /* Emits additional JS to work with CommonJS modules */\n    "skipLibCheck": true, /* Skip type checking on library .d.ts files */\n    "forceConsistentCasingInFileNames": true, /* Ensures correct import casing */\n    "outDir": "build", /* Sets the output folder to ./build */\n    "moduleResolution": "node", /* Enables compatibility with MSFS SDK bare global imports */\n    "jsxFactory": "FSComponent.buildComponent", /* Required for FSComponent framework JSX */\n    "jsxFragmentFactory": "FSComponent.Fragment", /* Required for FSComponent framework JSX */\n    "jsx": "react" /* Required for FSComponent framework JSX */\n  }\n}\n')),(0,o.kt)("h2",{id:"installing-and-configuring-rollup"},"Installing and Configuring Rollup"),(0,o.kt)("p",null,"Because the Coherent GT system used by MSFS uses a custom URL scheme (",(0,o.kt)("em",{parentName:"p"},"coui://"),"), it can be difficult to use the standard module systems and import syntaxes available. We recommend using a bundling system to bundle your project into a single file, and we will configure Rollup for that purpose here."),(0,o.kt)("p",null,"To install Rollup along with a few plugins we will use:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"> npm install rollup@2 @rollup/plugin-node-resolve @rollup/plugin-typescript rollup-plugin-import-css tslib --save-dev\n")),(0,o.kt)("p",null,"This will install Rollup itself, as well as the following plugins:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"plugin-typescript")," - Allows Rollup to bundle and compile TypeScript in one step, without needing to run ",(0,o.kt)("inlineCode",{parentName:"li"},"tsc")," manually."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"plugin-node-resolve")," - Allows Rollup to resolve packages that were installed via NPM, such as the avionics framework, and bundle that along with your code"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"rollup-plugin-import-css")," - Allows you to use import declarations in your code (like ",(0,o.kt)("inlineCode",{parentName:"li"},"import './MyComponent.css'"),") that point to CSS, and then bundle all that CSS into a single CSS file")),(0,o.kt)("p",null,"Once everything is installed, create a ",(0,o.kt)("inlineCode",{parentName:"p"},"rollup.config.js")," file in your project root with the following contents:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"import typescript from '@rollup/plugin-typescript';\nimport resolve from '@rollup/plugin-node-resolve';\nimport css from 'rollup-plugin-import-css';\n\nexport default {\n  input: 'MyInstrument.tsx',\n  output: {\n    dir: 'build',\n    format: 'es'\n  },\n  plugins: [css({ output: 'MyInstrument.css' }), resolve(), typescript()]\n}\n")),(0,o.kt)("p",null,"This configuration imports the plugins that we installed earlier, and then exports a Rollup configuration. The configuration takes in ",(0,o.kt)("inlineCode",{parentName:"p"},"MyInstrument.tsx")," and will output the bundle into the ",(0,o.kt)("inlineCode",{parentName:"p"},"./build")," folder with the Coherent GT/MSFS compatible ES module format. We also configure the CSS plugin to output a bundled ",(0,o.kt)("inlineCode",{parentName:"p"},"MyInstrument.css"),", which will also appear in the output folder."),(0,o.kt)("p",null,"Finally, add the following to your ",(0,o.kt)("inlineCode",{parentName:"p"},"package.json")," file to configure an NPM step that will run your Rollup build:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'...\n"scripts": {\n  "build": "npx rollup -c" //Add this line to the scripts configuration object\n},\n...\n')))}m.isMDXComponent=!0}}]);