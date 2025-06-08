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
