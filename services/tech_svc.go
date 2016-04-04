package services

import r "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/dancannon/gorethink"

// TechSvc represents a service that provides read/write access to tech data.
type TechSvc interface {
	GetAll() ([]string, *Error)
	Save(tech string) *Error
	Delete(tech string) *Error
}

type tech struct {
	ID string `json:"id" gorethink:"id"`
}

type techSvcImpl struct {
	session *r.Session
}

// GetAll returns all the techs in the system, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *techSvcImpl) GetAll() ([]string, *Error) {
	res, err := r.Table("Technologies").Run(svc.session)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	techs := []*tech{}
	err = res.All(&techs)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	result := make([]string, len(techs))
	for i, s := range techs {
		result[i] = s.ID
	}

	return result, nil
}

// Insert persists an tech and returns an error if the operation failed.
// Potential error types:
//   ErrBadData: the tech is invalid
//   ErrDB: error reading/writing to the database
func (svc *techSvcImpl) Save(tech string) *Error {
	res, err := r.Table("Technologies").Get(tech).Run(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}

	if res.IsNil() {
		_, err = r.Table("Technologies").Insert(tech).RunWrite(svc.session)
		if err != nil {
			return NewError(ErrDB, err)
		}
	}
	return nil
}

// Delete removes the tech with the specified id; if the tech does not exist, no action is taken.
// Potential error types:
//   ErrNotFound: the tech to delete doesn't exist
//   ErrDB: error reading/writing to the database
func (svc *techSvcImpl) Delete(tech string) *Error {
	res, err := r.Table("Technologies").Get(tech).Run(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}

	if !res.IsNil() {
		_, err = r.Table("Technologies").Get(tech).Delete().RunWrite(svc.session)
		if err != nil {
			return NewError(ErrDB, err)
		}
	}
	return nil
}
