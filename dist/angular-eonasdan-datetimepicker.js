(function () {
    'use strict';

    var module = angular.module('ae-datetimepicker', []);

    module.directive('datetimepicker', [
        '$timeout',
        function ($timeout) {
            return {
                restrict: 'EA',
                require: 'ngModel',
                scope: {
                    options: '=?',
                    onChange: '&?',
                    onClick: '&?',
                    dateFormat: '=?'
                },
                link: function ($scope, $element, $attrs, ngModel) {
                    var dpElement = $element.parent().hasClass('input-group') ? $element.parent() : $element;

                    $scope.$watch('options', function (newValue) {
                        var dtp = dpElement.data('DateTimePicker');
                        $.map(newValue, function (value, key) {
                            dtp[key](value);
                        });
                    }, true);

                    ngModel.$render = function () {
                        // if value is undefined/null do not do anything, unless some date was set before
                        var currentDate = dpElement.data('DateTimePicker').date();
                        if (!ngModel.$viewValue && currentDate) {
                            dpElement.data('DateTimePicker').clear();
                        } else if (ngModel.$viewValue) {
                            // otherwise make sure it is moment object
                            if (!moment.isMoment(ngModel.$viewValue)) {
                                if ($scope.dateFormat) {
                                    ngModel.$setViewValue(moment(ngModel.$viewValue, $scope.dateFormat));
                                } else {
                                    ngModel.$setViewValue(moment(ngModel.$viewValue));
                                }
                            }
                            dpElement.data('DateTimePicker').date(ngModel.$viewValue);
                        }
                    };

                    var isDateEqual = function (d1, d2) {
                        return moment.isMoment(d1) && moment.isMoment(d2) && d1.valueOf() === d2.valueOf();
                    };

                    dpElement.on('dp.change', function (e) {
                        if (!isDateEqual(e.date, ngModel.$viewValue)) {
                            var newValue = e.date === false ? null : e.date;
                            ngModel.$setViewValue(newValue);

                            $timeout(function () {
                                if (typeof $scope.onChange === 'function') {
                                    $scope.onChange();
                                }
                            });
                        }
                    });

                    dpElement.on('click', function () {
                        $timeout(function () {
                            if (typeof $scope.onClick === 'function') {
                                $scope.onClick();
                            }
                        });
                    });

                    // when the ngmodel value is empty but the element value is set (eg from backend rendering) lets set the value
                    var $$element = $($element);
                    var set_default_value = "";

                    if (!ngModel.$viewValue && $$element.val().length) {
                        set_default_value = $$element.val();
                    }

                    dpElement.datetimepicker($scope.options);

                    if (set_default_value.length) {
                        if ($scope.dateFormat) {
                            ngModel.$setViewValue(moment(set_default_value, $scope.dateFormat));
                            ngModel.$render();
                        } else {
                            ngModel.$setViewValue(moment(set_default_value));
                            ngModel.$render();
                        }
                    }
                }
            };
        }
    ]);
})();
