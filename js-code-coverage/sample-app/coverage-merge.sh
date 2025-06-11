#!/bin/bash

# Coverage merging script for counter project
# Merges Vitest and Cypress coverage reports into a single HTML report

REPORTS_FOLDER=".coverage-data"
NYC_FOLDER=".nyc_output"
FINAL_OUTPUT_FOLDER=".coverage-html"

echo "🔄 Merging coverage reports..."

# Recreate necessary directories
rm -rf "$NYC_FOLDER"
mkdir -p "$NYC_FOLDER"

rm -rf "$FINAL_OUTPUT_FOLDER"
mkdir -p "$FINAL_OUTPUT_FOLDER"


# Rename coverage files for merging
if [ -f "$REPORTS_FOLDER/cypress/coverage-final.json" ]; then
  mv "$REPORTS_FOLDER/cypress/coverage-final.json" "$REPORTS_FOLDER/coverage-cypress.json"
  echo "✅ Found Cypress coverage data"
else
  echo "⚠️  No Cypress coverage data found"
fi

if [ -f "$REPORTS_FOLDER/vitest/coverage-final.json" ]; then
  mv "$REPORTS_FOLDER/vitest/coverage-final.json" "$REPORTS_FOLDER/coverage-vitest.json"
  echo "✅ Found Vitest coverage data"
else
  echo "⚠️  No Vitest coverage data found"
fi

# Merge coverage reports
echo "🔀 Merging coverage data..."
npx nyc merge "$REPORTS_FOLDER"
mv coverage.json "$NYC_FOLDER/out.json"

# Generate reports
echo "📊 Generating coverage reports..."
npx nyc report --reporter=html --reporter=text --report-dir="$FINAL_OUTPUT_FOLDER"

# Cleanup temporary files
rm -rf "$NYC_FOLDER"
rm -rf "$REPORTS_FOLDER"

echo "✅ Coverage report generated at: $FINAL_OUTPUT_FOLDER/index.html"