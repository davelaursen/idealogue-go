namespace blocks.logger {
    'use strict';

    /**
     * This application block provides generic, extensible logging functionality.
     *
     * This loggerProvider is meant to provide a drop-in replacement for Angular's built-in $log service.
     * It provides the ability to set logging levels and to plug in a custom action to take whenever a logging
     * action is executed.
     */
    angular.module('blocks.logger', []);

}
