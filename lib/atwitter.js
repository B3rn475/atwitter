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
   
   var auth = AOAManager(this.options);
}

aTwitter.VERSION = VERSION;
module.exports = aTwitter;
 

