/**
 * db.js
 *
 */

var mongo = require('mongodb'),
    mongoose = require('mongoose');

/**
 * Connect database
 */
exports.connect = function (callback) {
    'use strict';

    console.log('connect(): %s', process.env.MONGOLAB_URI);

    mongoose.connect(process.env.MONGOLAB_URI, function (err) {
        if (!err) {
            console.log('connected...')
        } else {
            throw err;
        }
    });

    callback();
};

