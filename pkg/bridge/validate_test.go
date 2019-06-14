package bridge

import (
	"testing"
)

func TestTHING(t *testing.T) {
	tests := []struct{
		name string
		input string
		output string
	} {
		{
			name: "THING should do the right thing",
			input: "foo",
			output: "bar",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			if diff := deep.Equal(tt.input(), tt.output); diff != nil {
				t.Error(diff)
			}
		})
	}
}

func TestValidateFlagNotEmpty(t *testing.T) {

}
func TestValidateFlagIsURL(t *testing.T) {

}
func TestTestValidateFlagIs(t *testing.T) {

}


