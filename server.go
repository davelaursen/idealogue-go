package main

import (
	"net"
	"net/http"
	"os"
	"strings"
	"syscall"
	"time"

	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/codegangsta/negroni"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/context"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/sessions"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/markbates/goth"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/markbates/goth/gothic"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/markbates/goth/providers/gplus"
	"github.com/davelaursen/idealogue-go/routes"
	"github.com/davelaursen/idealogue-go/services"
)

// Server represents an http server.
type Server interface {
	Run(config *Config, dbManager services.DBManager, logger Logger)
	Stop()
	SignalShutdown()
	SignalRestart()
}

type serverImpl struct {
	stopChan   chan int
	signalChan chan os.Signal
	shutdown   bool
	timeout    time.Duration
}

// NewServer returns a new Server instance.
func NewServer(timeout time.Duration, signalChan chan os.Signal) Server {
	return &serverImpl{
		stopChan:   make(chan int, 1),
		signalChan: signalChan,
		shutdown:   false,
		timeout:    timeout,
	}
}

// SignalShutdown will stop the server and send a shutdown signal (SIGINT) on the signal channel.
func (s *serverImpl) SignalShutdown() {
	s.Stop()
	s.signalChan <- syscall.SIGINT
}

// SignalShutdown will stop the server and send a restart signal (SIGHUP) on the signal channel.
func (s *serverImpl) SignalRestart() {
	s.Stop()
	s.signalChan <- syscall.SIGHUP
}

// Stop will stop the server.
func (s *serverImpl) Stop() {
	if !s.shutdown {
		s.shutdown = true
		s.stopChan <- 1
		<-time.After(s.timeout)
		close(s.stopChan)
	}
}

// Run configures and starts the HTTP server.
func (s *serverImpl) Run(config *Config, dbManager services.DBManager, logger Logger) {
	router := s.initRouter(dbManager)
	neg := s.initNegroni(router)

	server := &http.Server{Addr: ":" + config.Port, Handler: neg}

	// grab the listener so that we have control over it - allows us to manually close the
	// listener when we're ready to shut down the http server
	listener, err := net.Listen("tcp", server.Addr)
	if err != nil {
		logger.Warnf("%v", err)
		s.signalChan <- syscall.SIGINT
		return
	}

	// a goroutine that will listen for a signal to stop the server
	go func() {
		<-s.stopChan
		server.SetKeepAlivesEnabled(false)
		listener.Close()
	}()

	logger.Info("Running on port " + config.Port)
	if err = server.Serve(listener); err != nil {
		if !s.shutdown {
			logger.Warnf("%v", err)
			s.signalChan <- syscall.SIGINT
		}
	}
}

// initializes and returns the router and registers the API routes.
func (s *serverImpl) initRouter(dbManager services.DBManager) *mux.Router {
	r := mux.NewRouter()

	enc := routes.JSONEncoder{}
	userSvc := dbManager.NewUserSvc()
	ideaSvc := dbManager.NewIdeaSvc()
	skillSvc := dbManager.NewSkillSvc()
	tagSvc := dbManager.NewTagSvc()
	techSvc := dbManager.NewTechSvc()

	store := sessions.NewCookieStore([]byte("testing"))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   60 * 15, //15 minutes
		HttpOnly: true,
	}

	goth.UseProviders(gplus.New(
		os.Getenv("GOOGLE_IDEALOGUE_KEY"),
		os.Getenv("GOOGLE_IDEALOGUE_SECRET"),
		"http://localhost:1977/auth/gplus/callback",
	))

	gothic.Store = store
	gothic.GetProviderName = func(r *http.Request) (string, error) {
		return "gplus", nil
	}

	r.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		s.getStatus(w)
	}).Methods("GET")

	authRouter := r.PathPrefix("/auth").Subrouter()
	routes.RegisterAuthRoutes(authRouter, enc, store, userSvc)

	apiRouter := mux.NewRouter()
	routes.RegisterUserRoutes(apiRouter, enc, userSvc)
	routes.RegisterIdeaRoutes(apiRouter, enc, ideaSvc)
	routes.RegisterSkillRoutes(apiRouter, enc, skillSvc)
	routes.RegisterTagRoutes(apiRouter, enc, tagSvc)
	routes.RegisterTechRoutes(apiRouter, enc, techSvc)

	loginRequiredMiddleware := func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		session, err := store.Get(r, "idealogue")
		if err != nil {
			http.Error(w, err.Error(), 500)
		}

		if _, ok := session.Values["userEmail"]; !ok {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"message": "Not Authorized"}`))
			return
		}

		session.Save(r, w)
		next(w, r)
	}

	userMiddleware := func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
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
				context.Set(r, "user", u)
			}
		}
		next(w, r)
	}

	r.PathPrefix("/api").Handler(negroni.New(
		negroni.HandlerFunc(loginRequiredMiddleware),
		negroni.HandlerFunc(userMiddleware),
		negroni.Wrap(apiRouter),
	))

	// add support for static files
	r.PathPrefix("/bower_components/").Handler(http.StripPrefix("/bower_components/", http.FileServer(http.Dir("./client/bower_components"))))
	r.PathPrefix("/node_modules/").Handler(http.StripPrefix("/node_modules/", http.FileServer(http.Dir("./client/node_modules"))))
	r.PathPrefix("/lib/").Handler(http.StripPrefix("/lib/", http.FileServer(http.Dir("./client/lib"))))
	r.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir("./client/src/assets"))))
	r.PathPrefix("/app/").Handler(http.StripPrefix("/app/", http.FileServer(http.Dir("./client/src/app"))))
	r.Handle("/", http.FileServer(http.Dir("./client/src")))
	r.PathPrefix("/").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.String(), ".") {
			http.ServeFile(w, r, "./client/src"+r.URL.String())
		} else {
			http.ServeFile(w, r, "./client/src/index.html")
		}
	}))

	return r
}

// getStatus is a REST handler that will return the application status.
func (*serverImpl) getStatus(w http.ResponseWriter) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

// initializes Negroni, which wraps the router and runs middleware.
func (s *serverImpl) initNegroni(handler http.Handler) *negroni.Negroni {
	n := negroni.New()
	// n.Use(negroni.NewStatic(http.Dir("./client")))
	n.Use(negroni.NewRecovery())
	n.Use(negroni.NewLogger())
	n.Use(s.contentTypeMiddleware())
	n.UseHandler(handler)
	return n
}

// contentTypeMiddleware gets Negroni middleware that sets the Content-Type header for all responses.
func (*serverImpl) contentTypeMiddleware() negroni.HandlerFunc {
	return negroni.HandlerFunc(func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			w.Header().Set("Content-Type", "application/json")
		}
		next(w, r)
	})
}
