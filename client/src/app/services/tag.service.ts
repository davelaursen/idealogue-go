namespace app.services {
    'use strict';

    import Service = ngDecorators.Service;
    import IDataService = blocks.data.IDataService;
    import IConfig = app.config.IConfig;

    export interface ITagService {
        getAll(): ng.IPromise<any>;
    }

    /**
     * A service that provides functionality for reading/writing tag data.
     */
    @Service('app.services', 'tagService')
    class TagService {

        static $inject = ['dataService', 'config'];
        constructor(
            private _dataService: IDataService,
            private _config: IConfig) {
        }

        /**
         * Retrieves all of the tags in the system.
         */
        getAll(): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'tags',
                action: 'get'
            });
        }
    }

}
