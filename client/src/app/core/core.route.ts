namespace app.core {
    'use strict';

    /**
     * Configures the application's core routing functionality.
     */
    angular
        .module('app.core')
        .run(configureRoutes);

    /**
     * Internal function that is used to configure the application's router.
     */
    configureRoutes.$inject = ['$state', '$rootScope', 'uiRouterHelper', 'authService'];
    function configureRoutes($state, $rootScope, uiRouterHelper, authService) {
        let otherwise = '/404';
        uiRouterHelper.configureStates(getStates(), otherwise);

        $rootScope.$on('$stateChangeStart', (e, toState) => {
            if (toState.redirectTo) {
                e.preventDefault();
                return $state.go(toState.redirectTo);
            }
            let stateData = toState.data;
            if (angular.isDefined(stateData) && stateData.auth) {
                let currentUser = authService.currentUser();
                if (!currentUser) {
                    e.preventDefault();
                    return $state.go('login');
                }
            }
        });
    }

    /**
     * Returns an array of core state objects.
     */
    function getStates(): any[] {
        return [
            {
                state: 'root',
                config: {
                    url: '/',
                    redirectTo: 'ideas'
                }
            },
            {
                state: '404',
                config: {
                    url: '/404',
                    templateUrl: 'app/core/404.html',
                    title: '404'
                }
            },
            {
                state: '401',
                config: {
                    url: '/401',
                    templateUrl: 'app/core/401.html',
                    title: '401'
                }
            }
        ];
    }

}
