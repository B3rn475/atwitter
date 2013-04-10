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
   
   this.search = function (options, cbStep, cbEnd)
   {
      var defaults = {
         count : 100,
         include_entities : 1,
         result_type : 'recent'
      }
      
      if (typeof(options) == 'string')
      {
         options = {q: options };
      }
      
      options = utils.merge(defaults, options);
      
      auth.addRef(function(err){
         if (err)
         { 
            cb(err);
            return;
         }
         
         var firstPath = '?' + utils.urlSerialize(options);
         
         console.log(firstPath);
         
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
                        var ret = cbStep(jRes.statuses);
                        if (ret !== false)
                        {
                           searchStep(jRes.search_metadata.next_results,searchCb);
                        }
                        else
                        {
                           cbEnd(null);
                        }
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
 

