package routes

import (
	"fmt"
	"testing"

	. "github.com/davelaursen/tranquil"
)

// ----------------------------------------------
// JSONEncoder TESTS
// ----------------------------------------------

func Test_JSONEncoder(t *testing.T) {
	enc := JSONEncoder{}

	type encTestObj struct {
		Name  string `json:"name"`
		Value int    `json:"value"`
	}

	Describe("JSONEncoder.Encode()", t, func(s *Setup, it It) {
		it("should correctly encode an object to a JSON string", func(expect Expect) {
			o := encTestObj{Name: "my name", Value: 50}
			expected := fmt.Sprintf(`{"name":"%s","value":%d}`, o.Name, o.Value)
			actual := enc.Encode(o)

			expect(actual).ToEqual(expected)
		})
	})

	Describe("JSONEncoder.EncodeMulti()", t, func(s *Setup, it It) {
		it("should correctly encode an array of objects to a JSON array string", func(expect Expect) {
			o1 := encTestObj{Name: "my name", Value: 50}
			o2 := encTestObj{Name: "your name", Value: 25}
			col := []interface{}{o1, o2}

			str1 := fmt.Sprintf(`{"name":"%s","value":%d}`, o1.Name, o1.Value)
			str2 := fmt.Sprintf(`{"name":"%s","value":%d}`, o2.Name, o2.Value)
			expected := fmt.Sprintf("[%s,%s]", str1, str2)
			actual := enc.EncodeMulti(col...)

			expect(actual).ToEqual(expected)
		})

		it("should correctly encode an empty array to an empty JSON array string", func(expect Expect) {
			col := []interface{}{}
			actual := enc.EncodeMulti(col...)
			expected := "[]"

			expect(actual).ToEqual(expected)
		})

		it("should correctly encode a nil value to an empty JSON array string", func(expect Expect) {
			enc := JSONEncoder{}
			actual := enc.EncodeMulti(nil)
			expected := "[]"

			expect(actual).ToEqual(expected)
		})

		it("should correctly encode no value to an empty JSON array string", func(expect Expect) {
			enc := JSONEncoder{}
			actual := enc.EncodeMulti()
			expected := "[]"

			expect(actual).ToEqual(expected)
		})
	})

	Describe("JSONEncoder.Decode()", t, func(s *Setup, it It) {
		it("should correctly decode a JSON string to an object", func(expect Expect) {
			expected := encTestObj{Name: "my name", Value: 50}
			str := fmt.Sprintf(`{"name":"%s","value":%d}`, expected.Name, expected.Value)
			actual := encTestObj{}
			_ = enc.Decode([]byte(str), &actual)

			expect(actual).ToEqual(expected)
		})
	})
}
