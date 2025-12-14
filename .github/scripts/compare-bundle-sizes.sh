#!/bin/bash
#
# Compare bundle sizes between base and PR branches
# Usage: ./compare-bundle-sizes.sh <base-assets-path> <pr-assets-path> [output-file]
#
# Arguments:
#   base-assets-path  Path to base branch dist/assets directory
#   pr-assets-path    Path to PR branch dist/assets directory
#   output-file       Output report filename (default: bundle-report.md)

set -euo pipefail

BASE_PATH="${1:-base/dist/assets}"
PR_PATH="${2:-pr/dist/assets}"
OUTPUT_FILE="${3:-bundle-report.md}"

# Function to normalize filename (remove Vite hash)
# Vite format: name-HASH.ext -> name.ext (hash is 7-10 alphanumeric chars)
normalize_name() {
  echo "$1" | sed -E 's/-[A-Za-z0-9_-]{7,10}\.(js|css)$/.\1/'
}

# Function to format bytes to human readable
format_size() {
  local bytes=$1
  if [ "$bytes" -ge 1048576 ]; then
    printf "%.2f MB" "$(echo "scale=4; $bytes / 1048576" | bc)"
  elif [ "$bytes" -ge 1024 ]; then
    printf "%.2f KB" "$(echo "scale=4; $bytes / 1024" | bc)"
  else
    printf "%d B" "$bytes"
  fi
}

# Function to format diff with sign
format_diff() {
  local diff=$1
  if [ "$diff" -gt 0 ]; then
    printf "+%s" "$(format_size $diff)"
  elif [ "$diff" -lt 0 ]; then
    printf -- "-%s" "$(format_size ${diff#-})"
  else
    echo "0"
  fi
}

# Create temporary files for storing sizes
base_sizes=$(mktemp)
pr_sizes=$(mktemp)
all_files=$(mktemp)

# Cleanup on exit
trap "rm -f '$base_sizes' '$pr_sizes' '$all_files'" EXIT

# Collect base branch sizes
if [ -d "$BASE_PATH" ]; then
  for file in "$BASE_PATH"/*.js "$BASE_PATH"/*.css; do
    [ -f "$file" ] || continue
    name=$(basename "$file")
    normalized=$(normalize_name "$name")
    size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
    echo "$normalized $size" >> "$base_sizes"
    echo "$normalized" >> "$all_files"
  done
fi

# Collect PR branch sizes
for file in "$PR_PATH"/*.js "$PR_PATH"/*.css; do
  [ -f "$file" ] || continue
  name=$(basename "$file")
  normalized=$(normalize_name "$name")
  size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  echo "$normalized $size" >> "$pr_sizes"
  echo "$normalized" >> "$all_files"
done

# Get unique files and sort
sort -u "$all_files" -o "$all_files"

# Generate report
echo "## Bundle Size Comparison" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "| File | Base | PR | Diff |" >> "$OUTPUT_FILE"
echo "|:-----|-----:|---:|-----:|" >> "$OUTPUT_FILE"

total_base=0
total_pr=0
small_js_base=0
small_js_pr=0
small_js_count=0
small_css_base=0
small_css_pr=0
small_css_count=0

# Threshold for "large" files (50KB)
threshold=51200

while read -r normalized; do
  base_size=$(grep "^$normalized " "$base_sizes" | awk '{print $2}' | head -1)
  pr_size=$(grep "^$normalized " "$pr_sizes" | awk '{print $2}' | head -1)

  base_size=${base_size:-0}
  pr_size=${pr_size:-0}

  # Determine max size for threshold check
  if [ "$base_size" -gt "$pr_size" ]; then
    max_size=$base_size
  else
    max_size=$pr_size
  fi

  # Aggregate small files
  if [ "$max_size" -lt "$threshold" ]; then
    if [[ "$normalized" == *.js ]]; then
      small_js_base=$((small_js_base + base_size))
      small_js_pr=$((small_js_pr + pr_size))
      small_js_count=$((small_js_count + 1))
    else
      small_css_base=$((small_css_base + base_size))
      small_css_pr=$((small_css_pr + pr_size))
      small_css_count=$((small_css_count + 1))
    fi
    total_base=$((total_base + base_size))
    total_pr=$((total_pr + pr_size))
    continue
  fi

  # Output large files
  total_base=$((total_base + base_size))
  total_pr=$((total_pr + pr_size))
  diff=$((pr_size - base_size))

  if [ "$base_size" -eq 0 ]; then
    echo "| $normalized | - | $(format_size $pr_size) | new |" >> "$OUTPUT_FILE"
  elif [ "$pr_size" -eq 0 ]; then
    echo "| $normalized | $(format_size $base_size) | - | removed |" >> "$OUTPUT_FILE"
  else
    echo "| $normalized | $(format_size $base_size) | $(format_size $pr_size) | $(format_diff $diff) |" >> "$OUTPUT_FILE"
  fi
done < "$all_files"

# Add aggregated small JS files
if [ "$small_js_count" -gt 0 ]; then
  small_js_diff=$((small_js_pr - small_js_base))
  echo "| *Other JS ($small_js_count files)* | $(format_size $small_js_base) | $(format_size $small_js_pr) | $(format_diff $small_js_diff) |" >> "$OUTPUT_FILE"
fi

# Add aggregated small CSS files
if [ "$small_css_count" -gt 0 ]; then
  small_css_diff=$((small_css_pr - small_css_base))
  echo "| *Other CSS ($small_css_count files)* | $(format_size $small_css_base) | $(format_size $small_css_pr) | $(format_diff $small_css_diff) |" >> "$OUTPUT_FILE"
fi

# Total row
total_diff=$((total_pr - total_base))
echo "| **Total** | **$(format_size $total_base)** | **$(format_size $total_pr)** | **$(format_diff $total_diff)** |" >> "$OUTPUT_FILE"

echo "Bundle size report written to $OUTPUT_FILE"
