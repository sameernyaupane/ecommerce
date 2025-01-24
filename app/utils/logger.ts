export function logInfo(message: string, data?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    ...data
  }));
}

export function logError(message: string, error: any) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    error: {
      message: error.message,
      stack: error.stack,
      ...error
    }
  }));
} 