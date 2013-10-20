/**
 * routes.js
 *
 */

var Instagram = require('instagram-node-lib'),
	db = require('../libs/db'),
	tags = require('../libs/tags'),
	users = require('../libs/users'),
    friends = require('../libs/friends'),
	geo = require('../libs/geo'),
	scraper = require('../libs/scraper');

Instagram.set('client_id', process.env.CLIENT_ID);
Instagram.set('client_secret', process.env.CLIENT_SECRET);
Instagram.set('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI);

/**
 * Welcome
 */
exports.welcome = function (req, res) {
    'use strict';
    res.render('authorize', { klazz: 'authorize' });
};

/**
 * Login
 */
exports.login = function (req, res) {
	'use strict';
	res.render('login', { klazz: 'login' });
};

/**
 * Profile
 */
exports.profiles = function (req, res) {
	'use strict';
	res.render('profiles', { klazz: 'profiles' });
};

/**
 * Oauth authorization
 */
exports.authorize = function (req, res) {
	'use strict';

	console.log('authorize()');

	var url = Instagram.oauth.authorization_url({ scope: 'comments relationships likes' });
	res.redirect(url);
};

/**
 * Oauth redirect
 */
exports.redirect = function (req, res) {
	'use strict';

	console.log('redirect():' + process.env.INSTAGRAM_REDIRECT_URI);

	Instagram.oauth.ask_for_access_token({
		request: req,
		response: res,
		redirect: null,
		complete: function (params, response) {
			console.log('complete():' + JSON.stringify(params));

			var accessToken = params.access_token,
				user = params.user;

			// add user to database
			users.addUser(user, accessToken);

            // save user info in session
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.accessToken = accessToken;

            res.redirect('/tags/aggregate');
		},
		error: function (errorMessage, errorObject, caller, response) {
			console.log('[error]:' + errorMessage);
			response.writeHead(406, { 'Content-Type': 'text/plain' });
			response.end();
		}
	});
};

/**
 * Aggregate tags
 */
exports.aggregate = function (req, res) {
	'use strict';

	console.log('tags()');

	var self = this,
		username = req.session.username,
        userId = null,
		accessToken = null,
		userTags = [],
		apiCalls = [],
		apiResponses = 0;

	function onTagsReceived (foundTags, foundImages) {
        'use strict';

		apiResponses = apiResponses + 1;

		// collect tags
		userTags = userTags.concat(foundTags);

        console.log('onTagsReceived(): %s tags', foundTags.length);

		if (apiResponses === apiCalls.length) {
			users.updateUser(userId, { tags: userTags }, function (err) {
				if (err) {
					throw err;
				} else {
					res.redirect('/app/login');
				}
			});
		}
	};

    function onUserFound (user) {
        'use strict';

        console.log('onUserFound(): %s', user);

        userId = user.id;
        accessToken = user.access_token;
    
        // check self
        apiCalls.push(tags.getTagsFromSelf);

        // check liked
        apiCalls.push(tags.getTagsFromLiked);
        
        // start
        apiCalls.forEach(function (fn, index, array) {
            fn.call(self, userId, accessToken, onTagsReceived);
        });
    }

    users.getUserByUsername(username, function (err, doc) {
        if (err) {
            throw error;
        }
        else if (doc) {
            onUserFound(doc);
        }
    });
}

/**
 * Tags results
 */
exports.results = function (req, res) {
	'use strict';

    var username = req.session.username;

	console.log('results()');

    function onUserFound (user) {
        'use strict';

        var userId = user.id;

        tags.getTagsByUserId(userId, function (err, tags) {
            if (err) {
                throw err;
            }
            res.render('results', { klazz: 'results', tags: tags.join(', ') });
        });
    }

    users.getUserByUsername(username, function (err, doc) {
        if (err) {
            throw error;
        }
        else if (doc) {
            onUserFound(doc);
        }
    });
}

/**
 * Scrape by geo
 */
exports.scrapeByGeo = function (req, res) {
	'use strict';

	console.log('scrapeByGeo()');

	var username = req.session.username,
        accessToken = null,
        ll = '37.786928,-122.403574',
		/* ll = req.params.ll.split(','), */
		lat = 37.786928 /* ll[0] */,
		lng = -122.403574 /*ll[1] */,
        userTags,
        friendsWithTags = [],
        friendsMatched = [],
        uniqueFriends = [];

    function matchTags () {
        'use strict';

        var tmp = {};

        userTags.forEach(function (tag, index, array) {
            friendsWithTags.forEach(function (friend, index, array) {
                var key = friend.username;

                if (tmp[key] === undefined) {
                    tmp[key] = friend;
                    tmp[key].matchedTags = [];
                }
                else {
                    tmp[key].tags.concat(friend.tags);   
                }
            });
        });

        for (var i in tmp) { 
            if (tmp.hasOwnProperty(i)) {
                var friend = tmp[i];
                uniqueFriends.push(friend);
                console.log('after: %s', friend.username);
            }
        }

        tmp = {};
        userTags.forEach(function (tag, index, array) {
            uniqueFriends.forEach(function (friend, index, array) {
                var key = friend.username;

                if (friend.tags.indexOf(tag) > -1) {
                    console.log('match: %s on %s', friend.username, tag);

                    if (tmp[key] === undefined) {
                        tmp[key] = friend;
                        tmp[key].matchedTags = ['#' + tag];
                    }
                    else {
                        tmp[key].tags.concat(friend.tags);
                        tmp[key].matchedTags.push('#' + tag);
                    }
                }
            });
        });

        for (var i in tmp) { 
            if (tmp.hasOwnProperty(i)) {
                var friend = tmp[i];
                friendsMatched.push(friend);
            }
        }

        res.render('friends', { klazz: 'friends', users: friendsMatched.concat(uniqueFriends) });
    }

    function onFriendsFound (friendsFound) {
        'use strict';

        var numFriendsUpdated = 0;

        friendsFound.forEach(function (friend, index, array) {
            tags.getTagsFromSelf(friend.id, accessToken, function (tags, images) {

                var props = {
                    id: friend.id,
                    full_name: friend.full_name,
                    username: friend.username,
                    profile_picture: friend.profile_picture,
                    tags: tags,
                    images: images
                };

                friends.updateFriend(friend.id, props, function (err) {
                    var key = friend.username;

                    if (err) {
                        throw error;
                    }
                    else if (++numFriendsUpdated === friendsFound.length) {
                        matchTags();
                    }
                    else {
                        friendsWithTags.push({
                            id: friend.id,
                            username: friend.username,
                            profile_picture: friend.profile_picture,
                            tags: tags,
                            images: images
                        });
                    }
                });
            });
        });
    }
	
    function onUserFound (user) {
        'use strict';

        accessToken = user.access_token;
        userTags = user.tags;

        geo.getUsersByGeo(lat, lng, onFriendsFound);
    }

    users.getUserByUsername(username, function (err, doc) {
        if (err) {
            throw error;
        }
        else if (doc) {
            onUserFound(doc);
        }
    });
};
