const marked = require('marked');
const loaderUtils = require("loader-utils");
let defaultOptions={
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  codeTheme:"default",
  theme:"default"
}



module.exports=function(source,map){
    let options =  loaderUtils.getOptions(this) || {};
    options=Object.assign({},defaultOptions,options);
    marked.setOptions(options);
    this.cacheable();
    const callback = this.async();

    let styles=`<style lang="scss">
                  @import '~highlight.js/styles/${options.codeTheme}.css';
                  @import '~ivue-doc-loader/styles/${options.theme}.scss';
                </style>`;

    let code = source.match(/```([\s\S]+?)```/g);
    code=code?code[0].replace(/(^```\S*)|(```$)/,''):"";

    source=marked(source);

    let markedCode=source.match(/<pre>([\s\S]+?)<\/pre>/g);
    markedCode=markedCode?`<div class="ivue-doc-code">
                            <div class="ivue-doc-code-copy">copy</div>
                            <div class="ivue-doc-code-toggle">toggle</div>
                            <div class="ivue-doc-code-content">${markedCode[0]}</div>
                          </div>`:"";

    source=`<div id="ivue-doc-text">
              ${source}
            </div>`.replace(/<pre>([\s\S]+?)<\/pre>/g,'');

    source=code.replace(/<\/template>/,`</div>${source}${markedCode}</div></template>`);
    source=source.replace(/<template[^>]*>/,`<template><div class="ivue-doc-demo"><div class="ivue-doc-instance">`);

    source+=styles;

    callback(null, source,map);
};
