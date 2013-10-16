var S3_FIELDS = ['key', 'secret', 'bucket', 'local', 'domain', 'emulation'];
module.exports = function () {
    var noxmox = require('noxmox'),
        knox = require('knox'),
        uuid = require('uuid'),
        util = require('../util');

    /* Load S3 Configuration */
    var s3_conf = util.getEnvConfig(S3_FIELDS, { prefix: 'S3_' }),
        emulate_s3 = s3_conf.emulation || !s3_conf.key,
        s3_mode = emulate_s3 ? 'mox' : 'nox';

    if (emulate_s3) {
        require('mox-server').runServer(this.app.get('MOX_PORT'));
    }

    return {
        mode: s3_mode,
        conf: s3_conf,
        url: function (filename) {
            return this.client.url(filename);
        },
        put: function (data, type, cb) {
            var filename = "/" + uuid.v4();
            var s3_req = this.client.put(filename, {
                'Content-Length':   data.length,
                'Content-Type':     type,
                'x-amz-acl':        'public-read'
            });
            s3_req.on('response', function(s3_res) {
                if (s3_res.statusCode === 200)
                    cb(filename, s3_res);
            });
            s3_req.end(data);
            return filename;
        },
        delete: function (url) {
            var match = url.match(/\/([^\/]+)\/?$/);
            if (match) {
                this.client.del(match[1]);
                return true;
            } else console.error("Error: S3 url ("+url+") seems to be invalid.");
            return false;
        },
        client: { mox: noxmox.mox, nox: knox }[s3_mode].createClient(s3_conf)
    };
};
