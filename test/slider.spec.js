'use strict';

describe('uiSlider', function () {

  // declare these up here to be global to all tests
  var scope, $compile, element;

  /**
   * UTILS
   */

  function appendTemplate(tpl) {
    element = angular.element(tpl);
    angular.element(document.body).append(element);
    $compile(element)(scope);
  }

  /**
   * TESTS
   */

  beforeEach(module('ui.slider'));

  // inject in angular constructs. Injector knows about leading/trailing underscores and does the right thing
  // otherwise, you would need to inject these into each test
  beforeEach(inject(function (_$rootScope_, _$compile_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));

  afterEach(function () {
    if (element) element.remove();
  });

  describe('directive', function () {

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

  describe('ngModel', function () {
    var thumbElm, thumbOriginLeft, thumb_bb;

    function _initThumbValues() {
      thumbElm = _jQuery(element[0]).find('.ui-slider-thumb')[0];
      thumbOriginLeft = thumbElm.getBoundingClientRect().left;
    }

    it('should render at 0 if null', function () {
      appendTemplate('<div ui-slider ng-model="foo"></div>');
      _initThumbValues();

      thumb_bb = thumbElm.getBoundingClientRect();
      expect(Math.ceil(thumb_bb.left) - thumbOriginLeft).toEqual(0);

      scope.$apply(function () {
        scope.foo = null;
      });

      thumb_bb = thumbElm.getBoundingClientRect();

      expect(Math.ceil(thumb_bb.left) - thumbOriginLeft).toEqual(0);
    });

    it('should deal with strings', function () {
      appendTemplate('<div ui-slider ng-model="foo" ></div>');
      //scope.$digest();

      scope.$apply(function () {
        scope.foo = '1';
      });

      // TODO : Add validation and formatting...
      //expect(scope.foo).toEqual(0);
    });


  });

});