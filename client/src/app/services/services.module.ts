namespace app.services {
    'use strict';

    /**
     * This module provides services for use throughout the application.
     */
    angular.module('app.services', [
        'blocks.data',
        'blocks.storage',
        'blocks.util',
        'app.config'
    ]);

}
