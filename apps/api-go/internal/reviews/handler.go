package reviews

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/web"
	"gorm.io/gorm"
)

type Handler struct {
	svc *Service
}

func Register(v1 *gin.RouterGroup, db *gorm.DB, authRequired gin.HandlerFunc) {
	h := &Handler{svc: NewService(db)}
	v1.POST("/products/:slug/reviews", authRequired, h.create)
	v1.GET("/products/:slug/reviews", h.list) // public
	r := v1.Group("/reviews", authRequired)
	r.PATCH("/:id", h.update)
	r.DELETE("/:id", h.delete)
}

func (h *Handler) create(c *gin.Context) {
	var in struct {
		Rating  int     `json:"rating"`
		Comment *string `json:"comment"`
	}
	if !web.Bind(c, &in) {
		return
	}
	dto, err := h.svc.Create(c.GetString("userId"), c.Param("slug"), in.Rating, in.Comment)
	if err != nil {
		reply(c, dto, err)
		return
	}
	c.JSON(http.StatusCreated, dto)
}

func (h *Handler) list(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	dto, err := h.svc.List(c.Param("slug"), page, limit)
	reply(c, dto, err)
}

func (h *Handler) update(c *gin.Context) {
	var in struct {
		Rating  *int    `json:"rating"`
		Comment *string `json:"comment"`
	}
	if !web.Bind(c, &in) {
		return
	}
	dto, err := h.svc.Update(c.Param("id"), c.GetString("userId"),
		deref(in.Rating), in.Rating != nil, in.Comment, in.Comment != nil)
	reply(c, dto, err)
}

func (h *Handler) delete(c *gin.Context) {
	err := h.svc.Delete(c.Param("id"), c.GetString("userId"))
	reply(c, gin.H{"success": true}, err)
}

func reply(c *gin.Context, dto any, err error) {
	if err == nil {
		c.JSON(http.StatusOK, dto)
		return
	}
	var he *HTTPError
	if errors.As(err, &he) {
		c.JSON(he.Code, gin.H{"statusCode": he.Code, "message": he.Msg, "error": http.StatusText(he.Code)})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"statusCode": 500, "message": err.Error(), "error": "Internal Server Error"})
}

func nestError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{"statusCode": code, "message": message, "error": http.StatusText(code)})
}

func deref(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}
