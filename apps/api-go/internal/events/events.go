package events

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/cart"
)

type Event struct {
	ID          string    `gorm:"column:id"`
	Title       string    `gorm:"column:title"`
	Description *string   `gorm:"column:description"`
	StartDate   time.Time `gorm:"column:startDate"`
	EndDate     time.Time `gorm:"column:endDate"`
	Location    *string   `gorm:"column:location"`
	Type        string    `gorm:"column:type"`
	Organizer   *string   `gorm:"column:organizer"`
	Attendees   *int      `gorm:"column:attendees"`
	SurveyLink  *string   `gorm:"column:surveyLink"`
	CreatedBy   *string   `gorm:"column:createdBy"`
	CreatedAt   time.Time `gorm:"column:createdAt"`
	UpdatedAt   time.Time `gorm:"column:updatedAt"`
}

func (Event) TableName() string { return "events" }

type EventDTO struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	Location    *string   `json:"location"`
	Type        string    `json:"type"`
	Organizer   *string   `json:"organizer"`
	Attendees   *int      `json:"attendees"`
	SurveyLink  *string   `json:"surveyLink"`
	CreatedBy   *string   `json:"createdBy,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

var validTypes = map[string]bool{"MEETING": true, "WORKSHOP": true, "SOCIAL": true, "COMPETITION": true, "SURVEY": true, "OTHER": true}

type Handler struct{ db *gorm.DB }

// Register mounts the whole module. Write routes are ADMIN-only like Nest's @Roles(ADMIN).
func Register(v1 *gin.RouterGroup, db *gorm.DB, authRequired, adminRequired gin.HandlerFunc) {
	h := &Handler{db: db}
	g := v1.Group("/events")
	g.GET("", h.list)
	g.GET("/:id", h.getByID)
	g.POST("", authRequired, adminRequired, h.create)
	g.PATCH("/:id", authRequired, adminRequired, h.update)
	g.DELETE("/:id", authRequired, adminRequired, h.delete)
}

func newID() string {
	b := make([]byte, 12)
	randRead(b)
	return hexEnc(b)
}

func (h *Handler) list(c *gin.Context) {
	q := h.db.Model(&Event{})
	if v := c.Query("startDate"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			q = q.Where("\"startDate\" >= ?", t)
		}
	}
	if v := c.Query("endDate"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			q = q.Where("\"endDate\" <= ?", t)
		}
	}
	if v := c.Query("types"); v != "" {
		types := splitCSV(v)
		q = q.Where("type IN ?", types)
	}
	var rows []Event
	if err := q.Order("\"startDate\" ASC").Find(&rows).Error; err != nil {
		fail(c, err)
		return
	}
	out := make([]EventDTO, 0, len(rows))
	for _, e := range rows {
		out = append(out, toDTO(e))
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) getByID(c *gin.Context) {
	var e Event
	err := h.db.First(&e, map[string]any{"id": c.Param("id")}).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		nest(c, 404, fmt.Sprintf("Event with ID %s not found", c.Param("id")))
		return
	}
	if err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, toDTO(e))
}

func (h *Handler) create(c *gin.Context) {
	var in struct {
		Title       string  `json:"title" binding:"required,max=255"`
		Description *string `json:"description"`
		StartDate   string  `json:"startDate" binding:"required"`
		EndDate     string  `json:"endDate" binding:"required"`
		Location    *string `json:"location"`
		Type        string  `json:"type" binding:"required"`
		Organizer   *string `json:"organizer"`
		Attendees   *int    `json:"attendees"`
		SurveyLink  *string `json:"surveyLink"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		nest(c, http.StatusBadRequest, err.Error())
		return
	}
	if !validTypes[in.Type] {
		nest(c, http.StatusBadRequest, "type must be one of MEETING, WORKSHOP, SOCIAL, COMPETITION, SURVEY, OTHER")
		return
	}
	sd, err1 := time.Parse(time.RFC3339, in.StartDate)
	ed, err2 := time.Parse(time.RFC3339, in.EndDate)
	if err1 != nil || err2 != nil {
		nest(c, http.StatusBadRequest, "startDate/endDate must be ISO date strings")
		return
	}
	e := Event{
		ID: newID(), Title: in.Title, Description: in.Description,
		StartDate: sd, EndDate: ed, Location: in.Location, Type: in.Type,
		Organizer: in.Organizer, Attendees: in.Attendees, SurveyLink: in.SurveyLink,
		CreatedBy: strPtr(c.GetString("userId")),
	}
	if err := h.db.Create(&e).Error; err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, toDTO(e))
}

func (h *Handler) update(c *gin.Context) {
	var e Event
	err := h.db.First(&e, map[string]any{"id": c.Param("id")}).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		nest(c, 404, fmt.Sprintf("Event with ID %s not found", c.Param("id")))
		return
	}
	var in map[string]any
	if err := c.ShouldBindJSON(&in); err != nil {
		nest(c, http.StatusBadRequest, err.Error())
		return
	}
	updates := map[string]any{}
	for _, k := range []string{"title", "description", "location", "organizer", "surveyLink"} {
		if v, ok := in[k]; ok {
			updates[k] = v
		}
	}
	if v, ok := in["type"]; ok {
		s, _ := v.(string)
		if !validTypes[s] {
			nest(c, http.StatusBadRequest, "invalid event type")
			return
		}
		updates["type"] = s
	}
	if v, ok := in["attendees"]; ok {
		f, _ := v.(float64)
		i := int(f)
		updates["attendees"] = i
	}
	for _, k := range []string{"startDate", "endDate"} {
		if v, ok := in[k]; ok {
			s, _ := v.(string)
			t, err := time.Parse(time.RFC3339, s)
			if err != nil {
				nest(c, http.StatusBadRequest, k+" must be an ISO date string")
				return
			}
			updates[k] = t
		}
	}
	if len(updates) > 0 {
		if err := h.db.Model(&Event{}).Where(map[string]any{"id": e.ID}).Updates(updates).Error; err != nil {
			fail(c, err)
			return
		}
	}
	h.db.First(&e, map[string]any{"id": e.ID})
	c.JSON(http.StatusOK, toDTO(e))
}

func (h *Handler) delete(c *gin.Context) {
	res := h.db.Delete(&Event{}, map[string]any{"id": c.Param("id")})
	if res.Error != nil {
		fail(c, res.Error)
		return
	}
	if res.RowsAffected == 0 {
		nest(c, 404, fmt.Sprintf("Event with ID %s not found", c.Param("id")))
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func toDTO(e Event) EventDTO {
	return EventDTO{
		ID: e.ID, Title: e.Title, Description: e.Description,
		StartDate: e.StartDate, EndDate: e.EndDate, Location: e.Location,
		Type: e.Type, Organizer: e.Organizer, Attendees: e.Attendees,
		SurveyLink: e.SurveyLink, CreatedBy: e.CreatedBy,
		CreatedAt: e.CreatedAt, UpdatedAt: e.UpdatedAt,
	}
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

func splitCSV(s string) []string {
	var out []string
	cur := ""
	for _, r := range s {
		if r == ',' {
			if cur != "" {
				out = append(out, cur)
			}
			cur = ""
			continue
		}
		cur += string(r)
	}
	if cur != "" {
		out = append(out, cur)
	}
	return out
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func randRead(b []byte) { _, _ = rand.Read(b) }

func hexEnc(b []byte) string { return hex.EncodeToString(b) }
