namespace app.people {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IStateParamsService = angular.ui.IStateParamsService;
    import IUserService = app.services.IUserService;
    import IPerson = app.services.IPerson;

    interface IPersonViewStateParamService extends IStateParamsService {
        id: string
    }

    /**
     * This component renders the Person Detail view.
     */
    @Component('app.people', 'idPersonView', {
        templateUrl: 'app/features/people/person-view.component.html',
        controllerAs: 'vm'
    })
    class PersonViewComponent {
        person: IPerson;

        static $inject = ['$state', '$stateParams', 'userService'];
        constructor(
            private _$state: IStateService,
            private _$stateParams: IPersonViewStateParamService,
            private _userService: IUserService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this._userService.getById(this._$stateParams.id)
                .then((person) => this.person = person);
        }

        /**
         * Navigate to the people view.
         */
        back() {
            this._$state.go('people');
        }
    }

}
