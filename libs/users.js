/**
 * users.js
 *
 */

var db = require('./db'),
    Instagram = require('instagram-node-lib'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    UserSchema;

UserSchema = new Schema({
    id              : String,
    username        : String,
    full_name       : String,
    profile_picture : String,
    active          : { type: Boolean, default: true },
    access_token    : String,
    num_follows     : String,
    added_at        : { type: Date, default: Date.now },
    updated_at      : { type: Date, default: Date.now },
    tags            : Array
});

// register schema
mongoose.model('User', UserSchema);

// create model instance
exports.UserModel = mongoose.model('User');

/**
 * Get user by ID
 */
exports.getUserById = function (userId, callback) {
    'use strict';

    console.log('getUserById(): %s %o', userId, this);
    this.UserModel.findOne({ id: userId }, callback);
};

/**
 * Get user by username
 */
exports.getUserByUsername = function (username, callback) {
    'use strict';

    console.log('getUserByUsername(): %s', username);
    this.UserModel.findOne({ username: username }, callback);
};

/**
 * Add user
 */
exports.addUser = function (props, accessToken) {
    'use strict';

    console.log('addUser(): %s', props.username);
    
    props.access_token = accessToken;

    this.updateUser(props.id, props, function (err) {
        if (err) {
            throw error;
        }
    });
};

/**
 * Update user
 */
exports.updateUser = function (userId, props, callback) {
    'use strict';

    console.log('updateUser(): %s', userId);

    var condition = { id: userId },
        update = { $set: props },
        options = { upsert: true };

    this.UserModel.update(condition, update, options, callback);
}
