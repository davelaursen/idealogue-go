namespace app.ideas {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IStateParamsService = angular.ui.IStateParamsService;
    import IUtil = blocks.util.IUtil;
    import IAuthService = app.services.IAuthService;
    import IIdeaService = app.services.IIdeaService;
    import IUserService = app.services.IUserService;
    import IIdea = app.services.IIdea;
    import IPerson = app.services.IPerson;

    interface IIdeaViewStateParamService extends IStateParamsService {
        id: string
    }

    @Component({
        module: 'app.ideas',
        selector: 'idIdeaView',
        templateUrl: 'app/features/ideas/idea-view.component.html',
        controllerAs: 'vm'
    })
    class IdeaViewComponent {
        showNewComment: boolean;
        hideAddCommentButton: boolean;
        newComment: any;
        idea: IIdea;
        people: IPerson[];

        static $inject = [
            '$q', '$state', '$stateParams', 'util', 'authService', 'ideaService', 'userService'];
        constructor(
            private _$q: ng.IQService,
            private _$state: IStateService,
            private _$stateParams: IIdeaViewStateParamService,
            private _util: IUtil,
            private _authService: IAuthService,
            private _ideaService: IIdeaService,
            private _userService: IUserService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this.showNewComment = false;
            this.hideAddCommentButton = false;
            this.newComment = null;

            this._$q.all([
                this._ideaService.getById(this._$stateParams.id),
                this._userService.getAll()
            ]).then((data) => {
                this.idea = this._ideaService.convertForView(data[0], data[1]);
                this.people = data[1];
            }).catch(() => {
                this._$state.go('404');
            });
        }

        /**
         * Navigates to the ideas view.
         */
        back() {
            this._$state.go('ideas');
        }

        /**
         * Navigates to the edit idea view.
         */
        edit() {
            this._$state.go('idea-edit', { id: this.idea.id });
        }

        /**
         * Deletes the current idea from the system.
         */
        remove() {
            this._ideaService.remove(this.idea.id)
                .then(this.back);
        }

        /**
         * Adds a vote for the current idea from the current user. If the user has already
         * voted for the current idea, no action is taken.
         */
        vote() {
            let id = this._authService.currentUser().id;
            let found = this.idea.votes.indexOf(id) > -1
            if (!found) {
                this.idea.votes.push(id);
                this._ideaService.update(this._ideaService.convertForSave(this.idea));
            }
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
         * Displays the add comment input.
         */
        addComment() {
            this.showNewComment = true;
            this.hideAddCommentButton = true;
        }

        /**
         * Cancels adding a comment toe the idea's comment array.
         */
        cancelComment() {
            this.newComment = null;
            this.showNewComment = false;
            this.hideAddCommentButton = false;
        }

        /**
         * Adds a comment to the idea's comment array.
         */
        saveComment() {
            let user = this._authService.currentUser();

            this.idea.comments.push({
                id: user.id,
                text: this.newComment,
                timestamp: this._util.getISO8601DateString(),
                person: user
            });

            this._ideaService.update(this._ideaService.convertForSave(this.idea))
                .then(() => {
                    this.cancelComment();
                });
        }
    }

}
