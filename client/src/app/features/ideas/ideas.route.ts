namespace app.Ideas {
    'use strict';

    /**
     * Configures the Idea routing functionality.
     */
    angular
        .module('app.ideas')
        .run(configureRoutes);

    /**
     * Internal function that is used to configure the routes.
     */
    configureRoutes.$inject = ['uiRouterHelper'];
    function configureRoutes(uiRouterHelper) {
        uiRouterHelper.configureStates([
            {
                state: 'ideas',
                config: {
                    url: '/ideas',
                    template: '<id-idea-list></id-idea-list>',
                    title: 'Ideas',
                    data: {
                        requiresLogin: true
                    }
                }
            },
            {
                state: 'idea-new',
                config: {
                    url: '/ideas/new',
                    template: '<id-idea-edit></id-idea-edit>',
                    title: 'New Idea',
                    data: {
                        requiresLogin: true
                    }
                }
            },
            {
                state: 'idea-view',
                config: {
                    url: '/ideas/:id',
                    template: '<id-idea-view></id-idea-view>',
                    title: 'Idea',
                    data: {
                        requiresLogin: true
                    }
                }
            },
            {
                state: 'idea-edit',
                config: {
                    url: '/ideas/:id/edit',
                    template: '<id-idea-edit></id-idea-edit>',
                    title: 'Edit Idea',
                    data: {
                        requiresLogin: true
                    }
                }
            }
        ]);
    }
}
