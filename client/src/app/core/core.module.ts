namespace app.core {
    'use strict';

    /**
     * This module provides core functionality for the application.
     */
    angular.module('app.core', [
        'blocks.exception',
        'blocks.logger',
        'blocks.router',
        'app.components',
        'app.config',
        'ui.router'
    ]);

}
