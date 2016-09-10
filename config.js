/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path     = require('path'),
    extend   = require('extend'),
    config   = require('spa-plugin/config'),
    profiles = {};


// main
profiles.default = extend(true, {}, config, {
    // ssh2 package connection options
    connection: {
        host: 'localhost',
        port: 22,
        username: process.env.USER,
        privateKey: require('fs').readFileSync(path.join(process.env.HOME, '.ssh', 'id_rsa'))
    },

    // a task for each key
    commands: {
        uptime: 'uptime',
        meminfo: 'cat /proc/meminfo'
    },

    // info channels
    notifications: {
        popup: {
            info: {icon: path.join(__dirname, 'media', 'info.png')},
            warn: {icon: path.join(__dirname, 'media', 'warn.png')},
            fail: {icon: path.join(__dirname, 'media', 'fail.png')}
        }
    }
});


// public
module.exports = profiles;
