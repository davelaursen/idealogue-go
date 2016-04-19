namespace app.components {
    'use strict';

    import Component = ngDecorators.Component;
    import IUtil = blocks.util.IUtil;
    import IUserService = app.services.IUserService;
    import IPerson = app.services.IPerson;

    interface IOnSelectObj {
        person: IPerson
    }

    /**
     * This component renders the person search lightbox.
     */
    @Component({
        module: 'app.components',
        selector: 'idPersonSearch',
        templateUrl: 'app/components/person-search.component.html',
        bindings: {
            people: '=',
            showLightbox: '=',
            onSelect: '&'
        },
        controllerAs: 'vm'
    })
    class PersonSearchComponent {
        searchStr: string;
        searchResults: IPerson[];
        people: IPerson[];
        showLightbox: boolean;
        onSelect: (obj: IOnSelectObj) => void;

        static $inject = ['$rootScope', '$scope', 'util', 'userService'];
        constructor(
            private _$rootScope: ng.IRootScopeService,
            private _$scope: ng.IScope,
            private _util: IUtil,
            private _userService: IUserService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this.searchStr = "";
            this.searchResults = [];

            this._$scope.$watch('vm.showLightbox', (val: boolean) => {
                this._$rootScope.$broadcast('disableView', val);
            });
        }

        /**
         * Executes a person search.
         */
        executeSearch() {
            let results = this._findPeople();
            results.sort(this._util.sortCompareFunc<IPerson>('id', false, (a) => a.toUpperCase()));
            this.searchResults = results;
        }

        /**
         * Closes the search lightbox.
         */
        closeSearch() {
            this.showLightbox = false;
            this.searchStr = "";
            this.searchResults = [];
        }

        /**
         * Selects a person from the search results and closes the search lightbox.
         * @param person  the selected person
         */
        selectPerson(person) {
            if (this.onSelect) {
                this.onSelect({person: person});
            }
            this.closeSearch();
        }

        /////////////////////

        /**
         * Finds people that match the current search value.
         * @return an array of person objects
         */
        private _findPeople(): IPerson[] {
            if (this._util.isEmpty(this.searchStr)) {
                return this.people;
            }

            let text = this.searchStr.toLowerCase();
            let result = [];
            for (let p of this.people) {
                if (p.firstName.toLowerCase().indexOf(text) > -1 ||
                    p.lastName.toLowerCase().indexOf(text) > -1 ||
                    p.email.toLowerCase().indexOf(text) > -1) {
                    result.push(p);
                }
            }
            return result;
        }
    }

}
