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

        function isEmpty(value) {
          return angular.isUndefined(value) || value === '' || value === null || value !== value;
        }

        return {
          restrict: 'AE',
          require: '?ngModel',
          template: '<div class="ui-slider-container">\n' +
            '  <div class="ui-slider-runnable-track">\n' +
            '    <div class="ui-slider-thumb"></div>\n' +
            '  </div>\n' +
            '</div>',
          link: function(scope, iElement, attrs, ngModel) {

            var animationFrameRequested, lastPos, max;
            var _cache = {};
            var track = angular.element(iElement[0].getElementsByClassName('ui-slider-runnable-track'));
            var thumb = angular.element(track[0].getElementsByClassName('ui-slider-thumb'));

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
              _cache.max = +newVal;
              _cache.max = !isNaN(_cache.max) ? _cache.max : 100;
              if (ngModel) {
                ngModel.$render();
              }
            });

            // Observe min attr (default 0)
            attrs.$observe('min', function(newVal) {
              _cache.min = +newVal;
              _cache.min = !isNaN(_cache.min) ? _cache.min : 0;
              if (ngModel) {
                ngModel.$render();
              }
            });

            // Observe min attr (default 1)
            attrs.$observe('step', function (newVal) {
              _cache.step = +newVal;
              _cache.step = !isNaN(_cache.step) && _cache.step > 0 ? _cache.step : 1;
              if (ngModel) {
                ngModel.$render();
              }
            });

            function _cached_layout_values() {

              if (_cache.time && +new Date() < _cache.time + 1000) { return; } // after ~60 frames

              // track bounding box
              var track_bb = track[0].getBoundingClientRect();
              var thumb_bb = thumb[0].getBoundingClientRect();

              _cache.time = +new Date();
              _cache.trackOrigine = track_bb.left;
              _cache.trackSize = track_bb.width;
              _cache.thumbSize = thumb_bb.width;
            }


            function _formatValue(value) {
              var formattedValue = value;
              if (_cache.min > _cache.max) return NaN;
              formattedValue = Math.floor(formattedValue / _cache.step) * _cache.step;
              formattedValue = Math.max(Math.min(formattedValue, _cache.max), _cache.min);
              return formattedValue;
            }

            function _drawFromValue(value) {
              var drawValue = value;
              if (isNaN(drawValue)) drawValue = 0;
              drawValue = (value - _cache.min ) / (_cache.max - _cache.min) * 100;
              thumb.css('left', drawValue + '%');
            }

            function _handleMouseEvent(mouseEvent) {
              // Store the mouse position for later
              lastPos = mouseEvent.clientX;

              // Cancel previous rAF call
              if (animationFrameRequested) { window.cancelAnimationFrame(animationFrameRequested); }

              // Animate the page outside the event
              animationFrameRequested = window.requestAnimationFrame(function drawAndUpdateTheModel() {
                _cached_layout_values();

                var the_thumb_value;
                the_thumb_value = _cache.min + (lastPos - _cache.trackOrigine) / _cache.trackSize * (_cache.max - _cache.min);
                the_thumb_value = _formatValue(the_thumb_value);
                _drawFromValue(the_thumb_value);

                if (ngModel) {
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
                var the_thumb_value = _formatValue(ngModel.$viewValue);

                // Cancel previous rAF call
                if (animationFrameRequested) { window.cancelAnimationFrame(animationFrameRequested); }

                // Animate the page outside the event
                animationFrameRequested = window.requestAnimationFrame(function drawFromTheModelValue() {
                  _cached_layout_values();
                  _drawFromValue(the_thumb_value);
                });
              };

            }




            // Bind the click on the bar then you can move it all over the page.
            iElement.bind('mousedown touchstart', function(e) {
              e.preventDefault();
              e.stopPropagation();
              _handleMouseEvent(e); // Handle simple click
              htmlElement.bind('mousemove touchmove', _handleMouseEvent);
              return false;
            });
            htmlElement.bind('mouseup touchend', function() {
              // Don't preventDefault and stopPropagation
              // The html element needs to be free of doing anything !
              htmlElement.unbind('mousemove touchmove');
            });

          }
        };
      }
    ]);




}(window, document));