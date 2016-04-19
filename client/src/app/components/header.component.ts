namespace app.components {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IAuthService = app.services.IAuthService;
    import IEventingService = app.services.IEventingService;

    /**
     * This component renders the application header.
     */
    @Component({
        module: 'app.components',
        selector: 'idHeader',
        templateUrl: 'app/components/header.component.html',
        controllerAs: 'vm'
    })
    class HeaderComponent {
        headerVisible: boolean;
        searchValue: string;
        searchResultsVisible: boolean;
        currentUserName: string;

        static $inject = ['$state', 'eventingService', 'authService'];
        constructor(
            private _$state: IStateService,
            private _eventingService: IEventingService,
            private _authService: IAuthService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            let currentUser = this._authService.currentUser();
            if (currentUser) {
                this.currentUserName = currentUser.firstName + ' ' + currentUser.lastName;
            }

            this.headerVisible = true;
            this.searchValue = '';
            this.searchResultsVisible = false;

            this._eventingService.registerListener('accountChange', 'header', (user) => {
                this.currentUserName = !user ? '' : user.firstName + ' ' + user.lastName;
            });
        }

        /**
         * Executes a search.
         */
        executeSearch() {
            this.searchResultsVisible = true;
        }

        /**
         * Navigates to the Ideas view.
         */
        goToIdeas() {
            this._$state.go('ideas');
        }

        /**
         * Navigates to the People view.
         */
        goToPeople() {
            this._$state.go('people');
        }

        /**
         * Navigates to the Account view.
         */
        goToAccount() {
            this._$state.go('account');
        }

        /**
         * Logs the current user out of the application.
         */
        logout() {
            this._authService.logout()
                .then(() => {
                    this._$state.go('login');
                });
        }

        /**
         * Clears the search text field.
         */
        clearSearchValue() {
            this.searchValue = '';
        }
    }

}
