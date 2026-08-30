export class ApiError extends Error {
  status: number;
  messageValue: string | string[];

  constructor(status: number, message: string | string[]) {
    super(Array.isArray(message) ? message.join('; ') : message);
    this.name = 'ApiError';
    this.status = status;
    this.messageValue = message;
  }
}

// ponytail: Bun/Node client-side Response.statusText is always ''; Go http.StatusText map.
const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  503: 'Service Unavailable',
};

export function statusText(status: number): string {
  return STATUS_TEXT[status] ?? '';
}

export function nestBody(status: number, message: string | string[]) {
  return { statusCode: status, message, error: statusText(status) };
}
