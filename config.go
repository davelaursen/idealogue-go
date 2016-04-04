package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config stores configuration information.
type Config struct {
	Port        string   `json:"port"`
	DBAddresses []string `json:"db_addresses"`
	AuthKey     string   `json:"auth_key"`
}

// GetConfig retrieves configuration information for the application.
func GetConfig() (*Config, []error) {
	config := &Config{
		Port:        "1977",
		DBAddresses: []string{"localhost:28015"},
		AuthKey:     "",
	}

	port := flag.String("port", "", "port the rest server will listen on")
	dbAddresses := flag.String("dbaddr", "", "the RethinkDB addresses (i.e. 'localhost:28015')")
	authKey := flag.String("dbauth", "", "the RethinkDB auth key")
	file := flag.String("f", "", "config file")
	flag.Parse()

	// if a config file was specified, load config from it
	if *file != "" {
		if err := readConfigFile(*file, config); err != nil {
			return nil, []error{err}
		}
	}

	// if flags are specified, overwrite any config file values with them
	if *port != "" {
		config.Port = *port
	}
	if *dbAddresses != "" {
		config.DBAddresses = strings.Split(*dbAddresses, ",")
	}
	if *authKey != "" {
		config.AuthKey = *authKey
	}

	// validate the loaded config values
	if errs := validateConfig(config); errs != nil {
		return nil, errs
	}

	return config, nil
}

// readConfigFile reads config information into the given config instance from the specified configuration file.
func readConfigFile(path string, config *Config) error {
	file, err := os.Open(path)
	defer file.Close()
	if os.IsNotExist(err) {
		return fmt.Errorf("Config file '%s' does not exist", path)
	}

	if err == nil {
		decoder := json.NewDecoder(file)
		err = decoder.Decode(config)
		if err == nil {
			return nil
		}
	}
	return fmt.Errorf("Unable to load config file '%s': %v", path, err)
}

// validateConfig determines if the given Config instance contains valid values.
func validateConfig(config *Config) []error {
	// validate port
	errs := []error{}
	if config.Port == "" {
		errs = append(errs, fmt.Errorf("a port value is required"))
	} else {
		i, err := strconv.Atoi(config.Port)
		if err != nil || i < 1 || i > 65535 {
			errs = append(errs, fmt.Errorf("port value '%s' is invalid - must be an integer from 1-65535", config.Port))
		}
	}

	// validate db-path
	if len(config.DBAddresses) == 0 || config.DBAddresses[0] == "" {
		errs = append(errs, fmt.Errorf("a RethinkDB address is required"))
	}

	if len(errs) > 0 {
		return errs
	}
	return nil
}
