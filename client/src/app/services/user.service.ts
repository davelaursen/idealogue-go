namespace app.services {
    'use strict';

    import Service = ngDecorators.Service;
    import IDataService = blocks.data.IDataService;
    import IUtil = blocks.util.IUtil;
    import IConfig = app.config.IConfig;

    export interface IUser {
        id?: string;
        firstName: string;
        lastName: string;
        email: string;
        createdDate: string;
        updatedDate: string;
    }

    export interface IPerson extends IUser {
    }

    export interface IUserService {
        search(searchValue: string): ng.IPromise<any>;
        getAll(): ng.IPromise<any>;
        getById(id: string): ng.IPromise<any>;
        getByEmail(email: string): ng.IPromise<any>;
        insert(user: IUser): ng.IPromise<any>;
        update(user: IUser): ng.IPromise<any>;
        remove(id: string): ng.IPromise<any>;
        newUser(): IUser;
    }

    /**
     * A service that provides functionality for reading/writing user data.
     */
    @Service('app.services', 'userService')
    class UserService {

        static $inject = ['dataService', 'util', 'config'];
        constructor(
            private _dataService: IDataService,
            private _util: IUtil,
            private _config: IConfig) {
        }

        /**
         * Searches for users that match the given search value.
         */
        search(searchValue: string): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'users?search={search}',
                action: 'get',
                tokens: { search: searchValue }
            });
        }

        /**
         * Retrieves all of the users in the system.
         */
        getAll(): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'users',
                action: 'get'
            });
        }

        /**
         * Retrieves the user that has the specified id.
         */
        getById(id: string): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'users/{id}',
                action: 'get',
                tokens: { id: id }
            });
        }

        /**
         * Retrieves the user that has the specified email.
         */
        getByEmail(email: string): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'users?email={email}',
                action: 'get',
                tokens: { email: email }
            });
        }

        /**
         * Adds a new user to the system.
         */
        insert(user: IUser): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'users',
                action: 'post',
                payload: user
            });
        }

        /**
         * Updates an existing user.
         * @param {object} user
         * @returns {promise}
         */
        update(user: IUser): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'users/{id}',
                action: 'put',
                tokens: { id: user.id },
                payload: user
            });
        }

        /**
         * Removes the user that has the specified id.
         */
        remove(id: string): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'users/{id}',
                action: 'delete',
                tokens: { id: id }
            });
        }

        /**
         * Returns an new, initialized user object.
         */
        newUser(): IUser {
            let dateStr = this._util.getISO8601DateString();
            return {
                firstName: '',
                lastName: '',
                email: '',
                createdDate: dateStr,
                updatedDate: dateStr
            };
        }
    }

}
