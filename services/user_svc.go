package services

import (
	"fmt"

	r "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/dancannon/gorethink"
)

// UserSvc represents a service that provides read/write access to user data.
type UserSvc interface {
	GetAll() (Users, *Error)
	GetByID(id string) (*User, *Error)
	GetByEmail(email string) (*User, *Error)
	Insert(user *User) *Error
	Update(user *User) *Error
	Delete(id string) *Error
}

type userSvcImpl struct {
	session *r.Session
}

// GetAll returns all the users in the system, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *userSvcImpl) GetAll() (Users, *Error) {
	res, err := r.Table("Users").Run(svc.session)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	users := []*User{}
	err = res.All(&users)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	return users, nil
}

// GetByID returns the user that has the specified id, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *userSvcImpl) GetByID(id string) (*User, *Error) {
	res, err := r.Table("Users").Get(id).Run(svc.session)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	if res.IsNil() {
		return nil, nil
	}

	user := &User{}
	err = res.One(user)
	if err != nil {
		return nil, NewError(ErrDB, err)
	}

	return user, nil
}

// GetByEmail returns the user that has the specified email, or nil.
// Potential error types:
//   ErrDB: error reading/writing to the database
func (svc *userSvcImpl) GetByEmail(email string) (*User, *Error) {
	res, err := r.Table("Users").GetAllByIndex("email", email).Run(svc.session)
	if err != nil {
		fmt.Println("ERROR 1: ", err)
		return nil, NewError(ErrDB, err)
	}
	if res.IsNil() {
		return nil, nil
	}

	user := &User{}
	err = res.One(user)
	if err != nil {
		fmt.Println("ERROR 2: ", err)
		return nil, NewError(ErrDB, err)
	}

	return user, nil
}

// Insert persists an user and returns an error if the operation failed.
// Potential error types:
//   ErrBadData: the user is invalid
//   ErrDB: error reading/writing to the database
func (svc *userSvcImpl) Insert(user *User) *Error {
	//TODO: lookup by email - check for conflict
	//TODO: validate user to insert
	res, err := r.Table("Users").Insert(user).RunWrite(svc.session)
	if err != nil {
		return NewError(ErrDB, err)
	}
	user.ID = res.GeneratedKeys[0]
	return nil
}

// Update persists an user and returns an error if the operation failed.
// Potential error types:
//   ErrBadData: the user is invalid
//   ErrNotFound: the user to update doesn't exist
//   ErrDB: error reading/writing to the database
func (svc *userSvcImpl) Update(user *User) *Error {
	//TODO: validate user to update
	existing, err := svc.GetByID(user.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return NewError(ErrNotFound, nil)
	}

	_, err2 := r.Table("Users").Get(user.ID).Update(user).RunWrite(svc.session)
	if err2 != nil {
		return NewError(ErrDB, err2)
	}
	return nil
}

// Delete removes the user with the specified id; if the user does not exist, no action is taken.
// Potential error types:
//   ErrNotFound: the user to delete doesn't exist
//   ErrDB: error reading/writing to the database
func (svc *userSvcImpl) Delete(id string) *Error {
	existing, err := svc.GetByID(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return NewError(ErrNotFound, nil)
	}

	_, err2 := r.Table("Users").Get(id).Delete().RunWrite(svc.session)
	if err2 != nil {
		return NewError(ErrDB, err2)
	}
	return nil
}
