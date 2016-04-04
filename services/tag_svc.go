package services

import r "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/dancannon/gorethink"

// TagSvc represents a service that provides read/write access to tag data.
type TagSvc interface {
	GetAll() ([]string, *Error)
	Save(tag string) *Error
	Delete(tag string) *Error
}

type tag struct {
	ID string `json:"id" gorethink:"id"`
}

type tagSvcImpl struct {
	session *r.Session
}

// GetAll returns all the tags in the system, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *tagSvcImpl) GetAll() ([]string, *Error) {
	res, err := r.Table("Tags").Run(svc.session)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	tags := []*tag{}
	err = res.All(&tags)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	result := make([]string, len(tags))
	for i, s := range tags {
		result[i] = s.ID
	}

	return result, nil
}

// Insert persists an tag and returns an error if the operation failed.
// Potential error types:
//   ErrBadData: the tag is invalid
//   ErrDB: error reading/writing to the database
func (svc *tagSvcImpl) Save(tag string) *Error {
	res, err := r.Table("Tags").Get(tag).Run(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}

	if res.IsNil() {
		_, err = r.Table("Tags").Insert(tag).RunWrite(svc.session)
		if err != nil {
			return NewError(ErrDB, err)
		}
	}
	return nil
}

// Delete removes the tag with the specified id; if the tag does not exist, no action is taken.
// Potential error types:
//   ErrNotFound: the tag to delete doesn't exist
//   ErrDB: error reading/writing to the database
func (svc *tagSvcImpl) Delete(tag string) *Error {
	res, err := r.Table("Tags").Get(tag).Run(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}

	if !res.IsNil() {
		_, err = r.Table("Tags").Get(tag).Delete().RunWrite(svc.session)
		if err != nil {
			return NewError(ErrDB, err)
		}
	}
	return nil
}
