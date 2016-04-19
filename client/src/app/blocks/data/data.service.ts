namespace blocks.data {
    'use strict';

    import Service = ngDecorators.Service;

    export interface IDataRequest {
        action: string;
        baseUrl?: string;
        url: string;
        tokens?: Object;
        payload?: Object;
        headers?: Object;
        cache?: boolean|Object;
        params?: Object;
        config?: Object;
    }

    export interface IDataService {
        execute(data: IDataRequest): ng.IPromise<any>;
        get(url: string, headers?: Object, callback?: Function, cache?: boolean|Object,
            params?: Object, config?: Object): ng.IPromise<any>;
        put(url: string, data: any, headers?: Object, callback?: Function, config?: Object): ng.IPromise<any>;
        post(url: string, data: any, headers?: Object, callback?: Function, config?: Object): ng.IPromise<any>;
        del(url: string, headers?: Object, callback?: Function, config?: Object): ng.IPromise<any>;
        formPost(url: string, formData: any, callback?: Function): ng.IPromise<any>;
    }

    /**
     * A service that provides functionality for making HTTP calls to a backend service.
     */
    @Service({
        module: 'blocks.data',
        name: 'dataService'
    })
    class DataService implements IDataService {
        static $inject = ['$http', '$q', 'util'];
        constructor(private _$http: ng.IHttpService,
            private _$q: ng.IQService,
            private _util: blocks.util.IUtil) {
        }

        /**
         * Executes an HTTP request.
         */
        execute(data: IDataRequest): ng.IPromise<any> {
            let url = this._util.pathJoin([data.baseUrl || '', data.url]);
            if (data.tokens) {
                url = this._util.detokenize(url, data.tokens);
            }

            let callback = function(response) {
                return response.data;
            };

            let action = this._util.isDefined(data.action) ? data.action.toLowerCase() : '';
            switch (action) {
                case 'get':
                    return this.get(url, data.headers, callback, data.cache, data.params, data.config);
                case 'put':
                    return this.put(url, data.payload, data.headers, callback, data.config);
                case 'post':
                    return this.post(url, data.payload, data.headers, callback, data.config);
                case 'del':
                case 'delete':
                    return this.del(url, data.headers, callback, data.config);
                case 'formpost':
                case 'form_post':
                    return this.formPost(url, data.payload, callback);
            }
            return null;
        }

        /**
         * Performs a GET request.
         * @param url  absolute or relative URL of the resource that is being requested
         * @param headers  map of strings or functions which return strings representing
         *        HTTP headers to send to the server. If the return value of a function is null,
         *        the header will not be sent. Functions accept a config object as an argument
         * @param callback  the callback function that should be called when the request
         *        completes to transform the data - should take the response data as a parameter
         *        and return the data that should be resolved by the promise
         * @param cache  if true, a default $http cache will be used to cache the
         *        GET request, otherwise if a cache instance built with $cacheFactory, this cache
         *        will be used for caching
         * @param params  map of strings or objects which will be turned to
         *        ?key1=value1&key2=value2 after the url. If the value is not a string, it will be
         *        JSONified
         * @param config  additional request configuration properties
         */
        get(url: string, headers?: Object, callback?: Function, cache?: boolean|Object,
            params?: Object, config?: Object): ng.IPromise<any> {
            return this._makeCall('GET', url, undefined, headers, callback, cache, params, config);
        }

        /**
         * Performs a PUT request.
         * @param url  absolute or relative URL of the resource that is being requested
         * @param data  data to be sent as the request message data
         * @param headers  map of strings or functions which return strings representing
         *        HTTP headers to send to the server. If the return value of a function is null,
         *        the header will not be sent. Functions accept a config object as an argument
         * @param callback  the callback function that should be called when the request
         *        completes to transform the data - should take the response data as a parameter
         *        and return the data that should be resolved by the promise
         * @param config  additional request configuration properties
         */
        put(url: string, data: any, headers?: Object, callback?: Function, config?: Object): ng.IPromise<any> {
            return this._makeCall('PUT', url, data, headers, callback, undefined, undefined, config);
        }

        /**
         * Performs a POST request.
         * @param url  absolute or relative URL of the resource that is being requested
         * @param data  data to be sent as the request message data
         * @param headers  map of strings or functions which return strings representing
         *        HTTP headers to send to the server. If the return value of a function is null,
         *        the header will not be sent. Functions accept a config object as an argument
         * @param callback  the callback function that should be called when the request
         *        completes to transform the data - should take the response data as a parameter
         *        and return the data that should be resolved by the promise
         * @param config  additional request configuration properties
         */
        post(url: string, data: any, headers?: Object, callback?: Function, config?: Object): ng.IPromise<any> {
            return this._makeCall('POST', url, data, headers, callback, undefined, undefined, config);
        }

        /**
         * Performs a DELETE request.
         * @param url  absolute or relative URL of the resource that is being requested
         * @param headers  map of strings or functions which return strings representing
         *        HTTP headers to send to the server. If the return value of a function is null,
         *        the header will not be sent. Functions accept a config object as an argument
         * @param callback  the callback function that should be called when the request
         *        completes to transform the data - should take the response data as a parameter
         *        and return the data that should be resolved by the promise
         * @param config  additional request configuration properties
         */
        del(url: string, headers?: Object, callback?: Function, config?: Object): ng.IPromise<any> {
            return this._makeCall('DELETE', url, null, headers, callback, undefined, undefined, config);
        }

        /**
         * Execute an HTTP form post.
         * @param url  absolute or relative URL to post the form to
         * @param formData  the form data to post
         * @param callback  the callback function that should be called when the request
         *        completes to transform the data - should take the response data as a parameter
         *        and return the data that should be resolved by the promise
         */
        formPost(url: string, formData: any, callback?: Function): ng.IPromise<any> {
            let req = {
                method: 'POST',
                url: url,
                data: formData,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            };

            let deferred = this._$q.defer();
            this._$http(req)
                .then((result) => this._resolveDeferred(deferred, result, callback))
                .catch((err) => deferred.reject(err));

            return deferred.promise;
        }

        /**
         * Execute an HTTP request.
         */
        private _makeCall(method: string, url: string, data: any, headers: Object,
                callback: Function, cache: boolean|any, params: Object, config: Object) {
            // if it is a get and cache is not defined then cache is false
            if (method === 'GET' && !this._util.isDefined(cache)) {
                cache = false;
            }

            // create the request
            let req = {
                url: url,
                method: method,
                data: data,
                headers: headers,
                cache: cache,
                params: params
            };

            // add any additional configuration properties to the request
            if (config) {
                for (let prop in config) {
                    if (config.hasOwnProperty(prop)) {
                        req[prop] = config[prop];
                    }
                }
            }

            let deferred = this._$q.defer();
            this._$http(req)
                .then((result) => this._resolveDeferred(deferred, result, callback))
                .catch((err) => deferred.reject(err));

            return deferred.promise;
        }

        /**
         * Takes an HTTP response object and resolve or reject it.
         */
        private _resolveDeferred(deferred: any, result: any, callback: Function) {
            if (this._isNonError(result.status)) {
                result = callback ? callback(result) : result;
                deferred.resolve(result);
            } else {
                deferred.reject({ code: 'ERR', result: result});
            }
        }

        /**
         * Examines an HTTP status code to determine if the response is an error response.
         */
        private _isNonError(status: number): boolean {
            return status >= 100 && status <= 399; // 100/200/300 series status codes (non-errors)
        }
    }

}
