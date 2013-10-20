/**
 * tags.js
 *
 */

var db = require('./db'),
    Instagram = require('instagram-node-lib'),
    users = require('./users'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    TagSchema;

TagSchema = new Schema({
    name        : String,
    added_at    : { type: Date, default: Date.now }, 
    source      : String
});

// register schema
mongoose.model('Tag', TagSchema);

// create model instance
exports.TagModel = mongoose.model('Tag');

/**
 * Get tags by user ID
 */
exports.getTagsByUserId = function (userId, callback) {
    'use strict';

    console.log('getTagsByUserId(): %s', userId);

    users.UserModel.findOne({ id: userId }, function (err, user) {
        var tags = [],
            prop;

        if (err) {
            throw err;
        } else if (!user) {
            console.log('user not found with id: %s', userId);
        } else {
            tags = user.tags;
        }
        callback(err, tags);
    });
};

/**
 * Get tags from self media
 */
exports.getTagsFromSelf = function (userId, accessToken, callback) {
    'use strict';

    console.log('getTagsFromSelf(): %s', userId);

    var tags = [],
        images = [],
        processImages = function (data) {
            if (images.length < 5) {
                images.push(data.standard_resolution.url)    
            }
        },        
        processTags = function (data) {
            data.forEach(function (tag, index, array) {
                tags.push(tag);
            });
        },
        onData = function (data) {
            data.forEach(function (post, index, array) {
                processTags(post.tags);
                processImages(post.images);
            });

            callback(tags, images);
        };

    Instagram.set('access_token', accessToken); 
    Instagram.users.recent({
        user_id: userId,
        count: 5000,
        complete: onData
    }); 
}

/**
 * Get tags from liked media
 */
exports.getTagsFromLiked = function (userId, accessToken, callback) {
    'use strict';

    console.log('getTagsFromLiked()');

    var tags = [],
        processTags = function (data) {
            data.forEach(function (tag, index, array) {
                tags.push(tag);
            });
        },
        onData = function (data) {
            data.forEach(function (post, index, array) {
                processTags(post.tags);
            });

            callback(tags);
        };

    Instagram.set('access_token', accessToken);
    Instagram.users.liked_by_self({
        count: 5000,
        complete: onData
    });
};
