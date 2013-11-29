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

    var domResult = '<div class="ui-slider-container">\n  <div class="ui-slider-runnable-track">\n    <div class="ui-slider-slider-thumb"></div>\n  </div>\n</div>';

    afterEach(function () {
      if (element) {
        element.remove();
      }
    });

    it('should have a expected result', function () {
      appendTemplate('<div ui-slider></div>');
      expect(element.html()).toEqual(domResult);
    });

    it('should work as an element', function () {
      appendTemplate('<ui-slider></ui-slider>');
      expect(element.html()).toEqual(domResult);
    });

    it('should work as an attribute', function () {
      appendTemplate('<div ui-slider></div>');
      expect(element.html()).toEqual(domResult);
    });


    describe('default behaviour', function () {

      var element_bb, thumb_elem;
      beforeEach(function () {
        appendTemplate('<div ui-slider></div>');

        // Explicit element width
        _jQuery(element).width(100);

        spyOn(window, 'requestAnimationFrame').andCallFake(function(fct) { fct(); });
        element_bb = element[0].getBoundingClientRect();
        thumb_elem =  _jQuery(element[0]).find('.ui-slider-slider-thumb');
      });

      afterEach(function () {
        if (element) {
          element.remove();
        }
      });

      it('should be change the position of the thumb when we click on the track', function () {
        var thumb_left_pos, thumb_bb;

        // Default position
        expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        expect(thumb_elem.position().left).toEqual(0);

        thumb_bb = thumb_elem[0].getBoundingClientRect();
        thumb_left_pos = thumb_bb.left;

        // Click on the middle
        browserTrigger(element, startEvent, {
          x : (element_bb.width / 2 + element_bb.left)|0
        });
        browserTrigger(element, endEvent);
        thumb_bb = thumb_elem[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left|0) + thumb_left_pos ).toEqual((element_bb.width / 2)|0);


        // Click on the end
        browserTrigger(element, startEvent, {
          x : (element_bb.width + element_bb.left)|0
        });
        browserTrigger(document.body, endEvent);
        thumb_bb = thumb_elem[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left|0) + thumb_left_pos ).toEqual((element_bb.width)|0);
      });

      it('should follow the ' + description + '', function () {
        var thumb_left_pos, thumb_bb;

        thumb_bb = thumb_elem[0].getBoundingClientRect();
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
        thumb_bb = thumb_elem[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).toHaveBeenCalled();
        expect((thumb_bb.left|0) + thumb_left_pos ).toEqual((element_bb.width / 4)|0);
      });

    });
  });

});
};


sliderTests('touch', 'touchstart', 'touchmove', 'touchend');
sliderTests('mouse', 'mousedown',  'mousemove', 'mouseup');