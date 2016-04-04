package routes

import (
	"fmt"
	"net/http"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/davelaursen/idealogue-go/services"
)

// RegisterTechRoutes registers the /techs endpoints with the router.
func RegisterTechRoutes(r *mux.Router, enc Encoder, techSvc services.TechSvc) {
	u := util{}

	r.HandleFunc("/api/technologies", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			GetTechs(w, r, enc, techSvc)
		}
	}).Methods("GET")

	r.HandleFunc("/api/technologies/{tech}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			PutTech(w, r, enc, techSvc, mux.Vars(r))
		}
	}).Methods("PUT")

	r.HandleFunc("/api/technologies/{tech}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			DeleteTech(w, enc, techSvc, mux.Vars(r))
		}
	}).Methods("DELETE")
}

// GetTechs returns a list of techs.
func GetTechs(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.TechSvc) {
	techs, err := svc.GetAll()
	if err != nil {
		panic(err)
	}
	util{}.writeResponse(w, http.StatusOK, enc.EncodeMultiString(techs...))
}

// PutTech updates a tech.
func PutTech(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.TechSvc, params Params) {
	tech := params["tech"]
	err := svc.Save(tech)
	if err != nil {
		switch err.Type {
		case services.ErrBadData:
			util{}.badRequest(w, enc, err.Error())
			return
		default:
			panic(err)
		}
	}

	util{}.writeResponse(w, http.StatusOK, enc.Encode(tech))
}

// DeleteTech removes a tech.
func DeleteTech(w http.ResponseWriter, enc Encoder, svc services.TechSvc, params Params) {
	tech := params["tech"]
	err := svc.Delete(tech)
	if err != nil {
		switch err.Type {
		case services.ErrNotFound:
			util{}.notFound(w, enc, fmt.Sprintf("the tech %s does not exist", tech))
			return
		default:
			panic(err)
		}
	}
	util{}.writeResponse(w, http.StatusNoContent, "")
}
