/**
 * geo.js
 *
 */

var db = require('./db'),
    Instagram = require('instagram-node-lib');

/**
 * Get media by geo
 */
exports.getUsersByGeo = function (lat, lng, callback) {
    'use strict';

    console.log('getUsersByGeo(): %s,%s', lat, lng);

    var users = [];

    var onData = function (data) {
        data.forEach(function (media, index, array) {
            users.push(media.user);
        });
        
        callback(users);
    };

    Instagram.media.search({
        lat: lat,
        lng: lng,
        distance: 5000,
        complete: onData
    });
};