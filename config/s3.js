var S3_FIELDS = ['key', 'secret', 'bucket', 'prefix'];
module.exports = function (app) {
    var noxmox = require("noxmox");

    /* Load S3 Configuration */
    var s3_conf = require('../util').getEnvConf(S3_FIELDS, { prefix: 'S3_' });
    if (!s3_conf) throw new Error("S3 configuration not found.");

    return noxmox[app.get('env') === 'production' ? 'nox' : 'mox'].createClient({
    });
};
