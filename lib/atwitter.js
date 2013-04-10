//atwitter

var   VERSION = "0.0.1",
      utils = require('./utils'),
      AOAManager = require('./ApplicationOnlyAuthManager');

function aTwitter(options) {
   if (!(this instanceof aTwitter)) return new aTwitter(options);
   
   var defaults = {
      consumer_key: null,
      consumer_secret: null
   };
   
   this.options = utils.merge(defaults, options);
   
   var auth = new AOAManager(this.options);   
   
   this.search = function (search, cbStep, cbEnd)
   {
      auth.addRef(function(err){
         if (err)
         { 
            cb(err);
            return;
         }
         
         var firstPath = '?q=' + encodeURIComponent(search) + '&include_entities=1&result_type=recent&count=100';
         
         function searchCb(err){
            auth.removeRef();
            cbEnd(err);
         }
         
         function searchStep(path, cbEnd)
         {
            var r_options = {
               "host": 'api.twitter.com',
               "path": '/1.1/search/tweets.json' + path
            };

            auth.get(r_options, function(err, jRes){
               if (err) cbEnd(err)
               else {
                  if (jRes.errors) cbEnd(jRes.errors);
                  else 
                  {
                     if (jRes.search_metadata.next_results)
                     {
                        searchStep(jRes.search_metadata.next_results,searchCb);
                        cbStep(jRes.statuses);
                     }
                     else
                     {
                        cbStep(jRes.statuses);
                        cbEnd(null);
                     }
                  }
               }
            });
         }
         
         searchStep(firstPath, searchCb);
      })
   }
}

aTwitter.VERSION = VERSION;
module.exports = aTwitter;
 

