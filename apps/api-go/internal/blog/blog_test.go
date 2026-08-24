package blog

import (
	"strings"
	"testing"
)

func TestAutoExcerpt(t *testing.T) {
	got := autoExcerpt("# Hello\n\nWorld **bold**")
	if strings.Contains(got, "#") || strings.Contains(got, "*") {
		t.Fatalf("markdown not stripped: %q", got)
	}
	long := strings.Repeat("x", 500)
	if len(autoExcerpt(long)) != 200 {
		t.Fatal("excerpt not truncated to 200")
	}
}
