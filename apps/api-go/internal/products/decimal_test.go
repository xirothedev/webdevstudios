package products

import "testing"

func TestDecimalScan(t *testing.T) {
	cases := []struct {
		name string
		src  any
		want float64
		err  bool
	}{
		{"usd money", "$130,000.00", 130000, false},
		{"plain numeric string", "299000.00", 299000, false},
		{"vnd symbol", "₫250,000", 250000, false},
		{"float64 driver", float64(4.5), 4.5, false},
		{"int64 driver", int64(42), 42, false},
		{"nil", nil, 0, false},
		{"garbage", []byte("abc"), 0, true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var d Decimal
			err := d.Scan(tc.src)
			if tc.err {
				if err == nil {
					t.Fatalf("want error, got %v", d)
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}
			if float64(d) != tc.want {
				t.Fatalf("got %v want %v", d, tc.want)
			}
		})
	}
}

func TestStatusOf(t *testing.T) {
	cases := map[int]string{0: "out_of_stock", 4: "low_stock", 5: "in_stock", 100: "in_stock"}
	for stock, want := range cases {
		if got := statusOf(stock); got != want {
			t.Errorf("statusOf(%d) = %q want %q", stock, got, want)
		}
	}
}
