package routes

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/context"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/sessions"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/markbates/goth/gothic"
	"github.com/davelaursen/idealogue-go/services"
)

// RegisterAuthRoutes registers the /roles endpoints with the router.
func RegisterAuthRoutes(r *mux.Router, enc Encoder, store sessions.Store, userSvc services.UserSvc) {
	r.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		Login(w, r)
	}).Methods("GET")

	r.HandleFunc("/gplus/callback", func(w http.ResponseWriter, r *http.Request) {
		LoginCallback(w, r, store, userSvc)
	}).Methods("GET")

	r.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		Logout(w, r, store)
	}).Methods("GET")

	r.HandleFunc("/currentuser", func(w http.ResponseWriter, r *http.Request) {
		GetCurrentUser(w, r, enc, store, userSvc)
	}).Methods("GET")
}

// Login redirects to Google for authentication.
func Login(w http.ResponseWriter, r *http.Request) {
	url, err := gothic.GetAuthURL(w, r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintln(w, err)
		fmt.Println(err)
		return
	}

	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// LoginCallback is the callback route for Google to call once the user logs in.
func LoginCallback(w http.ResponseWriter, r *http.Request, store sessions.Store, userSvc services.UserSvc) {
	// fmt.Println("State: ", gothic.GetState(r))

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	// if !strings.HasSuffix(user.Email, "@mycompany.com") {
	// 	w.WriteHeader(http.StatusUnauthorized)
	// 	w.Write([]byte("only mycompany.com accounts allowed"))
	// 	return
	// }

	// fmt.Printf("%#v\n", user)
	session, err := store.Get(r, "idealogue")
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	session.Values["userEmail"] = user.Email
	session.Save(r, w)

	u, err := userSvc.GetByEmail(user.Email)
	if err != nil {
		fmt.Println("ERROR: ", err)
		// panic(err)
	}
	if u == nil {
		fmt.Println("User Found Found")
		index := strings.Index(user.Name, " ")
		t := time.Now()
		date := t.UTC().Format("2006-01-02T15:04:05.000Z")
		u = &services.User{
			FirstName:   user.Name[0:index],
			LastName:    user.Name[index+1:],
			Email:       user.Email,
			CreatedDate: date,
			UpdatedDate: date,
		}
		userSvc.Insert(u)
	}
	context.Set(r, "user", u)

	http.Redirect(w, r, "/ideas", http.StatusTemporaryRedirect)
}

// Logout logs the user out of the system.
func Logout(w http.ResponseWriter, r *http.Request, store sessions.Store) {
	session, err := store.Get(r, "idealogue")
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
	delete(session.Values, "userEmail")
	session.Save(r, w)
	util{}.writeResponse(w, http.StatusNoContent, "")
}

// GetCurrentUser returns the currently logged in user.
func GetCurrentUser(w http.ResponseWriter, r *http.Request, enc Encoder, store sessions.Store, userSvc services.UserSvc) {
	session, err := store.Get(r, "idealogue")
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
	if val, ok := session.Values["userEmail"]; ok {
		u, err := userSvc.GetByEmail(val.(string))
		if err != nil {
			panic(err)
		}
		if u != nil {
			util{}.writeResponse(w, http.StatusOK, enc.Encode(*u))
			return
		}
	}
	util{}.writeResponse(w, http.StatusOK, "")
}
