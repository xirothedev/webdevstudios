package products

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	svc *Service
}

func Register(v1 *gin.RouterGroup, db *gorm.DB) {
	h := &Handler{svc: NewService(db)}
	g := v1.Group("/products")
	g.GET("", h.list)
	g.GET("/:slug", h.bySlug)
	g.GET("/:slug/stock", h.stock)
}

func (h *Handler) list(c *gin.Context) {
	rows, err := h.svc.List()
	if err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	dtos := make([]ProductDTO, 0, len(rows))
	for _, r := range rows {
		dtos = append(dtos, toDTO(r))
	}
	c.JSON(http.StatusOK, ProductListDTO{Products: dtos, Total: len(dtos)})
}

func (h *Handler) bySlug(c *gin.Context) {
	slug := c.Param("slug")
	p, err := h.svc.BySlug(slug)
	if errors.Is(err, ErrNotFound) {
		nestError(c, http.StatusNotFound, "Product with slug "+slug+" not found")
		return
	}
	if err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, toDTO(*p))
}

func (h *Handler) stock(c *gin.Context) {
	slug := c.Param("slug")
	info, err := h.svc.Stock(slug, c.Query("size"))
	if errors.Is(err, ErrNotFound) {
		nestError(c, http.StatusNotFound, "Product with slug "+slug+" not found")
		return
	}
	if errors.Is(err, ErrSizeNotFound) {
		nestError(c, http.StatusNotFound, "Size "+c.Query("size")+" not found for product "+slug)
		return
	}
	if err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, info)
}

func nestError(c *gin.Context, code int, message string) {
	status := http.StatusText(code)
	c.JSON(code, gin.H{"statusCode": code, "message": message, "error": status})
}
