package reviews

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service { return &Service{db: db} }

type ReviewDTO struct {
	ID           string    `json:"id"`
	Rating       int       `json:"rating"`
	Comment      *string   `json:"comment"`
	UserID       string    `json:"userId"`
	UserFullName string    `json:"userFullName"`
	UserAvatar   *string   `json:"userAvatar"`
	ProductSlug  string    `json:"productSlug"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type ReviewListDTO struct {
	Reviews    []ReviewDTO `json:"reviews"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int64       `json:"totalPages"`
}

// Create mirrors NestJS exactly: purchase-gated, one review per user per product.
func (s *Service) Create(userID, slug string, rating int, comment *string) (*ReviewDTO, error) {
	if !validSlugs[slug] {
		return nil, bad(404, "Product with slug %s not found", slug)
	}
	if rating < 1 || rating > 5 {
		return nil, bad(400, "Rating must be between 1 and 5")
	}
	var p products.Product
	if err := s.db.First(&p, map[string]any{"slug": slug}).Error; err != nil {
		return nil, bad(404, "Product with slug %s not found", slug)
	}
	var existing int64
	s.db.Model(&Review{}).Where(map[string]any{"userId": userID, "productId": p.ID}).Count(&existing)
	if existing > 0 {
		return nil, bad(409, "User has already reviewed this product")
	}
	hasPurchased, err := s.hasPurchased(userID, slug)
	if err != nil {
		return nil, err
	}
	if !hasPurchased {
		return nil, bad(400, "You must purchase this product before reviewing")
	}
	review := Review{ID: newReviewID(), UserID: userID, ProductID: p.ID, Rating: rating, Comment: comment}
	if err := s.db.Create(&review).Error; err != nil {
		return nil, err
	}
	if err := s.db.Preload("User").First(&review, map[string]any{"id": review.ID}).Error; err != nil {
		return nil, err
	}
	review.Product = p
	if err := s.recomputeRating(p.ID); err != nil {
		return nil, err
	}
	return s.toDTO(&review), nil
}

func (s *Service) List(slug string, page, limit int) (*ReviewListDTO, error) {
	if !validSlugs[slug] {
		return nil, bad(404, "Product with slug %s not found", slug)
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	var p products.Product
	if err := s.db.First(&p, map[string]any{"slug": slug}).Error; err != nil {
		return nil, bad(404, "Product with slug %s not found", slug)
	}
	where := map[string]any{"productId": p.ID}
	var total int64
	if err := s.db.Model(&Review{}).Where(where).Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []Review
	if err := s.db.Preload("User").Where(where).Order(`"createdAt" DESC`).
		Offset((page - 1) * limit).Limit(limit).Find(&rows).Error; err != nil {
		return nil, err
	}
	dto := &ReviewListDTO{Total: total, Page: page, Limit: limit, TotalPages: (total + int64(limit) - 1) / int64(limit)}
	for i := range rows {
		dto.Reviews = append(dto.Reviews, *s.toDTO(&rows[i]))
	}
	return dto, nil
}

func (s *Service) Update(reviewID, userID string, rating int, hasRating bool, comment *string, hasComment bool) (*ReviewDTO, error) {
	review, err := s.owned(reviewID, userID)
	if err != nil {
		return nil, err
	}
	if hasRating && (rating < 1 || rating > 5) {
		return nil, bad(400, "Rating must be between 1 and 5")
	}
	updates := map[string]any{}
	if hasRating {
		updates["rating"] = rating
	}
	if hasComment {
		updates["comment"] = comment
	}
	if len(updates) > 0 {
		if err := s.db.Model(&Review{}).Where(map[string]any{"id": reviewID}).Updates(updates).Error; err != nil {
			return nil, err
		}
	}
	if err := s.recomputeRating(review.ProductID); err != nil {
		return nil, err
	}
	fresh, err := s.byID(reviewID)
	if err != nil {
		return nil, err
	}
	return s.toDTO(fresh), nil
}

func (s *Service) Delete(reviewID, userID string) error {
	review, err := s.owned(reviewID, userID)
	if err != nil {
		return err
	}
	pid := review.ProductID
	if err := s.db.Delete(&Review{}, map[string]any{"id": reviewID}).Error; err != nil {
		return err
	}
	return s.recomputeRating(pid)
}

func (s *Service) owned(reviewID, userID string) (*Review, error) {
	review, err := s.byID(reviewID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, bad(404, "Review with id %s not found", reviewID)
	}
	if err != nil {
		return nil, err
	}
	if review.UserID != userID {
		return nil, bad(403, "Review does not belong to user")
	}
	return review, nil
}

func (s *Service) byID(id string) (*Review, error) {
	var r Review
	err := s.db.Preload("User").Preload("Product").First(&r, map[string]any{"id": id}).Error
	return &r, err
}

// hasPurchased: an order containing this slug that is neither CANCELLED nor
// unpaid, scanned over the user's latest 100 orders — same window as NestJS.
func (s *Service) hasPurchased(userID, slug string) (bool, error) {
	var count int64
	err := s.db.Table("order_items").
		Joins(`JOIN orders ON orders.id = order_items."orderId"`).
		Where(`orders."userId" = ? AND orders.status <> ? AND orders."paymentStatus" = ?`, userID, "CANCELLED", "PAID").
		Where(`order_items."productSlug" = ?`, slug).
		Count(&count).Error
	return count > 0, err
}

// recomputeRating is the O(n) aggregate NestJS uses too: read all ratings, average.
func (s *Service) recomputeRating(productID string) error {
	var rows []int
	if err := s.db.Model(&Review{}).Where(map[string]any{"productId": productID}).Pluck("rating", &rows).Error; err != nil {
		return err
	}
	value, count := 0.0, len(rows)
	for _, r := range rows {
		value += float64(r)
	}
	if count > 0 {
		value /= float64(count)
	}
	return s.db.Model(&products.Product{}).Where(map[string]any{"id": productID}).
		Updates(map[string]any{"ratingValue": products.Decimal(value), "ratingCount": count}).Error
}

func (s *Service) toDTO(r *Review) *ReviewDTO {
	name := "Anonymous"
	if r.User.FullName != nil && *r.User.FullName != "" {
		name = *r.User.FullName
	}
	return &ReviewDTO{
		ID: r.ID, Rating: r.Rating, Comment: r.Comment, UserID: r.UserID,
		UserFullName: name, UserAvatar: r.User.Avatar, ProductSlug: r.Product.Slug,
		CreatedAt: r.CreatedAt, UpdatedAt: r.UpdatedAt,
	}
}
