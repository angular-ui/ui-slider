/*
 jQuery UI Slider plugin wrapper
*/
angular.module('ui.slider', []).value('uiSliderConfig',{}).directive('uiSlider', ['uiSliderConfig', '$timeout', function(uiSliderConfig, $timeout) {
	uiSliderConfig = uiSliderConfig || {};
        return {
            require: 'ngModel',
            compile: function (tElm, tAttrs) {
                return function ($scope, elm, $attrs, ngModel) {
                    var options = angular.extend($scope.$eval($attrs.uiSlider) || {}, uiSliderConfig);

                    var init = function() {
                        elm.slider(options);
                        init = angular.noop;
                    };

                    // convenience properties
                    var properties = ['min', 'max', 'step'];
                    $.each(properties, function(i, property){
                        // support {{}} and watch for updates
                        $attrs.$observe(property, function(newVal){
                            if (!!newVal) {
                                init();
                                elm.slider('option', property, parseInt(newVal));
                            }
                        });
                    });
                    $attrs.$observe('disabled', function(newVal){
                        init();
                        elm.slider('option', 'disabled', !!newVal);
                    });

                    // Watch ui-slider (byVal) for changes and update
                    $scope.$watch($attrs.uiSlider, function(newVal){
                        init();
                        elm.slider('option', newVal);
                    }, true);
                    
                    // Late-bind to prevent compiler clobbering
                    $timeout(init, 0, true);
                    
                    // Update model value from slider
                    elm.bind('slide', function(event, ui){
                        ngModel.$setViewValue(ui.values || ui.value);
                        $scope.$apply();
                    });
                    
                    // Update slider from model value
                    ngModel.$render = function(){
                        init();
                        var method = options.range === true ? 'values' : 'value';
                        if (!ngModel.$viewValue)
                            ngModel.$viewValue = 0;
                        elm.slider(method, ngModel.$viewValue);
                    };
                    
                    $scope.$watch($attrs.ngModel, function(){
                        if (options.range === true)
                            ngModel.$render();
                    }, true);

                    function destroy(){
                        elm.slider('destroy');
                    }
                    elm.bind('$destroy', destroy);
                };
            }
        };
    }]);
