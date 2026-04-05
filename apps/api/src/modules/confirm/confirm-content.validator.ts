import { BadRequestException } from '@nestjs/common';
import type {
  DataCategory,
  EventContent,
  ExtractedContent,
  HoursContent,
  MaterialContent,
  NoteContent,
  TaskContent,
} from '../../types';

type ContentInput = Record<string, unknown>;

function ensurePlainObject(value: unknown): ContentInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('content must be a plain object.');
  }

  return value as ContentInput;
}

function assertAllowedKeys(content: ContentInput, allowedKeys: string[], category: DataCategory) {
  const unexpectedKeys = Object.keys(content).filter((key) => !allowedKeys.includes(key));

  if (unexpectedKeys.length > 0) {
    throw new BadRequestException(
      `Invalid ${category} content. Unexpected field(s): ${unexpectedKeys.join(', ')}.`,
    );
  }
}

function requireNonEmptyString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
}

function optionalTrimmedString(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function optionalFiniteNumber(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new BadRequestException(`${fieldName} must be a valid number.`);
  }

  return value;
}

function optionalPositiveInteger(value: unknown, fieldName: string) {
  const parsedValue = optionalFiniteNumber(value, fieldName);

  if (parsedValue === undefined) {
    return undefined;
  }

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new BadRequestException(`${fieldName} must be a positive integer.`);
  }

  return parsedValue;
}

function validateTaskContent(content: ContentInput): TaskContent {
  assertAllowedKeys(content, ['description', 'location'], 'task');

  return {
    description: requireNonEmptyString(content.description, 'task.description'),
    location: optionalTrimmedString(content.location, 'task.location'),
  };
}

function validateMaterialContent(content: ContentInput): MaterialContent {
  assertAllowedKeys(content, ['description', 'quantity', 'unit', 'supplier'], 'material');

  const quantity = optionalFiniteNumber(content.quantity, 'material.quantity');
  if (quantity !== undefined && quantity < 0) {
    throw new BadRequestException('material.quantity must be zero or greater.');
  }

  return {
    description: requireNonEmptyString(content.description, 'material.description'),
    quantity,
    unit: optionalTrimmedString(content.unit, 'material.unit'),
    supplier: optionalTrimmedString(content.supplier, 'material.supplier'),
  };
}

function validateHoursContent(content: ContentInput): HoursContent {
  assertAllowedKeys(content, ['start', 'end', 'workers', 'notes'], 'hours');

  return {
    start: requireNonEmptyString(content.start, 'hours.start'),
    end: requireNonEmptyString(content.end, 'hours.end'),
    workers: optionalPositiveInteger(content.workers, 'hours.workers'),
    notes: optionalTrimmedString(content.notes, 'hours.notes'),
  };
}

function validateEventContent(content: ContentInput): EventContent {
  assertAllowedKeys(content, ['description', 'date'], 'event');

  return {
    description: requireNonEmptyString(content.description, 'event.description'),
    date: optionalTrimmedString(content.date, 'event.date'),
  };
}

function validateNoteContent(content: ContentInput): NoteContent {
  assertAllowedKeys(content, ['text'], 'note');

  return {
    text: requireNonEmptyString(content.text, 'note.text'),
  };
}

export function validateConfirmedContent(category: DataCategory, content: unknown): ExtractedContent {
  const parsedContent = ensurePlainObject(content);

  switch (category) {
    case 'task':
      return validateTaskContent(parsedContent);
    case 'material':
      return validateMaterialContent(parsedContent);
    case 'hours':
      return validateHoursContent(parsedContent);
    case 'event':
      return validateEventContent(parsedContent);
    case 'note':
      return validateNoteContent(parsedContent);
    default:
      throw new BadRequestException(`Unsupported extracted data category: ${category}.`);
  }
}
