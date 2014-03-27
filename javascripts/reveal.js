// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "reveal",
				defaults = {
					revealElement: '.reveal',
					showWhenFromBottom: 100,
					unhideOnScrollUp: true,
					scrollUpUnhideSensitivity: 50
		};

		// The actual plugin constructor
		function Plugin (element, options) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options);
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		Plugin.prototype = {
			init: function () {
				// Place initialization logic here
				// You already have access to the DOM element and
				// the options via the instance, e.g. this.element
				// and this.settings
				// you can add more functions like the one below and
				// call them like so: this.yourOtherFunction(this.element, this.settings).
				
				
				// get the viewport height
				this.documentHeight = $(document).height()-$(window).height();
				
				var _this = this;
				var refresh = false;
				
				// this seems a bit of a hack, but in at least Chrome, if you scroll down the page
				// then hit refresh, Chrome will take you to the scroll position you were at, but
				// scrollTop() still returns 0. Delaying the fucntion call seems to overcome the issue
				setTimeout(function() {
					_this.preStack(_this);
				},10);

			},
			preStack: function(_this) {
				_this.totalElements = $(_this.settings.revealElement).length;
				
				var currentHeight = 0;
				var bodyPadding = 0;

				$(_this.settings.revealElement).each(function( index ) {
					currentHeight += $(this).outerHeight();

					if(currentHeight > $(window).height()+$(window).scrollTop()) {
						$(this).css({'position': 'fixed','bottom': 0, 'zIndex': _this.totalElements - index}).addClass('stuck');
						bodyPadding += $(this).outerHeight();
					} else {
						$(this).css({'position': 'relative', 'zIndex': _this.totalElements - index}).addClass('flow');
					}
				});
				
				$('body').css('paddingBottom', bodyPadding);
				
				$(window).on('scroll', function() {
					_this.update(_this);
				});

				$(window).on('resize', function() {
					_this.update(_this);
				});
			},
			update: function (_this) {
				var s = 0;
				var stuck = $('.stuck');
				var flow = $('.flow');
					
				var offsetTop = flow.first().offset().top
				
				s += $(window).scrollTop()+offsetTop;
				
				if(s >= 0) {			
					var flowHeight = offsetTop;
					
					$('.flow').each(function() {
						flowHeight += $(this).outerHeight();
					});
					
					if(stuck.length > 0) {
						if(stuck.first().offset().top > flowHeight) {
							stuck.first().removeClass('stuck').addClass('flow').css({'position': 'relative', 'bottom': 'auto'});
							$('body').css('padding-bottom', parseInt($('body').css('padding-bottom')) - $('.flow').last().outerHeight());
						}
					}
					if(flowHeight >= $(window).height() + s) {
						$('.flow').last().removeClass('flow').addClass('stuck').css({'position': 'fixed', 'bottom': 0});
						$('body').css('padding-bottom', parseInt($('body').css('padding-bottom')) + $('.stuck').first().outerHeight());
					}
				}
			}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[pluginName] = function ( options ) {
			return this.each(function() {
				if(!$.data(this, "plugin_" + pluginName)) {
					$.data(this, "plugin_" + pluginName, new Plugin(this, options));
				}
			});
		};
		

})( jQuery, window, document );