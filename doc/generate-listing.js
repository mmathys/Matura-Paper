var tests = ["layout", "3d"];
var file = require('file');

for(var i = 0; i<tests.length; i++) {
  console.log("\\begin{listcodesection}["+tests[i]+"]");
  var path = "../tests/"+tests[i];
  file.walkSync(path, function(dirPath, dirs, files) {
    for(var j = 0; j<files.length; j++) {
      var what = dirPath+"/"+files[j];
      var name = "";
      if(what.indexOf("/")!=-1) {
        var split = what.split("/");
        name = split[split.length-1];
      }else{
        name = what;
      }
      what = what.replace(/\_/g, "\\_")
      name = name.replace(/\_/g, "\\_")
      type = what.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1];

      console.log("\\listcodefile{"+what+"}{"+name+"}{"+type+"}");
    }
  });
  console.log("\\end{listcodesection}")
}
