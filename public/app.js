//----------------
// App
//----------------

/*global define:false */

define([
	'underscore',
	'backbone',
	'router'
], function (_, Backbone, Router) {
	'use strict';

	return {
		initialize : function () {
			Router.initialize();
		}
	};
});