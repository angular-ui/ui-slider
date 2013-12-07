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
    .controller('uiSliderController', ['$element', function uiSliderCtrl($element) {

      this.element = $element;

    }])


    .directive('uiSlider', function () {
      return {
        restrict: 'EAC',
        controller: 'uiSliderController',
        compile: function (tElement, tAttrs) {
          if (tElement.children().length === 0) {
            // Create a default slider for design purpose.
            tElement.addClass('ui-slider-default');
            tElement.append(
              // Use a virtual scope key to allow
              '<ui-slider-thumb ng-model="__' + Math.random().toString(36).substring(7) + '"></ui-slider-thumb>'
            );
          }

          return function (scope, iElement, iAttrs, controller) {
            ////////////////////////////////////////////////////////////////////
            // OBSERVERS
            ////////////////////////////////////////////////////////////////////

            // Observe the min attr (default 0)
            iAttrs.$observe('min', function (newVal) {
              controller.min = +newVal;
              controller.min = !isNaN(controller.min) ? controller.min : 0;
              //TODO Add on fly validation
            });

            // Observe the max attr (default 100)
            iAttrs.$observe('max', function (newVal) {
              controller.max = +newVal;
              controller.max = !isNaN(controller.max) ? controller.max : 100;
              //TODO Add on fly validation
            });

            // Observe the step attr (default 1)
            iAttrs.$observe('step', function (newVal) {
              controller.step = +newVal;
              controller.step = !isNaN(controller.step) && controller.step > 0 ? controller.step : 1;
              //TODO Add on fly validation
            });

          };
        }
      };
    })

    .directive('uiSliderRange', function () {
      return {
        restrict: 'EAC',
        require: ['^uiSlider'],
        scope: { start: '@', end: '@' },
        link: function (scope, iElement, iAttrs) {
          ////////////////////////////////////////////////////////////////////
          // OBSERVERS
          ////////////////////////////////////////////////////////////////////

          // Observe the start attr (default 0%)
          iAttrs.$observe('start', function (newVal) {
            var val = !isNaN(+newVal) ? +newVal : 0;
            // TODO add half of th width of the targeted thumb ([ng-model='+ iAttrs.$attr.start + '])
            iElement.css('left', val + '%');
          });

          // Observe the min attr (default 100%)
          iAttrs.$observe('end', function (newVal) {
            // Don't display the range if no attr are specified
            var displayed = angular.isDefined(iAttrs.start) || angular.isDefined(iAttrs.end);
            var val = !isNaN(+newVal) ? +newVal : displayed ? 100 : 0;
            // TODO add half of th width of the targeted thumb ([ng-model='+ iAttrs.$attr.end + '])
            iElement.css('right', (100 - val) + '%');
          });

        }
      };
    })

    .directive('uiSliderThumb', function () {
      // Get all the page.
      var htmlElement = angular.element(document.body.parentElement);

      return {
        restrict: 'EAC',
        require: ['^uiSlider', '?ngModel'],
        link: function (scope, iElement, iAttrs, controller) {
          if (!controller[1]) return;
          var ngModel = controller[1];
          var uiSliderCtrl = controller[0];
          var animationFrameRequested;
          var _cache = {};

          ////////////////////////////////////////////////////////////////////
          // UTILS
          ////////////////////////////////////////////////////////////////////

          function _formatValue(value, min, max, step) {
            var formattedValue = value;
            if (min > max) return max;
            formattedValue = Math.floor(formattedValue / step) * step;
            formattedValue = Math.max(Math.min(formattedValue, max), min);
            return formattedValue;
          }

          function getFormattedValue(value) {
            var formattedValue = value;
            formattedValue = _formatValue(formattedValue, uiSliderCtrl.min, uiSliderCtrl.max, uiSliderCtrl.step);
            formattedValue = _formatValue(formattedValue, _cache.min, _cache.max, _cache.step);
            return formattedValue;
          }

          ////////////////////////////////////////////////////////////////////
          // OBSERVERS
          ////////////////////////////////////////////////////////////////////

          // Observe the min attr (default 0)
          iAttrs.$observe('min', function (newVal) {
            var oldVal = _cache.min;
            _cache.min = +newVal;
            _cache.min = !isNaN(_cache.min) ? _cache.min : 0;

            if (!angular.isUndefined(oldVal) && oldVal !== _cache.max) {
              ngModel.$setViewValue(getFormattedValue(ngModel.$viewValue));
            }
            ngModel.$render();
          });

          // Observe the max attr (default 100)
          iAttrs.$observe('max', function (newVal) {
            var oldVal = _cache.max;
            _cache.max = +newVal;
            _cache.max = !isNaN(_cache.max) ? _cache.max : 100;

            if (!angular.isUndefined(oldVal) && oldVal !== _cache.max) {
              ngModel.$setViewValue(getFormattedValue(ngModel.$viewValue));
            }
            ngModel.$render();
          });

          // Observe the step attr (default 1)
          iAttrs.$observe('step', function (newVal) {
            var oldVal = _cache.step;
            _cache.step = +newVal;
            _cache.step = !isNaN(_cache.step) && _cache.step > 0 ? _cache.step : 1;

            if (!angular.isUndefined(oldVal) && oldVal !== _cache.step) {
              ngModel.$setViewValue(getFormattedValue(ngModel.$viewValue));
            }
            ngModel.$render();
          });

          ////////////////////////////////////////////////////////////////////
          // RENDERING
          ////////////////////////////////////////////////////////////////////

          ngModel.$render = function () {

            // Cancel previous rAF call
            if (animationFrameRequested) {
              window.cancelAnimationFrame(animationFrameRequested);
            }

            // Animate the page outside the event
            animationFrameRequested = window.requestAnimationFrame(function drawFromTheModelValue() {
              var the_thumb_pos = (ngModel.$viewValue - uiSliderCtrl.min ) / (uiSliderCtrl.max - uiSliderCtrl.min) * 100;
              iElement.css('left', the_thumb_pos + '%');
            });
          };


          ////////////////////////////////////////////////////////////////////
          // FORMATTING
          ////////////////////////////////////////////////////////////////////

          // Final view format
          ngModel.$formatters.push(function (value) {
            return +value;
          });

          // Checks that it's on the step
          ngModel.$parsers.push(function stepParser(value) {
            return Math.floor(value / _cache.step) * _cache.step;
          });
          ngModel.$formatters.push(function stepValidator(value) {
            if (!ngModel.$isEmpty(value) && value !== Math.floor(value / _cache.step) * _cache.step) {
              ngModel.$setValidity('step', false);
              return undefined;
            } else {
              ngModel.$setValidity('step', true);
              return value;
            }
          });

          // Checks that it's less then the maximum
          ngModel.$parsers.push(function maxParser(value) {
            return Math.min(Math.min(value, _cache.max), uiSliderCtrl.max);
          });
          ngModel.$formatters.push(function maxValidator(value) {
            if (!ngModel.$isEmpty(value) && (value > _cache.max || value > uiSliderCtrl.max)) {
              ngModel.$setValidity('max', false);
              return undefined;
            } else {
              ngModel.$setValidity('max', true);
              return value;
            }
          });

          // Checks that it's more then the minimum
          ngModel.$parsers.push(function minParser(value) {
            return Math.max(Math.max(value, _cache.min), uiSliderCtrl.min);
          });
          ngModel.$formatters.push(function minValidator(value) {
            if (!ngModel.$isEmpty(value) && (value < _cache.min || value < uiSliderCtrl.min)) {
              ngModel.$setValidity('min', false);
              return undefined;
            } else {
              ngModel.$setValidity('min', true);
              return value;
            }
          });


          // First check that a number is used
          ngModel.$formatters.push(function numberValidator(value) {
            if (ngModel.$isEmpty(value) || angular.isNumber(value)) {
              ngModel.$setValidity('number', true);
              return +value;
            } else {
              ngModel.$setValidity('number', false);
              return undefined;
            }
          });

          ////////////////////////////////////////////////////////////////////
          // USER EVENT BINDING
          ////////////////////////////////////////////////////////////////////

          var hasMultipleThumb = iElement.parent()[0].getElementsByClassName('ui-slider-thumb').length;
          hasMultipleThumb += iElement.parent()[0].getElementsByTagName('ui-slider-thumb').length;
          //TODO add attribute name "[ui-slider-thumb]" ...
          hasMultipleThumb = hasMultipleThumb > 1;

          // Bind the click on the bar then you can move it all over the page.
          if (!hasMultipleThumb) {
            uiSliderCtrl.element.on('mousedown touchstart', function (e) {
              e.preventDefault();
              e.stopPropagation();
              _handleMouseEvent(e); // Handle simple click
              htmlElement.bind('mousemove touchmove', _handleMouseEvent);
              return false;
            });
          } else {
            iElement.on('mousedown touchstart', function (e) {
              e.preventDefault();
              e.stopPropagation();
              htmlElement.bind('mousemove touchmove', _handleMouseEvent);
              return false;
            });
          }
          htmlElement.on('mouseup touchend', function () {
            // Don't preventDefault and stopPropagation
            // The html element needs to be free of doing anything !
            htmlElement.unbind('mousemove touchmove');
          });

          function _cached_layout_values() {

            if (_cache.time && +new Date() < _cache.time + 1000) {
              return;
            } // after ~60 frames

            // track bounding box
            var track_bb = iElement.parent()[0].getBoundingClientRect();

            _cache.time = +new Date();
            _cache.trackOrigine = track_bb.left;
            _cache.trackSize = track_bb.width;
          }

          function _handleMouseEvent(mouseEvent) {
            // Store the mouse position for later
            _cache.lastPos = mouseEvent.clientX;

            _cached_layout_values();

            var the_thumb_value = uiSliderCtrl.min + (_cache.lastPos - _cache.trackOrigine) / _cache.trackSize * (uiSliderCtrl.max - uiSliderCtrl.min);
            the_thumb_value = Math.max(Math.min(the_thumb_value, _cache.max), _cache.min);
            the_thumb_value = Math.max(Math.min(the_thumb_value, uiSliderCtrl.max), uiSliderCtrl.min);

            ngModel.$setViewValue(parseFloat(the_thumb_value.toFixed(5)));
            if (!scope.$root.$$phase) {
              scope.$root.$apply();
            }
            ngModel.$render();
          }

        }
      };
    })
  ;


}(window, document));
