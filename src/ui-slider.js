// requestAnimationFrame polyfill by Erik MÃ¶ller. fixes from Paul Irish and Tino Zijdel
(function (window, document) {
  'use strict';


  /**
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
   *
   * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
   *
   * MIT license
   */
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }


  /**
   * UI.Slider
   */
  angular.module('ui.slider', []).value('uiSliderConfig', {})
    .directive('uiSlider', [
      function() {


        // Get all the page.
        var htmlElement = angular.element(document.body.parentElement);
        var domElement = "<div class=\"ui-slider-container\">\n  <div class=\"ui-slider-runnable-track\">\n    <div class=\"ui-slider-slider-thumb\"></div>\n  </div>\n</div>";

        function isEmpty(value) {
          return angular.isUndefined(value) || value === '' || value === null || value !== value;
        }

        return {
          restrict: 'AE',
          require: '?ngModel',
          template: domElement,
          link: function(scope, iElement, attrs, ngModel) {

            var animationFrameRequested, lastPos, max;
            var _cache = {};
            var track = iElement.children().children();
            var thumb = track.children();

            var options = angular.extend({}, scope.$eval(attrs.uiSlider));

            // Watch ui-slider (byVal) for changes and update
            scope.$watch(attrs.uiSlider, function(newVal) {
              options = angular.extend(options, newVal);
              if (ngModel) {
                ngModel.$render();
              }
            }, true);

            // Observe max attr (default 100)
            attrs.$observe('max', function(newVal) {
              _cache.max = +newVal || 100;
              if (ngModel) {
                ngModel.$render();
              }
            });

            // Observe min attr (default 0)
            attrs.$observe('min', function(newVal) {
              _cache.min = +newVal || 0;
              if (ngModel) {
                ngModel.$render();
              }
            });

            function _cached_layout_values() {

              if (_cache.time && +new Date() < _cache.time + 1000) return; // after ~60 frames

              // track bounding box
              var track_bb = track[0].getBoundingClientRect();
              var thumb_bb = thumb[0].getBoundingClientRect();

              _cache.time = +new Date();
              _cache.trackOrigine = track_bb.left;
              _cache.trackSize = track_bb.width;
              _cache.thumbSize = thumb_bb.width;
            }

            function _handleMouseEvent(mouseEvent) {
              // Store the mouse position for later
              lastPos = mouseEvent.x;

              // Cancel previous rAF call
              if (animationFrameRequested) window.cancelAnimationFrame(animationFrameRequested);

              _cached_layout_values();

              // Animate the page outside the event
              animationFrameRequested = window.requestAnimationFrame(function drawAndUpdateTheModel() {

                var the_thumb_pos = (lastPos - _cache.trackOrigine - _cache.thumbSize / 2) / _cache.trackSize * 100;

                // Use ngmodel.$formatters ??
                if (options.step) {
                  the_thumb_pos = Math.floor(the_thumb_pos / options.step) * options.step;
                }

                // Here we clamp the result to be beetween 0 and 100
                the_thumb_pos = Math.min(Math.max(the_thumb_pos, 0), 100);

                thumb.css('left', "" + the_thumb_pos + "%");


                if (ngModel) {
                  var the_thumb_value = _cache.min + the_thumb_pos / 100 * (_cache.max - _cache.min);

                  // Use ngmodel.$formatters ??
                  // reSteping...
                  if (options.step) {
                    the_thumb_value = Math.floor(the_thumb_value / options.step) * options.step;
                  }
                  ngModel.$setViewValue(parseFloat(the_thumb_value.toFixed(5)));
                  if (!scope.$$phase) {
                    scope.$apply();
                  }
                }
              });

            }

            if (ngModel) {
              ngModel.$formatters.push(function(value) {
                return ((angular.isNumber(value)) ? value : 0);
              });

              ngModel.$render = function() {
                var the_thumb_pos = ngModel.$viewValue;

                _cached_layout_values();

                // Use ngmodel.$formatters ??
                if (options.step) {
                  the_thumb_pos = Math.floor(the_thumb_pos / options.step) * options.step;
                }

                // The value is on the correct range
                the_thumb_pos = Math.max(Math.min(the_thumb_pos, _cache.max), _cache.min);
                // Get the position in percentage
                the_thumb_pos = (the_thumb_pos - _cache.min) / (_cache.max - _cache.min) * 100;


                // Cancel previous rAF call
                if (animationFrameRequested) window.cancelAnimationFrame(animationFrameRequested);

                // Animate the page outside the event
                animationFrameRequested = window.requestAnimationFrame(function drawFromTheModelValue() {
                  thumb.css('left', "" + the_thumb_pos + "%");
                });
              };

            }




            // Bind the click on the bar then you can move it all over the page.
            iElement.bind('mousedown', function(e) {
              e.preventDefault();
              e.stopPropagation();
              _handleMouseEvent(e); // Handle simple click
              htmlElement.bind('mousemove', _handleMouseEvent);
              return false;
            });
            htmlElement.bind('mouseup', function(e) {
              // Don't preventDefault and stopPropagation
              // The html element needs to be free of doing anything !
              htmlElement.unbind('mousemove');
            });

          }
        };
      }
    ]);




}(window, document));