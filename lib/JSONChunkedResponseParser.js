
module.exports = function(res,cb)
{
   var output = [];
   var error = false;

   res.setEncoding("utf8");

   res.on('data', function (chunk) {
      output.push(chunk);
   });

   res.on('end', function() {
      if (error) return;
      var obj = null;
      try
      {
         obj = JSON.parse(output.join(''));
      }
      catch (ex)
      {
         return cb(new Error("Unable to parse response"),null);
      }
      cb(null, obj);
   });
   
   res.on('error', function(){
      error = true;
      cb(new Error("Error during request"),null);
   });
}
