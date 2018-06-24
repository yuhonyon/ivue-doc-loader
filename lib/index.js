const loaderUtils = require("loader-utils");
const convertIndex=require('./convertIndex')
const convertDemo=require('./convertDemo')

let defaultOptions={
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  headerPrefix:"vue-doc-",
  codeTheme: "default",
  theme: "default"
};

module.exports=function(source,map){
    let isIndex=/\/index\.md/.test(this.resourcePath);
    let options = loaderUtils.getOptions(this) || {};
    options=Object.assign({},defaultOptions,options);
    this.cacheable();
    const callback = this.async();

    if(isIndex){
      convertIndex(options,source,this.resourcePath).then(data=>{
        callback(null, data,map);
      }).catch((e)=>{
        console.log(e)
      })
    }else{
      convertDemo(options,source).then(data=>{
        callback(null, data,map);
      }).catch((e)=>{
        console.log(e)
      })
    }
};
