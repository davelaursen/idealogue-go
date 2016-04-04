namespace blocks.exception {
    'use strict';

    import Provider = ngDecorators.Provider;

    /**
     * An IExceptionHandler is a drop-in replacement of $exceptionHandler, or it can be used
     * on its own. It provides additional exception handling functionality, such as specifying
     * an error message prefix.
     *
     * Configure the Exception Handler in your application's app or app.core module:
     *
     *   angular.module('app.core').config(function($provide, exceptionHandlerProvider) {
     *       // optionally replace the $exceptionHandler service
     *       $provide.provider('$exceptionHandler', exceptionHandlerProvider);
     *       exceptionHandlerProvider.errorPrefix('MyApp: ');
     *   });
     */
    export interface IExceptionHandlerProvider {
        errorPrefix(prefix?: string): string|ExceptionHandlerProvider;
        customAction(actionFn?: Function): Function|ExceptionHandlerProvider;
    }

    @Provider('blocks.exception', 'exceptionHandler')
    class ExceptionHandlerProvider implements IExceptionHandlerProvider {
        private _msgPrefix = '';
        private _noop = function() {};
        private _action: Function = this._noop;

        constructor() {
            this.$get.$inject = ['$log'];
        }

        /**
         * Sets the string to prepend to exception messages.
         * @param prefix  the error message prefix to use
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        errorPrefix(prefix?: string): string|ExceptionHandlerProvider {
            if (angular.isDefined(prefix)) {
                this._msgPrefix = prefix || '';
                return this;
            } else {
                return this._msgPrefix;
            }
        };

        /**
         * Sets the custom function to execute whenever an exception is handled.
         * @param actionFn  the custom function
         * @returns current value if used as getter or itself (chaining) if used as setter
         */
        customAction(actionFn?: Function): Function|ExceptionHandlerProvider {
            if (angular.isDefined(actionFn)) {
                this._action = actionFn;
                return this;
            } else {
                return this._action;
            }
        };

        /**
         * Gets the IExceptionHandler instance.
         */
        $get($log: ng.ILogService): ng.IExceptionHandlerService {
            let self = this;
            return handleException;

            /**
             * Handles the given exception.
             * @param exception  the exception associated with the error
             * @param cause  optional information about the context in which the error was thrown
             */
            function handleException(exception: any, cause: string) {
                exception.message = self._msgPrefix + exception.message;
                let errorData = { exception: exception, cause: cause };

                $log.error(exception, '\n', errorData);

                if (self._action) {
                    self._action(errorData);
                }
            }
        }
    }

}
