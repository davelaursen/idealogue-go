namespace ngDecorators {
    'use strict';

    export interface IComponentOptions {
        module: string,
        selector: string
        template?: string;
        templateUrl?: string;
        bindings?: Object;
        controllerAs?: string;
    }

    export function Component(options: IComponentOptions) {
        return (controller: Object) => {
            let module = angular.module(options.module);
            let selector = options.selector;
            delete options.module;
            delete options.selector;
            module.component(selector, angular.extend(options, { controller: controller }));
        }
    }

    export interface IDirectiveOptions {
        module: string,
        selector: string
        restrict?: string;
        require?: string;
        template?: string;
        templateUrl?: string;
        scope?: Object;
        controllerAs?: string;
    }

    export function Directive(options: IDirectiveOptions) {
        return (controller: Object) => {
            let module = angular.module(options.module);
            let selector = options.selector;
            delete options.module;
            delete options.selector;
            if (options.require) {
                options = angular.extend(options, {
                    link: function(scope, element, attrs, ctrl) {
                        scope.ctrl = ctrl;
                    }
                });
            }
            options = angular.extend(options, { controller: controller });
            module.directive(selector, function() { return options; });
        }
    }

    export interface INamedOptions {
        module: string,
        name: string
    }

    export function Provider(options: INamedOptions) {
        return (provider: any) => {
            var module = angular.module(options.module);
            module.provider(options.name, provider);
        }
    }

    export function Service(options: INamedOptions) {
        return (service: any) => {
            var module = angular.module(options.module);
            module.service(options.name, service);
        }
    }

    export function Filter(options: INamedOptions) {
        return (filter: any) => {
            var module = angular.module(options.module);
            var constructor = function() {
                let instance = new filter();
                return instance.filter;
            };
            module.filter(options.name, constructor);
        }
    }

}
