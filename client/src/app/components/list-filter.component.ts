namespace app.components {
    'use strict';

    import Component = ngDecorators.Component;

    /**
     * This component renders a filter field for a list.
     */
    @Component('app.components', 'idListFilter', {
        templateUrl: 'app/components/list-filter.component.html',
        bindings: {
            showFilter: '=',
            filterStr: '='
        },
        controllerAs: 'vm'
    })
    class ListFilterComponent {}

}
