namespace app.account {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IUtil = blocks.util.IUtil;
    import IAuthService = app.services.IAuthService;
    import IUserService = app.services.IUserService;
    import IUser = app.services.IUser;

    /**
     * This component renders the Edit Account view.
     */
    @Component({
        module: 'app.account',
        selector: 'idAccountEdit',
        templateUrl: 'app/features/account/account-edit.component.html',
        controllerAs: 'vm'
    })
    class AccountEditComponent {
        user: IUser;

        static $inject = ['$state', 'util', 'userService', 'authService'];
        constructor(
            private _$state: IStateService,
            private _util: IUtil,
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
         * Saves the account.
         * @param form  the form containing the account data to save
         */
        save(form: any) {
            if (!form.$valid) {
                return;
            }

            this.user.updatedDate = this._util.getISO8601DateString();
            this._userService.update(this.user)
                .then(() => {
                    this._authService.currentUser(this.user);
                    this.back();
                });
        }

        /**
         * Navigates to the account view.
         */
        back() {
            this._$state.go('account');
        }
    }

}
