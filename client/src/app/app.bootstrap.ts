namespace app {
    'use strict';

    import IDataService = blocks.data.IDataService;
    import IUtil = blocks.util.IUtil;
    import IStorageService = blocks.storage.IStorageService;
    import IConfig = app.config.IConfig;

    let injector: ng.auto.IInjectorService = angular.injector([
        'ng', 'blocks.data', 'blocks.util', 'blocks.storage', 'app.config']);
    let dataService: IDataService = injector.get<IDataService>('dataService');
    let util: IUtil = injector.get<IUtil>('util');
    let sessionStorageService: IStorageService = injector.get<IStorageService>('sessionStorageService');
    let config: IConfig = injector.get<IConfig>('config');

    // load the currently logged in user from the server, then start the Angular application
    dataService.get(util.pathJoin([config.authBaseUrl, 'currentuser']))
        .then((res) => sessionStorageService.setItem('CurrentUser', res.data))
        .catch(() => sessionStorageService.removeItem('CurrentUser'))
        .finally(() => {
            (<any>angular.element(document)).ready(() => {
                angular.bootstrap(document, ['app']);
            });
        });
}
