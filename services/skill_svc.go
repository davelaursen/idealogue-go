package services

import r "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/dancannon/gorethink"

// SkillSvc represents a service that provides read/write access to skill data.
type SkillSvc interface {
	GetAll() ([]string, *Error)
	Save(skill string) *Error
	Delete(skill string) *Error
}

type skill struct {
	ID string `json:"id" gorethink:"id"`
}

type skillSvcImpl struct {
	session *r.Session
}

// GetAll returns all the skills in the system, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *skillSvcImpl) GetAll() ([]string, *Error) {
	res, err := r.Table("Skills").Run(svc.session)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	skills := []*skill{}
	err = res.All(&skills)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	result := make([]string, len(skills))
	for i, s := range skills {
		result[i] = s.ID
	}

	return result, nil
}

// Insert persists an skill and returns an error if the operation failed.
// Potential error types:
//   ErrBadData: the skill is invalid
//   ErrDB: error reading/writing to the database
func (svc *skillSvcImpl) Save(skill string) *Error {
	res, err := r.Table("Skills").Get(skill).Run(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}

	if res.IsNil() {
		_, err = r.Table("Skills").Insert(skill).RunWrite(svc.session)
		if err != nil {
			return NewError(ErrDB, err)
		}
	}
	return nil
}

// Delete removes the skill with the specified id; if the skill does not exist, no action is taken.
// Potential error types:
//   ErrNotFound: the skill to delete doesn't exist
//   ErrDB: error reading/writing to the database
func (svc *skillSvcImpl) Delete(skill string) *Error {
	res, err := r.Table("Skills").Get(skill).Run(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}

	if !res.IsNil() {
		_, err = r.Table("Skills").Get(skill).Delete().RunWrite(svc.session)
		if err != nil {
			return NewError(ErrDB, err)
		}
	}
	return nil
}
