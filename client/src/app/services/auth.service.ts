namespace app.services {
    'use strict';

    import Service = ngDecorators.Service;
    import IDataService = blocks.data.IDataService;
    import IStorageService = blocks.storage.IStorageService;
    import IUtil = blocks.util.IUtil;
    import IConfig = app.config.IConfig;

    export interface IAuthService {
        isLoggedIn(): boolean;
        currentUser(user?: IUser): IUser;
        login(): void;
        logout(): ng.IPromise<any>;
    }

    /**
     * A service that provides authorization functionality.
     */
    @Service({
        module: 'app.services',
        name: 'authService'
    })
    class AuthService implements IAuthService {
        static $inject = ['dataService', 'sessionStorageService', 'util', 'config', 'eventingService'];
        constructor(private _dataService: IDataService,
            private _sessionStorageService: IStorageService,
            private _util: IUtil,
            private _config: IConfig,
            private _eventingService: IEventingService) {
        }

        /**
         * Determines if the current user is logged in.
         */
        isLoggedIn(): boolean {
            let currentUser = this._sessionStorageService.getItem('CurrentUser');
            return !!currentUser;
        }

        /**
         * Gets or sets the current user.
         * @param user  the user to set
         * @returns the current user, if no user was passed in
         */
        currentUser(user?: IUser): IUser {
            if (this._util.isDefined(user)) {
                this._sessionStorageService.setItem('CurrentUser', user);
                this._fireAccountChangeEvent(user);
            } else {
                return <IUser>this._sessionStorageService.getItem('CurrentUser');
            }
        }

        /**
         * Logs a user into the system.
         */
        login(): void {
            window.location.href = "/auth/login";
        }

        /**
         * Logs the current user out of the sytem.
         */
        logout(): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.authBaseUrl,
                url: 'logout',
                action: 'get'
            }).then((data) => {
                this._sessionStorageService.removeItem('CurrentUser');
                this._fireAccountChangeEvent(null);
                return data;
            });
        }

        /////////////////////

        /**
         * Fires the accountChange event.
         */
        private _fireAccountChangeEvent(val: any): void {
            this._eventingService.fireEvent('accountChange', val);
        }
    }

}
