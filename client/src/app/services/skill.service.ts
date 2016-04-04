namespace app.services {
    'use strict';

    import Service = ngDecorators.Service;
    import IDataService = blocks.data.IDataService;
    import IConfig = app.config.IConfig;

    export interface ISkillService {
        getAll(): ng.IPromise<any>;
    }

    /**
     * A service that provides functionality for reading/writing skill data.
     */
    @Service('app.services', 'skillService')
    class SkillService {

        static $inject = ['dataService', 'config'];
        constructor(
            private _dataService: IDataService,
            private _config: IConfig) {
        }

        /**
         * Retrieves all of the skills in the system.
         */
        getAll(): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'skills',
                action: 'get'
            });
        }
    }

}
