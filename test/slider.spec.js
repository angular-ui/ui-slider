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
    scope.$digest();
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

  // Spy on the requestAnimationFrame to directly trigger it
  beforeEach(function(){
    spyOn(window, 'requestAnimationFrame').andCallFake(function (fct) {
      fct();
    });
  });

  afterEach(function () {
    if (element) element.remove();
  });

  describe('restrictions', function () {
    it('should have a expected result', function () {
      appendTemplate('<div ui-slider></div>');
      expect(element.children().length).toBeGreaterThan(0);
    });

    it('should work as an element', function () {
      appendTemplate('<ui-slider></ui-slider>');
      expect(element.children().length).toBeGreaterThan(0);
    });

    it('should work as a class', function () {
      appendTemplate('<div class="ui-slider"></div>');
      expect(element.children().length).toBeGreaterThan(0);
    });
  });

  describe('static', function () {
    var track, thumb;
    beforeEach(function(){
      appendTemplate('<ui-slider></ui-slider>');

      track = element.children();
      thumb = track.children();
    });

    it('should have a track and a thumb', function () {
      expect(element[0].tagName).toBe('UI-SLIDER');
      expect(track[0].tagName).toBe('UI-SLIDER-TRACK');
      expect(thumb[0].tagName).toBe('UI-SLIDER-THUMB');
    });

    describe('the thumb', function () {

      it('should have a ngModel attr', function () {
        expect(thumb.attr('ng-model')).toBeTruthy();
      });

      it('should have a virtual key as ngModel attr', function () {
        expect(thumb.attr('ng-model')).toMatch(/^__\w{5,10}/);
      });

      it('should move went the model change', function () {
        var $thumb = _jQuery(thumb[0]);
        var virtualModel = $thumb.attr('ng-model');
        expect($thumb.position().left).toEqual(0);
        expect($thumb).toBePristine();
        expect(scope[virtualModel]).toBeUndefined();

        scope.$apply(virtualModel + " = 50");
        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect(scope[virtualModel]).toBeDefined();

        expect($thumb).toBePristine();
        expect($thumb).toBeValid();
        expect($thumb.position().left).toEqual($thumb.parent().width() / 2 );
      });

    });
  });

  describe('ngModel', function () {
    var $thumb, thumbOriginLeft;

    function setupThumb(tpl) {
      appendTemplate(
        '<ui-slider class="ui-slider-default">' +
          '<ui-slider-track>' +
          tpl +
          '</ui-slider-track>'+
          '</ui-slider>'
      );
      $thumb = _jQuery(element[0]).find('ui-slider-thumb');
      thumbOriginLeft = $thumb.position().left;
    }

    it('should render at 0 if null', function () {
      setupThumb('<ui-slider-thumb ng-model="foo"></ui-slider-thumb>');
      expect($thumb.position().left).toEqual(0);

      scope.$apply("foo = null");
      expect(window.requestAnimationFrame).toHaveBeenCalled();

      expect($thumb.position().left).toEqual(0);
    });

    describe('validation', function () {
      var ngCtrl;

      beforeEach(function () {
        setupThumb('<ui-slider-thumb ng-model="foo" name="bar"></ui-slider-thumb>');
        scope.$apply("foo = 25");
        expect(window.requestAnimationFrame).toHaveBeenCalled();
        ngCtrl = angular.element($thumb[0]).data('$ngModelController');
      });

      it('should init the properties', function () {
        expect($thumb).toBePristine();
        expect($thumb).toBeValid();

        expect(ngCtrl.$viewValue).toBeDefined();
        expect(ngCtrl.$modelValue).toBeDefined();

        expect(ngCtrl.$formatters.length).toEqual(5);
        expect(ngCtrl.$parsers.length).toEqual(3);

        expect(ngCtrl.$name).toBe('bar');
      });

      it('should be valid', function () {
        expect($thumb).toBeValid();
        expect($thumb).toHasClass('ng-valid-min ng-valid-max ng-valid-step', 'ng-invalid-min ng-invalid-max ng-invalid-step');
      });

      it('should be invalid \'cause not a number', function () {
        scope.$apply("foo = '1'");

        expect($thumb).toBeInvalid();
        expect($thumb).toHasClass('ng-invalid-number', 'ng-valid-number');
        expect(ngCtrl.$viewValue).toBeNaN();
      });

      it('should be invalid \'cause of the min', function () {
        scope.$apply("foo = -1");

        expect($thumb).toBeInvalid();
        expect($thumb).toHasClass('ng-invalid-min', 'ng-valid-min');
        expect(ngCtrl.$viewValue).toBeNaN();
      });

      it('should be invalid \'cause of the max', function () {
        scope.$apply("foo = 1000");

        expect($thumb).toBeInvalid();
        expect($thumb).toHasClass('ng-invalid-max', 'ng-valid-max');
        expect(ngCtrl.$viewValue).toBeNaN();
      });

      it('should be invalid \'cause of the step', function () {
        scope.$apply("foo = 0.5");

        expect($thumb).toBeInvalid();
        expect($thumb).toHasClass('ng-invalid-step', 'ng-valid-step');
        expect(ngCtrl.$viewValue).toBeNaN();
      });
    });

    describe('on-the-fly', function () {

      beforeEach(function () {
        scope.min = 10;
        scope.max = 20;
        scope.step = 1;
        setupThumb('<ui-slider-thumb ng-model="foo" min="{{min}}"  max="{{max}}"  step="{{step}}"></ui-slider-thumb>');
      });

      it('should validate even if min value changes', function () {
        scope.$apply("foo = 0");
        expect($thumb).toBeInvalid();
        expect($thumb).toHasClass('ng-invalid-min', 'ng-valid-min');

        scope.$apply("min = 0");
        expect($thumb).toBeValid();
        expect($thumb).toHasClass('ng-valid-min', 'ng-invalid-min');
      });

      it('should validate even if max value changes on-the-fly', function () {
        scope.$apply("foo = 30");
        expect($thumb).toBeInvalid();
        expect($thumb).toHasClass('ng-invalid-max', 'ng-valid-max');

        scope.$apply("max = 30");
        expect($thumb).toBeValid();
        expect($thumb).toHasClass('ng-valid-max', 'ng-invalid-max');
      });

      it('should validate even if step value changes on-the-fly', function () {
        scope.$apply("foo = 10.5");
        expect($thumb).toBeInvalid();
        expect($thumb).toHasClass('ng-invalid-step', 'ng-valid-step');

        scope.$apply("step = 0.5");
        expect($thumb).toBeValid();
        expect($thumb).toHasClass('ng-valid-step', 'ng-invalid-step');
      });

    });

  });

  xdescribe('range option', function () {

    beforeEach(function () {

      spyOn(window, 'requestAnimationFrame').andCallFake(function (fct) {
        fct();
      });

    });

    it('should display the ui-slider-range element', function () {
      appendTemplate('<div ui-slider="{ range : \'min\' }" ng-model="foo" ></div>');
      scope.$apply("foo = 25");
      expect(window.requestAnimationFrame).toHaveBeenCalled();

      var $rangeElm = _jQuery(element[0]).find('.ui-slider-range');
      expect($rangeElm.length).toBeGreaterThan(0);
      expect($rangeElm.hasClass('ui-slider-range-min')).toBeTruthy();
      expect($rangeElm.width()).toBeGreaterThan(0);
      expect($rangeElm.height()).toBeGreaterThan(0);
    });


    it('should display the ui-slider-range element', function () {
      appendTemplate('<div ui-slider="{ range : \'max\' }" ng-model="foo" ></div>');
      scope.$apply("foo = 25");
      expect(window.requestAnimationFrame).toHaveBeenCalled();

      var $rangeElm = _jQuery(element[0]).find('.ui-slider-range');
      expect($rangeElm.length).toBeGreaterThan(0);
      expect($rangeElm.hasClass('ui-slider-range-max')).toBeTruthy();
      expect($rangeElm.width()).toBeGreaterThan(0);
      expect($rangeElm.height()).toBeGreaterThan(0);
    });

    describe('range', function () {

    });
  });

});
