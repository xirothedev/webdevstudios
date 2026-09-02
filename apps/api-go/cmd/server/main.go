package main

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/mailer"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/storage"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/throttle"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/auth"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/blog"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/cart"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/events"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/httput"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/orders"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/payments"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/reviews"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/users"
)

func main() {
	_ = godotenv.Load(".env", "../.env", "../../apps/api-go/.env") // optional local overrides
	port := os.Getenv("PORT")
	if port == "" {
		port = "4001" // ponytail: 4000 belongs to the NestJS twin while both run
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("set DATABASE_URL, e.g. postgresql://user:pass@localhost:5432/webdevstudios")
	}
	if u, err := url.Parse(dsn); err == nil && u.Scheme != "" {
		q := u.Query()
		q.Del("schema")          // Prisma-only param, pgx rejects it
		q.Del("channel_binding") // libpq-only param, pgx rejects it
		if q.Get("sslmode") == "" {
			q.Set("sslmode", "require")
		}
		// ponytail: simple protocol because Neon's PgBouncer pooler breaks prepared statements; drop when moving to direct connections
		if q.Get("default_query_exec_mode") == "" {
			q.Set("default_query_exec_mode", "simple_protocol")
		}
		u.RawQuery = q.Encode()
		dsn = u.String()
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("postgres connect failed: %v", err)
	}

	rdb := redis.NewClient(&redis.Options{Addr: os.Getenv("REDIS_HOST") + ":" + envOr("REDIS_PORT", "6379")})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Printf("redis unavailable (%v) — verification tokens disabled", err)
		rdb = nil
	}
	mail := mailer.New()
	store := storage.New()
	_, defaultThrottle, strictThrottle := throttle.New()

	secret := os.Getenv("JWT_SECRET_KEY") // same secret as apps/api: tokens must verify in both
	if secret == "" {
		log.Fatal("set JWT_SECRET_KEY (must match the NestJS app)")
	}

	r := gin.Default()
	r.SetTrustedProxies(nil)

	csrfGuard := auth.NewCSRF(envOr("CSRF_SECRET", "derived-"+secret))      // ponytail: derive from JWT secret when CSRF_SECRET unset
	r.Use(httput.CORSPolicy(envOr("CORS_ORIGIN", "http://localhost:3000"))) // must precede all handlers, mirrors Nest main.ts
	r.Use(csrfGuard.Middleware())
	r.Use(httput.Envelope())

	v1 := r.Group("/v1", defaultThrottle)
	v1.GET("/csrf-token", func(c *gin.Context) {
		token, err := csrfGuard.Token()
		if err != nil {
			c.JSON(500, gin.H{"statusCode": 500})
			return
		}
		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("_csrf", token, 3600, "/", "", gin.Mode() == gin.ReleaseMode, true)
		c.JSON(http.StatusOK, gin.H{"csrfToken": token})
	})
	v1.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong from Go"})
	})
	authRequired := auth.AuthRequired(db, secret)
	auth.Register(v1, db, secret, rdb, mail, strictThrottle)
	users.Register(v1, db, secret, authRequired, store)
	cart.Register(v1, db, authRequired, secret)
	adminOnly := auth.RequireRole("ADMIN")
	payClient := payments.NewClient()
	markPaid := payments.NewService(db, payClient).MarkPaid
	orders.Register(v1, db, authRequired, adminOnly, markPaid)
	payments.Register(v1, db, payClient, authRequired, strictThrottle)
	reviews.Register(v1, db, authRequired)
	blog.Register(v1, db, authRequired, adminOnly, store)
	events.Register(v1, db, authRequired, adminOnly)
	products.Register(v1, db)

	orderSvc := orders.NewService(db)
	go func() { // NestJS OrderExpirationScheduler: sweep at boot, then every 5 min
		if n := orderSvc.SweepExpired(); n > 0 {
			log.Printf("startup sweep expired %d order(s)", n)
		}
		for range time.Tick(5 * time.Minute) {
			orderSvc.SweepExpired()
		}
	}()

	log.Println("api-go listening on http://localhost:" + port + "/v1")
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
