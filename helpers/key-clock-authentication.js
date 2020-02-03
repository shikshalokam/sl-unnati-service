/**
 * name : key-clock-authentication
 * author : Rakesh Kumar
 */
var keyCloakAuthUtils = require("keycloak-auth-utils");

function ApiInterceptor(keyclock_config, cache_config) {
  this.config = keyclock_config;
  this.keyCloakConfig = new keyCloakAuthUtils.Config(this.config);
  this.grantManager = new keyCloakAuthUtils.GrantManager(this.keyCloakConfig);

}

/**
 * [validateToken is used for validate user]
 * @param  {[string]}   token    [x-auth-token]
 * @param  {Function} callback []
 * @return {[Function]} callback [its retrun err or object with fields(token, userId)]
 */
ApiInterceptor.prototype.validateToken = function(token, callback) {
      var self = this;

      
      self.grantManager.userInfo(token, function(err, userData) {
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, { token: token, userId: userData.sub });
        }
      });
};
module.exports = ApiInterceptor;
