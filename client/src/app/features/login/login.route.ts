namespace app.login {
    'use strict';

    /**
     * Configures the Login routing functionality.
     */
    angular
        .module('app.login')
        .run(configureRoutes);

    /**
     * Internal function that is used to configure the routes.
     */
    configureRoutes.$inject = ['uiRouterHelper'];
    function configureRoutes(uiRouterHelper) {
        uiRouterHelper.configureStates([
            {
                state: 'login',
                config: {
                    url: '/login',
                    template: '<id-login></id-login>',
                    title: 'Login'
                }
            }
        ]);
    }
}
