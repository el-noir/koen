import { BadRequestException } from '@nestjs/common';
import { validateConfirmedContent } from './confirm-content.validator';

describe('validateConfirmedContent', () => {
  it('accepts valid task content', () => {
    expect(
      validateConfirmedContent('task', {
        description: 'Install cladding on the north wall',
        location: 'North wall',
      }),
    ).toEqual({
      description: 'Install cladding on the north wall',
      location: 'North wall',
    });
  });

  it('rejects unexpected fields for note content', () => {
    expect(() =>
      validateConfirmedContent('note', {
        text: 'Remember to call the electrician',
        extra: 'nope',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid hours worker counts', () => {
    expect(() =>
      validateConfirmedContent('hours', {
        start: '08:00',
        end: '17:00',
        workers: 0,
      }),
    ).toThrow('hours.workers must be a positive integer.');
  });

  it('rejects empty material descriptions', () => {
    expect(() =>
      validateConfirmedContent('material', {
        description: '   ',
      }),
    ).toThrow('material.description must be a non-empty string.');
  });
});
