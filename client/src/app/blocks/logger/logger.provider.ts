namespace blocks.logger {
    'use strict';

    import Provider = ngDecorators.Provider;

    /**
     * An ILogger is a drop-in replacement of $log, or it can be used on its own. It provides
     * additional logging functionality, such as specifying the logging level and injecting
     * custom logging behavior.
     *
     * Configure the Logger service in your application's app or app.core module:
     *
     *   angular.module('app.core').config(function($provide, loggerProvider) {
     *       // optionally replace the $log service
     *       $provide.provider('$log', loggerProvider);
     *       loggerProvider.logLevel('info');
     *       loggerProvider.logToConsole(true);
     *       loggerProvider.customAction(function(level, args) {...});
     *   });
     */
    export interface ILoggerProvider {
        debugEnabled(flag?: boolean): boolean|LoggerProvider;
        logLevel(level?: string): string|LoggerProvider;
        logToConsole(flag?: boolean): boolean|LoggerProvider;
        customAction(actionFn?: Function): Function|LoggerProvider;
    }

    @Provider('blocks.logger', 'logger')
    class LoggerProvider implements ILoggerProvider {
        private _currentLevel = 'error';
        private _consoleLogging = false;
        private _noop = function() {};
        private _action: Function = this._noop;

        private _logLevels = {
            debug: 4,
            info: 3,
            warn: 2,
            error: 1
        };

        constructor() {
            this.$get.$inject = ['$window'];
        }

        /**
         * Enables debug-level logging.
         * @param flag  enable or disable debug level messages
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        debugEnabled(flag?: boolean): boolean|LoggerProvider {
            if (angular.isDefined(flag)) {
                this._currentLevel = 'debug';
                return this;
            } else {
                return this._currentLevel === 'debug';
            }
        };

        /**
         * Sets the level that logging should occur. Valid values, in priority order, are
         * 'error', 'warn', 'info' and 'debug'. Setting a log level will enable logging for
         * that level and all higher-priority levels. Defaults log level is 'error'.
         * @param level  the log level
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        logLevel(level?: string): string|LoggerProvider {
            if (angular.isDefined(level)) {
                this._currentLevel = this._logLevels[level] || 'error';
                return this;
            } else {
                return this._currentLevel;
            }
        };

        /**
         * Sets whether logging to a browser's console is enabled. By default it is disabled.
         * @param flag  whether to log to console
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        logToConsole(flag?: boolean): boolean|LoggerProvider {
            if (angular.isDefined(flag)) {
                this._consoleLogging = flag;
                return this;
            } else {
                return this._consoleLogging;
            }
        };

        /**
         * Sets the custom function to execute whenever a logging action is executed.
         * @param actionFn  the custom function
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        customAction(actionFn?: Function): Function|LoggerProvider {
            if (angular.isDefined(actionFn)) {
                this._action = actionFn;
                return this;
            } else {
                return this._action;
            }
        };

        /**
         * Gets the logger service.
         */
        $get($window: ng.IWindowService): ng.ILogService {
            let self = this;
            let service = {
                debug: debug,
                info: info,
                warn: warn,
                error: error,
                log: log
            };

            return service;

            /////////////////////
            // service methods

            /**
             * Write a debug message.
             */
            function debug() {
                if (self._logLevels[self._currentLevel] >= self._logLevels.debug) {
                    consoleLog('debug').apply(this, arguments);
                }
                takeAction('debug', [].slice.call(arguments));
            }

            /**
             * Write an information message.
             */
            function info() {
                if (self._logLevels[self._currentLevel] >= self._logLevels.info) {
                    consoleLog('info').apply(this, arguments);
                }
                takeAction('info', [].slice.call(arguments));
            }

            /**
             * Write a warning message.
             */
            function warn() {
                if (self._logLevels[self._currentLevel] >= self._logLevels.warn) {
                    consoleLog('warn').apply(this, arguments);
                }
                takeAction('warn', [].slice.call(arguments));
            }

            /**
             * Write an error message.
             * Note: error messages are always written (e.g. not controlled by log level).
             */
            function error() {
                consoleLog('error').apply(self, arguments);
                takeAction('error', [].slice.call(arguments));
            }

            /**
             * Write a log message.
             * Note: log messages are always written (e.g. not controlled by log level).
             */
            function log() {
                consoleLog('log').apply(self, arguments);
                takeAction('log', [].slice.call(arguments));
            }

            /////////////////////
            // helpers

            /**
             * Returns a function that is used to write logs to a console.
             * @param type  the type of message that needs to be logged
             * @returns a function that can be used to log messages to a browser's console
             */
            function consoleLog(type: string): Function {
                if (!self._consoleLogging) {
                    return function() {};
                }

                let console = $window.console || {log: self._noop};
                let logFn = console[type] || console.log;
                let hasApply = false;

                // Note: reading logFn.apply throws an error in IE11 in IE8 document mode.
                // The reason behind this is that console.log has type "object" in IE8...
                try {
                    hasApply = !!logFn.apply;
                } catch (e) {}

                if (hasApply) {
                    return function() {
                        let args = [];
                        angular.forEach(arguments, (arg) => {
                            args.push(formatError(arg));
                        });
                        return logFn.apply(console, args);
                    };
                }

                // we are IE which either doesn't have window.console => this is noop and we do nothing,
                // or we are IE where console.log doesn't have apply so we log at least first 2 args
                return function(arg1, arg2) {
                    logFn(arg1, arg2 == null ? '' : arg2);
                };
            }

            /**
             * Formats a logging argument.
             * @param arg  a logging argument
             * @returns the formatted logging argument
             */
            function formatError(arg: any): any {
                if (arg instanceof Error) {
                    if (arg.stack) {
                        arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ?
                            'Error: ' + arg.message + '\n' + arg.stack :
                            arg.stack;
                    } else if (arg.sourceURL) {
                        arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
                    }
                }
                return arg;
            }

            /**
             * Executes the custom action if it was injected.
             */
            function takeAction(level, args) {
                if (self._action) {
                    self._action(level, args);
                }
            }
        };
    }

}
