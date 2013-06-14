/*
 jQuery UI Slider plugin wrapper
*/
angular.module('ui.slider', []).value('uiSliderConfig',{}).directive('uiSlider', ['uiSliderConfig', function(uiSliderConfig) {
	uiSliderConfig = uiSliderConfig || {};
        return {
            restrict: 'A',
            require: 'ngModel',            
            scope: {
                value: '=ngModel'
            },
            link: function (scope, elm, $attrs, uiEvent) {
                var expression = {};                
                // Set attribute from element
                if (!angular.isUndefined($attrs.min)) {
                        expression['min'] = parseInt($attrs.min);
                }
                if (!angular.isUndefined($attrs.max)) {
                        expression['max'] = parseInt($attrs.max);
                }
                if (!angular.isUndefined($attrs.step)) {
                        expression['step'] = parseInt($attrs.step);
                }
                if (!angular.isUndefined($attrs.initValue)) {
                    expression['value'] = parseInt($attrs.initValue);
                   	scope.value = expression['value'];
                }
                if (!angular.isUndefined($attrs.range)) {
                        expression['range'] = $attrs.range;
                }                  
                // Default values                      
                var options = {
                	range:	'min',
                    value: scope.value,
                    min: 1,
                    max: 100,
                    // Apply values
                    slide: function (event, ui) {
                        scope.$apply(function () {
                            scope.value = ui.value;
                        });
                    },
                    // Set initial value when slider handle is clicked
                    start: function( event, ui ) {
                        if (!scope.value) {
                            scope.$apply(function () {
                                if (!angular.isUndefined(expression['min'])) {
                                    scope.value = expression['min'];
                                }
                                else if (!angular.isUndefined(uiSliderConfig['min'])) {
                                    scope.value = parseInt(uiSliderConfig['min']);
                                }
                                else if (!angular.isUndefined(options['min'])) {
                                    scope.value = parseInt(options['min']);
                                }
                            });
                         }
                    }
                };
                
                // Watch for changes in value, update all sliders bind to the same model within scope
                scope.$watch('value', function (newVal, oldVal) {
                    if (!angular.isUndefined(newVal) && newVal != oldVal) {
                        elm.slider('value', newVal);
                    }
                });
                //Set the options from the directive's configuration
                angular.extend(options, uiSliderConfig, expression);
                elm.slider(options);
            }
        };
    }]);
