namespace app.ideas {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IUtil = blocks.util.IUtil;
    import IIdeaService = app.services.IIdeaService;
    import IIdea = app.services.IIdea;

    @Component('app.ideas', 'idIdeaList', {
        templateUrl: 'app/features/ideas/idea-list.component.html',
        controllerAs: 'vm'
    })
    class IdeaViewComponent {
        ideas: IIdea[];
        desc: boolean;
        filterStr: string;
        showFilter: boolean;

        static $inject = ['$state', 'util', 'ideaService'];
        constructor(
            private _$state: IStateService,
            private _util: IUtil,
            private _ideaService: IIdeaService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this.ideas = [];
            this.desc = false;
            this.filterStr = '';
            this.showFilter = false;

            this._ideaService.getAll()
                .then((ideas) => {
                    if (ideas && ideas.length > 0) {
                        ideas.sort(this._util.sortCompareFunc('name', false, (a) => a.toUpperCase()));
                        this.ideas = ideas;
                    }
                });
        }

        /**
         * Converts the given array to a string.
         * @param arr  the array of object to convert
         * @param prop  the name of the property to use as the string value
         */
        toList(arr: {}[], prop: string): string {
            return this._util.arrayToString(arr, prop);
        }

        /**
         * Navigates to the Add New Idea view.
         */
        addNew() {
            this._$state.go('idea-new');
        }

        /**
         * Navigates to the detail view for the specified idea.
         * @param {string} id  the id of the idea to view
         */
        viewIdea(id) {
            this._$state.go('idea-view', {id: id});
        }

        /**
         * Reverses the sort order for the idea list.
         */
        reverseSortOrder() {
            this.desc = !this.desc;
            this.ideas.sort(this._util.sortCompareFunc('name', this.desc, (a) => a.toUpperCase()));
        }

        /**
         * Toggles displaying the filter field for the ideas list.
         */
        toggleFilter() {
            this.showFilter = !this.showFilter;
        }
    }

}
