namespace app.people {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IUtil = blocks.util.IUtil;
    import IUserService = app.services.IUserService;
    import IPerson = app.services.IPerson;

    /**
     * This component renders the Person List view.
     */
    @Component('app.people', 'idPersonList', {
        templateUrl: 'app/features/people/person-list.component.html',
        controllerAs: 'vm'
    })
    class PersonListComponent {
        people: IPerson[];
        desc: boolean;
        filterStr: string;
        showFilter: boolean;

        static $inject = ['$state', 'util', 'userService'];
        constructor(
            private _$state: IStateService,
            private _util: IUtil,
            private _userService: IUserService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this.people = [];
            this.desc = false;
            this.filterStr = '';
            this.showFilter = false;

            this._userService.getAll()
                .then((users) => {
                    if (users && users.length > 0) {
                        users.sort(this._util.sortCompareFunc('lastName', false, (a) => a.toUpperCase()));
                        this.people = users;
                    }
                });
        }

        /**
         * Navigates to the detail view for the specified person.
         * @param id  the id of the person to view
         */
        viewPerson(id: string) {
            this._$state.go('person-view', {id: id});
        }

        /**
         * Reverses the sort order for the people list.
         */
        reverseSortOrder() {
            this.desc = !this.desc;
            this.people.sort(this._util.sortCompareFunc('lastName', this.desc, (a) => a.toUpperCase()));
        }

        /**
         * Toggles displaying the filter field for the people list.
         */
        toggleFilter() {
            this.showFilter = !this.showFilter;
        }
    }

}
