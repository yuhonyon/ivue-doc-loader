const md2vue= require('../lib/md2vue')
const matter= require('../lib/matter')
let m=`---
title:
   zh-CN: 阿斯蒂芬
slug: home
---
# 阿斯asdfas蒂芬
> sdfasdfsdfasdfasdfas

\`\`\`vue
<template>
  <div>
    aaaa
  </div>
</template>
<script>
  export default{
    data(){
      return {
        a:1
      }
    }
  }
</script>
<style>
  a{
    color:#999;
  }
</style>
\`\`\`
`;
const option={

  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  codeTheme: "default",
  theme: "default"
}

m=matter(m,false)

console.log(md2vue(option,m))
