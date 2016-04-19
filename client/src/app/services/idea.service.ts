namespace app.services {
    'use strict';

    import Service = ngDecorators.Service;
    import IDataService = blocks.data.IDataService;
    import IUtil = blocks.util.IUtil;
    import IConfig = app.config.IConfig;

    export interface IIdea {
        id?: string;
        name: string
        summary: string;
        benefits: string;
        details: string;
        state: string;
        tags: string[];
        skills: string[];
        technologies: string[];
        proposers: any[];
        votes: string[];
        comments: {}[];
        createdDate: string;
        updatedDate: string;
    }

    export interface IIdeaService {
        search(searchValue: string): ng.IPromise<any>;
        getAll(): ng.IPromise<any>;
        getById(id: string): ng.IPromise<any>;
        insert(idea: IIdea): ng.IPromise<any>;
        update(idea: IIdea): ng.IPromise<any>;
        remove(id: string): ng.IPromise<any>;
        newIdea(): IIdea;
        convertForView(idea: IIdea, people: IPerson[]): IIdea;
        convertForSave(idea: IIdea): IIdea;
    }

    /**
     * A service that provides functionality for reading/writing idea data.
     */
    @Service({
        module: 'app.services',
        name: 'ideaService'
    })
    class IdeaService {

        static $inject = ['dataService', 'util', 'config'];
        constructor(
            private _dataService: IDataService,
            private _util: IUtil,
            private _config: IConfig) {
        }

        /**
         * Searches for ideas that match the given search value.
         */
        search(searchValue: string): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'ideas?search={search}',
                action: 'get',
                tokens: { search: searchValue }
            });
        }

        /**
         * Retrieves all of the ideas in the system.
         */
        getAll(): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'ideas',
                action: 'get'
            });
        }

        /**
         * Retrieves the idea that has the specified id.
         */
        getById(id: string): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'ideas/{id}',
                action: 'get',
                tokens: { id: id }
            });
        }

        /**
         * Adds a new idea to the system.
         */
        insert(idea: IIdea): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'ideas',
                action: 'post',
                payload: idea
            });
        }

        /**
         * Updates an existing idea.
         */
        update(idea: IIdea): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'ideas/{id}',
                action: 'put',
                tokens: { id: idea.id },
                payload: idea
            });
        }

        /**
         * Removes the idea that has the specified id.
         */
        remove(id: string): ng.IPromise<any> {
            return this._dataService.execute({
                baseUrl: this._config.apiBaseUrl,
                url: 'ideas/{id}',
                action: 'delete',
                tokens: { id: id }
            });
        }

        /**
         * Returns an new, initialized idea object.
         */
        newIdea(): IIdea {
            let dateStr = this._util.getISO8601DateString();
            return {
                name: "",
                summary: "",
                benefits: "",
                details: "",
                state: "Idea",
                tags: [],
                skills: [],
                technologies: [],
                proposers: [],
                votes: [],
                comments: [],
                createdDate: dateStr,
                updatedDate: dateStr
            };
        }

        //TODO: MOVE THESE OBJECT CONVERSIONS TO THE SERVER

        /**
         * Converts an idea object so that it contains all additional information needed by the views.
         */
        convertForView(idea: IIdea, people: IPerson[]): IIdea {
            let result = this._util.clone(idea);
            result.proposerNames = [];

            let proposerObjs = [];
            let proposerNames = [];
            for (let i = 0; i < result.proposers.length; i++) {
                let person;
                for (let p of people) {
                    if (p.id === result.proposers[i]) {
                        person = p;
                        break;
                    }
                }
                if (person) {
                    result.proposers[i] = person;
                    result.proposerNames.push(person.firstName + ' ' + person.lastName);
                }
            }

            for (let i = 0; i < result.comments.length; i++) {
                let person;
                for (let p of people) {
                    if (p.id === result.comments[i].id) {
                        person = p;
                        break;
                    }
                }
                if (person) {
                    result.comments[i].person = person;
                }
            }
            return result;
        }

        /**
         * Converts an idea object so that it has the data that server expects when saving.
         */
        convertForSave(idea: IIdea): IIdea {
            let result = this._util.clone(idea);

            delete result.proposerNames;
            for (let i = 0; i < result.proposers.length; i++) {
                result.proposers[i] = result.proposers[i].id;
            }
            for (let i = 0; i < result.comments.length; i++) {
                delete result.comments[i].person;
            }
            return result;
        }
    }

}
