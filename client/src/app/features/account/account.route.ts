namespace app.account {
    'use strict';

    /**
     * Configures the Account routing functionality.
     */
    angular
        .module('app.account')
        .run(configureRoutes);

    /**
     * Internal function that is used to configure the routes.
     */
    configureRoutes.$inject = ['uiRouterHelper'];
    function configureRoutes(uiRouterHelper) {
        uiRouterHelper.configureStates([
            {
                state: 'account',
                config: {
                    url: '/account',
                    template: '<id-account-view></id-account-view>',
                    title: 'Account',
                    data: {
                        auth: true
                    }
                }
            },
            {
                state: 'account-edit',
                config: {
                    url: '/account/edit',
                    template: '<id-account-edit></id-account-edit>',
                    title: 'Edit Account',
                    data: {
                        auth: true
                    }
                }
            }
        ]);
    }
}
