'use strict';

describe('uiLayout', function () {

  // declare these up here to be global to all tests
  var scope, $compile, element;


  function appendTemplate(tpl) {
    element = angular.element(tpl);
    angular.element(document.body).append(element);
    $compile(element)(scope);
    scope.$digest();
  }

  beforeEach(module('ui.slider'));

  // inject in angular constructs. Injector knows about leading/trailing underscores and does the right thing
  // otherwise, you would need to inject these into each test
  beforeEach(inject(function (_$rootScope_, _$compile_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));


  // jasmine matcher for expecting an element to have a css class
  // https://github.com/angular/angular.js/blob/master/test/matchers.js
  beforeEach(function () {
    this.addMatchers({
      toHaveClass: function (cls) {
        this.message = function () {
          return 'Expected "' + angular.mock.dump(this.actual) + '" to have class "' + cls + '".';
        };

        return this.actual.hasClass(cls);
      }
    });
  });

  describe('require', function () {
    it('requestAnimationFrame', function () {
      expect(window.requestAnimationFrame).toBeDefined();
    });
    it('cancelAnimationFrame', function () {
      expect(window.cancelAnimationFrame).toBeDefined();
    });
  });


  describe('directive', function () {

    afterEach(function () {
      if (element) {
        element.remove();
      }
    });

    it('should have a children with a "ui-slider-container" class', function () {
      appendTemplate('<div ui-slider></div>');
      expect(element.children().eq(0)).toHaveClass('ui-slider-container');
    });

    it('should work as an element', function () {
      appendTemplate('<ui-slider></ui-slider>');
      expect(element.children().eq(0)).toHaveClass('ui-slider-container');
    });

    it('should work as an attribute', function () {
      appendTemplate('<div ui-slider></div>');
      expect(element.children().eq(0)).toHaveClass('ui-slider-container');
    });

  });


});
