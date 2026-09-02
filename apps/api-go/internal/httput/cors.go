package httput

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSPolicy mirrors apps/api/src/main.ts enableCors: single origin, credentials,
// the same methods/headers, preflight answered with 204.
func CORSPolicy(origin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if reqOrigin := c.GetHeader("Origin"); reqOrigin != "" {
			if reqOrigin == origin {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Credentials", "true")
				c.Header("Access-Control-Expose-Headers", "Content-Type, Authorization")
			}
			if c.Request.Method == http.MethodOptions {
				c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With, X-CSRF-Token")
				c.AbortWithStatus(http.StatusNoContent)
				return
			}
		}
		c.Next()
	}
}
