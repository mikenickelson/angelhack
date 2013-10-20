/**
 * friends.js
 *
 */

var db = require('./db'),
    Instagram = require('instagram-node-lib'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    FriendSchema;

FriendSchema = new Schema({
    id              : String,
    username        : String,
    full_name       : String,
    profile_picture : String,
    num_follows     : String,
    added_at        : { type: Date, default: Date.now },
    updated_at      : { type: Date, default: Date.now },
    tags            : Array,
    images          : Array
});

// register schema
mongoose.model('Friend', FriendSchema);

// create model instance
exports.FriendModel = mongoose.model('Friend');

/**
 * Get friend by ID
 */
exports.getFriendById = function (friendId, callback) {
    'use strict';

    console.log('getFriendById(): %s', friendId);
    this.FriendModel.findOne({ id: friendId }, callback);
};

/**
 * Add friend
 */
exports.addFriend = function (props, accessToken) {
    'use strict';

    console.log('addFriend(): %s', props.username);

    this.updateFriend(props.id, props, function (err) {
        if (err) {
            throw error;
        }
    });
};

/**
 * Update friend
 */
exports.updateFriend = function (friendId, props, callback) {
    'use strict';

    console.log('updateFriend(): %s', friendId);

    var condition = { id: friendId },
        update = { $set: props },
        options = { upsert: true };

    this.FriendModel.update(condition, update, options, callback);
}
