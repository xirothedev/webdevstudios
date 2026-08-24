package cart

import "gorm.io/gorm"

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

type Service struct {
	db *gorm.DB
}
