package cart

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/web"
	"gorm.io/gorm"
)

type Handler struct {
	svc *Service
}

func Register(v1 *gin.RouterGroup, db *gorm.DB, authRequired gin.HandlerFunc) {
	h := &Handler{svc: NewService(db)}
	g := v1.Group("/cart", authRequired)
	g.GET("", h.get)
	g.POST("/items", h.add)
	g.PATCH("/items/:id", h.update)
	g.DELETE("/items/:id", h.remove)
	g.DELETE("", h.clear)
}

func (h *Handler) get(c *gin.Context) {
	dto, err := h.svc.GetCart(c.GetString("userId"))
	reply(c, dto, err)
}

func (h *Handler) add(c *gin.Context) {
	var in struct {
		ProductID string  `json:"productId" binding:"required"`
		Size      *string `json:"size"`
		Quantity  int     `json:"quantity"`
	}
	if !web.Bind(c, &in) {
		return
	}
	dto, err := h.svc.AddToCart(c.GetString("userId"), in.ProductID, in.Size, in.Quantity)
	if err != nil {
		reply(c, dto, err)
		return
	}
	c.JSON(http.StatusCreated, dto) // NestJS @Post default is 201
}

func (h *Handler) update(c *gin.Context) {
	var in struct {
		Quantity int `json:"quantity"`
	}
	if !web.Bind(c, &in) {
		return
	}
	dto, err := h.svc.UpdateCartItem(c.GetString("userId"), c.Param("id"), in.Quantity)
	reply(c, dto, err)
}

func (h *Handler) remove(c *gin.Context) {
	dto, err := h.svc.RemoveFromCart(c.GetString("userId"), c.Param("id"))
	reply(c, dto, err)
}

func (h *Handler) clear(c *gin.Context) {
	dto, err := h.svc.ClearCart(c.GetString("userId"))
	reply(c, dto, err)
}

func reply(c *gin.Context, dto any, err error) {
	if err == nil {
		c.JSON(http.StatusOK, dto)
		return
	}
	var he *HTTPError
	if errors.As(err, &he) {
		status := http.StatusText(he.Code)
		c.JSON(he.Code, gin.H{"statusCode": he.Code, "message": he.Msg, "error": status})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"statusCode": 500, "message": err.Error(), "error": "Internal Server Error"})
}

func nestError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{"statusCode": code, "message": message, "error": http.StatusText(code)})
}
