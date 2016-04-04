package routes

import (
	"fmt"
	"net/http"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/davelaursen/idealogue-go/services"
)

// RegisterSkillRoutes registers the /skills endpoints with the router.
func RegisterSkillRoutes(r *mux.Router, enc Encoder, skillSvc services.SkillSvc) {
	u := util{}

	r.HandleFunc("/api/skills", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			GetSkills(w, r, enc, skillSvc)
		}
	}).Methods("GET")

	r.HandleFunc("/api/skills/{skill}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			PutSkill(w, r, enc, skillSvc, mux.Vars(r))
		}
	}).Methods("PUT")

	r.HandleFunc("/api/skills/{skill}", func(w http.ResponseWriter, r *http.Request) {
		if u.checkAccess(w, r) {
			DeleteSkill(w, enc, skillSvc, mux.Vars(r))
		}
	}).Methods("DELETE")
}

// GetSkills returns a list of skills.
func GetSkills(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.SkillSvc) {
	skills, err := svc.GetAll()
	if err != nil {
		panic(err)
	}
	util{}.writeResponse(w, http.StatusOK, enc.EncodeMultiString(skills...))
}

// PutSkill updates a skill.
func PutSkill(w http.ResponseWriter, r *http.Request, enc Encoder, svc services.SkillSvc, params Params) {
	skill := params["skill"]
	err := svc.Save(skill)
	if err != nil {
		switch err.Type {
		case services.ErrBadData:
			util{}.badRequest(w, enc, err.Error())
			return
		default:
			panic(err)
		}
	}

	util{}.writeResponse(w, http.StatusOK, enc.Encode(skill))
}

// DeleteSkill removes a skill.
func DeleteSkill(w http.ResponseWriter, enc Encoder, svc services.SkillSvc, params Params) {
	skill := params["skill"]
	err := svc.Delete(skill)
	if err != nil {
		switch err.Type {
		case services.ErrNotFound:
			util{}.notFound(w, enc, fmt.Sprintf("the skill %s does not exist", skill))
			return
		default:
			panic(err)
		}
	}
	util{}.writeResponse(w, http.StatusNoContent, "")
}
