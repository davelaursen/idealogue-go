package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/davelaursen/idealogue-go/services"
)

const (
	defaultTimeout = "3s"

	helpText = `
Idealogue

Idealogue is a an application for sharing ideas.

Usage: %s [options]

Options:
   -help                     show this help page
   -port=1977                port the server will listen on
   -dbaddr=localhost:28015   the RethinkDB addresses
   -f=config.json            path to a config file, overwrites CLI flags

`
)

func main() {
	// create channel for handling application reload and exit
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGHUP)

	for {
		if exit, code := start(signalChan); exit {
			os.Exit(code)
		}
		// resets the command line arguments with a new Flag Set
		flag.CommandLine = flag.NewFlagSet(os.Args[0], flag.ContinueOnError)
		flag.Usage = nil
	}
}

// starts the application
func start(signalChan chan os.Signal) (bool, int) {
	logger := Logger{}

	// show help text if -help flag is specified
	if len(os.Args) == 2 && os.Args[1] == "-help" {
		fmt.Printf(helpText, os.Args[0])
		os.Exit(0)
	}

	// load config
	config, errs := GetConfig()
	if errs != nil {
		msg := "error loading config data:\n"
		for _, e := range errs {
			msg += fmt.Sprintf("  %v\n", e)
		}
		logger.Error(msg)
		return true, 1
	}

	// initialize DB connection
	dbManager := services.NewDBManager()
	logger.Info("Connecting to database...")
	err := dbManager.Connect(config.DBAddresses, config.AuthKey)
	if err != nil {
		logger.Errorf("error connecting to database: %s", err.Error())
		return true, 1
	}
	err = dbManager.EnsureDatabaseStructure()
	if err != nil {
		logger.Errorf("error creating database structure: %s", err.Error())
		return true, 1
	}
	logger.Info("Connected!")

	// start the web server in a new goroutine
	d, _ := time.ParseDuration(defaultTimeout)
	server := NewServer(d, signalChan)
	go server.Run(config, dbManager, logger)

	// listen for a signal to restart or stop the web server
	exit, code := waitForSignal(signalChan, server, logger)

	// if stopping/restarting, disconnect from database
	logger.Info("Closing database connection...")
	err = dbManager.Disconnect()
	if err != nil {
		logger.Errorf("error closing database connection: %s", err.Error())
		return true, 1
	}
	logger.Info("Connection closed!")

	return exit, code
}

// waits for a signal to reload config or shutdown the web server
func waitForSignal(signalChan chan os.Signal, server Server, logger Logger) (bool, int) {
	select {
	case sig := <-signalChan:
		switch sig {
		case syscall.SIGHUP:
			logger.Infof("Received %v signal - reloading configuration", sig)
			server.Stop()
			return false, 0
		default:
			logger.Warnf("Received %v signal - shutting down", sig)
			server.Stop()
			return true, 0
		}
	}
}
