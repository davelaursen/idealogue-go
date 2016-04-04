package routes

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/davelaursen/idealogue-go/services"
)

// RegisterIdeaRoutes registers the /ideas endpoints with the router.
func RegisterIdeaRoutes(r *mux.Router, enc Encoder, ideaSvc services.IdeaSvc) {
	u := util{}

	r.HandleFunc("/api/ideas", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			GetIdeas(w, r, enc, ideaSvc)
		}
	}).Methods("GET")

	r.HandleFunc("/api/ideas/{id}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			GetIdea(w, enc, ideaSvc, mux.Vars(r))
		}
	}).Methods("GET")

	r.HandleFunc("/api/ideas/{id}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			PutIdea(w, r, enc, ideaSvc, mux.Vars(r))
		}
	}).Methods("PUT")

	r.HandleFunc("/api/ideas", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			PostIdea(w, r, enc, ideaSvc)
		}
	}).Methods("POST")

	r.HandleFunc("/api/ideas/{id}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			DeleteIdea(w, enc, ideaSvc, mux.Vars(r))
		}
	}).Methods("DELETE")
}

// GetIdeas returns a list of ideas.
func GetIdeas(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.IdeaSvc) {
	search := r.URL.Query().Get("search")
	ideas := services.Ideas{}
	if search != "" {
		//TODO: implement full text search
		// i, err := svc.Search(search)
		i, err := svc.GetAll()
		if err != nil {
			panic(err)
		}
		ideas = i
	} else {
		i, err := svc.GetAll()
		if err != nil {
			panic(err)
		}
		ideas = i
	}
	util{}.writeResponse(w, http.StatusOK, enc.EncodeMulti(ideas.ToInterfaces()...))
}

// GetIdea returns the requested idea.
func GetIdea(w http.ResponseWriter, enc Encoder, svc services.IdeaSvc, params Params) {
	id := params["id"]
	u, err := svc.GetByID(id)
	if err != nil {
		panic(err)
	}
	if u == nil {
		util{}.notFound(w, enc, fmt.Sprintf("the idea with id '%s' does not exist", id))
		return
	}
	util{}.writeResponse(w, http.StatusOK, enc.Encode(*u))
}

// PostIdea creates a idea.
func PostIdea(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.IdeaSvc) {
	idea := &services.Idea{}
	e := loadIdeaFromRequest(w, r, enc, idea)
	if e != nil {
		util{}.badRequest(w, enc, "the idea data is invalid")
		return
	}

	err := svc.Insert(idea)
	if err != nil {
		switch err.Type {
		case services.ErrBadData:
			util{}.badRequest(w, enc, err.Error())
			return
		default:
			panic(err)
		}
	}

	util{}.writeResponse(w, http.StatusCreated, enc.Encode(idea))
}

// PutIdea updates a idea.
func PutIdea(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.IdeaSvc, params Params) {
	id := params["id"]
	idea, err := svc.GetByID(id)
	if err != nil {
		panic(err)
	}
	if idea == nil {
		util{}.notFound(w, enc, fmt.Sprintf("the idea with id %s does not exist", id))
		return
	}

	e := loadIdeaFromRequest(w, r, enc, idea)
	if e != nil {
		util{}.badRequest(w, enc, "the idea data is invalid")
		return
	}

	err = svc.Update(idea)
	if err != nil {
		switch err.Type {
		case services.ErrBadData:
			util{}.badRequest(w, enc, err.Error())
			return
		default:
			panic(err)
		}
	}

	util{}.writeResponse(w, http.StatusOK, enc.Encode(idea))
}

// DeleteIdea removes a idea.
func DeleteIdea(w http.ResponseWriter, enc Encoder, svc services.IdeaSvc, params Params) {
	id := params["id"]
	err := svc.Delete(id)
	if err != nil {
		switch err.Type {
		case services.ErrNotFound:
			util{}.notFound(w, enc, fmt.Sprintf("the idea with id %s does not exist", id))
			return
		default:
			panic(err)
		}
	}
	util{}.writeResponse(w, http.StatusNoContent, "")
}

// parse request body into a Idea instance
func loadIdeaFromRequest(w http.ResponseWriter, r *http.Request, enc Encoder, idea *services.Idea) *services.ErrorResponse {
	body, err := ioutil.ReadAll(http.MaxBytesReader(w, r.Body, maxRequestBodySize))
	if err != nil {
		if err.Error() == "http: request body too large" {
			return services.NewErrorResponse(http.StatusBadRequest, err.Error())
		}
		panic(err)
	}
	err = enc.Decode(body, idea)
	if err != nil {
		fmt.Printf("%s\n", err)
		return services.NewErrorResponse(http.StatusBadRequest, fmt.Sprintf("the idea data is not valid"))
	}
	return nil
}
