var   https = require('https'),
      JSONChunkedResponseParser = require('./JSONChunkedResponseParser');

function ApplicationOnlyAuthManager(options) {
   if (!(this instanceof ApplicationOnlyAuthManager)) return new ApplicationOnlyAuthManager(options);
   
   var activeConnections = 0;
   var activating = false;
   var deactivating = false;
   var postActivationCallBacks = [];
   var postDeactivationCallBacks = [];
   var Barear = null;
   
   this.getActiveConnections = function()
   {
      return activeConnections;
   }
   
   this.AddRef = function(cb)
   {
      if (!activating)
      {
         if (activeConnections > 0) 
         {
            activeConnections++;
            if (typeof(cb) == "function") {
               cb();
            }
         }
         else
         {
            postActivationCallBacks.push(cb);
            if (!deactivating)
            {
               activate(); 
            }
            else
            {
               postDeactivationCallBacks.push(function()
               {
                  activate();
               });
            }
         }
      }
      else
      {
         postActivationCallBacks.push(cb);
      }
      return this;
   }
   
   this.RemoveRef = function(cb)
   {
      if (!deactivating)
      {
         if (activeConnections > 0) 
         {
            activeConnections--;
            if (activeConnections > 0)
            {
               if (typeof(cb) == "function") {
                  cb();
               }
            }
            else
            {
               postDeactivationCallBacks.push(cb);
               if (!activating)
               {
                  deactivate();
               }
               else
               {
                  postActivationCallBacks.push(function()
                  {
                     deactivate();
                  });
               }
            }       
         }
      }
      return this;
   }
   
   function activate()
   {
      if (activating) return;
      if (deactivating) return;
      activating = true;
      
      var http_options = {
         host: 'api.twitter.com',
         path: '/oauth2/token',
         method: 'POST',
         headers: {
	         "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
            "Content-Length": 29,
            "Authorization": "Basic " + calculateAuthToken()
	      }
      };

      var req = https.request(options, function(res) {
	      JSONChunkedResponseParser(res, function(err, jRes){
	         if (!err)
	         {
	            if (jRes.errors)
	            {
	               err = jRes.errors;
	            }
	            else
	            {
   	            if (!jRes.token_type || jRes.token_type != "bearer")
   	            {
   	               err.push("Unknown Auth Token Type");
   	            }
   	            else
   	            {
   	               if (!jRes.access_token)
   	               {
   	                  err.push("No Auth Token present in the response");
   	               }
   	            }
   	         }
	         }
	         var local_postActivationCallBacks = postActivationCallBacks;
            postActivationCallBacks = [];
            activating = false;
	         if (err)
	         {
	            local_postActivationCallBacks.forEach(function(cb) {
	               if (typeof(cb) == "function") {
                     cb(err);
                  }
	            });
	         }
	         else
	         {
	            Barear = jRes.access_token;
	            activeConnections = local_postActivationCallBacks.length;
	            local_postActivationCallBacks.forEach(function(cb) {
	               if (typeof(cb) == "function") {
                     cb(err);
                  }
	            });
	         }
	      });
      });
      req.write('grant_type=client_credentials');
      req.end();
      
   }
   
   function calculateAuthToken()
   {
      return new(encodeURIComponent(options.consumer_key) + ":" + encodeURIComponent(options.consumer_secret)).toString('base64');
   }
   
   function deactivate()
   {
      if (deactivating) return;
      if (activating) return;
      deactivating = true;
      
      var content = "access_token=" + Bearer;
      
      var http_options = {
         host: 'api.twitter.com',
         path: '/oauth2/invalidate_token',
         method: 'POST',
         headers: {
	         "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
            "Content-Length": content.length,
            "Authorization": "Basic " + calculateAuthToken()
	      }
      };

      var req = https.request(options, function(res) {
	      JSONChunkedResponseParser(res, function(err, jRes){
	         if (!err)
	         {
	            if (jRes.errors)
	            {
	               err = jRes.errors;
	            }
	            else
	            {
 	               if (!jRes.access_token)
	               {
	                  err.push("No Auth Token present in the response");
	               }
	               else
	               {
	                  if (jRes.access_token != Barear)
	                  {
	                     err.push("Unexpected Token in the response");
	                  }
	               }
   	         }
	         }
	         var local_postDeactivationCallBacks = postDeactivationCallBacks;
            postDeactivationCallBacks = [];
            deactivating = false;
            activeConnections = 0;
            Barear = null;
            local_postDeactivationCallBacks.forEach(function(cb) {
               if (typeof(cb) == "function") {
                  cb(err);
               }
            });
	      });
      });
      req.write(content);
      req.end();
   }
}
module.exports = ApplicationOnlyAuthManager;
