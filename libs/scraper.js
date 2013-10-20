/**
 * scraper.js
 * 
 */

exports.getProfilePics = function (profileId, callback) {
	'use strict';

	console.log('getProfilePics():' + profileId);

	var express = require('express'),
		http = require('http'),
		fs = require('fs'),
		MAX_IMAGES = 4,
		req,
		callback,
		images = [],
		options = {
			host: 'instagram.com',
			port: 80,
			path: '/' + profileId,
			method: 'GET'
		};

	req = http.request(options, function (response) {
		var html = '';

		response.on('data', function (chunk) {
			html += chunk;
		});

		response.on('end', function () {

			var i,
				regEx = /"userMedia":(.*),"prerelease"/i,		/* /"userprofile","Main",(.*),"rC0"/i, */
				matches = html.match(regEx),
				profile = {},
				imageUrls = [];

			if (matches && matches.length) {
				try {
					profile = JSON.parse(matches[1]);

					profile.forEach(function (element, index, array) {
						var prop;

						for (prop in element) {
							if (prop === 'images') {
								images.push({
									url : element.images.standard_resolution.url,
									likes : element.likes.count
								});
							}
						}
					});					
				}
				catch (e) {
					console.log('error parsing profile for %s; error is %s ', profileId, e);
				}

				imageUrls.push(images.shift().url);

				// pull 4 most-liked images
				i = 0;
				while(images.length && i < MAX_IMAGES) {
					imageUrls.push(images.pop().url);
					i = i + 1;
				}
			}

			callback(imageUrls);
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
}