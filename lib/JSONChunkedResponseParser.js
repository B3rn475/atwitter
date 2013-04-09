
module.exports = function(res,cb)
{
   var output = '';

   res.setEncoding('utf8');

   res.on('data', function (chunk) {
      output += chunk;
   });

   res.on('end', function() {
      var obj = JSON.parse(output);
      cb(null, obj);
   });
}
