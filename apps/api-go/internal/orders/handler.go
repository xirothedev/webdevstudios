package orders

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/web"
	"gorm.io/gorm"
)

type Handler struct {
	svc      *Service
	markPaid func(orderID string) error
}

func Register(v1 *gin.RouterGroup, db *gorm.DB, authRequired, adminRequired gin.HandlerFunc, markPaid func(orderID string) error) {
	h := &Handler{svc: NewService(db), markPaid: markPaid}
	g := v1.Group("/orders", authRequired)
	g.POST("", h.create)
	g.GET("", h.list)
	g.GET("/:id", h.get)
	g.PATCH("/:id/cancel", h.cancel)
	a := v1.Group("/admin/orders", authRequired, adminRequired)
	a.GET("/all", h.adminList)
	a.GET("/:id", h.adminGet)
	a.PATCH("/:id/status", h.adminStatus)
	a.POST("/:id/mark-paid", func(c *gin.Context) {
		if err := h.markPaid(c.Param("id")); err != nil {
			var he *HTTPError
			if errors.As(err, &he) {
				nestError(c, he.Code, he.Msg)
				return
			}
			nestError(c, http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true})
	})
}

func (h *Handler) create(c *gin.Context) {
	var in CreateOrderInput
	if !web.Bind(c, &in) {
		return
	}
	dto, err := h.svc.Create(c.GetString("userId"), in)
	if err != nil {
		reply(c, dto, err)
		return
	}
	c.JSON(http.StatusCreated, dto)
}

func (h *Handler) list(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	dto, err := h.svc.List(c.GetString("userId"), page, limit, c.Query("status"))
	reply(c, dto, err)
}

func (h *Handler) get(c *gin.Context) {
	dto, err := h.svc.Get(c.Param("id"), c.GetString("userId"), c.GetString("role"))
	reply(c, dto, err)
}

func (h *Handler) adminList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	dto, err := h.svc.ListAll(page, limit, c.Query("status"))
	reply(c, dto, err)
}

func (h *Handler) adminGet(c *gin.Context) {
	dto, err := h.svc.Get(c.Param("id"), "", "ADMIN")
	reply(c, dto, err)
}

func (h *Handler) adminStatus(c *gin.Context) {
	var in struct {
		Status string `json:"status" binding:"required"`
	}
	if !web.Bind(c, &in) {
		return
	}
	dto, err := h.svc.UpdateStatus(c.Param("id"), in.Status)
	reply(c, dto, err)
}

func (h *Handler) cancel(c *gin.Context) {
	dto, err := h.svc.Cancel(c.Param("id"), c.GetString("userId"))
	reply(c, dto, err)
}

func reply(c *gin.Context, dto any, err error) {
	if err == nil {
		c.JSON(http.StatusOK, dto)
		return
	}
	var he *HTTPError
	if asErr(err, &he) {
		c.JSON(he.Code, gin.H{"statusCode": he.Code, "message": he.Msg, "error": http.StatusText(he.Code)})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"statusCode": 500, "message": err.Error(), "error": "Internal Server Error"})
}

func nestError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{"statusCode": code, "message": message, "error": http.StatusText(code)})
}
