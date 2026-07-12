import { environment } from '../../environments/environment';
import { EVENT_NAME } from './event-name';

describe('EVENT_NAME', () => {
  it('should come from environment configuration', () => {
    expect(EVENT_NAME).toBe(environment.eventName);
  });
});
