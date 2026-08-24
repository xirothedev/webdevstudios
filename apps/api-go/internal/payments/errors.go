package payments

import "errors"

func errorsAs(err error, target **HTTPError) bool {
	for err != nil {
		if e, ok := err.(*HTTPError); ok {
			*target = e
			return true
		}
		err = errors.Unwrap(err)
	}
	return false
}
