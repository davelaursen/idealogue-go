var ngDecorators;
(function (ngDecorators) {
    'use strict';
    function Component(options) {
        return function (controller) {
            var module = angular.module(options.module);
            var selector = options.selector;
            delete options.module;
            delete options.selector;
            module.component(selector, angular.extend(options, { controller: controller }));
        };
    }
    ngDecorators.Component = Component;
    function Directive(options) {
        return function (controller) {
            var module = angular.module(options.module);
            var selector = options.selector;
            delete options.module;
            delete options.selector;
            if (options.require) {
                options = angular.extend(options, {
                    link: function (scope, element, attrs, ctrl) {
                        scope.ctrl = ctrl;
                    }
                });
            }
            options = angular.extend(options, { controller: controller });
            module.directive(selector, function () { return options; });
        };
    }
    ngDecorators.Directive = Directive;
    function Provider(options) {
        return function (provider) {
            var module = angular.module(options.module);
            module.provider(options.name, provider);
        };
    }
    ngDecorators.Provider = Provider;
    function Service(options) {
        return function (service) {
            var module = angular.module(options.module);
            module.service(options.name, service);
        };
    }
    ngDecorators.Service = Service;
    function Filter(options) {
        return function (filter) {
            var module = angular.module(options.module);
            var constructor = function () {
                var instance = new filter();
                return instance.filter;
            };
            module.filter(options.name, constructor);
        };
    }
    ngDecorators.Filter = Filter;
})(ngDecorators || (ngDecorators = {}));
//# sourceMappingURL=decorators.js.map