package services

import (
	"errors"
	"fmt"
	"testing"

	. "github.com/davelaursen/tranquil"
)

// ----------------------------------------------
// ErrorType TESTS
// ----------------------------------------------

func Test_ErrorType(t *testing.T) {
	Describe("ErrorType.String()", t, func(s *Setup, it It) {
		it("should return the correct string value for a defined ErrorType", func(expect Expect) {
			expect(ErrConflict.String()).ToEqual("ErrConflict")
			expect(ErrNotFound.String()).ToEqual("ErrNotFound")
			expect(ErrBadData.String()).ToEqual("ErrBadData")
			expect(ErrDB.String()).ToEqual("ErrDB")
			expect(ErrUnknown.String()).ToEqual("ErrUnknown")
		})

		it("should return an empty string for an undefined ErrorType", func(expect Expect) {
			var ErrTest ErrorType = 99
			expect(ErrTest.String()).ToBeEmpty()
		})
	})
}

// ----------------------------------------------
// Error TESTS
// ----------------------------------------------

func Test_Error(t *testing.T) {
	Describe("NewError()", t, func(s *Setup, it It) {
		it("should create and return a new Error instance", func(expect Expect) {
			err := errors.New("test error")
			derr := NewError(ErrUnknown, err)

			expect(derr.Type).ToEqual(ErrUnknown)
			expect(derr.error).ToEqual(err)
		})
	})

	Describe("NewErrorf()", t, func(s *Setup, it It) {
		it("should create and return a new Error instance passing in a string value", func(expect Expect) {
			err := errors.New("test error")
			derr := NewErrorf(ErrUnknown, "test error")

			expect(derr.Type).ToEqual(ErrUnknown)
			expect(derr.error).ToEqual(err)
		})

		it("should create an return a new Error instance using a string pattern", func(expect Expect) {
			pat := "test error: %s"
			s := "test"
			err := fmt.Errorf(pat, s)
			derr := NewErrorf(ErrUnknown, pat, s)

			expect(derr.Type).ToEqual(ErrUnknown)
			expect(derr.error).ToEqual(err)
		})
	})
}

// ----------------------------------------------
// ErrorResponse TESTS
// ----------------------------------------------

func Test_ErrorResponse(t *testing.T) {
	Describe("NewErrorResponse()", t, func(s *Setup, it It) {
		it("should create and return a new ErrorResponse instance", func(expect Expect) {
			c := 500
			m := "an error occurred"
			expected := &ErrorResponse{Code: c, Message: m}
			actual := NewErrorResponse(c, m)

			expect(*actual).ToEqual(*expected)
		})
	})

	Describe("ErrorResponse.String()", t, func(s *Setup, it It) {
		it("should return the correct string value for an ErrorResponse", func(expect Expect) {
			c := 500
			m := "an error occurred"
			e := NewErrorResponse(c, m)
			expected := fmt.Sprintf("[%d] %s", c, m)
			actual := e.String()

			expect(actual).ToEqual(expected)
		})
	})
}
