check:
	cargo fmt
	cargo clippy --all-targets --all-features -- -D warnings
	