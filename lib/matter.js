const matter = require('gray-matter');
const fs = require('fs');
function md2json(url,isPath=true){
  let content=isPath?fs.readFileSync(url).toString():url;
  let json=matter(content);
  json.name=isPath?url.match(/[^/]+(?=\.md)/)[0]:'';
  return json;
}

module.exports=md2json;
