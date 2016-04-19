namespace app.account {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IAuthService = app.services.IAuthService;
    import IUserService = app.services.IUserService;
    import IUser = app.services.IUser;

    /**
     * This component renders the Account Details view.
     */
    @Component({
        module: 'app.account',
        selector: 'idAccountView',
        templateUrl: 'app/features/account/account-view.component.html',
        controllerAs: 'vm'
    })
    class AccountEditComponent {
        user: IUser;

        static $inject = ['$state', 'userService', 'authService'];
        constructor(
            private _$state: IStateService,
            private _userService: IUserService,
            private _authService: IAuthService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this.user = this._authService.currentUser();
        }

        /**
         * Navigates to the edit account view.
         */
        edit() {
            this._$state.go('account-edit');
        }

        /**
         * Deletes the current user's account.
         */
        remove() {
            this._userService.remove(this.user.id)
                .then(() => this._authService.logout());
        }
    }

}
