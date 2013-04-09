var https = require('https');

function ApplicationOnlyAuthManager(options) {
   if (!(this instanceof ApplicationOnlyAuthManager)) return new ApplicationOnlyAuthManager(options);
   
}
module.exports = ApplicationOnlyAuthManager;
