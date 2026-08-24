package throttle

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// Fixed-window counter per key. Mirrors @nestjs/throttler's Redis storage
// well enough for a dev twin; swap to sliding window if 429 bursts annoy anyone.
//
// ponytail: global fixed window per IP+bucket, not per-route config tree.

func New() (*Throttler, gin.HandlerFunc, gin.HandlerFunc) {
	addr := os.Getenv("REDIS_HOST")
	if addr == "" {
		addr = "localhost"
	}
	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}
	rdb := redis.NewClient(&redis.Options{Addr: addr + ":" + port})
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		// No Redis: run unthrottled rather than dead — matches Nest losing its storage driver.
		return nil, func(c *gin.Context) { c.Next() }, func(c *gin.Context) { c.Next() }
	}
	t := &Throttler{rdb: rdb}
	return t, t.middleware(100, time.Minute), t.middleware(10, time.Minute)
}

type Throttler struct {
	rdb *redis.Client
}

// Default is the general limiter; Strict guards auth endpoints (@ThrottleAPI).
func (t *Throttler) middleware(limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), time.Second)
		defer cancel()
		key := fmt.Sprintf("throttle:%s:%s:%d", c.FullPath(), c.ClientIP(), time.Now().Unix()/int64(window.Seconds()))
		n, err := t.rdb.Incr(ctx, key).Result()
		if err == nil && n == 1 {
			t.rdb.Expire(ctx, key, window)
		}
		if err == nil && n > int64(limit) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"statusCode": http.StatusTooManyRequests,
				"message":    "ThrottlerException: Too Many Requests",
				"error":      "Too Many Requests",
			})
			return
		}
		c.Next()
	}
}

var _ = strconv.Itoa // silence unused import churn during refactors
