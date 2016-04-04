package routes

import (
	"fmt"
	"net/http"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/davelaursen/idealogue-go/services"
)

// RegisterTagRoutes registers the /tags endpoints with the router.
func RegisterTagRoutes(r *mux.Router, enc Encoder, tagSvc services.TagSvc) {
	u := util{}

	r.HandleFunc("/api/tags", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			GetTags(w, r, enc, tagSvc)
		}
	}).Methods("GET")

	r.HandleFunc("/api/tags/{tag}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			PutTag(w, r, enc, tagSvc, mux.Vars(r))
		}
	}).Methods("PUT")

	r.HandleFunc("/api/tags/{tag}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			DeleteTag(w, enc, tagSvc, mux.Vars(r))
		}
	}).Methods("DELETE")
}

// GetTags returns a list of tags.
func GetTags(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.TagSvc) {
	tags, err := svc.GetAll()
	if err != nil {
		panic(err)
	}
	util{}.writeResponse(w, http.StatusOK, enc.EncodeMultiString(tags...))
}

// PutTag updates a tag.
func PutTag(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.TagSvc, params Params) {
	tag := params["tag"]
	err := svc.Save(tag)
	if err != nil {
		switch err.Type {
		case services.ErrBadData:
			util{}.badRequest(w, enc, err.Error())
			return
		default:
			panic(err)
		}
	}

	util{}.writeResponse(w, http.StatusOK, enc.Encode(tag))
}

// DeleteTag removes a tag.
func DeleteTag(w http.ResponseWriter, enc Encoder, svc services.TagSvc, params Params) {
	tag := params["tag"]
	err := svc.Delete(tag)
	if err != nil {
		switch err.Type {
		case services.ErrNotFound:
			util{}.notFound(w, enc, fmt.Sprintf("the tag %s does not exist", tag))
			return
		default:
			panic(err)
		}
	}
	util{}.writeResponse(w, http.StatusNoContent, "")
}
