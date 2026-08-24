package orders

import "errors"

func asErr(err error, target **HTTPError) bool {
	for err != nil {
		if e, ok := err.(*HTTPError); ok {
			*target = e
			return true
		}
		err = errors.Unwrap(err)
	}
	return false
}
