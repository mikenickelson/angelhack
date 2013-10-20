//----------------
// Main
//----------------

/*global require:false */

require.config({
	paths: {
		underscore: 'js/libs/underscore/underscore-min',
		backbone: 'js/libs/backbone/backbone-min',
		jquery: 'js/libs/jquery/jquery-min',
		templates: '../templates',
		modernizr: 'js/libs/modernizr/modernizr.min',
		swipe: 'js/libs/swipe/swipe'
	}
});

require([
	'app'
], function (App) {
	'use strict';

	App.initialize();
});