package blog

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/web"
	"gorm.io/gorm"

	"strings"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/cart"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/storage"
)

// Post mirrors Prisma BlogPost. The markdown body itself lives in R2
// (contentUrl); the DB row is metadata only.
type Post struct {
	ID              string     `gorm:"column:id"`
	Slug            string     `gorm:"column:slug"`
	Title           string     `gorm:"column:title"`
	ContentKey      string     `gorm:"column:contentKey"`
	ContentSize     *int       `gorm:"column:contentSize"`
	Excerpt         *string    `gorm:"column:excerpt"`
	CoverImage      *string    `gorm:"column:coverImage"`
	AuthorID        string     `gorm:"column:authorId"`
	IsPublished     bool       `gorm:"column:isPublished"`
	PublishedAt     *time.Time `gorm:"column:publishedAt"`
	ViewCount       int        `gorm:"column:viewCount"`
	MetaTitle       *string    `gorm:"column:metaTitle"`
	MetaDescription *string    `gorm:"column:metaDescription"`
	CreatedAt       time.Time  `gorm:"column:createdAt"`
	UpdatedAt       time.Time  `gorm:"column:updatedAt"`

	Author Author `gorm:"foreignKey:AuthorID;references:ID"`
}

func (Post) TableName() string { return "blog_posts" }

type Author struct {
	ID       string  `gorm:"column:id"`
	FullName *string `gorm:"column:fullName"`
	Avatar   *string `gorm:"column:avatar"`
}

func (Author) TableName() string { return "users" }

type PostDTO struct {
	ID              string     `json:"id"`
	Slug            string     `json:"slug"`
	Title           string     `json:"title"`
	ContentKey      string     `json:"contentKey"`
	Content         string     `json:"content,omitempty"`
	ContentSize     *int       `json:"contentSize"`
	Excerpt         *string    `json:"excerpt"`
	CoverImage      *string    `json:"coverImage"`
	Author          AuthorDTO  `json:"author"`
	IsPublished     bool       `json:"isPublished"`
	PublishedAt     *time.Time `json:"publishedAt"`
	ViewCount       int        `json:"viewCount"`
	MetaTitle       *string    `json:"metaTitle"`
	MetaDescription *string    `json:"metaDescription"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type AuthorDTO struct {
	ID       string  `json:"id"`
	FullName *string `json:"fullName"`
	Avatar   *string `json:"avatar"`
}

type ListDTO struct {
	Posts []PostDTO `json:"posts"`
	Total int64     `json:"total"`
}

func toDTO(p Post) PostDTO {
	return PostDTO{
		ID: p.ID, Slug: p.Slug, Title: p.Title,
		ContentKey: p.ContentKey, ContentSize: p.ContentSize,
		Excerpt: p.Excerpt, CoverImage: p.CoverImage,
		Author:      AuthorDTO{ID: p.Author.ID, FullName: p.Author.FullName, Avatar: p.Author.Avatar},
		IsPublished: p.IsPublished, PublishedAt: p.PublishedAt, ViewCount: p.ViewCount,
		MetaTitle: p.MetaTitle, MetaDescription: p.MetaDescription,
		CreatedAt: p.CreatedAt, UpdatedAt: p.UpdatedAt,
	}
}

type Handler struct {
	db    *gorm.DB
	store *storage.Service
}

func Register(v1 *gin.RouterGroup, db *gorm.DB, authRequired, adminRequired gin.HandlerFunc, store *storage.Service) {
	h := &Handler{db, store}
	g := v1.Group("/blog/posts")
	g.GET("", h.list)          // published only
	g.GET("/search", h.search) // published only
	g.GET("/admin/all", authRequired, adminRequired, h.listAll)
	g.POST("", authRequired, adminRequired, h.create)
	g.PATCH("/:id", authRequired, adminRequired, h.update)
	g.DELETE("/:id", authRequired, adminRequired, h.remove)
	g.GET("/:slug", h.getBySlug)
}

func (h *Handler) list(c *gin.Context) {
	page, size := paging(c)
	where := map[string]any{"isPublished": true}
	var total int64
	if err := h.db.Model(&Post{}).Where(where).Count(&total).Error; err != nil {
		fail(c, err)
		return
	}
	var rows []Post
	if err := h.db.Preload("Author").Where(where).
		Order(`"publishedAt" DESC`).Offset((page - 1) * size).Limit(size).Find(&rows).Error; err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, toList(rows, total))
}

func (h *Handler) listAll(c *gin.Context) {
	page, size := paging(c)
	var total int64
	if err := h.db.Model(&Post{}).Count(&total).Error; err != nil {
		fail(c, err)
		return
	}
	var rows []Post
	if err := h.db.Preload("Author").
		Order(`"publishedAt" DESC`).Offset((page - 1) * size).Limit(size).Find(&rows).Error; err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, toList(rows, total))
}

func (h *Handler) search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		nest(c, http.StatusBadRequest, "q is required")
		return
	}
	page, size := paging(c)
	pattern := "%" + q + "%"
	base := h.db.Model(&Post{}).Where(map[string]any{"isPublished": true}).
		Where(`title ILIKE ? OR excerpt ILIKE ?`, pattern, pattern)
	var total int64
	if err := base.Count(&total).Error; err != nil {
		fail(c, err)
		return
	}
	var rows []Post
	if err := h.db.Preload("Author").Where(map[string]any{"isPublished": true}).
		Where(`title ILIKE ? OR excerpt ILIKE ?`, pattern, pattern).
		Order(`"publishedAt" DESC`).Offset((page - 1) * size).Limit(size).Find(&rows).Error; err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, toList(rows, total))
}

func (h *Handler) getBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var p Post
	if err := h.db.Preload("Author").First(&p, map[string]any{"slug": slug}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			nest(c, http.StatusNotFound, fmt.Sprintf("Blog post with slug %q not found", slug))
			return
		}
		fail(c, err)
		return
	}
	if c.Query("includeContent") == "true" {
		body, err := h.store.GetObject(p.ContentKey)
		if err != nil {
			if errors.Is(err, storage.ErrUnavailable) {
				nest(c, http.StatusNotImplemented, "includeContent requires R2_* env vars")
				return
			}
			nest(c, http.StatusInternalServerError, err.Error())
			return
		}
		dto := toDTO(p)
		dto.Content = string(body)
		c.JSON(http.StatusOK, dto)
		return
	}
	includeContent := false
	if includeContent {
		// Content bytes live in R2; fetching lands with the storage phase.
		nest(c, http.StatusNotImplemented, "includeContent requires storage integration (Phase 7)")
		return
	}
	if p.IsPublished {
		h.db.Model(&Post{}).Where(map[string]any{"id": p.ID}).
			UpdateColumn("viewCount", gorm.Expr(`"viewCount" + ?`, 1))
	}
	c.JSON(http.StatusOK, toDTO(p))
}

func toList(rows []Post, total int64) ListDTO {
	out := ListDTO{Posts: make([]PostDTO, 0, len(rows)), Total: total}
	for _, r := range rows {
		out.Posts = append(out.Posts, toDTO(r))
	}
	return out
}

func paging(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 10
	}
	return page, size
}

func fail(c *gin.Context, err error) {
	var he *cart.HTTPError
	if errors.As(err, &he) {
		nest(c, he.Code, he.Msg)
		return
	}
	nest(c, http.StatusInternalServerError, err.Error())
}

func nest(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"statusCode": code, "message": msg, "error": http.StatusText(code)})
}

func (h *Handler) create(c *gin.Context) {
	var in struct {
		Slug            string  `json:"slug" binding:"required"`
		Title           string  `json:"title" binding:"required,max=255"`
		Content         string  `json:"content" binding:"required"`
		Excerpt         *string `json:"excerpt"`
		CoverImage      *string `json:"coverImage"`
		IsPublished     *bool   `json:"isPublished"`
		MetaTitle       *string `json:"metaTitle"`
		MetaDescription *string `json:"metaDescription"`
	}
	if !web.Bind(c, &in) {
		return
	}
	var count int64
	h.db.Model(&Post{}).Where(map[string]any{"slug": in.Slug}).Count(&count)
	if count > 0 {
		nest(c, http.StatusConflict, fmt.Sprintf("Blog post with slug %q already exists", in.Slug))
		return
	}
	excerpt := autoExcerpt(in.Content)
	if in.Excerpt != nil {
		excerpt = *in.Excerpt
	}
	published := false
	if in.IsPublished != nil {
		published = *in.IsPublished
	}
	size := len(in.Content)
	p := Post{
		ID: newID(), Slug: in.Slug, Title: in.Title, ContentKey: "",
		ContentSize: &size, Excerpt: &excerpt, CoverImage: in.CoverImage,
		AuthorID: c.GetString("userId"), IsPublished: published,
		MetaTitle: in.MetaTitle, MetaDescription: in.MetaDescription,
	}
	if published {
		now := time.Now()
		p.PublishedAt = &now
	}
	if err := h.db.Create(&p).Error; err != nil {
		fail(c, err)
		return
	}
	key := "blog/posts/" + p.ID + "/content.md"
	if err := h.store.PutObject(key, []byte(in.Content), "text/markdown"); err != nil {
		h.db.Delete(&Post{}, map[string]any{"id": p.ID}) // mirror Nest rollback
		status := http.StatusInternalServerError
		if errors.Is(err, storage.ErrUnavailable) {
			status = http.StatusNotImplemented
		}
		nest(c, status, err.Error())
		return
	}
	h.db.Model(&Post{}).Where(map[string]any{"id": p.ID}).Update("contentKey", key)
	p.ContentKey = key
	h.db.Preload("Author").First(&p, map[string]any{"id": p.ID})
	c.JSON(http.StatusCreated, toDTO(p))
}

func (h *Handler) update(c *gin.Context) {
	id := c.Param("id")
	var p Post
	if err := h.db.Preload("Author").First(&p, map[string]any{"id": id}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			nest(c, http.StatusNotFound, "Blog post not found")
			return
		}
		fail(c, err)
		return
	}
	var in struct {
		Title           *string `json:"title"`
		Content         *string `json:"content"`
		Excerpt         *string `json:"excerpt"`
		CoverImage      *string `json:"coverImage"`
		IsPublished     *bool   `json:"isPublished"`
		MetaTitle       *string `json:"metaTitle"`
		MetaDescription *string `json:"metaDescription"`
	}
	if !web.Bind(c, &in) {
		return
	}
	updates := map[string]any{}
	if in.Title != nil {
		updates["title"] = *in.Title
	}
	if in.Excerpt != nil {
		updates["excerpt"] = *in.Excerpt
	}
	if in.CoverImage != nil {
		updates["coverImage"] = *in.CoverImage
	}
	if in.MetaTitle != nil {
		updates["metaTitle"] = *in.MetaTitle
	}
	if in.MetaDescription != nil {
		updates["metaDescription"] = *in.MetaDescription
	}
	if in.IsPublished != nil && *in.IsPublished && p.PublishedAt == nil {
		updates["publishedAt"] = time.Now()
	}
	if in.IsPublished != nil {
		updates["isPublished"] = *in.IsPublished
	}
	if len(updates) > 0 {
		if err := h.db.Model(&Post{}).Where(map[string]any{"id": id}).Updates(updates).Error; err != nil {
			fail(c, err)
			return
		}
	}
	if in.Content != nil {
		if err := h.store.PutObject(p.ContentKey, []byte(*in.Content), "text/markdown"); err != nil {
			status := http.StatusInternalServerError
			if errors.Is(err, storage.ErrUnavailable) {
				status = http.StatusNotImplemented
			}
			nest(c, status, err.Error())
			return
		}
		size := len(*in.Content)
		h.db.Model(&Post{}).Where(map[string]any{"id": id}).Update("contentSize", size)
	}
	h.db.Preload("Author").First(&p, map[string]any{"id": id})
	c.JSON(http.StatusOK, toDTO(p))
}

func (h *Handler) remove(c *gin.Context) {
	id := c.Param("id")
	var p Post
	if err := h.db.First(&p, map[string]any{"id": id}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			nest(c, http.StatusNotFound, "Blog post not found")
			return
		}
		fail(c, err)
		return
	}
	if err := h.db.Delete(&Post{}, map[string]any{"id": id}).Error; err != nil {
		fail(c, err)
		return
	}
	_ = h.store.DeleteObject(p.ContentKey) // object errors never fail the delete
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// autoExcerpt mirrors extractExcerpt loosely: first ~200 chars, markdown stripped.
func autoExcerpt(content string) string {
	s := strings.NewReplacer("#", "", "*", "", "`", "", "\n", " ").Replace(content)
	for len(s) > 3 && s[0] == ' ' {
		s = s[1:]
	}
	if len(s) > 200 {
		s = s[:200]
	}
	return s
}

func newID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
