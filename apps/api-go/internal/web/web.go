package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Bind mirrors NestJS's global ValidationPipe
// ({ whitelist, transform, forbidNonWhitelisted }): unknown properties are
// rejected, and failures return {"message": [ ...class-validator phrasing... ]}.
func Bind(c *gin.Context, in any) bool {
	dec := json.NewDecoder(c.Request.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(in); err != nil {
		msg := "Internal Server Error"
		var ute *json.UnmarshalTypeError
		var se *json.SyntaxError
		switch {
		case errors.As(err, &ute):
			msg = fmt.Sprintf("property %s must be a %s", jsonFieldName(in, ute.Field), kindWord(ute.Value))
		case strings.Contains(err.Error(), "unknown field"):
			f := extractUnknownField(err.Error())
			msg = fmt.Sprintf("property %s should not exist", f)
		case errors.As(err, &se):
			msg = "Malformed JSON body"
		default:
			msg = err.Error()
		}
		NestError(c, http.StatusBadRequest, []string{msg})
		return false
	}
	if err := validateStruct(in); err != nil {
		NestError(c, http.StatusBadRequest, err)
		return false
	}
	return true
}

func validateStruct(in any) []string {
	v, ok := in.(interface{ Validate() []string })
	if ok {
		return v.Validate()
	}
	err := GinValidate(in)
	if err == nil {
		return nil
	}
	var ves validator.ValidationErrors
	if errors.As(err, &ves) {
		out := make([]string, 0, len(ves))
		for _, fe := range ves {
			out = append(out, classValidatorMessage(fe))
		}
		return out
	}
	return []string{err.Error()}
}

// classValidatorMessage reproduces @nestjs/class-validator default phrasing.
func classValidatorMessage(fe validator.FieldError) string {
	f := fe.Field()
	lower := strings.ToLower(f[:1]) + f[1:]
	switch fe.Tag() {
	case "required":
		return lower + " should not be empty"
	case "email":
		return lower + " must be an email"
	case "min":
		if fe.Param() != "" && isStringKind(fe) {
			return fmt.Sprintf("%s must be longer than or equal to %s characters", lower, fe.Param())
		}
		return fmt.Sprintf("%s must not be less than %s", lower, fe.Param())
	case "max":
		if isStringKind(fe) {
			return fmt.Sprintf("%s must be shorter than or equal to %s characters", lower, fe.Param())
		}
		return fmt.Sprintf("%s must not be greater than %s", lower, fe.Param())
	case "oneof":
		return fmt.Sprintf("%s must be one of the following values: %s", lower, fe.Param())
	case "omitempty":
		return ""
	default:
		return fmt.Sprintf("%s failed the %s validation", lower, fe.Tag())
	}
}

func isStringKind(fe validator.FieldError) bool {
	return fe.Kind().String() == "string" && !strings.HasPrefix(fe.Tag(), "min") || fe.Tag() == "max" && fe.Kind().String() == "string" || strings.Contains(fe.Type().String(), "string")
}

func kindWord(v string) string {
	switch v {
	case "string":
		return "string"
	case "number":
		return "number"
	case "bool":
		return "boolean"
	default:
		return v
	}
}

func extractUnknownField(msg string) string {
	i := strings.Index(msg, "field \"")
	if i < 0 {
		return msg
	}
	rest := msg[i+7:]
	j := strings.Index(rest, "\"")
	if j < 0 {
		return rest
	}
	return rest[:j]
}

// jsonFieldName maps a struct path like `.RegisterInput.Email` back to the
// camelCase json tag the client sent.
func jsonFieldName(in any, path string) string {
	parts := strings.Split(strings.Trim(path, "."), ".")
	last := parts[len(parts)-1]
	t := strings.ToLower(last[:1]) + last[1:]
	return t
}

// NestError writes the exact envelope Nest's exception filter produces.
func NestError(c *gin.Context, code int, messages []string) {
	c.JSON(code, gin.H{"statusCode": code, "message": messages, "error": http.StatusText(code)})
}

// GinValidate exposes the validator engine without importing it everywhere.
var GinValidate = defaultValidate.Struct

// gin reads `binding:` tags, so the engine must be told to do the same.
var defaultValidate = newDefaultValidator()

func newDefaultValidator() *validator.Validate {
	v := validator.New(validator.WithRequiredStructEnabled())
	v.SetTagName("binding") // same tag gin's own binder enforces
	return v
}
