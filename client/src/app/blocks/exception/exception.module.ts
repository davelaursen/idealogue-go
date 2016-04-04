namespace blocks.exception {
    'use strict';

    /**
     * This application block provides exception handling functionality.
     *
     * This exceptionHandlerProvider is meant to provide a drop-in replacement for Angular's built-in
     * $exceptionHandler. It provides more advanced logging of errors, and provides the ability to plug in
     * a custom action to take when an exception is handled.
     */
    angular.module('blocks.exception', []);

}
