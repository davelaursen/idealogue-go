namespace app.components {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IUtil = blocks.util.IUtil;
    import IIdeaService = app.services.IIdeaService;
    import IUserService = app.services.IUserService;
    import IIdea = app.services.IIdea;
    import IPerson = app.services.IPerson;

    /**
     * This component renders the site search lightbox.
     */
    @Component({
        module: 'app.components',
        selector: 'idSiteSearch',
        templateUrl: 'app/components/site-search.component.html',
        bindings: {
            searchStr: '<',
            showLightbox: '=',
            onSelect: '&',
            onClose: '&'
        },
        controllerAs: 'vm'
    })
    class SiteSearchComponent {
        ideaResults: IIdea[];
        peopleResults: IPerson[];
        searchStr: string;
        showLightbox: boolean;
        onSelect: () => void;
        onClose: () => void;

        static $inject = ['$rootScope', '$scope', '$q', '$state', 'util', 'ideaService', 'userService'];
        constructor(
            private _$rootScope: ng.IRootScopeService,
            private _$scope: ng.IScope,
            private _$q: ng.IQService,
            private _$state: IStateService,
            private _util: IUtil,
            private _ideaService: IIdeaService,
            private _userService: IUserService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this.ideaResults = [];
            this.peopleResults = [];
            this.executeSearch();

            this._$scope.$watch('vm.showLightbox', (val: boolean) => {
                this._$rootScope.$broadcast('disableView', val);
            });
        }

        /**
         * Executes a site search.
         */
        executeSearch() {
            if (this._util.isEmpty(this.searchStr)) {
                this.ideaResults = [];
                this.peopleResults = [];
            } else {
                this._$q.all([
                    this._ideaService.search(this.searchStr),
                    this._userService.search(this.searchStr)
                ]).then((data) => {
                    this.ideaResults = data[0];
                    this.peopleResults = data[1];
                });
            }
        }

        /**
         * Closes the search lightbox.
         */
        closeSearch() {
            this.showLightbox = false;
            this.onClose();
        }

        /**
         * Selects an idea from the search results and navigates to the idea details view.
         * @param idea  the selected idea
         */
        selectIdea(idea) {
            this.onSelect();
            this._$state.go('idea-view', {id: idea.id});
        }

        /**
         * Selects a person from the search results and navigates to the person details view.
         * @param person  the selected person
         */
        selectPerson(person) {
            this.onSelect();
            this._$state.go('person-view', {id: person.id});
        }
    }

}
