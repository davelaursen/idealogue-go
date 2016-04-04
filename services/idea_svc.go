package services

import r "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/dancannon/gorethink"

// IdeaSvc represents a service that provides read/write access to idea data.
type IdeaSvc interface {
	GetAll() (Ideas, *Error)
	GetByID(id string) (*Idea, *Error)
	Insert(idea *Idea) *Error
	Update(idea *Idea) *Error
	Delete(id string) *Error
}

type ideaSvcImpl struct {
	session *r.Session
}

// GetAll returns all the ideas in the system, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *ideaSvcImpl) GetAll() (Ideas, *Error) {
	res, err := r.Table("Ideas").Run(svc.session)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	ideas := []*Idea{}
	err = res.All(&ideas)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	return ideas, nil
}

// GetByID returns the idea that has the specified id, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *ideaSvcImpl) GetByID(id string) (*Idea, *Error) {
	res, err := r.Table("Ideas").Get(id).Run(svc.session)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	if res.IsNil() {
		return nil, nil
	}

	idea := &Idea{}
	err = res.One(idea)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	return idea, nil
}

// Insert persists an idea and returns an error if the operation failed.
// Potential error types:
//   ErrBadData: the idea is invalid
//   ErrDB: error reading/writing to the database
func (svc *ideaSvcImpl) Insert(idea *Idea) *Error {
	//TODO: lookup by email - check for conflict
	//TODO: validate idea to insert
	res, err := r.Table("Ideas").Insert(idea).RunWrite(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}
	idea.ID = res.GeneratedKeys[0]
	return nil
}

// Update persists an idea and returns an error if the operation failed.
// Potential error types:
//   ErrBadData: the idea is invalid
//   ErrNotFound: the idea to update doesn't exist
//   ErrDB: error reading/writing to the database
func (svc *ideaSvcImpl) Update(idea *Idea) *Error {
	//TODO: validate idea to update
	existing, err := svc.GetByID(idea.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return NewError(ErrNotFound, nil)
	}

	_, err2 := r.Table("Ideas").Get(idea.ID).Update(idea).RunWrite(svc.session)
	if err2 != nil {
		return NewError(ErrDB, err2)
	}
	return nil
}

// Delete removes the idea with the specified id; if the idea does not exist, no action is taken.
// Potential error types:
//   ErrNotFound: the idea to delete doesn't exist
//   ErrDB: error reading/writing to the database
func (svc *ideaSvcImpl) Delete(id string) *Error {
	existing, err := svc.GetByID(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return NewError(ErrNotFound, nil)
	}

	_, err2 := r.Table("Ideas").Get(id).Delete().RunWrite(svc.session)
	if err2 != nil {
		return NewError(ErrDB, err2)
	}
	return nil
}
