namespace app.config {
    'use strict';

    /**
     * Represents the configuration settings for this application.
     */
    export interface IConfig {
        apiBaseUrl: string;
        authBaseUrl: string;
        appErrorPrefix: string;
        logToConsole: boolean;
        consoleLogLevel: string;
    }

    angular
        .module('app.config')
        .constant('config', {
            apiBaseUrl: '/api',
            authBaseUrl: '/auth',

            // exception handler settings
            appErrorPrefix: '[Idealogue] ',

            // logger settings
            logToConsole: true,
            consoleLogLevel: 'info'
        });
}
