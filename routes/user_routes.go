package routes

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/davelaursen/idealogue-go/services"
)

// RegisterUserRoutes registers the /users endpoints with the router.
func RegisterUserRoutes(r *mux.Router, enc Encoder, userSvc services.UserSvc) {
	u := util{}

	r.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			GetUsers(w, r, enc, userSvc)
		}
	}).Methods("GET")

	r.HandleFunc("/api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			GetUser(w, enc, userSvc, mux.Vars(r))
		}
	}).Methods("GET")

	r.HandleFunc("/api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			PutUser(w, r, enc, userSvc, mux.Vars(r))
		}
	}).Methods("PUT")

	r.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			PostUser(w, r, enc, userSvc)
		}
	}).Methods("POST")

	r.HandleFunc("/api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			DeleteUser(w, enc, userSvc, mux.Vars(r))
		}
	}).Methods("DELETE")
}

// GetUsers returns a list of users.
func GetUsers(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.UserSvc) {
	email := r.URL.Query().Get("email")
	search := r.URL.Query().Get("search")
	users := services.Users{}
	if email != "" {
		u, err := svc.GetByEmail(email)
		if err != nil {
			panic(err)
		}
		if u != nil {
			users = append(users, u)
		}
	} else if search != "" {
		//TODO: implement full text search
		// u, err := svc.Search(search)
		u, err := svc.GetAll()
		if err != nil {
			panic(err)
		}
		users = u
	} else {
		u, err := svc.GetAll()
		if err != nil {
			panic(err)
		}
		users = u
	}
	util{}.writeResponse(w, http.StatusOK, enc.EncodeMulti(users.ToInterfaces()...))
}

// GetUser returns the requested user.
func GetUser(w http.ResponseWriter, enc Encoder, svc services.UserSvc, params Params) {
	id := params["id"]
	u, err := svc.GetByID(id)
	if err != nil {
		panic(err)
	}
	if u == nil {
		util{}.notFound(w, enc, fmt.Sprintf("the user with id '%s' does not exist", id))
		return
	}
	util{}.writeResponse(w, http.StatusOK, enc.Encode(*u))
}

// PostUser creates a user.
func PostUser(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.UserSvc) {
	user := &services.User{}
	e := loadUserFromRequest(w, r, enc, user)
	if e != nil {
		util{}.badRequest(w, enc, "the user data is invalid")
		return
	}

	err := svc.Insert(user)
	if err != nil {
		switch err.Type {
		case services.ErrBadData:
			util{}.badRequest(w, enc, err.Error())
			return
		default:
			panic(err)
		}
	}

	util{}.writeResponse(w, http.StatusCreated, enc.Encode(user))
}

// PutUser updates a user.
func PutUser(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.UserSvc, params Params) {
	id := params["id"]
	user, err := svc.GetByID(id)
	if err != nil {
		panic(err)
	}
	if user == nil {
		util{}.notFound(w, enc, fmt.Sprintf("the user with id %s does not exist", id))
		return
	}

	e := loadUserFromRequest(w, r, enc, user)
	if e != nil {
		util{}.badRequest(w, enc, "the user data is invalid")
		return
	}

	err = svc.Update(user)
	if err != nil {
		switch err.Type {
		case services.ErrBadData:
			util{}.badRequest(w, enc, err.Error())
			return
		default:
			panic(err)
		}
	}

	util{}.writeResponse(w, http.StatusOK, enc.Encode(user))
}

// DeleteUser removes a user.
func DeleteUser(w http.ResponseWriter, enc Encoder, svc services.UserSvc, params Params) {
	id := params["id"]
	err := svc.Delete(id)
	if err != nil {
		switch err.Type {
		case services.ErrNotFound:
			util{}.notFound(w, enc, fmt.Sprintf("the user with id %s does not exist", id))
			return
		default:
			panic(err)
		}
	}
	util{}.writeResponse(w, http.StatusNoContent, "")
}

// parse request body into a User instance
func loadUserFromRequest(w http.ResponseWriter, r *http.Request, enc Encoder, user *services.User) *services.ErrorResponse {
	body, err := ioutil.ReadAll(http.MaxBytesReader(w, r.Body, maxRequestBodySize))
	if err != nil {
		if err.Error() == "http: request body too large" {
			return services.NewErrorResponse(http.StatusBadRequest, err.Error())
		}
		panic(err)
	}
	err = enc.Decode(body, user)
	if err != nil {
		fmt.Printf("%s\n", err)
		return services.NewErrorResponse(http.StatusBadRequest, fmt.Sprintf("the user data is not valid"))
	}
	return nil
}
