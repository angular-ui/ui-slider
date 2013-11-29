'use strict';

// Wrapper to abstract over using touch events or mouse events.
var sliderTests = function(description, startEvent, moveEvent, endEvent) {
  describe('uiSlider with ' + description + ' events', function () {

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

    describe('default behaviour', function () {

      var element_bb, $thumb, thumb_left_pos, thumb_bb;

      function defaultBefore(html) {
        appendTemplate(html || '<div ui-slider></div>');

        // Explicit element width
        _jQuery(element).width(100);

        spyOn(window, 'requestAnimationFrame').andCallFake(function(fct) { fct(); });
        element_bb = element[0].getBoundingClientRect();
        $thumb = _jQuery(element[0]).find('.ui-slider-thumb');
      }

      afterEach(function () {
        if (element) {
          element.remove();
        }
      });

      it('should be change the position of the thumb when we click on the track', function () {
        defaultBefore();

        // Default position
        expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        expect($thumb.position().left).toEqual(0);

        thumb_bb = $thumb[0].getBoundingClientRect();
        thumb_left_pos = thumb_bb.left;

        // Click on the middle
        browserTrigger(element, startEvent, {
          x : (element_bb.width / 2 + element_bb.left)|0
        });
        browserTrigger(element, endEvent);
        thumb_bb = $thumb[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left | 0) + thumb_left_pos).toEqual(element_bb.width / 2);


        // Click on the end
        browserTrigger(element, startEvent, {
          x : (element_bb.width + element_bb.left)|0
        });
        browserTrigger(document.body, endEvent);
        thumb_bb = $thumb[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left|0) + thumb_left_pos ).toEqual((element_bb.width)|0);
      });

      it('should follow the ' + description + '', function () {
        defaultBefore();

        thumb_bb = $thumb[0].getBoundingClientRect();
        thumb_left_pos = thumb_bb.left;

        // Click on a global position
        browserTrigger(element, startEvent, {
          x : (element_bb.width / 2 + element_bb.left)|0
        });
        browserTrigger(document.body, moveEvent, {
          x : (element_bb.width / 3 + element_bb.left)|0
        });
        browserTrigger(document.body, moveEvent, {
          x : (element_bb.width / 4 + element_bb.left)|0
        });
        browserTrigger(document.body, endEvent);
        thumb_bb = $thumb[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left|0) + thumb_left_pos ).toEqual((element_bb.width / 4)|0);
      });

      iit('should use a static step', function () {
        defaultBefore('<div ui-slider step="25"></div>');

        // Click on a global position
        browserTrigger(element, startEvent, {
          x: (element_bb.width / 4 + element_bb.left) | 0
        });
        browserTrigger(document.body, endEvent);
        thumb_bb = $thumb[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left | 0) + thumb_left_pos).toEqual(25);


        // Click on a global position
        browserTrigger(element, startEvent, {
          x: (element_bb.left) | 0
        });
        browserTrigger(document.body, endEvent);

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left | 0) + thumb_left_pos).toEqual(0);


        // Click on a global position
        browserTrigger(element, startEvent, {
          x: (3 * element_bb.width / 4 + element_bb.left) | 0
        });
        browserTrigger(document.body, endEvent);

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left | 0) + thumb_left_pos).toEqual(50);
      });

    });
  });

});
};


sliderTests('touch', 'touchstart', 'touchmove', 'touchend');
sliderTests('mouse', 'mousedown',  'mousemove', 'mouseup');