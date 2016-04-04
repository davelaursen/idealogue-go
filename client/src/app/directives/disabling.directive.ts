namespace app.directives {
    'use strict';

    import Directive = ngDecorators.Directive;

    @Directive('app.directives', 'idDisabling', {})
    class AutoSizeDirective {

        static $inject = ['$scope', '$element'];
        constructor($scope: any, $element: any) {
            $scope.$on('disableView', (e, val) => {
                var isAnchor = ($element[0].localName === 'a');
                if (val === true) {
                    if (isAnchor) {
                        $element.removeAttr("href");
                    } else {
                        $element.attr("disabled", "disabled");
                    }
                } else {
                    if (isAnchor) {
                        $element.attr("href", "");
                    } else {
                        $element.removeAttr("disabled");
                    }
                }
            });
        }

    }

}
