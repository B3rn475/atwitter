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
            cbEnd(err);
            return;
         }
         
         var firstPath = '?' + utils.urlSerialize(options);
         
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
                  if (jRes.errors)
                  {
                     if (jRes.errors[0].code == 88)
			{
			console.log("rate limited waiting 15 minutes");
                        return setTimeout(function(){searchStep(path,searchCb);},900000); //15minutes
			}
                     else
                        return cbEnd(new Error(jRes.errors[0].message))
                        
                  }
                  if (jRes.statuses && jRes.statuses.length > 0)
                  {
                     var nextPath = '?' + utils.urlSerialize(utils.merge(options, 
                                                               {
                                                                  max_id: utils.dec(jRes.statuses[jRes.statuses.length-1].id_str)
                                                               }));
                     var ret = cbStep(jRes.statuses);
                     if (ret !== false)
                     {
                        searchStep(nextPath,searchCb);
                     }
                     else
                     {
                        cbEnd(null);
                     }
                  }
                  else
                  {
                     cbEnd(null);
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
 

