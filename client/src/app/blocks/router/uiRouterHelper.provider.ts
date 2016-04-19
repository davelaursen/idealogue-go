namespace blocks.router {
    'use strict';

    import Provider = ngDecorators.Provider;

    /**
     * routerHelper is an utility service that useful functionality when working with UI-Router.
     *
     * Configure the routerHelper service in your application's app or app.core module:
     *
     *   angular.module('app.core').config(function(routerHelperProvider) {
     *       routerHelperProvider.docTitle('MyApp:');
     *       routerHelperProvider.addResolve('name', nameResolutionFunc);
     *   });
     */
    export interface IRouterHelper {
        stateCounts: Object;
        configureStates(states: any[], otherwisePath: string);
    }

    export interface IUIRouterHelperProvider {
        titlePrefix(prefix?: string): string|UIRouterHelperProvider;
        resolve(name?: string, func?: Function): Object|UIRouterHelperProvider;
        html5Mode(mode?: boolean|Object): boolean|UIRouterHelperProvider;
    }

    interface RouterHelperRootScope extends ng.IRootScopeService {
        title?: string;
    }

    @Provider({
        module: 'blocks.router',
        name: 'uiRouterHelper'
    })
    export class UIRouterHelperProvider implements IUIRouterHelperProvider {
        private _docTitlePrefix: string;
        private _resolveAlways: Object = {};

        static $inject: Array<string> = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
        constructor(private _$locationProvider: ng.ILocationProvider,
            private _$stateProvider: angular.ui.IStateProvider,
            private _$urlRouterProvider: angular.ui.IUrlRouterProvider) {
            this.$get.$inject = ['$rootScope'];
            _$locationProvider.html5Mode(true);
        }

        /**
         * Sets the document title prefix for all routes.
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        titlePrefix(prefix?: string): string|UIRouterHelperProvider {
            if (angular.isDefined(prefix)) {
                this._docTitlePrefix = prefix;
                return this;
            } else {
                return this._docTitlePrefix;
            }
        };

        /**
         * Adds a parameter to resolve for all routes.
         * @param name  the name of the parameter to resolve
         * @param func  a function that returns a Promise that will resolve the parameter
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        resolve(name?: string, func?: Function): Object|UIRouterHelperProvider {
            if (angular.isDefined(name)) {
                this._resolveAlways[name] = func;
                return this;
            } else {
                return this._resolveAlways;
            }
        };

        /**
         * Enables HTML 5 mode.
         * @returns current html5mode object if used as getter or itself (chaining) if used as setter
         */
        html5Mode(mode?: boolean|Object): boolean|UIRouterHelperProvider {
            if (angular.isDefined(mode)) {
                this._$locationProvider.html5Mode(mode);
                return this;
            } else {
                return this._$locationProvider.html5Mode();
            }
        };

        /**
         * Gets the routerHelper service.
         */
        $get($rootScope: RouterHelperRootScope): IRouterHelper {
            let self = this;
            let hasOtherwise = false;
            let stateCounts = {
                errors: 0,
                changes: 0
            };

            let service = {
                stateCounts: stateCounts,
                configureStates: configureStates
            };

            init();

            return service;

            ///////////////

            /**
             * Initializes the service.
             */
            function init() {
                $rootScope.$on('$stateChangeError', () => {
                    stateCounts.errors++;
                });

                $rootScope.$on('$stateChangeSuccess', (event, toState) => {
                    stateCounts.changes++;
                    $rootScope.title = self._docTitlePrefix + ' ' + (toState.title || '');
                });
            }

            /**
             * Configures the specified states.
             */
            function configureStates(states: any[], otherwisePath: string) {
                states.forEach((state) => {
                    state.config.resolve = angular.extend(
                        state.config.resolve || {},
                        self._resolveAlways
                    );
                    self._$stateProvider.state(state.state, state.config);
                });
                if (otherwisePath && !hasOtherwise) {
                    hasOtherwise = true;
                    self._$urlRouterProvider.otherwise(otherwisePath);
                }
            }
        };
    }

    // angular
    //     .module('blocks.router')
    //     .provider('uiRouterHelper', UIRouterHelperProvider);

}
