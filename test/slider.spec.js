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
  beforeEach(function () {
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
    beforeEach(function () {
      appendTemplate('<ui-slider></ui-slider>');

      thumb = element.children();
    });

    it('should have a track and a thumb', function () {
      expect(element[0].tagName).toBe('UI-SLIDER');
      expect(thumb[0].tagName).toBe('UI-SLIDER-THUMB');
    });

    describe('the thumb', function () {

      it('should have a ngModel attr', function () {
        expect(thumb.attr('ng-model')).toBeTruthy();
      });

      it('should have a virtual key as ngModel attr', function () {
        expect(thumb.attr('ng-model')).toMatch(/^__\w*/);
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
        expect($thumb.get(0).style.left).toEqual('50%');
      });

    });
  });

  describe('thumb ngModel', function () {
    var $thumb, thumbOriginLeft;

    function setupThumb(tpl) {
      appendTemplate(
        '<ui-slider class="ui-slider-default">' +
          tpl +
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

  describe('slider', function () {
    var $thumb;

    beforeEach(function () {
      scope.min = 10;
      scope.max = 20;
      scope.step = 1;
      spyOn(scope, "$emit").andCallThrough();
      appendTemplate(
        '<ui-slider class="ui-slider-default" min="{{min}}"  max="{{max}}"  step="{{step}}">' +
          '<ui-slider-thumb ng-model="foo"></ui-slider-thumb>' +
          '</ui-slider>'
      );
      $thumb = _jQuery(element[0]).find('ui-slider-thumb');
      expect(scope.$emit).toHaveBeenCalled();
      expect(scope.$emit.callCount).toEqual(3);
    });

    it('should influence the thumb min', function () {
      scope.$emit.reset();

      scope.$apply("foo = 0");
      expect($thumb).toBeInvalid();
      expect($thumb).toHasClass('ng-invalid-min', 'ng-valid-min');

      scope.$apply("min = 0");
      expect(scope.$emit).toHaveBeenCalledWith('global min changed');

      expect($thumb).toBeValid();
      expect($thumb).toHasClass('ng-valid-min', 'ng-invalid-min');
    });

    it('should influence the thumb max', function () {
      scope.$emit.reset();

      scope.$apply("foo = 30");
      expect($thumb).toBeInvalid();
      expect($thumb).toHasClass('ng-invalid-max', 'ng-valid-max');

      scope.$apply("max = 30");
      expect(scope.$emit).toHaveBeenCalledWith('global max changed');

      expect($thumb).toBeValid();
      expect($thumb).toHasClass('ng-valid-max', 'ng-invalid-max');
    });

    it('should influence the thumb step', function () {
      scope.$emit.reset();

      scope.$apply("foo = 10.5");
      expect($thumb).toBeInvalid();
      expect($thumb).toHasClass('ng-invalid-step', 'ng-valid-step');

      scope.$apply("step = 0.5");
      expect(scope.$emit).toHaveBeenCalledWith('global step changed');

      expect($thumb).toBeValid();
      expect($thumb).toHasClass('ng-valid-step', 'ng-invalid-step');
    });

  });

  describe('range', function () {
    var $range;

    function setupRange(tpl) {
      appendTemplate(
        '<ui-slider class="ui-slider-default">' +
          tpl +
          '<ui-slider-thumb ng-model="foo"></ui-slider-thumb>' +
          '</ui-slider>'
      );
      $range = _jQuery(element[0]).find('ui-slider-range');
    }

    it('should be hidden (somehow)', function () {
      setupRange('<ui-slider-range></ui-slider-range>');
      expect($range.get(0).style.left).toEqual('0%');
      expect($range.get(0).style.right).toEqual('100%');
    });

    it('should display a static range that end at 50%', function () {
      setupRange('<ui-slider-range end="50"></ui-slider-range>');
      expect($range.get(0).style.left).toEqual('0%');
      expect($range.get(0).style.right).toEqual('50%');
    });

    it('should display a range from 0 to cursor', function () {
      setupRange('<ui-slider-range end="{{foo}}"></ui-slider-range>');
      expect($range.get(0).style.left).toEqual('0%');
      expect($range.get(0).style.right).toEqual('100%');

      scope.$apply("foo = 50");
      expect($range.get(0).style.left).toEqual('0%');
      // FIXME left position must be at half of the targeted thumb's width
      expect($range.get(0).style.right).toEqual('50%');
    });

    it('should display a range from cursor to 100', function () {
      setupRange('<ui-slider-range start="{{foo}}"></ui-slider-range>');
      scope.$apply("foo = 0");
      expect($range.get(0).style.left).toEqual('0%');
      expect($range.get(0).style.right).toEqual('0%');

      scope.$apply("foo = 50");
      // FIXME left position must be at half of the targeted thumb's width
      expect($range.get(0).style.left).toEqual('50%');
      expect($range.get(0).style.right).toEqual('0%');
    });

  });

});
