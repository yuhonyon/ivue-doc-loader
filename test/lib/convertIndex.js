const matter = require('./matter');
const glob =require('glob');
const md2vue = require('./md2vue')

function convertIndex(options,source,resourcePath){
  return new Promise((res,rej)=>{
    let url=resourcePath.replace(/\/[^\/]*\.md$/,"/demo/*.md");
    glob(url,function(err,files){
      if(err){
        rej(err);
        return;
      }
      let results =files.map(file=>matter(file));
      let vueCode=md2vue(options,matter(source,false),results);
      res(vueCode)
    });
  })



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

  styleStr+=`
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

module.exports=convertIndex;
