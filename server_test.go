package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"syscall"
	"testing"
	"time"

	. "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/davelaursen/tranquil"
	"github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/gorilla/mux"
)

// Tests that the getStatus() handler behaves properly.
func Test_Server(t *testing.T) {
	Describe("NewServer()", t, func(s *Setup, it It) {
		it("should initialize and return a new Server instance", func(expect Expect) {
			d, _ := time.ParseDuration("1ms")
			signalChan := make(chan os.Signal, 1)
			server := NewServer(d, signalChan)
			expect(server).ToNotBeNil()

			_, ok := server.(*serverImpl)
			expect(ok).ToBeTrue()
		})
	})

	Describe("*serverImpl.SignalShutdown()", t, func(s *Setup, it It) {
		var server *serverImpl
		signalChan := make(chan os.Signal, 1)

		s.BeforeEach(func() {
			d, _ := time.ParseDuration("1ms")
			server = &serverImpl{
				timeout:    d,
				signalChan: signalChan,
				shutdown:   false,
				stopChan:   make(chan int, 1),
			}
		})

		it("should stop the server", func(expect Expect) {
			server.SignalShutdown()
			expect(server.shutdown).ToBeTrue()
			select {
			case <-signalChan:
			case <-time.After(time.Second * 1):
				close(signalChan)
			}
		})

		it("should send an interupt signal on the signal channel", func(expect Expect) {
			server.SignalShutdown()
			var sig os.Signal
			select {
			case sig = <-signalChan:
			case <-time.After(time.Second * 1):
				close(signalChan)
			}
			expect(sig).ToEqual(syscall.SIGINT)
		})
	})

	Describe("*serverImpl.SignalRestart()", t, func(s *Setup, it It) {
		var server *serverImpl
		signalChan := make(chan os.Signal, 1)

		s.BeforeEach(func() {
			d, _ := time.ParseDuration("1ms")
			server = &serverImpl{
				timeout:    d,
				signalChan: signalChan,
				shutdown:   false,
				stopChan:   make(chan int, 1),
			}
		})

		it("should stop the server", func(expect Expect) {
			server.SignalRestart()
			expect(server.shutdown).ToBeTrue()
			select {
			case <-signalChan:
			case <-time.After(time.Second * 1):
				close(signalChan)
			}
		})

		it("should send a hangup signal on the signal channel", func(expect Expect) {
			server.SignalRestart()
			var sig os.Signal
			select {
			case sig = <-signalChan:
			case <-time.After(time.Second * 1):
				close(signalChan)
			}
			expect(sig).ToEqual(syscall.SIGHUP)
		})
	})

	Describe("*serverImpl.Stop()", t, func(s *Setup, it It) {
		d, _ := time.ParseDuration("1ms")
		server := &serverImpl{
			timeout:  d,
			shutdown: false,
			stopChan: make(chan int, 1),
		}

		it("should stop the server", func(expect Expect) {
			server.Stop()
			expect(server.shutdown).ToBeTrue()
		})
	})

	// Describe("Server.Run()", t, func(s *Setup, it It) {
	// 	it("should start the server", func(expect Expect) {
	// 	})
	// })

	Describe("*serverImpl.initRouter()", t, func(s *Setup, it It) {
		var server *serverImpl

		s.BeforeEach(func() {
			server = &serverImpl{}
		})

		it("should initialize and return the router", func(expect Expect) {
			router := server.initRouter(&DBManagerMock{})
			expect(router).ToNotBeNil()
		})
	})

	Describe("*serverImpl.getStatus()", t, func(s *Setup, it It) {
		server := &serverImpl{}

		it("should return a 200 OK status code", func(expect Expect) {
			rw := httptest.NewRecorder()
			server.getStatus(rw)
			expect(rw.Code).ToEqual(http.StatusOK)
		})

		it("should return a JSON object representing the status", func(expect Expect) {
			rw := httptest.NewRecorder()
			server.getStatus(rw)
			expect(rw.Body.String()).ToEqual(`{"status":"ok"}`)
		})
	})

	Describe("*serverImpl.initNegroni()", t, func(s *Setup, it It) {
		server := &serverImpl{}
		r := mux.NewRouter()

		it("should initialize and return a Negroni instance", func(expect Expect) {
			neg := server.initNegroni(r)
			expect(neg).ToNotBeNil()
		})

		// NOTE: there is no way implement this test
		// it("should wrap the router", func(expect Expect) {
		// })

		it("should register expected middleware", func(expect Expect) {
			neg := server.initNegroni(r)
			expect(len(neg.Handlers())).ToBe(4)
		})
	})

	Describe("*serverImpl.contentTypeMiddleware()", t, func(s *Setup, it It) {
		server := &serverImpl{}

		it("should return a Negroni handler function", func(expect Expect) {
			handler := server.contentTypeMiddleware()
			expect(handler).ToNotBeNil()
		})
	})
}
