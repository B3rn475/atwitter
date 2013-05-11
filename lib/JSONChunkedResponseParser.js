
//var fs = require('fs');

module.exports = function(res,cb)
{
   var output = '';
   var error = false;

   res.setEncoding("utf8");

   res.on('data', function (chunk) {
      output += chunk;
   });

   res.on('end', function() {
      if (error) return;
      try
      {
         var obj = JSON.parse(output);
         cb(null, obj);
      }
      catch (ex)
      {
         //fs.writeFile("/home/b3rn475/Documents/pippo.txt",output, function(){});
         //console.log(ex);
         cb(new Error("Unable to parse response"),null);
      }
   });
   
   res.on('error', function(){
      error = true;
      cb(new Error("Error during request"),null);
   });
}
