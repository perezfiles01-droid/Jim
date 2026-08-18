#!/bin/bash
# Quick syntax checker for JavaScript code
# Usage: ./syntax-check.sh <file.js> or <file.html>

FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: syntax-check.sh <file.js or file.html>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "Error: File '$FILE' not found"
  exit 1
fi

echo "=== Syntax Check: $FILE ==="
echo ""

# For HTML files, extract script content
if [[ "$FILE" == *.html ]]; then
  echo "Extracting JavaScript from HTML..."
  TEMP_JS=$(mktemp)
  sed -n '/<script>/,/<\/script>/p' "$FILE" | sed '/<script>/d;/<\/script>/d' > "$TEMP_JS"
  JS_FILE="$TEMP_JS"
  CLEANUP=1
else
  JS_FILE="$FILE"
  CLEANUP=0
fi

# Check with Node.js
if command -v node &> /dev/null; then
  echo "Running Node.js syntax check..."
  if node -c "$JS_FILE" 2>&1; then
    echo "✅ Syntax OK - No JavaScript errors found"
  else
    echo "❌ Syntax errors found - see above"
  fi
  echo ""
else
  echo "⚠️  Node.js not found. Cannot run full syntax check."
  echo "   Install Node.js to enable automatic syntax checking."
fi

# Quick manual checks
echo "=== Manual Checks ==="
echo ""

# Check for unclosed braces
OPEN_BRACES=$(grep -o '{' "$JS_FILE" | wc -l)
CLOSE_BRACES=$(grep -o '}' "$JS_FILE" | wc -l)
if [ $OPEN_BRACES -eq $CLOSE_BRACES ]; then
  echo "✅ Braces balanced: $OPEN_BRACES open, $CLOSE_BRACES close"
else
  echo "⚠️  Braces mismatch: $OPEN_BRACES open, $CLOSE_BRACES close"
fi

# Check for unclosed parentheses
OPEN_PARENS=$(grep -o '(' "$JS_FILE" | wc -l)
CLOSE_PARENS=$(grep -o ')' "$JS_FILE" | wc -l)
if [ $OPEN_PARENS -eq $CLOSE_PARENS ]; then
  echo "✅ Parentheses balanced: $OPEN_PARENS open, $CLOSE_PARENS close"
else
  echo "⚠️  Parentheses mismatch: $OPEN_PARENS open, $CLOSE_PARENS close"
fi

# Check for unclosed brackets
OPEN_BRACKETS=$(grep -o '\[' "$JS_FILE" | wc -l)
CLOSE_BRACKETS=$(grep -o '\]' "$JS_FILE" | wc -l)
if [ $OPEN_BRACKETS -eq $CLOSE_BRACKETS ]; then
  echo "✅ Brackets balanced: $OPEN_BRACKETS open, $CLOSE_BRACKETS close"
else
  echo "⚠️  Brackets mismatch: $OPEN_BRACKETS open, $CLOSE_BRACKETS close"
fi

# Check for suspicious patterns
echo ""
echo "=== Suspicious Patterns ==="

# Missing return statements
if grep -q "function.*{$" "$JS_FILE" | grep -q "if\|else\|const" "$JS_FILE"; then
  echo "⚠️  Found functions with conditional logic - verify return statements"
fi

# Async without await
if grep -q "async" "$JS_FILE" && ! grep -q "await" "$JS_FILE"; then
  echo "⚠️  Found 'async' but no 'await' - async function might not be used correctly"
fi

# Cleanup
if [ $CLEANUP -eq 1 ]; then
  rm "$TEMP_JS"
fi

echo ""
echo "=== End of Syntax Check ==="
