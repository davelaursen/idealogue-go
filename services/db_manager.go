package services

import r "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/dancannon/gorethink"

// DBManager interface defines methods for working with a database.
type DBManager interface {
	Connect(addresses []string, authKey string) error
	Disconnect() error
	EnsureDatabaseStructure() error
	NewIdeaSvc() IdeaSvc
	NewSkillSvc() SkillSvc
	NewTagSvc() TagSvc
	NewTechSvc() TechSvc
	NewUserSvc() UserSvc
}

type dbManagerImpl struct {
	Session *r.Session
}

// NewDBManager returns a new DBManager instance.
func NewDBManager() DBManager {
	return &dbManagerImpl{}
}

func (mgr *dbManagerImpl) Connect(addresses []string, authKey string) error {
	session, err := r.Connect(r.ConnectOpts{
		Addresses:     addresses,
		Database:      "Idealogue",
		DiscoverHosts: true,
		AuthKey:       authKey,
	})
	if err != nil {
		return err
	}
	mgr.Session = session
	return nil
}

func (mgr *dbManagerImpl) Disconnect() error {
	return mgr.Session.Close()
}

func (mgr *dbManagerImpl) EnsureDatabaseStructure() error {
	type table struct {
		Name    string
		Indices []string
	}
	type dbStructure struct {
		Name   string
		Tables []table
	}
	db := dbStructure{
		Name: "Idealogue",
		Tables: []table{
			table{Name: "Ideas", Indices: []string{}},
			table{Name: "Skills", Indices: []string{}},
			table{Name: "Tags", Indices: []string{}},
			table{Name: "Technologies", Indices: []string{}},
			table{Name: "Users", Indices: []string{"email"}},
		},
	}

	// ensure Idealogue DB exists
	res, err := r.DBList().Run(mgr.Session)
	if err != nil {
		return err
	}
	dbs := []string{}
	err = res.All(&dbs)
	if err != nil {
		return err
	}
	if !mgr.contains(db.Name, dbs) {
		_, err = r.DBCreate(db.Name).Run(mgr.Session)
		if err != nil {
			return err
		}
	}

	// ensure tables/indexes exist
	res, err = r.DB(db.Name).TableList().Run(mgr.Session)
	if err != nil {
		return err
	}
	tables := []string{}
	err = res.All(&tables)
	if err != nil {
		return err
	}
	for _, table := range db.Tables {
		if !mgr.contains(table.Name, tables) {
			_, err = r.DB(db.Name).TableCreate(table.Name).Run(mgr.Session)
			if err != nil {
				return err
			}
		}

		res, err = r.DB(db.Name).Table(table.Name).IndexList().Run(mgr.Session)
		if err != nil {
			return err
		}
		indices := []string{}
		err = res.All(&indices)
		if err != nil {
			return err
		}
		for _, indexName := range table.Indices {
			if !mgr.contains(indexName, indices) {
				_, err = r.DB(db.Name).Table(table.Name).IndexCreate(indexName).Run(mgr.Session)
				if err != nil {
					return err
				}
			}
		}

		// ensure one-off compound indices
		if table.Name == "TimeEntries" {
			if !mgr.contains("user_date", indices) {
				_, err = r.DB(db.Name).Table(table.Name).IndexCreateFunc("user_date", func(row r.Term) interface{} {
					return []interface{}{row.Field("userId"), row.Field("date")}
				}).RunWrite(mgr.Session)
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func (mgr *dbManagerImpl) contains(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

func (mgr *dbManagerImpl) NewIdeaSvc() IdeaSvc {
	return &ideaSvcImpl{mgr.Session}
}

func (mgr *dbManagerImpl) NewSkillSvc() SkillSvc {
	return &skillSvcImpl{mgr.Session}
}

func (mgr *dbManagerImpl) NewTagSvc() TagSvc {
	return &tagSvcImpl{mgr.Session}
}

func (mgr *dbManagerImpl) NewTechSvc() TechSvc {
	return &techSvcImpl{mgr.Session}
}

func (mgr *dbManagerImpl) NewUserSvc() UserSvc {
	return &userSvcImpl{mgr.Session}
}
