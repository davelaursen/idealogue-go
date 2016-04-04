package main

import (
	"flag"
	"os"
	"testing"

	. "github.com/davelaursen/idealogue-go/Godeps/_workspace/src/github.com/davelaursen/tranquil"
)

func Test_Config(t *testing.T) {
	Describe("GetConfig()", t, func(s *Setup, it It) {
		var config *Config
		configFilePath := "test-fixtures/config.json"

		s.BeforeEach(func() {
			config = &Config{}
		})

		s.AfterEach(func() {
			// resets the command line arguments with a new Flag Set
			flag.CommandLine = flag.NewFlagSet(os.Args[0], flag.ContinueOnError)
			flag.Usage = nil
		})

		it("should load the default config when no override values are provided", func(expect Expect) {
			config, err := GetConfig()
			expect(err).ToBeNil()

			if err == nil {
				expect(config.Port).ToEqual("1977")
				expect(config.DBAddresses).ToEqual([]string{"localhost:28015"})
			}
		})

		it("should override the default config values when a config file is provided", func(expect Expect) {
			err := readConfigFile(configFilePath, config)
			expect(err).ToBeNil()

			if err == nil {
				expect(config.Port).ToEqual("4000")
				expect(config.DBAddresses).ToEqual([]string{"localhost:2882"})
			}
		})

		it("should override the default config values when command-line arguments are provided", func(expect Expect) {
			os.Args = []string{
				"conduit",
				"-port", "9000",
				"-dbaddr", "localhost:2882,localhost:3883",
			}

			config, err := GetConfig()
			expect(err).ToBeNil()

			if err == nil {
				expect(config.Port).ToEqual("9000")
				expect(config.DBAddresses).ToEqual([]string{"localhost:2882", "localhost:3883"})
			}
		})

		it("should override the default and file config values when command-line arguments are provided", func(expect Expect) {
			os.Args = []string{
				"conduit",
				"-port", "9000",
				// "-dbaddr", "another_string", //explicitly not specified
				"-f", "./test-fixtures/config.json",
			}

			config, err := GetConfig()
			expect(err).ToBeNil()

			if err == nil {
				expect(config.Port).ToEqual("9000")
				expect(config.DBAddresses).ToEqual([]string{"localhost:2882"})
			}
		})

		it("should return an error if the config file does not exist", func(expect Expect) {
			os.Args = []string{
				"conduit",
				"-f", "./doesNotExist.json",
			}

			_, err := GetConfig()
			expect(err).ToNotBeNil()
		})

		it("should return an error if the config data is invalid", func(expect Expect) {
			os.Args = []string{
				"conduit",
				"-port", "1234567890",
			}

			_, err := GetConfig()
			expect(err).ToNotBeNil()
		})
	})

	Describe("readConfig()", t, func(s *Setup, it It) {
		it("should properly populate a Config object with values from a config file", func(expect Expect) {
			config := &Config{}
			err := readConfigFile("./test-fixtures/config.json", config)
			expect(err).ToBeNil()
			expect(config).ToNotBeNil()
			if config != nil {
				expect(config.Port).ToEqual("4000")
				expect(config.DBAddresses).ToEqual([]string{"localhost:2882"})
			}
		})

		it("should return an error if the config file does not exist", func(expect Expect) {
			config := &Config{}
			err := readConfigFile("./doesNotExist.json", config)
			expect(err).ToNotBeNil()
		})

		it("should return an error if the config file is invalid", func(expect Expect) {
			config := &Config{}
			err := readConfigFile("./test-fixtures/invalidConfig.json", config)
			expect(err).ToNotBeNil()
		})
	})

	Describe("validateConfig()", t, func(s *Setup, it It) {
		it("should return nil if the config object is valid", func(expect Expect) {
			config := &Config{}
			err := readConfigFile("test-fixtures/config.json", config)
			expect(err).ToBeNil()

			if err == nil {
				errs := validateConfig(config)
				expect(errs).ToBeEmpty()
			}
		})

		it("should return an array of errors if the config object is invalid", func(expect Expect) {
			config := &Config{
				Port:        "",         //invalid
				DBAddresses: []string{}, //invalid
			}

			errs := validateConfig(config)
			expect(len(errs)).ToBe(2)

			config.Port = "1234567890"
			errs = validateConfig(config)
			expect(len(errs)).ToBe(2)

			config.Port = "8080"
			errs = validateConfig(config)
			expect(len(errs)).ToBe(1)
		})
	})
}
