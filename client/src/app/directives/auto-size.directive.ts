namespace app.directives {
    'use strict';

    import Directive = ngDecorators.Directive;

    @Directive({
        module: 'app.directives',
        selector: 'idAutoSize'
    })
    class AutoSizeDirective {

        static $inject = ['$element', '$timeout'];
        constructor($element: any, $timeout: ng.ITimeoutService) {
            $element.css('overflow', 'hidden');
            $element.bind('keyup', () => { resize(); });

            $timeout(() => {
                resize();
            });

            function resize() {
                if ($element[0].scrollHeight < 1) {
                    return;
                }
                while($element[0].clientHeight >= $element[0].scrollHeight) {
                    $element[0].style.height =
                        parseInt(getComputedStyle($element[0]).getPropertyValue('height'), 10) - 1 + "px";
                }
                while($element[0].clientHeight < $element[0].scrollHeight) {
                    $element[0].style.height =
                        parseInt(getComputedStyle($element[0]).getPropertyValue('height'), 10) + 1 + "px";
                }
            }
        }

    }

}
