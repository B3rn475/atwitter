//atwitter

var   VERSION = "0.0.1",
      utils = require('./utils'),
      https = require('https'),
      AOAManager = require('./ApplicationOnlyAuthManager'),
      JSONChunkedResponseParser = require('./JSONChunkedResponseParser');

function aTwitter(options) {
   if (!(this instanceof aTwitter)) return new aTwitter(options);
   
   var defaults = {
      consumer_key: null,
      consumer_secret: null
   };
   
   this.options = utils.merge(defaults, options);
   
   var auth = new AOAManager(this.options);   
   
   this.search = function (search, cb)
   {
      auth.addRef(function(err){
         if (err)
         { 
            cb(err);
            return;
         }
         
         var http_options = {
         host: 'api.twitter.com',
         path: '/1.1/search/tweets.json?q=' + encodeURIComponent(search),
         headers: {
            "Authorization": auth.getAuthString()
	         }
         };

         function searchManageFunction(err, jRes){
            if (err) cb(err)
            else {
               if (jRes.errors) cb(jRes.errors);
               else cb(null,jRes.statuses);
            }
            auth.removeRef();
         }

         var req = https.get(http_options, function(res) {
	         JSONChunkedResponseParser(res, searchManageFunction);
         });
         
         req.on('error', searchManageFunction);
      })
   }
}

aTwitter.VERSION = VERSION;
module.exports = aTwitter;
 

