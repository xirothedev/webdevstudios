use std::collections::BTreeMap;

pub fn parse_cookies(header: Option<&str>) -> BTreeMap<String, String> {
    let mut out = BTreeMap::new();
    if let Some(v) = header {
        for part in v.split(';') {
            if let Some((k, val)) = part.trim().split_once('=') {
                out.insert(k.trim().to_string(), val.trim().to_string());
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_single_cookie() {
        let m = parse_cookies(Some("a=1"));
        assert_eq!(m.get("a").map(|s| s.as_str()), Some("1"));
    }

    #[test]
    fn parses_multiple_cookies_and_trims() {
        let m = parse_cookies(Some("a=1; b=2 ; _csrf=tok123 ; c= hello "));
        assert_eq!(m.get("a").map(|s| s.as_str()), Some("1"));
        assert_eq!(m.get("b").map(|s| s.as_str()), Some("2"));
        assert_eq!(m.get("_csrf").map(|s| s.as_str()), Some("tok123"));
        assert_eq!(m.get("c").map(|s| s.as_str()), Some("hello"));
    }

    #[test]
    fn returns_empty_on_none_or_empty() {
        assert!(parse_cookies(None).is_empty());
        assert!(parse_cookies(Some("")).is_empty());
        assert!(parse_cookies(Some("   ")).is_empty());
    }

    #[test]
    fn ignores_malformed_parts() {
        let m = parse_cookies(Some("a=1; badpart ; b=2"));
        assert_eq!(m.len(), 2);
        assert!(m.contains_key("a"));
        assert!(m.contains_key("b"));
    }
}
