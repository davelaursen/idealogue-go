package main

import "github.com/davelaursen/idealogue-go/services"

type DBManagerMock struct {
	UserSvc services.UserSvc
}

func (mgr *DBManagerMock) Connect(addresses []string, authKey string) error {
	return nil
}

func (mgr *DBManagerMock) Disconnect() error {
	return nil
}

func (mgr *DBManagerMock) EnsureDatabaseStructure() error {
	return nil
}

func (mgr *DBManagerMock) NewUserSvc() services.UserSvc {
	return mgr.UserSvc
}

func (mgr *DBManagerMock) NewIdeaSvc() services.IdeaSvc {
	return nil
}

func (mgr *DBManagerMock) NewSkillSvc() services.SkillSvc {
	return nil
}

func (mgr *DBManagerMock) NewTagSvc() services.TagSvc {
	return nil
}

func (mgr *DBManagerMock) NewTechSvc() services.TechSvc {
	return nil
}
