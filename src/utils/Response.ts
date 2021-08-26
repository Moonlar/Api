export enum Errors {
  NEED_AUTHENTICATE = 'Authentication required',
  NO_PERMISSION = 'Not allowed to access resource',
  NOT_FOUND = 'Resource not found',
  WRONG_PASSWORD = 'Incorrect password',
  INVALID_REQUEST = 'Invalid request data',
  NEED_LOGOUT = 'Need to logout first',

  INTERNAL_ERROR = 'Internal server error',
  UNAVAILABLE = 'Route unavailable',

  EXPIRED_TOKEN = 'Expired token',
  INVALID_TOKEN = 'Invalid token',
}

export enum Success {
  SUCCESS = 'Success',
  CREATED = 'Successfully created',
  UPDATED = 'Successfully updated',
  DELETED = 'Successfully deleted',
  LOGIN = 'Successfully login',
  LOGOUT = 'Successfully logout',
}
