package storage

import (
	"bytes"
	"context"
	"errors"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// Service is an S3-compatible client for Cloudflare R2. nil Service = not
// configured; every method then reports ErrUnavailable and callers degrade.
type Service struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

var ErrUnavailable = errors.New("storage: R2_* env vars not configured")

func New() *Service {
	key := os.Getenv("R2_ACCESS_KEY_ID")
	if key == "" {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion("auto"),
		awsconfig.WithCredentialsProvider(aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
			return aws.Credentials{
				AccessKeyID:     key,
				SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
			}, nil
		})),
	)
	if err != nil {
		log.Printf("storage: config load failed: %v", err)
		return nil
	}
	endpoint := os.Getenv("R2_ENDPOINT")
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = &endpoint
		o.UsePathStyle = false
	})
	return &Service{client: client, bucket: os.Getenv("R2_BUCKET_NAME"), publicURL: strings.TrimSuffix(os.Getenv("R2_PUBLIC_URL"), "/")}
}

func (s *Service) Enabled() bool { return s != nil }

// ResolveMediaURL mirrors Nest's StorageService.resolveMediaUrl:
// absolute URLs pass through; bare R2 keys get the public base prepended.
func (s *Service) ResolveMediaURL(ref string) string {
	if ref == "" {
		return ""
	}
	if strings.Contains(ref, "://") || s == nil || s.publicURL == "" {
		return ref
	}
	return s.publicURL + "/" + ref
}

func (s *Service) GetObject(key string) ([]byte, error) {
	if s == nil {
		return nil, ErrUnavailable
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket), Key: aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	defer out.Body.Close()
	return io.ReadAll(out.Body)
}

func (s *Service) PutObject(key string, body []byte, contentType string) error {
	if s == nil {
		return ErrUnavailable
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(body),
		ContentType: aws.String(contentType),
	})
	return err
}

func (s *Service) DeleteObject(key string) error {
	if s == nil {
		return ErrUnavailable
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket), Key: aws.String(key),
	})
	return err
}
