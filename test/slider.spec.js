'use strict';

describe('uiSlider', function () {

  // declare these up here to be global to all tests
  var scope, $compile, element;


  function appendTemplate(tpl) {
    element = angular.element(tpl);
    angular.element(document.body).append(element);
    $compile(element)(scope);
  }

  beforeEach(module('ui.slider'));

  // inject in angular constructs. Injector knows about leading/trailing underscores and does the right thing
  // otherwise, you would need to inject these into each test
  beforeEach(inject(function (_$rootScope_, _$compile_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));


  describe('directive', function () {

    afterEach(function () {
      if (element) {
        element.remove();
      }
    });

    it('should have a expected result', function () {
      appendTemplate('<div ui-slider></div>');
      expect(element.children().hasClass('ui-slider-container')).toBeTruthy();
    });

    it('should work as an element', function () {
      appendTemplate('<ui-slider></ui-slider>');
      expect(element.children().hasClass('ui-slider-container')).toBeTruthy();
    });

    it('should work as an attribute', function () {
      appendTemplate('<div ui-slider></div>');
      expect(element.children().hasClass('ui-slider-container')).toBeTruthy();
    });
  });

});