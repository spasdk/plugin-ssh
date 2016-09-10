/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var util   = require('util'),
    Client = require('ssh2').Client,
    PluginTemplate = require('spa-plugin');


/**
 * @constructor
 * @extends PluginTemplate
 *
 * @param {Object} config init parameters (all inherited from the parent)
 */
function Plugin ( config ) {
    var self = this;

    // parent constructor call
    PluginTemplate.call(this, config);

    // create tasks for profiles
    this.profiles.forEach(function ( profile ) {
        var commands = profile.data.commands,
            connection;

        // main entry task
        profile.task(self.entry, function ( done ) {
            var client = new Client();

            client.on('close', done);

            client.on('error', function ( error ) {
                profile.notify({
                    type: 'fail',
                    info: error.toString(),
                    tags: [self.entry]
                });
            });

            client.on('ready', function () {
                // share handle
                connection = client;

                profile.notify({
                    info: util.format(
                        'connected to %s@%s:%s',
                        profile.data.connection.username, profile.data.connection.host, profile.data.connection.port
                    ),
                    tags: [self.entry]
                });
            }).connect(profile.data.connection);
        });

        // create a task for each profile command
        Object.keys(commands).forEach(function ( name ) {
            profile.task(name, function ( done ) {
                if ( connection ) {
                    // ok
                    connection.exec(commands[name], function ( error, stream ) {
                        if ( error ) {
                            // fatal error
                            profile.notify({
                                type: 'fail',
                                info: 'command execution failed',
                                data: error,
                                tags: [name]
                            });

                            // finish
                            done();

                            return;
                        }

                        stream.on('close', function ( code, signal ) {
                            profile.notify({
                                info: util.format('execution code: %s, signal: %s', code, signal || 'n/a'),
                                tags: [name, 'close']
                            });

                            // finish
                            done();
                        }).on('data', function ( data ) {
                            profile.notify({
                                info: data.toString(),
                                tags: [name, 'stdout']
                            });
                        }).stderr.on('data', function ( data ) {
                            profile.notify({
                                type: 'warn',
                                info: data.toString(),
                                tags: [name, 'stderr']
                            });
                        });
                    });
                } else {
                    profile.notify({
                        type: 'warn',
                        info: 'no connection',
                        tags: [name]
                    });

                    // finish
                    done();
                }
            });
        });

        profile.task('close', function () {
            if ( connection ) {
                profile.notify({
                    info: 'close connection',
                    tags: ['close']
                });

                connection.end();
                connection = null;
            }
        });
    });

    this.debug('tasks: ' + Object.keys(this.tasks).sort().join(', '));
}


// inheritance
Plugin.prototype = Object.create(PluginTemplate.prototype);
Plugin.prototype.constructor = Plugin;


// public
module.exports = Plugin;
