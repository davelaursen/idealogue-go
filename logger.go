package main

import (
	"fmt"
	"os"
)

const (
	reset = "\033[0m"
	// white  = "\033[37m\033[1m"
	grey   = "\x1B[90m"
	yellow = "\033[33m"
	red    = "\033[31m"
)

// Logger provides the ability to write messages to the console.
type Logger struct{}

// Write writes a plain text message to stdout.
func (Logger) Write(msg string) {
	os.Stdout.WriteString(fmt.Sprintf("%s\n", msg))
}

// Writef writes a plain text message to stdout according to a format specifier.
func (l Logger) Writef(format string, a ...interface{}) {
	l.Write(fmt.Sprintf(format, a...))
}

// Info writes an info message to stdout.
func (Logger) Info(msg string) {
	os.Stdout.WriteString(fmt.Sprintf("%s[INFO]%s %s\n", grey, reset, msg))
}

// Infof writes an info message to stdout according to a format specifier.
func (l Logger) Infof(format string, a ...interface{}) {
	l.Info(fmt.Sprintf(format, a...))
}

// Warn writes a warning message to stdout.
func (Logger) Warn(msg string) {
	os.Stdout.WriteString(fmt.Sprintf("%s[WARN]%s %s\n", yellow, reset, msg))
}

// Warnf writes a warning message to stdout according to a format specifier.
func (l Logger) Warnf(format string, a ...interface{}) {
	l.Warn(fmt.Sprintf(format, a...))
}

// Error writes an error message to stderr.
func (Logger) Error(msg string) {
	os.Stderr.WriteString(fmt.Sprintf("%s[ERROR]%s %s\n", red, reset, msg))
}

// Errorf writes an error message to stderr according to a format specifier.
func (l Logger) Errorf(format string, a ...interface{}) {
	l.Error(fmt.Sprintf(format, a...))
}
