package payments

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"os"
)

func cryptoRead(b []byte) (int, error) { return rand.Read(b) }
func hexEncode(b []byte) string        { return hex.EncodeToString(b) }
func osGetenv(k string) string         { return os.Getenv(k) }

const httpStatusNotImplemented = http.StatusNotImplemented

func logPrintln(args ...any) { log.Println(args...) }
