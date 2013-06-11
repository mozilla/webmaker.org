var S3_FIELDS = ['key', 'secret', 'bucket', 'prefix'];
module.exports = function () {
    var noxmox = require('noxmox'),
        util = require('../util');

    /* Load S3 Configuration */
    var s3_conf = util.getEnvConf(S3_FIELDS, { prefix: 'S3_' }),
        s3_mode = this.app.get('env') === 'production' ? 'nox' : 'mox';

    if (!util.hasFields(s3_conf, ['key', 'secret']))
        throw new Error("Missing or incomplete S3 configuration.");

    s3_conf.prefix = s3_conf.prefix || __dirname+'/../static/uploads';
    s3_conf.bucket = s3_conf.bucket || 'events.webmaker.org';

    return {
        mode: s3_mode,
        conf: s3_conf,
        url: function (filename) {
            return this.mode === 'mox' ? '/uploads/' + this.conf.bucket
                                               + '/' + filename
                                       : this.client.url(filename)
        },
        delete: function (url) {
            var match = url.match(/\/([^\/]+)\/?$/);
            if (match) {
                this.client.del(match[1]);
                return true;
            } else console.error("Error: S3 url ("+url+") seems to be invalid.");
            return false;
        },
        client: noxmox[s3_mode].createClient(s3_conf)
    };
};
