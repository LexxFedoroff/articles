# How to Add Code Coverage to a React TypeScript Project with Cypress and Vitest

Code coverage is an important metric that shows how much of your code is tested. With high coverage, you can be more confident that your application works correctly and has fewer bugs. It helps you find parts of your code that need more testing and makes it easier to maintain your project. Teams often aim for high coverage (80% or more) to ensure their code is reliable. However, remember that having 100% coverage doesn't guarantee perfect code - it just means all your code runs during tests.

To achieve high code coverage, we'll use both Vitest and Cypress. Vitest is excellent for unit testing individual functions and small pieces of code, while Cypress is great for testing components and user interactions. Using just one tool often leaves gaps in coverage - Vitest might miss real-world user interactions, while Cypress alone might not cover all code paths in your business logic. By combining both tools, we can ensure thorough testing of both our logic and user interface, leading to better code quality and fewer bugs.

## What You Will Build

We will work with a simple React app that has:
- **Frontend**: A React app with TypeScript, built with Vite
- **Features**: A counter button that you can click to increase numbers
- **Testing**: Unit tests with Vitest and component tests with Cypress
- **Coverage**: Reports that show how much of your code is tested

## Creating the Sample Project

Let's start by creating a new React project with TypeScript. We'll work with the simple counter app that comes with it.

### 1. Create the Project

Create a new React project with Vite:

```bash
# Create new React TypeScript project
npm create vite@latest sample-app -- --template react-ts
cd sample-app
npm install
```

### 2. Install Testing Tools

Add all the tools you need for testing and coverage:

```bash
# Install Vitest and testing tools
npm install -D vitest @vitest/coverage-istanbul jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install Cypress and coverage tools
npm install -D cypress @cypress/code-coverage vite-plugin-istanbul nyc @istanbuljs/nyc-config-typescript @types/mocha
```

### 3. Move Counter Logic to a Separate File

To make testing easier, let's move the counter logic to its own file. Create `src/utils/counter.ts`:

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

Change `src/App.tsx` to use our helper functions and add a reset button:

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


## Setting Up Coverage Settings

### 1. Set Up Vite

Update your `vite.config.ts` file:

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

### 2. Set Up Cypress

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

Note: If you see an error with the Cypress config file like:
```
ReferenceError: exports is not defined in ES module scope
```
Add the following code to your tsconfig.json file:
```json
  "compilerOptions": {
    "module": "ESNext",
  },
```
For more details, visit https://github.com/cypress-io/cypress/issues/30313

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

Create `src/App.cy.tsx`:

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

## Create Coverage Merge Script

If we run both coverage commands:
```
npm test:coverage
npm cypress:coverage
```
We'll have two different files with coverage data:
```
.coverage-data/cypress/coverage-final.json 
.coverage-data/vitest/coverage-final.json 
```
We need to merge them into one report. To do this, we can write a simple bash script.

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
chmod +x coverage-merge.sh
```

Here's the result when we run the script:
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
You can also view the results in your browser by opening `./.coverage-html/index.html`

As you can see, we've covered both types of code: utilities and React components. If you have other testing tools, you can easily extend the merge script.

## Conclusion

In this article, we learned how to set up code coverage for a React TypeScript project using both Vitest and Cypress. We covered:

- Creating a simple React counter application
- Setting up Vitest for unit testing
- Setting up Cypress for component testing
- Configuring coverage reporting for both tools
- Writing thorough tests to achieve 100% coverage
- Merging coverage reports from different testing tools

Good code coverage helps teams write better, more reliable code. By using both Vitest and Cypress, we can test our code thoroughly and catch issues early. Remember that while 100% coverage is great, the quality of your tests is just as important as the coverage percentage.