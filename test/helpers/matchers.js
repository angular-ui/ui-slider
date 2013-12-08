'use strict';

beforeEach(function () {

  this.addMatchers({

    // NG MODEL VALIDATION
    toBeInvalid: cssMatcher('ng-invalid', 'ng-valid'),
    toBeValid: cssMatcher('ng-valid', 'ng-invalid'),
    toBeDirty: cssMatcher('ng-dirty', 'ng-pristine'),
    toBePristine: cssMatcher('ng-pristine', 'ng-dirty'),

    // OTHER
    toHasClass: function () {
      return cssMatcher.apply(null, arguments).apply(this)
    }
  });

  function cssMatcher(presentClasses, absentClasses) {
    return function () {
      var element = _jQuery(this.actual);
      var present = element.hasClass(presentClasses);
      var absent = element.hasClass(absentClasses);

      this.message = function () {
        return "Expected to have " + presentClasses +
          (absentClasses ? (" and not have " + absentClasses + "" ) : "") +
          " but had " + element.attr('class') + ".";
      };
      return present && !absent;
    };
  }
});