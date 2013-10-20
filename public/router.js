//----------------
// Router
//----------------

/*jshint supernew: true */
/*global define:false */

define([
	'underscore',
	'backbone',
	'js/views/main/MainView'
], function (_, Backbone, MainView) {
	'use strict';

	var AppRouter = Backbone.Router.extend({
		routes: {
			// Default
			'*actions': 'defaultAction'
		}
	});

	var initialize = function () {
		var app_router = new AppRouter,
			mainView = null;
		
		mainView = new MainView();
		mainView.render();

		app_router.on('route:getPage', function (id) {
			// do nothing...
		});

		app_router.on('route:getPath', function (folder, id) {
			// do nothing...
		});

		app_router.on('route:defaultAction', function () {
			// do nothing...
		});

		// create an event disptacher
		Backbone.dispatcher = _.extend({}, Backbone.Events);

		Backbone.history.start();
	};

	return {
		initialize: initialize
	};

});