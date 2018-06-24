const marked = require('marked');
const fs =require("fs");
const loaderUtils = require("loader-utils");
const m2j=require("markdown-to-json");
const glob=require("glob");
const m2jOptions = {
              minify: false,
              width: 0,
              content: true,
              outfile: null
        };
let defaultOptions={
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  codeTheme: "default",
  theme: "default"
};

function createdIndex(results,options){
  let templateStr=[];
  let importStr="";
  let styleStr="";
  let scriptStr="";
  let htmlStr="";
  let headStr="";

  for(let i in results){
    let result=results[i];
    if(result.basename=="index"){
      htmlStr+=marked(result.content);
      headStr+=head(result);
      continue;
    }

    if(result.order&&!templateStr[result.order]){
      templateStr[result.order]=`<${result.basename}></${result.basename}>`;
    }else{
      templateStr.push(`<${result.basename}></${result.basename}>`);
    }

    importStr+=`import ${result.basename} from './demo/${result.basename}.md';`;
    scriptStr+=`${result.basename},`;
  }
  templateStr=templateStr.join("");

  styleStr+=`@import '~highlight.js/styles/${options.codeTheme}.css';
            @import '~ivue-doc-loader/styles/${options.theme}.scss';`;
    let vueCode=`<template lang="html">
                  <div>
                    ${headStr}
                    ${templateStr}
                    ${htmlStr}
                  </div>
                </template>
                <script>
                  ${importStr}
                export default {
                  components:{
                    ${scriptStr}
                  }
                }
                </script>
                <style lang="scss">
                  ${styleStr}
                </style>
                  `;
  return vueCode;
}

function m2v(source,head){
  let code = source.match(/```vue([\s\S]+?)```/g);
  if(!code){
    return `<template lang="html">
              <div>
                  ${marked(source)}
              </div>
            </template>
            `;
  }
  let html = marked(source.replace(/```vue([\s\S]+?)```/g,''));
  html=`<div class="ivue-doc-text">${html}</div>`;
  code=code?code[0]:"";
  let markedCode=code.replace(/^```vue/,"```html");
  if(/^```html\s*<template>[\S\s]*<\/template>\s*```$/.test(markedCode)){
    markedCode=markedCode.replace(/^```html\s*<template>/,'```html').replace(/<\/template>\s*```$/,'```');
  }
  markedCode=marked(markedCode);

  markedCode=code?`<div class="ivue-doc-code">
                          <div class="ivue-doc-code-copy">copy</div>
                          <div class="ivue-doc-code-toggle">toggle</div>
                          <div class="ivue-doc-code-content">${markedCode}</div>
                        </div>`:"";
  code=code.replace(/(^```vue\S*)|(```$)/g,'');
  code=code.replace(/^[^<]*<template>/,`<template><div class="ivue-doc-demo"><div class="ivue-doc-header">${head}</div><div class="ivue-doc-instance">`);
  code=code.replace(/<\/template>/,`</div>${html}${markedCode}</div></template>`);

  return code;
}

function head(result){
  let head="";
  if(result.desc){
    head=`> ${result.desc}\n${head}`;
  }
  if(result.title){
    head=`# ${result.title}\n${head}`;
  }
  return marked(head);
}



module.exports=function(source,map){

    let isIndex=/\/index\.md/.test(this.resourcePath);
    let options = loaderUtils.getOptions(this) || {};
    options=Object.assign({},defaultOptions,options);
    marked.setOptions(options);
    this.cacheable();
    const callback = this.async();

    if(isIndex){
      let url=this.resourcePath.replace(/\/[^\/]*\.md$/,"/**/*.md");
      glob(url,function(err,files){
        if(err){
          console.log(err);
          return;
        }
        let results = m2j.parse(files, m2jOptions);
        results=JSON.parse(results);

        let vueCode=createdIndex(results,options);
        callback(null, vueCode,map);
      });
    }else{
      let results = m2j.parse([this.resourcePath], m2jOptions);
      results=JSON.parse(results);
      for(let i in results){
        let vueCode=m2v(results[i].content,head(results[i]));
        callback(null, vueCode,map);
      }

    }




    // let styles=`<style lang="scss">
    //               @import '~highlight.js/styles/${options.codeTheme}.css';
    //               @import '~ivue-doc-loader/styles/${options.theme}.scss';
    //             </style>`;
    //
    // let code = source.match(/```([\s\S]+?)```/g);
    // code=code?code[0].replace(/(^```\S*)|(```$)/,''):"";
    //
    //
    // source=marked(source);
    //
    // let markedCode=source.match(/<pre>([\s\S]+?)<\/pre>/g);
    // markedCode=markedCode?`<div class="ivue-doc-code">
    //                         <div class="ivue-doc-code-copy">copy</div>
    //                         <div class="ivue-doc-code-toggle">toggle</div>
    //                         <div class="ivue-doc-code-content">${markedCode[0]}</div>
    //                       </div>`:"";
    //
    // source=`<div id="ivue-doc-text">
    //           ${source}
    //         </div>`.replace(/<pre>([\s\S]+?)<\/pre>/g,'');
    //
    // source=code.replace(/<\/template>/,`</div>${source}${markedCode}</div></template>`);
    // source=source.replace(/<template[^>]*>/,`<template><div class="ivue-doc-demo"><div class="ivue-doc-instance">`);
    //
    // source+=styles;
    //
    // callback(null, source,map);
};
