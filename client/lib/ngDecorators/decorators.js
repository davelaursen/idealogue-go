var ngDecorators;
(function (ngDecorators) {
    'use strict';
    function Component(moduleOrName, selector, options) {
        return function (controller) {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            module.component(selector, angular.extend(options, { controller: controller }));
        };
    }
    ngDecorators.Component = Component;
    function Directive(moduleOrName, selector, options) {
        return function (controller) {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
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
    function Provider(moduleOrName, selector) {
        return function (provider) {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            module.provider(selector, provider);
        };
    }
    ngDecorators.Provider = Provider;
    function Service(moduleOrName, selector) {
        return function (service) {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            module.service(selector, service);
        };
    }
    ngDecorators.Service = Service;
    function Filter(moduleOrName, selector) {
        return function (filter) {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            var constructor = function () {
                var instance = new filter();
                return instance.filter;
            };
            module.filter(name, constructor);
        };
    }
    ngDecorators.Filter = Filter;
})(ngDecorators || (ngDecorators = {}));
//# sourceMappingURL=decorators.js.map