namespace app.directives {
    'use strict';

    import Directive = ngDecorators.Directive;

    interface IFocusScope extends ng.IScope {
        idFocus: any;
    }

    /**
     * This directive automatically puts focus on an element when it attached to the DOM.
     */
    @Directive('app.directives', 'idFocus', {
        scope: {
            idFocus: '@'
        }
    })
    class FocusDirective {
        static $inject = ['$scope', '$element', '$timeout'];
        constructor($scope: IFocusScope, $element: any, $timeout: ng.ITimeoutService) {
            if ($scope.idFocus != null) {
                if ($scope.idFocus !== 'false') {
                    doFocus();
                }

                $scope.$watch('idFocus', (value) => {
                    if (value === 'true') {
                        doFocus();
                    }
                });
            } else {
                doFocus();
            }

            function doFocus() {
                $timeout(() => {
                    $element[0].focus();
                });
            }
        }
    }

}
