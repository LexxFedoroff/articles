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
pnpm create vite@latest sample-app -- --template react-ts
cd sample-app
pnpm install
```

### 2. Install Testing Dependencies

Add all necessary testing and coverage dependencies:

```bash
# Install Vitest and testing utilities
pnpm add -D vitest @vitest/coverage-istanbul jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install Cypress and coverage tools
pnpm add -D cypress @cypress/code-coverage vite-plugin-istanbul nyc @istanbuljs/nyc-config-typescript
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

### 3. Create Coverage Merge Script

Create a `coverage.sh` script to merge coverage reports from both Vitest and Cypress:

```bash
#!/bin/bash

# Coverage merging script for counter project
# Merges Vitest and Cypress coverage reports into a single HTML report

REPORTS_FOLDER=".coverage-data"
NYC_FOLDER=".nyc_output"
FINAL_OUTPUT_FOLDER=".coverage-html"

echo "🔄 Merging coverage reports..."

# Create directories if they don't exist
mkdir -p "$REPORTS_FOLDER"
mkdir -p "$NYC_FOLDER"

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

# Clean output directory
rm -rf "$FINAL_OUTPUT_FOLDER"
mkdir -p "$FINAL_OUTPUT_FOLDER"

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
import App from '../../src/App'

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

### Unit Tests for App Component

Create `src/App.test.tsx` for React Testing Library unit tests:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component Unit Tests', () => {
  it('should render app with initial state', () => {
    render(<App />)
    
    expect(screen.getByText('Vite + React')).toBeInTheDocument()
    expect(screen.getByTestId('increment-btn')).toHaveTextContent('count is 0')
    expect(screen.getByTestId('reset-btn')).toHaveTextContent('Reset')
    expect(screen.getByText('Count is even')).toBeInTheDocument()
  })

  it('should increment counter when button is clicked', () => {
    render(<App />)
    
    const incrementBtn = screen.getByTestId('increment-btn')
    
    expect(incrementBtn).toHaveTextContent('count is 0')
    
    fireEvent.click(incrementBtn)
    expect(incrementBtn).toHaveTextContent('count is 1')
    
    fireEvent.click(incrementBtn)
    expect(incrementBtn).toHaveTextContent('count is 2')
  })

  it('should reset counter when reset button is clicked', () => {
    render(<App />)
    
    const incrementBtn = screen.getByTestId('increment-btn')
    const resetBtn = screen.getByTestId('reset-btn')
    
    // Increment counter
    fireEvent.click(incrementBtn)
    fireEvent.click(incrementBtn)
    expect(incrementBtn).toHaveTextContent('count is 2')
    
    // Reset counter
    fireEvent.click(resetBtn)
    expect(incrementBtn).toHaveTextContent('count is 0')
  })

  it('should toggle even/odd status correctly', () => {
    render(<App />)
    
    const incrementBtn = screen.getByTestId('increment-btn')
    
    // Start at 0 (even)
    expect(screen.getByText('Count is even')).toBeInTheDocument()
    expect(screen.queryByText('Count is odd')).not.toBeInTheDocument()
    
    // Click to 1 (odd)
    fireEvent.click(incrementBtn)
    expect(screen.getByText('Count is odd')).toBeInTheDocument()
    expect(screen.queryByText('Count is even')).not.toBeInTheDocument()
    
    // Click to 2 (even)
    fireEvent.click(incrementBtn)
    expect(screen.getByText('Count is even')).toBeInTheDocument()
    expect(screen.queryByText('Count is odd')).not.toBeInTheDocument()
  })

  it('should apply correct CSS classes for even/odd states', () => {
    render(<App />)
    
    const incrementBtn = screen.getByTestId('increment-btn')
    
    // Even state (0)
    expect(screen.getByText('Count is even')).toHaveClass('even-count')
    
    // Odd state (1)
    fireEvent.click(incrementBtn)
    expect(screen.getByText('Count is odd')).toHaveClass('odd-count')
  })

  it('should render all static elements', () => {
    render(<App />)
    
    expect(screen.getByText('Edit src/App.tsx and save to test HMR')).toBeInTheDocument()
    expect(screen.getByText('Click on the Vite and React logos to learn more')).toBeInTheDocument()
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument()
    expect(screen.getByAltText('React logo')).toBeInTheDocument()
  })

  it('should have correct external links', () => {
    render(<App />)
    
    const viteLink = screen.getByRole('link', { name: /vite logo/i })
    const reactLink = screen.getByRole('link', { name: /react logo/i })
    
    expect(viteLink).toHaveAttribute('href', 'https://vite.dev')
    expect(viteLink).toHaveAttribute('target', '_blank')
    
    expect(reactLink).toHaveAttribute('href', 'https://react.dev')
    expect(reactLink).toHaveAttribute('target', '_blank')
  })
})
```

```typescript
import { describe, it, expect } from 'vitest'
import { 
  add, 
  subtract, 
  multiply, 
  divide, 
  calculate, 
  formatNumber,
  type Operation 
} from './calculator'

describe('Calculator Functions', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5)
    })

    it('should add negative numbers', () => {
      expect(add(-2, -3)).toBe(-5)
    })

    it('should add zero', () => {
      expect(add(5, 0)).toBe(5)
    })

    it('should add decimal numbers', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3)
    })
  })

  describe('subtract', () => {
    it('should subtract two positive numbers', () => {
      expect(subtract(5, 3)).toBe(2)
    })

    it('should subtract negative numbers', () => {
      expect(subtract(-2, -5)).toBe(3)
    })

    it('should subtract zero', () => {
      expect(subtract(5, 0)).toBe(5)
    })

    it('should handle negative results', () => {
      expect(subtract(3, 5)).toBe(-2)
    })
  })

  describe('multiply', () => {
    it('should multiply two positive numbers', () => {
      expect(multiply(3, 4)).toBe(12)
    })

    it('should multiply by zero', () => {
      expect(multiply(5, 0)).toBe(0)
    })

    it('should multiply negative numbers', () => {
      expect(multiply(-3, -4)).toBe(12)
      expect(multiply(-3, 4)).toBe(-12)
    })

    it('should multiply decimal numbers', () => {
      expect(multiply(0.5, 0.2)).toBeCloseTo(0.1)
    })
  })

  describe('divide', () => {
    it('should divide two positive numbers', () => {
      const result = divide(10, 2)
      expect(result.result).toBe(5)
      expect(result.error).toBeUndefined()
    })

    it('should handle division by zero', () => {
      const result = divide(10, 0)
      expect(result.result).toBe(0)
      expect(result.error).toBe('Cannot divide by zero')
    })

    it('should divide negative numbers', () => {
      const result = divide(-10, 2)
      expect(result.result).toBe(-5)
      expect(result.error).toBeUndefined()
    })

    it('should handle decimal division', () => {
      const result = divide(1, 3)
      expect(result.result).toBeCloseTo(0.3333333333)
      expect(result.error).toBeUndefined()
    })
  })

  describe('calculate', () => {
    it('should perform addition', () => {
      const result = calculate(2, 3, 'add')
      expect(result.result).toBe(5)
      expect(result.error).toBeUndefined()
    })

    it('should perform subtraction', () => {
      const result = calculate(5, 3, 'subtract')
      expect(result.result).toBe(2)
      expect(result.error).toBeUndefined()
    })

    it('should perform multiplication', () => {
      const result = calculate(3, 4, 'multiply')
      expect(result.result).toBe(12)
      expect(result.error).toBeUndefined()
    })

    it('should perform division', () => {
      const result = calculate(10, 2, 'divide')
      expect(result.result).toBe(5)
      expect(result.error).toBeUndefined()
    })

    it('should handle division by zero', () => {
      const result = calculate(10, 0, 'divide')
      expect(result.result).toBe(0)
      expect(result.error).toBe('Cannot divide by zero')
    })

    it('should handle invalid operation', () => {
      const result = calculate(2, 3, 'invalid' as Operation)
      expect(result.result).toBe(0)
      expect(result.error).toBe('Invalid operation')
    })
  })

  describe('formatNumber', () => {
    it('should format integers without decimals', () => {
      expect(formatNumber(5)).toBe('5')
    })

    it('should format decimals with precision', () => {
      expect(formatNumber(5.123456789)).toBe('5.12345679')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('should remove trailing zeros', () => {
      expect(formatNumber(5.10000000)).toBe('5.1')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-5.123)).toBe('-5.123')
    })
  })
})
```

### Component Tests with Cypress

Create `cypress/component/Calculator.cy.tsx`:

```typescript
import { Calculator } from '../../src/components/Calculator'

describe('Calculator Component', () => {
  beforeEach(() => {
    cy.mount(<Calculator />)
  })

  it('should render calculator', () => {
    cy.get('[data-cy="calculator"]').should('be.visible')
    cy.get('[data-cy="display"]').should('contain', '0')
  })

  it('should input numbers', () => {
    cy.get('[data-cy="number-1"]').click()
    cy.get('[data-cy="number-2"]').click()
    cy.get('[data-cy="number-3"]').click()
    cy.get('[data-cy="display"]').should('contain', '123')
  })

  it('should clear display', () => {
    cy.get('[data-cy="number-5"]').click()
    cy.get('[data-cy="display"]').should('contain', '5')
    cy.get('[data-cy="clear-btn"]').click()
    cy.get('[data-cy="display"]').should('contain', '0')
  })

  it('should handle decimal input', () => {
    cy.get('[data-cy="number-1"]').click()
    cy.get('[data-cy="decimal-btn"]').click()
    cy.get('[data-cy="number-5"]').click()
    cy.get('[data-cy="display"]').should('contain', '1.5')
  })

  it('should prevent multiple decimals', () => {
    cy.get('[data-cy="decimal-btn"]').click()
    cy.get('[data-cy="decimal-btn"]').click()
    cy.get('[data-cy="number-5"]').click()
    cy.get('[data-cy="display"]').should('contain', '0.5')
  })

  describe('Basic Operations', () => {
    it('should perform addition', () => {
      cy.get('[data-cy="number-2"]').click()
      cy.get('[data-cy="add-btn"]').click()
      cy.get('[data-cy="number-3"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '5')
    })

    it('should perform subtraction', () => {
      cy.get('[data-cy="number-5"]').click()
      cy.get('[data-cy="subtract-btn"]').click()
      cy.get('[data-cy="number-3"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '2')
    })

    it('should perform multiplication', () => {
      cy.get('[data-cy="number-4"]').click()
      cy.get('[data-cy="multiply-btn"]').click()
      cy.get('[data-cy="number-3"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '12')
    })

    it('should perform division', () => {
      cy.get('[data-cy="number-8"]').click()
      cy.get('[data-cy="divide-btn"]').click()
      cy.get('[data-cy="number-2"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '4')
    })
  })

  describe('Error Handling', () => {
    it('should handle division by zero', () => {
      cy.get('[data-cy="number-5"]').click()
      cy.get('[data-cy="divide-btn"]').click()
      cy.get('[data-cy="number-0"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', 'Error: Cannot divide by zero')
    })

    it('should clear error state', () => {
      // Create error state
      cy.get('[data-cy="number-5"]').click()
      cy.get('[data-cy="divide-btn"]').click()
      cy.get('[data-cy="number-0"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', 'Error')
      
      // Clear should reset
      cy.get('[data-cy="clear-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '0')
      cy.get('[data-cy="display"]').should('not.contain', 'Error')
    })
  })

  describe('Complex Operations', () => {
    it('should handle chained operations', () => {
      cy.get('[data-cy="number-2"]').click()
      cy.get('[data-cy="add-btn"]').click()
      cy.get('[data-cy="number-3"]').click()
      cy.get('[data-cy="multiply-btn"]').click()
      cy.get('[data-cy="number-4"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '20')
    })

    it('should handle decimal operations', () => {
      cy.get('[data-cy="number-1"]').click()
      cy.get('[data-cy="decimal-btn"]').click()
      cy.get('[data-cy="number-5"]').click()
      cy.get('[data-cy="add-btn"]').click()
      cy.get('[data-cy="number-2"]').click()
      cy.get('[data-cy="decimal-btn"]').click()
      cy.get('[data-cy="number-5"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '4')
    })

    it('should handle operations after decimal input in waiting state', () => {
      cy.get('[data-cy="number-5"]').click()
      cy.get('[data-cy="add-btn"]').click()
      cy.get('[data-cy="decimal-btn"]').click()
      cy.get('[data-cy="number-5"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      cy.get('[data-cy="display"]').should('contain', '5.5')
    })

    it('should handle number input after error', () => {
      // Create error
      cy.get('[data-cy="number-1"]').click()
      cy.get('[data-cy="divide-btn"]').click()
      cy.get('[data-cy="number-0"]').click()
      cy.get('[data-cy="equals-btn"]').click()
      
      // Input new number should clear error
      cy.get('[data-cy="number-7"]').click()
      cy.get('[data-cy="display"]').should('contain', '7')
      cy.get('[data-cy="display"]').should('not.contain', 'Error')
    })
  })
})
```

### Integration Tests (Optional)

Create `src/App.test.tsx` for integration testing:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Integration', () => {
  it('should render app with calculator', () => {
    render(<App />)
    
    expect(screen.getByText('Calculator with Code Coverage')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('=')).toBeInTheDocument()
  })
})

## Understanding the Coverage Output

### Vitest Coverage
- Located in `client/.coverage-data/vitest/`
- Covers unit test scenarios
- Fast execution, good for TDD workflows

### Cypress Coverage
- Located in `client/.coverage-data/cypress/`
- Covers integration scenarios and user interactions
- More comprehensive but slower execution

### Merged Coverage
- Located in `client/.coverage-html/`
- Combines both Vitest and Cypress coverage
- Provides the most accurate representation of actual code coverage

### Server Coverage
- Located in `server/.coverage-html/`
- Covers API endpoints and business logic
- Includes coverage thresholds for quality gates

## Best Practices

### 1. Coverage Thresholds
Set appropriate thresholds to maintain code quality:

```typescript
thresholds: {
  functions: 100,   // All functions should be tested
  lines: 90,        // 90% line coverage minimum
  statements: 90,   // 90% statement coverage minimum
  branches: 80,     // 80% branch coverage minimum
}
```

### 2. Exclude Patterns
Exclude files that shouldn't be measured:
- Configuration files (`vite.config.ts`, `cypress.config.js`)
- Entry points (`index.ts`, `main.tsx`)
- Type definitions
- Test utilities

### 3. CI/CD Integration
Add coverage checks to your CI pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage thresholds
  run: npm run test:coverage
```

### 4. Coverage Reports
- Use HTML reports for local development and debugging
- Use JSON/LCOV reports for CI/CD integration
- Use text reports for quick command-line feedback

## Troubleshooting

### Common Issues

1. **Istanbul instrumentation conflicts**
   - Ensure `vite-plugin-istanbul` is configured correctly
   - Check that `requireEnv: false` is set for development

2. **Coverage files not found**
   - Verify that tests are actually running with coverage enabled
   - Check file paths in the merge script

3. **Threshold failures**
   - Review uncovered code in HTML reports
   - Adjust thresholds based on project requirements
   - Add tests for uncovered branches

### Debug Tips

1. **View detailed coverage**: Open `client/.coverage-html/index.html` in a browser
2. **Check merge process**: Run the coverage script manually to see any errors
3. **Validate configuration**: Ensure all tools are using Istanbul as the provider

## Conclusion

This comprehensive coverage setup provides:
- **Complete visibility** into test coverage across both unit and integration tests
- **Merged reporting** that shows the true coverage picture
- **Quality gates** through configurable thresholds
- **CI/CD integration** capabilities for automated quality checks

The configuration shown here scales well with project growth and provides the foundation for maintaining high code quality through comprehensive test coverage measurement.