import morgan from 'morgan';
import logger from '../utils/logger';

export const requestLogger = morgan('dev', {
  stream: {
    write: (message: string) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
  },
});
