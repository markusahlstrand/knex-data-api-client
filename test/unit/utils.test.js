const { expect } = require('chai');
const utils = require('../../src/utils');

describe('utils', () => {
  describe('parseTimestamp', () => {
    it('should parse date in year 2022', () => {
      const result = utils.parseTimestamp('2022-01-01 00:00:00');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('2022-01-01T00:00:00.000Z');
    });

    it('should parse date in year 2022 with 1 millisecond precision', () => {
      const result = utils.parseTimestamp('2022-01-01 00:00:00.1');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('2022-01-01T00:00:00.100Z');
    });

    it('should parse date in year 2022 with 2 millisecond precision', () => {
      const result = utils.parseTimestamp('2022-01-01 00:00:00.12');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('2022-01-01T00:00:00.120Z');
    });

    it('should parse date in year 2022 with 3 millisecond precision', () => {
      const result = utils.parseTimestamp('2022-01-01 00:00:00.123');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('2022-01-01T00:00:00.123Z');
    });

    it('should parse date in year 2022 with 6 millisecond precision', () => {
      const result = utils.parseTimestamp('2022-01-01 00:00:00.123456');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('2022-01-01T00:00:00.123Z');
    });

    it('should parse max js date', () => {
      const result = utils.parseTimestamp('+275760-09-13 00:00:00');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('+275760-09-13T00:00:00.000Z');
    });

    it('should parse max js date with milliseconds', () => {
      const result = utils.parseTimestamp('+275760-09-13 00:00:00.000000');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('+275760-09-13T00:00:00.000Z');
    });

    it('should parse just over max js date to Infinity', () => {
      const result = utils.parseTimestamp('+275760-09-13 00:00:00.1');
      expect(result).to.equal(Infinity);
    });

    it('should parse positive out of range date to Infinity', () => {
      const result = utils.parseTimestamp('+292278994-08-16 23:00:00');
      expect(result).to.equal(Infinity);
    });

    it('should parse min js date', () => {
      const result = utils.parseTimestamp('-271821-04-20 00:00:00');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('-271821-04-20T00:00:00.000Z');
    });

    it('should parse min js date with milliseconds', () => {
      const result = utils.parseTimestamp('-271821-04-20 00:00:00.000000');
      expect(result instanceof Date);
      expect(result.toISOString()).to.equal('-271821-04-20T00:00:00.000Z');
    });

    it('should parse just under min js date to negative Infinity', () => {
      const result = utils.parseTimestamp('-271821-04-19 23:59:59.999');
      expect(result).to.equal(-Infinity);
    });

    it('should parse negative out of range date to negative Infinity', () => {
      const result = utils.parseTimestamp('-292275055-05-16 23:00:00');
      expect(result).to.equal(-Infinity);
    });
  });
});
