namespace ngDecorators {
    'use strict';

    export interface IComponentOptions {
        template?: string;
        templateUrl?: string;
        bindings?: Object;
        controllerAs?: string;
    }

    export interface IDirectiveOptions {
        restrict?: string;
        require?: string;
        template?: string;
        templateUrl?: string;
        scope?: Object;
        controllerAs?: string;
    }

    export function Component(moduleOrName: string | ng.IModule, selector: string, options: IComponentOptions) {
        return (controller: Object) => {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            module.component(selector, angular.extend(options, { controller: controller }));
        }
    }

    export function Directive(moduleOrName: string | ng.IModule, selector: string, options: IDirectiveOptions) {
        return (controller: Object) => {
            let module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
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

    export function Provider(moduleOrName: string | ng.IModule, selector: string) {
        return (provider: any) => {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            module.provider(selector, provider);
        }
    }

    export function Service(moduleOrName: string | ng.IModule, selector: string) {
        return (service: any) => {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            module.service(selector, service);
        }
    }

    export function Filter(moduleOrName: string | ng.IModule, selector: string) {
        return (filter: any) => {
            var module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
            var constructor = function() {
                let instance = new filter();
                return instance.filter;
            };
            module.filter(name, constructor);
        }
    }

}
