package web

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

type testInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"omitempty,oneof=CUSTOMER ADMIN"`
	Unknown  string `json:"-"`
}

func TestBindRejectsUnknownFields(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("POST", "/", strings.NewReader(`{"email":"x@y.z","password":"longenough1","hacker":"yes"}`))
	var in testInput
	if Bind(c, &in) {
		t.Fatal("unknown field accepted")
	}
	body := w.Body.String()
	want := `"message":["property hacker should not exist"]`
	if !strings.Contains(body, want) {
		t.Fatalf("got %s want containing %s", body, want)
	}
}

func TestBindClassValidatorPhrasing(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("POST", "/", strings.NewReader(`{"email":"nope","password":"short"}`))
	var in testInput
	if Bind(c, &in) {
		t.Fatal("invalid payload accepted")
	}
	body := w.Body.String()
	for _, want := range []string{`"email must be an email"`, `"password must be longer than or equal to 8 characters"`} {
		if !strings.Contains(body, want) {
			t.Fatalf("got %s want containing %s", body, want)
		}
	}
}
