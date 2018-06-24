const matter = require('./matter');
const md2vue = require('./md2vue')
function convertDemo(options,source){
  return new Promise((res,rej)=>{
    try{
      let vueCode=md2vue(options,matter(source,false));
      res(vueCode)
    }catch(e){
      rej(e)
    }


  })
}
module.exports=convertDemo;
