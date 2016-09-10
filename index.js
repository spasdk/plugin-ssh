/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var Plugin = require('./lib/plugin');


// public
module.exports = new Plugin({
    name: 'ssh',
    entry: 'connect',
    config: require('./config')
});
