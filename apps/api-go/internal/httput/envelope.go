// Package httput wraps successful responses in the NestJS TransformInterceptor
// envelope ({success,data,timestamp,path}) so the frontend's `data.data` unwrap
// works against the Go twin exactly as against the NestJS app.
package httput

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type envelopeWriter struct {
	gin.ResponseWriter
	buf *bytes.Buffer
}

func (w *envelopeWriter) Write(b []byte) (int, error)       { return w.buf.Write(b) }
func (w *envelopeWriter) WriteString(s string) (int, error) { return w.buf.WriteString(s) }

func Envelope() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/v1/csrf-token" { // frontend reads this raw
			c.Next()
			return
		}
		orig := c.Writer
		ew := &envelopeWriter{ResponseWriter: orig, buf: &bytes.Buffer{}}
		c.Writer = ew
		c.Next()
		c.Writer = ew.ResponseWriter

		body := ew.buf.Bytes()
		status := orig.Status()
		if status < http.StatusOK || status >= 300 || len(body) == 0 || !json.Valid(body) {
			orig.Write(body)
			return
		}
		if m := (map[string]any{}); json.Unmarshal(body, &m) == nil {
			if _, done := m["success"]; done { // already an envelope — don't double-wrap
				orig.Write(body)
				return
			}
		}
		c.Writer = orig
		c.JSON(status, gin.H{
			"success":   true,
			"data":      json.RawMessage(body),
			"timestamp": time.Now().UTC().Format(time.RFC3339Nano),
			"path":      c.Request.URL.Path,
		})
	}
}
