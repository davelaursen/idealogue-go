namespace app.ideas {
    'use strict';

    import Component = ngDecorators.Component;
    import IStateService = angular.ui.IStateService;
    import IStateParamsService = angular.ui.IStateParamsService;
    import IUtil = blocks.util.IUtil;
    import IAuthService = app.services.IAuthService;
    import IIdeaService = app.services.IIdeaService;
    import IUserService = app.services.IUserService;
    import ISkillService = app.services.ISkillService;
    import ITagService = app.services.ITagService;
    import ITechnologyService = app.services.ITechnologyService;
    import IIdea = app.services.IIdea;
    import IPerson = app.services.IPerson;

    interface IdeaEditStateParamService extends IStateParamsService {
        id: string
    }

    @Component({
        module: 'app.ideas',
        selector: 'idIdeaEdit',
        templateUrl: 'app/features/ideas/idea-edit.component.html',
        controllerAs: 'vm'
    })
    class IdeaViewComponent {
        idea: IIdea;
        people: IPerson[];
        skills: string[];
        tags: string[];
        techs: string[];
        isCreate: boolean;
        showPersonSearch: boolean;
        newSkill: string;
        showNewSkill: boolean;
        hideNewSkillButton: boolean;
        newSkillFocus: boolean;
        newTech: string;
        showNewTech: boolean;
        hideNewTechButton: boolean;
        newTechFocus: boolean;
        newTag: string;
        showNewTag: boolean;
        hideNewTagButton: boolean;
        newTagFocus: boolean;

        static $inject = [
            '$q', '$state', '$stateParams', 'util', 'authService', 'ideaService', 'userService',
            'skillService', 'technologyService', 'tagService'];
        constructor(
            private _$q: ng.IQService,
            private _$state: IStateService,
            private _$stateParams: IdeaEditStateParamService,
            private _util: IUtil,
            private _authService: IAuthService,
            private _ideaService: IIdeaService,
            private _userService: IUserService,
            private _skillService: ISkillService,
            private _technologyService: ITechnologyService,
            private _tagService: ITagService) {
        }

        /**
         * Lifecycle hook for when the component is initialized.
         */
        $onInit() {
            this.isCreate = true;
            this.showPersonSearch = false;
            this.newSkill = "";
            this.showNewSkill = false;
            this.hideNewSkillButton = false;
            this.newSkillFocus = false;
            this.newTech = "";
            this.showNewTech = false;
            this.hideNewTechButton = false;
            this.newTechFocus = false;
            this.newTag = "";
            this.showNewTag = false;
            this.hideNewTagButton = false;
            this.newTagFocus = false;

            let loaders = [
                this._userService.getAll(),
                this._skillService.getAll(),
                this._technologyService.getAll(),
                this._tagService.getAll()
            ];
            if (this._$stateParams.id) {
                this.isCreate = false;
                loaders.push(this._ideaService.getById(this._$stateParams.id));
            }

            this._$q.all(loaders).then((data) => {
                let people = data[0];
                let skills = data[1];
                let techs = data[2];
                let tags = data[3];

                people.sort(this._util.sortCompareFunc<IPerson>('lastName', false, (a) => a.toUpperCase()));
                skills.sort(sortFunc);
                techs.sort(sortFunc);
                tags.sort(sortFunc);

                this.people = people;
                this.skills = skills;
                this.techs = techs;
                this.tags = tags;

                if (data.length === 5) {
                    this.idea = this._ideaService.convertForView(data[4], people);
                } else {
                    this.idea = this._ideaService.newIdea();
                    this.idea.proposers.push(this._authService.currentUser());
                }
            });

            function sortFunc(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }
        }

        /**
         * Saves the idea.
         * @param form  the form containing the idea data to save
         */
        save(form: any) {
            let action;

            if (!form.$valid) {
                return;
            }

            this.idea.updatedDate = this._util.getISO8601DateString();
            if (this.isCreate) {
                this.idea.createdDate = this.idea.updatedDate;
                this._ideaService.insert(this._ideaService.convertForSave(this.idea))
                    .then(() => this.back());
            } else {
                this._ideaService.update(this._ideaService.convertForSave(this.idea))
                    .then(() => this.back());
            }
        }

        /**
         * Navigates to the previous idea page.
         */
        back() {
            if (this.isCreate) {
                this._$state.go('ideas');
            } else {
                this._$state.go('idea-view', { id: this.idea.id });
            }
        }

        /**
         * Removes a proposer from the idea.
         * @param index  the index of the proposer to remove
         */
        removeProposer(index: number) {
            this.idea.proposers.splice(index, 1);
        }

        /**
         * Opens the person search in order to select a proposer to add to the idea.
         */
        addProposer() {
            this.showPersonSearch = true;
        }

        /**
         * Adds a person to the idea's proposer array.
         */
        onProposerSelected(person) {
            this.idea.proposers.push(person);
        }

        /**
         * Displays the add skill input.
         */
        addSkill() {
            this.showNewSkill = true;
            this.hideNewSkillButton = true;
            this.newSkillFocus = true;
        }

        /**
         * Removes a skill from the idea.
         * @param index  the index of the skill to remove
         */
        removeSkill(index: number) {
            this.idea.skills.splice(index, 1);
        }

        /**
         * Adds a skill to the idea's skills array.
         */
        saveSkill() {
            if (this.newSkill !== null && !(/^\s*$/).test(this.newSkill)) {
                this.idea.skills.push(this.newSkill);
            }
            this.cancelSkill();
        }

        /**
         * Cancels adding a skill to the idea's skill array.
         */
        cancelSkill() {
            this.newSkill = "";
            this.showNewSkill = false;
            this.hideNewSkillButton = false;
            this.newSkillFocus = false;
        }

        /**
         * Displays the add tech input.
         */
        addTech() {
            this.showNewTech = true;
            this.hideNewTechButton = true;
            this.newTechFocus = true;
        }

        /**
         * Removes a tech from the idea.
         * @param index  the index of the tech to remove
         */
        removeTech(index: number) {
            this.idea.technologies.splice(index, 1);
        }

        /**
         * Adds a tech to the idea's tech array.
         */
        saveTech() {
            if (this.newTech !== null && !(/^\s*$/).test(this.newTech)) {
                this.idea.technologies.push(this.newTech);
            }
            this.cancelTech();
        }

        /**
         * Cancels adding a tech to the idea's tech array.
         */
        cancelTech() {
            this.newTech = "";
            this.showNewTech = false;
            this.hideNewTechButton = false;
            this.newTechFocus = false;
        }

        /**
         * Displays the add tag input.
         */
        addTag() {
            this.showNewTag = true;
            this.hideNewTagButton = true;
            this.newTagFocus = true;
        }

        /**
         * Removes a tag from the idea.
         * @param index  the index of the tag to remove
         */
        removeTag(index: number) {
            this.idea.tags.splice(index, 1);
        }

        /**
         * Adds a tag to the idea's tag array.
         */
        saveTag() {
            if (this.newTag !== null && !(/^\s*$/).test(this.newTag)) {
                this.idea.tags.push(this.newTag);
            }
            this.cancelTag();
        }

        /**
         * Cancels adding a tag to the idea's tag array.
         */
        cancelTag() {
            this.newTag = "";
            this.showNewTag = false;
            this.hideNewTagButton = false;
            this.newTagFocus = false;
        }
    }

}
