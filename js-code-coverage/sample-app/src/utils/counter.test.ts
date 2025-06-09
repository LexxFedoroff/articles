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
    it('should format counts correctly', () => {
      expect(formatCount(0)).toBe('count is 0')
      expect(formatCount(1)).toBe('count is 1')
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