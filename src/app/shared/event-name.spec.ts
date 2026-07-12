import { environment } from '../../environments/environment';
import { EVENT_NAME } from './event-name';

describe('EVENT_NAME', () => {
  it('should come from environment configuration', () => {
    expect(EVENT_NAME).toBe(environment.eventName);
  });

  it('should default to motorizadas2026', () => {
    expect(EVENT_NAME).toBe('motorizadas2026');
  });
});
