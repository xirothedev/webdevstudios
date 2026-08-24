package payments

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/web"
	"gorm.io/gorm"
)

type Handler struct {
	svc *Service
	db  *gorm.DB
}

// Register mirrors PaymentsController. create-link + transactions are authed;
// webhook stays public (PayOS calls it); verify echoes like Nest's stub.
func Register(v1 *gin.RouterGroup, db *gorm.DB, client *Client, authRequired gin.HandlerFunc, strict gin.HandlerFunc) {
	h := &Handler{svc: NewService(db, client), db: db}
	g := v1.Group("/payments")
	g.POST("/create-link", strict, authRequired, h.createLink)
	g.POST("/webhook", h.webhook)
	g.GET("/verify/:transactionCode", strict, h.verify)
	g.GET("/transactions", authRequired, h.transactions)
}

func (h *Handler) createLink(c *gin.Context) {
	var in struct {
		OrderID string `json:"orderId" binding:"required"`
	}
	if !web.Bind(c, &in) {
		return
	}
	res, err := h.svc.CreateLink(in.OrderID)
	if err != nil {
		reply(c, res, err)
		return
	}
	c.JSON(http.StatusCreated, res)
}

func (h *Handler) webhook(c *gin.Context) {
	var body map[string]any
	if !web.Bind(c, &body) {
		return
	}
	settled, err := h.svc.ProcessWebhook(body)
	if err != nil {
		reply(c, nil, err)
		return
	}
	logPrintln("webhook processed, settled:", settled)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) verify(c *gin.Context) {
	code := c.Param("transactionCode")
	c.JSON(http.StatusOK, gin.H{"transactionCode": code, "message": "Use order endpoint to check status"})
}

func (h *Handler) transactions(c *gin.Context) {
	var rows []Transaction
	if err := h.db.Order(`"createdAt" DESC`).Limit(100).Find(&rows).Error; err != nil {
		nest(c, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]gin.H, 0, len(rows))
	for _, t := range rows {
		out = append(out, gin.H{
			"id": t.ID, "orderId": t.OrderID, "transactionCode": t.TransactionCode,
			"amount": t.Amount, "status": t.Status, "paymentUrl": t.PaymentURL,
			"createdAt": t.CreatedAt, "updatedAt": t.UpdatedAt,
		})
	}
	c.JSON(http.StatusOK, out)
}

func reply(c *gin.Context, dto any, err error) {
	if err == nil {
		c.JSON(http.StatusOK, dto)
		return
	}
	var he *HTTPError
	if errorsAs(err, &he) {
		nest(c, he.Code, he.Msg)
		return
	}
	nest(c, http.StatusInternalServerError, err.Error())
}

func nest(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"statusCode": code, "message": msg, "error": http.StatusText(code)})
}
