namespace app.services {
    'use strict';

    import Service = ngDecorators.Service;
    import IDataService = blocks.data.IDataService;
    import IConfig = app.config.IConfig;

    export interface ITechnologyService {
        getAll(): ng.IPromise<any>;
    }

    /**
     * A service that provides functionality for reading/writing technology data.
     */
    @Service('app.services', 'technologyService')
    class TechnologyService {

        static $inject = ['dataService', 'config'];
        constructor(
            private _dataService: IDataService,
            private _config: IConfig) {
        }

        /**
         * Retrieves all of the technologies in the system.
         */
        getAll(): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'technologies',
                action: 'get'
            });
        }
    }

}
