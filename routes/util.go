package routes

import (
	"net/http"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/context"
	"github.com/davelaursen/idealogue-go/services"
)

type util struct{}

func (u util) badRequest(w http.ResponseWriter, enc Encoder, err string) {
	u.writeResponse(w, http.StatusBadRequest, enc.Encode(services.NewErrorResponse(http.StatusBadRequest, err)))
}

func (u util) notFound(w http.ResponseWriter, enc Encoder, err string) {
	u.writeResponse(w, http.StatusNotFound, enc.Encode(services.NewErrorResponse(http.StatusNotFound, err)))
}

func (u util) conflict(w http.ResponseWriter, enc Encoder, err string) {
	u.writeResponse(w, http.StatusConflict, enc.Encode(services.NewErrorResponse(http.StatusConflict, err)))
}

func (u util) forbidden(w http.ResponseWriter) {
	u.writeResponse(w, http.StatusForbidden, "Forbidden")
}

func (u util) unauthorized(w http.ResponseWriter) {
	u.writeResponse(w, http.StatusUnauthorized, "Not Authorized")
}

func (util) writeResponse(w http.ResponseWriter, code int, body string) {
	w.WriteHeader(code)
	w.Write([]byte(body))
}

func (u util) checkAccess(w http.ResponseWriter, r *http.Request) bool {
	user := context.Get(r, "user").(*services.User)
	if user == nil {
		u.forbidden(w)
		return false
	}
	return true
}
