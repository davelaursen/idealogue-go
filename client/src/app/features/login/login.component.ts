namespace app.login {
    'use strict';

    import Component = ngDecorators.Component;
    import IAuthService = app.services.IAuthService;

    @Component({
        module: 'app.login',
        selector: 'idLogin',
        templateUrl: 'app/features/login/login.component.html',
        controllerAs: 'vm'
    })
    class LoginComponent {
        static $inject = ['authService'];
        constructor(private _authService: IAuthService) {
        }

        /**
         * Logs a user into the system.
         */
        login() {
            this._authService.login();
        }
    }

}
