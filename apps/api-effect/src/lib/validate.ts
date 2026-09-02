import { ApiError } from './errors';

export interface FieldDef {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  // Go int field: fractional numbers fail decode like Go's "cannot unmarshal number 1.5 into ... int".
  integer?: boolean;
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  minLen?: number;
  maxLen?: number;
  oneOf?: readonly string[];
  // Go binding:"omitempty,..." — zero values ("" 0 false) skip the other constraints.
  omitempty?: boolean;
  // Nested object; keys are Go field names (FullName -> JSON key fullName).
  fields?: Record<string, FieldDef>;
  items?: FieldDef;
}

// ponytail: pragmatic email check; Go uses go-playground's longer RFC-ish regex.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.trim() === '') {
    // ponytail: mirrors Go json.Decoder returning EOF on an empty body.
    throw new ApiError(400, ['EOF']);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(400, ['Malformed JSON body']);
  }

  if (parsed === null) return {};

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    // ponytail: Go's web.Bind panics here (empty field path) and gin recovery 500s; 400 is saner.
    throw new ApiError(400, [`property  must be a ${jsonKind(parsed)}`]);
  }

  return parsed as Record<string, unknown>;
}

export function bindBody<T>(raw: Record<string, unknown>, fields: Record<string, FieldDef>): T {
  checkDecode(raw, fields);

  const messages: string[] = [];
  for (const [name, def] of Object.entries(fields)) {
    collect(name, def, raw[jsonKey(name)], messages);
  }

  if (messages.length > 0) throw new ApiError(400, messages);
  return raw as T;
}

export async function bindJson<T>(
  ctx: { request: Request },
  fields: Record<string, FieldDef>,
): Promise<T> {
  const raw = await readJsonBody(ctx.request);
  return bindBody(raw, fields);
}

// Mirrors Go json.Decode with DisallowUnknownFields: the first decode error in
// document order wins, unknown keys reported by raw JSON key.
function checkDecode(object: Record<string, unknown>, fields: Record<string, FieldDef>): void {
  for (const [key, value] of Object.entries(object)) {
    const def = findField(fields, key);
    if (def === undefined) {
      throw new ApiError(400, [`property ${key} should not exist`]);
    }
    if (value !== null && value !== undefined) {
      const mismatch = typeMismatchMessage(key, def, value);
      if (mismatch !== null) throw new ApiError(400, [mismatch]);
      if (
        def.type === 'object' &&
        def.fields !== undefined &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        checkDecode(value as Record<string, unknown>, def.fields);
      }
    }
  }
}

function findField(fields: Record<string, FieldDef>, key: string): FieldDef | undefined {
  for (const [name, def] of Object.entries(fields)) {
    if (jsonKey(name) === key) return def;
  }
  return undefined;
}

// Constraint pass, declaration order. Go's FieldError.Field() is the leaf name
// only, so nested failures read "phone should not be empty" without a prefix.
function collect(name: string, def: FieldDef, value: unknown, out: string[]): void {
  if (value === null || value === undefined) {
    if (def.required) out.push(`${jsonKey(name)} should not be empty`);
    // Go validates inner fields even when the nested struct is absent/zero
    // (unless the struct itself is required and zero, which reports once).
    if (def.type === 'object' && def.fields !== undefined && !def.required) {
      for (const [subName, subDef] of Object.entries(def.fields)) {
        collect(subName, subDef, undefined, out);
      }
    }
    return;
  }
  if (def.omitempty && (value === '' || value === 0 || value === false)) return;

  if (
    def.type === 'object' &&
    def.fields !== undefined &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    const obj = value as Record<string, unknown>;
    // Go WithRequiredStructEnabled: a `required` zero struct fails once with
    // "should not be empty" and its inner fields are skipped; a zero struct
    // without `required` still validates its inner fields.
    if (isZeroStruct(obj, def.fields) && def.required) {
      out.push(`${jsonKey(name)} should not be empty`);
      return;
    }
    for (const [subName, subDef] of Object.entries(def.fields)) {
      collect(subName, subDef, obj[jsonKey(subName)], out);
    }
    return;
  }

  // Go `required` fails on any zero value; the first failing tag per field wins.
  if (def.required) {
    const zero =
      value === '' ||
      value === 0 ||
      value === false ||
      (Array.isArray(value) && value.length === 0);
    if (zero) {
      out.push(`${jsonKey(name)} should not be empty`);
      return;
    }
  }

  if (def.type === 'string' && typeof value === 'string') {
    if (def.email && !EMAIL_RE.test(value)) {
      out.push(`${jsonKey(name)} must be an email`);
      return;
    }
    if (def.minLen !== undefined && value.length < def.minLen) {
      out.push(`${jsonKey(name)} must be longer than or equal to ${def.minLen} characters`);
      return;
    }
    if (def.maxLen !== undefined && value.length > def.maxLen) {
      out.push(`${jsonKey(name)} must be shorter than or equal to ${def.maxLen} characters`);
      return;
    }
    if (def.oneOf !== undefined && !def.oneOf.includes(value)) {
      out.push(`${jsonKey(name)} must be one of the following values: ${def.oneOf.join(' ')}`);
    }
  } else if (def.type === 'number' && typeof value === 'number') {
    if (def.min !== undefined && value < def.min) {
      out.push(`${jsonKey(name)} must not be less than ${def.min}`);
      return;
    }
    if (def.max !== undefined && value > def.max) {
      out.push(`${jsonKey(name)} must not be greater than ${def.max}`);
    }
  }
}

function isZeroStruct(obj: Record<string, unknown>, fields: Record<string, FieldDef>): boolean {
  for (const name of Object.keys(fields)) {
    const v = obj[jsonKey(name)];
    if (v !== undefined && v !== null && v !== '' && v !== 0 && v !== false) return false;
  }
  return true;
}

function typeMismatchMessage(key: string, def: FieldDef, value: unknown): string | null {
  switch (def.type) {
    case 'string':
      if (typeof value === 'string') return null;
      break;
    case 'number':
      if (typeof value !== 'number') break;
      if (def.integer && !Number.isInteger(value))
        return `property ${jsonKey(key)} must be a number`;
      return null;
    case 'boolean':
      if (typeof value === 'boolean') return null;
      break;
    case 'object':
      if (typeof value === 'object' && !Array.isArray(value)) return null;
      break;
    case 'array':
      if (Array.isArray(value)) return null;
      break;
  }
  return `property ${jsonKey(key)} must be a ${jsonKind(value)}`;
}

// Mirrors Go web.Bind into map[string]any — Go emits []string for bind errors.
export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.trim() === '') {
    throw new ApiError(400, ['EOF']);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(400, ['Malformed JSON body']);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ApiError(400, [
      `json: cannot unmarshal ${Array.isArray(parsed) ? 'array' : typeof parsed} into Go value of type map[string]interface {}`,
    ]);
  }
  return parsed as Record<string, unknown>;
}

export function jsonKey(goFieldName: string): string {
  return goFieldName === '' ? goFieldName : goFieldName[0]!.toLowerCase() + goFieldName.slice(1);
}

function jsonKind(value: unknown): string {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return 'object';
}
