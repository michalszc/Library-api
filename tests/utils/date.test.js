const { describe, expect, test } = require('@jest/globals');
const { addDays, isBefore } = require('../../src/api/utils/date');

describe('DATE addDays', () => {
  const someDate = '2022/10/15';
  test('should add one day', () => {
    const newDate = addDays(someDate);
    expect(newDate.getFullYear()).toBe(2022);
    expect(newDate.getMonth()).toBe(9);
    expect(newDate.getDate()).toBe(16);
  });
  test('should add 10 days', () => {
    const newDate = addDays(someDate, 10);
    expect(newDate.getFullYear()).toBe(2022);
    expect(newDate.getMonth()).toBe(9);
    expect(newDate.getDate()).toBe(25);
  });
});

describe('DATE isBefore', () => {
  test('should return true if first date is before second', () => {
    const d1 = '2022/10/15';
    const d2 = '2022/12/14';
    expect(isBefore(d1, d2)).toBe(true);
  });
  test('should return false if first date is not before second', () => {
    const d1 = '2023/10/15';
    const d2 = '2022/12/14';
    expect(isBefore(d1, d2)).toBe(false);
  });
});
