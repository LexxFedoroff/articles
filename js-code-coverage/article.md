# Adding Code Coverage to a TypeScript React Project with Vitest and Cypress

This article demonstrates how to implement comprehensive code coverage in a React/TypeScript project that uses both Vitest for unit testing and Cypress for component testing. We'll use the default Vite React template with its simple counter button and show how to achieve 100% code coverage by combining both testing approaches.

## What You'll Build

We'll work with the default Vite React application featuring:
- **Frontend**: React/TypeScript application using Vite
- **Features**: Simple counter button with increment functionality
- **Testing**: Comprehensive unit tests with Vitest and component tests with Cypress
- **Coverage**: Combined coverage reporting from both test suites

## Setting Up the Sample Project

Let's start by creating a new React project with TypeScript and exploring the default counter application.

### 1. Create the Project

Create a new React project with Vite:

```bash
# Create new React TypeScript project
npm create vite@latest sample-app -- --template react-ts
cd sample-app
npm install
```

### 2. Install Testing Dependencies

Add all necessary testing and coverage dependencies:

```bash
# Install Vitest and testing utilities
npm install -D vitest @vitest/coverage-istanbul jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install Cypress and coverage tools
npm install -D cypress @cypress/code-coverage vite-plugin-istanbul nyc @istanbuljs/nyc-config-typescript @types/mocha
```

### 3. Extract Counter Logic

To make testing more comprehensive, let's extract the counter logic into a separate utility function. Create `src/utils/counter.ts`:

```typescript
export interface CounterState {
  count: number;
}

export function incrementCounter(currentCount: number): number {
  return currentCount + 1;
}

export function resetCounter(): number {
  return 0;
}

export function formatCount(count: number): string {
  return `count is ${count}`;
}

export function isEvenCount(count: number): boolean {
  return count % 2 === 0;
}
```

### 4. Update the App Component

Update `src/App.tsx` to use our utility functions and add a reset button:

```typescript
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { incrementCounter, resetCounter, formatCount, isEvenCount } from './utils/counter'

function App() {
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    setCount(incrementCounter(count))
  }

  const handleReset = () => {
    setCount(resetCounter())
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleIncrement} data-testid="increment-btn">
          {formatCount(count)}
        </button>
        <button onClick={handleReset} data-testid="reset-btn">
          Reset
        </button>
        <p className={isEvenCount(count) ? 'even-count' : 'odd-count'}>
          Count is {isEvenCount(count) ? 'even' : 'odd'}
        </p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
```

### 5. Add Styling for Even/Odd States

Update `src/App.css` to include styles for even/odd count states:

```css
.even-count {
  color: #4ade80;
  font-weight: bold;
}

.odd-count {
  color: #f97316;
  font-weight: bold;
}
```

## Setting Up Coverage Configuration

### 1. Configure Vite

Update your `vite.config.ts`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      cypress: true,
      requireEnv: false,
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: [['json', { file: 'coverage-final.json' }]],
      reportsDirectory: './.coverage-data/vitest',
      exclude: [
        'node_modules',
        'dist',
        'vite.config.ts',
        'src/main.tsx',
        'src/test/setup.ts'
      ],
    },
  },
})
```

Update your `package.json` scripts:

```json
{
  "scripts": {
    ...
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    ...
  }
}
```

### 2. Configure Cypress

Create `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress'
import codeCoverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config)
      return config
    },
  },
})
```

Create `cypress/support/component.ts`:

```typescript
import '@cypress/code-coverage/support'
import './commands'

import { mount } from 'cypress/react'

Cypress.Commands.add('mount', mount)

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}
```

Update your `package.json` scripts:

```json
{
  "scripts": {
    ...
    "cypress:open": "cypress open",
    "cypress:run": "cypress run --component --env coverage=false",
    "cypress:coverage": "cypress run --component",
    ...
  }
}
```

Note: if you have an error with cypress config file such as:
```
ReferenceError: exports is not defined in ES module scope
```
please add the following code to tsconfig.json
```json
  "compilerOptions": {
    "module": "ESNext",
  },
```
see details here https://github.com/cypress-io/cypress/issues/30313

## Writing Comprehensive Tests

Now let's write tests that will achieve 100% code coverage. We'll create both unit tests and component tests for our simple counter application.

### Unit Tests for Counter Logic

Create `src/utils/counter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { 
  incrementCounter, 
  resetCounter, 
  formatCount, 
  isEvenCount 
} from './counter'

describe('Counter Utility Functions', () => {
  describe('incrementCounter', () => {
    it('should increment count by 1', () => {
      expect(incrementCounter(0)).toBe(1)
      expect(incrementCounter(5)).toBe(6)
      expect(incrementCounter(-1)).toBe(0)
    })

    it('should handle large numbers', () => {
      expect(incrementCounter(999)).toBe(1000)
    })
  })

  describe('resetCounter', () => {
    it('should always return 0', () => {
      expect(resetCounter()).toBe(0)
    })
  })

  describe('formatCount', () => {
    it('should format count 0 correctly', () => {
      expect(formatCount(0)).toBe('count is 0')
    })

    it('should format count 1 correctly', () => {
      expect(formatCount(1)).toBe('count is 1')
    })

    it('should format other counts correctly', () => {
      expect(formatCount(2)).toBe('count is 2')
      expect(formatCount(10)).toBe('count is 10')
      expect(formatCount(-1)).toBe('count is -1')
    })
  })

  describe('isEvenCount', () => {
    it('should return true for even numbers', () => {
      expect(isEvenCount(0)).toBe(true)
      expect(isEvenCount(2)).toBe(true)
      expect(isEvenCount(4)).toBe(true)
      expect(isEvenCount(-2)).toBe(true)
    })

    it('should return false for odd numbers', () => {
      expect(isEvenCount(1)).toBe(false)
      expect(isEvenCount(3)).toBe(false)
      expect(isEvenCount(5)).toBe(false)
      expect(isEvenCount(-1)).toBe(false)
    })
  })
})
```

### Component Tests with Cypress

Create `cypress/component/App.cy.tsx`:

```typescript
import App from './App'

describe('App Component', () => {
  beforeEach(() => {
    cy.mount(<App />)
  })

  it('should render the app correctly', () => {
    cy.contains('Vite + React').should('be.visible')
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 0')
    cy.get('[data-testid="reset-btn"]').should('contain', 'Reset')
  })

  it('should display logos with correct links', () => {
    cy.get('a[href="https://vite.dev"]').should('be.visible')
    cy.get('a[href="https://react.dev"]').should('be.visible')
    cy.get('img[alt="Vite logo"]').should('be.visible')
    cy.get('img[alt="React logo"]').should('be.visible')
  })

  it('should increment counter on button click', () => {
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 0')
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 1')
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 2')
  })

  it('should reset counter to 0', () => {
    // Increment a few times
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 3')
    
    // Reset
    cy.get('[data-testid="reset-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 0')
  })

  it('should display even/odd status correctly', () => {
    // Start at 0 (even)
    cy.get('.even-count').should('contain', 'Count is even')
    
    // Click to 1 (odd)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.odd-count').should('contain', 'Count is odd')
    
    // Click to 2 (even)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.even-count').should('contain', 'Count is even')
    
    // Click to 3 (odd)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.odd-count').should('contain', 'Count is odd')
  })

  it('should have correct styling for even/odd states', () => {
    // Even state (0)
    cy.get('.even-count').should('have.css', 'color', 'rgb(74, 222, 128)')
    
    // Odd state (1)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.odd-count').should('have.css', 'color', 'rgb(249, 115, 22)')
  })

  it('should show HMR instruction text', () => {
    cy.contains('Edit src/App.tsx and save to test HMR').should('be.visible')
  })

  it('should show learn more text', () => {
    cy.contains('Click on the Vite and React logos to learn more').should('be.visible')
  })
})
```

### 3. Create Coverage Merge Script

If we run the both coverages 
```
npm test:coverage
npm cypress:coverage
```
we will have two diferent files with coverage data :
```
.coverage-data/cypress/coverage-final.json 
.coverage-data/vitest/coverage-final.json 
```
and we need to merge them into one report. To achive this we can write a simple bash script.

Create a `coverage-merge.sh` script to merge coverage reports from both Vitest and Cypress:

```bash
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
```

Make the script executable:

```bash
chmod +x coverage.sh
```

here we can see the result:
```
-------------|---------|----------|---------|---------|-------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------|---------|----------|---------|---------|-------------------
All files    |     100 |      100 |     100 |     100 |                   
 src         |     100 |      100 |     100 |     100 |                   
  App.tsx    |     100 |      100 |     100 |     100 |                   
 src/utils   |     100 |      100 |     100 |     100 |                   
  counter.ts |     100 |      100 |     100 |     100 |                   
-------------|---------|----------|---------|---------|-------------------
```

## Conclusion

This comprehensive coverage setup provides:
- **Complete visibility** into test coverage across both unit and integration tests
- **Merged reporting** that shows the true coverage picture
- **Quality gates** through configurable thresholds
- **CI/CD integration** capabilities for automated quality checks

The configuration shown here scales well with project growth and provides the foundation for maintaining high code quality through comprehensive test coverage measurement.