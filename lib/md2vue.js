const marked = require('best-marked');

function m2v(options,source,children){
  marked.setOptions(options);
  let code = source.content.match(/```vue([\s\S]+?)```/g);
  code=code?code[0]:'';

  let content=source.content.replace(code,'');
  let data=source.data;
  //zh&us
  let title=typeof data.title==='object'?data.title['zh-CN']:data.title||"";
  let titleEN=typeof data.title==='object'?data.title['en-US']:data.title||"";

  let desc=typeof data.desc==='object'?data.desc['zh-CN']:data.desc||"";
  let descEN=typeof data.desc==='object'?data.desc['en-US']:data.desc||"";



  let header=children?`# ${title}\n${desc}`:`## ${title}\n${desc}`
  let headerEN=children?`# ${titleEN}\n${descEN}`:`## ${titleEN}\n${descEN}`


  let md=content.match(/# zh-CN[\s\S]+?($|# en-US)/m)
  let mdEN=content.match(/# en-US[\s\S]+?($|# zh-CN)/m)

  if(!md&&content){
    md=[content];
  }else if(!md){
    md=[""]
  }
  if(!mdEN){
    mdEN=[""];
  }


  md=md[0].replace(/# zh-CN|# en-US/g,"");
  mdEN=mdEN[0].replace(/# zh-CN|# en-US/g,"");





  //code
  let template='',importStr=[],components=[],componentsX=[],style='',menu="<ul class='vue-doc-submenu-list'>",menuEN="<ul class='vue-doc-submenu-list-EN'>";
  if(!!code){
    template=code.match(/<template[\s\S]+<\/template>/)
    template=template?template[0]:"";
    style=code.match(/<style[\s\S]+<\/style>/)
    style=style?style[0]:"";
  }

  if(children){
    children=children.sort((a,b)=>{
      if(!a.order||!b.order){
        return -1;
      }
      return Number(a.order)-b.Number(order)||-1;
    })
    for(let item of children){
      components.push("demo"+item.name)
      importStr[item.data.order]=`import demo${item.name} from './demo/${item.name}.md';`
      componentsX[item.data.order]=`<demo${item.name}></demo${item.name}>`;

      let t= typeof item.data.title==='object'?item.data.title['zh-CN']:item.data.title||"";
      let tEN= typeof item.data.title==='object'?item.data.title['en-US']:item.data.title||"";
      menu+=`<li><a href="#vue-doc-${t.replace(/[^A-Za-z0-9_\u4e00-\u9fa5]/g,"")}1">${t}</a></li>`;
      menuEN+=`<li><a href="#vue-doc-${tEN.replace(/[^A-Za-z0-9_\u4e00-\u9fa5]/g,"")}1">${tEN}</a></li>`;
    }
    menu+="</ul>";
    menuEN+="</ul>";
  }


  let addScript=`
  ${importStr.join("\n")}
  import ClipboardJS from "clipboard";
  const mixin = {
    data(){
      return{
        showVueDocCode:false,
        vueDocCodeCopyText:"copy",
        vueDocCodeHeight:0
      }
    },
    methods: {
      vueDocCodeToggle() {
        this.showVueDocCode=!this.showVueDocCode;
        this.vueDocCodeHeight=this.vueDocCodeHeight||this.$refs.vueDocCodeBox.children[0].offsetHeight;
        this.$refs.vueDocCodeBox.style.height=this.showVueDocCode?(this.vueDocCodeHeight+50)+'px':'0px';
      },
      vueDocCodeCopy(){
        const clipboard = new ClipboardJS('.vue-doc-code-copy',{
          text:(trigger)=> {
                return trigger.nextElementSibling.textContent;
            }
        });
        clipboard.on('success', (e)=> {
            this.vueDocCodeCopyText="copy success!";
            setTimeout(()=>{
              this.vueDocCodeCopyText="copy";
            },1000);
            e.clearSelection();
            clipboard.destroy();
        });
      }
    },
    components:{
      ${components.join(',')}
    }
  };
  `

  let script=code.match(/<script[\s\S]+<\/script>/)
  script=script?script[0]:``;
  if(!script){
    script=`<script>
      ${addScript}
      export default {
        mixins:[mixin]
      }
      </script>`
  }else{
    script=script.replace(/export +default *{/,`${addScript}export default {`);
    let hasMixin=/mixins: *\[/.test(script);
    if(hasMixin){
      script=script.replace(/mixins: *\[/,"mixins: [mixin,")
    }else{
      script=script.replace(/export +default *{/,`export default { mixins: [mixin],`);
    }
  }





  return `<template>
    <div class="vue-doc-wrapper">
        ${
          !!children?`<div class="vue-doc-submenu">
          ${menu}${menuEN}
        </div>`:''
        }
        <div class="vue-doc-title">
          ${marked(header)}
        </div>
        <div class="vue-doc-title-EN">
          ${marked(headerEN)}
        </div>

        ${
          !!children?`<div class="vue-doc-components">
          ${componentsX.join("\n")}
        </div>`:''
        }


        <div class="vue-doc-content">
          ${marked(md)}
        </div>
        <div class="vue-doc-content-EN">
          ${marked(mdEN)}
        </div>
        ${!!code?`
          <div class="vue-doc-demo">
            ${template}
          </div>
            <div class="vue-doc-code" :class="{'vue-doc-code-show':showVueDocCode}">
              <div class="vue-doc-code-copy" @click="vueDocCodeCopy">{{vueDocCodeCopyText}}</div>
              <div class="vue-doc-code-content" ref="vueDocCodeBox">
                ${marked(code)}
              </div>
              <div class="vue-doc-code-toggle" @click="vueDocCodeToggle">
                <span class="vue-doc-code-toggle-text"></>{{showVueDocCode?"隐藏代码":"显示代码"}}</span>
                <span class="vue-doc-code-toggle-text-EN"></>{{showVueDocCode?"Hide Code":"Show Code"}}</span>
              </div>
            </div>
          `:''
        }


    </div>
  </template>
  ${script}
  ${style}
  <style lang="less">
    @import "ivue-doc-loader/styles/code/${options.codeTheme}.css";
    @import "ivue-doc-loader/styles/${options.theme}.css";
    .vue-doc-code-content{
      height:0;
      overflow:hidden;
      transition: height .3s;
      background:#f8f8f8;
    }
    .vue-doc-code-show .vue-doc-code-content{
      height:auto;
    }
    .vue-doc-content-EN,.vue-doc-title-EN,.vue-doc-submenu-list-EN,.vue-doc-code-toggle-text-EN{
      display:none;
    }
    .en-US .vue-doc-submenu-list-EN{
      display:block;
    }
    .en-US .vue-doc-submenu-list{
      display:none;
    }

    .en-US .vue-doc-content-EN{
      display:block;
    }
    .en-US .vue-doc-content{
      display:none;
    }

    .en-US .vue-doc-title-EN{
      display:block;
    }
    .en-US .vue-doc-title{
      display:none;
    }

    .en-US .vue-doc-code-toggle-text-EN{
      display:block;
    }
    .en-US .vue-doc-code-toggle-text{
      display:none;
    }

    .vue-doc-demo{
      padding: 20px;
      border:1px solid #ddd;
      border-bottom: 0;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }
    .vue-doc-code{
      border: 1px solid #ddd;
      position: relative;
      padding-bottom: 50px;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }
    .vue-doc-code-copy{
      display: none;
      position: absolute;
      right: 15px;
      font-weight: bold;
      top: 10px;
      cursor: pointer;
    }
    .vue-doc-code-show .vue-doc-code-copy{
      display: block;
    }
    .vue-doc-code-toggle{
      position: absolute;
      bottom: 0;
      left: 0;
      width:100%;
      font-weight: bold;
      height: 50px;
      line-height: 50px;
      text-align: center;
      cursor: pointer;
    }
    .vue-doc-code-show .vue-doc-code-toggle{
      border-top: 1px solid #ddd;
    }

    .vue-doc-code .vue-doc-code-content pre{
      border: 0;
      padding: 15px;
    }

    .vue-doc-wrapper{
      margin-bottom:50px;
    }



  </style>`



}




module.exports=m2v;
