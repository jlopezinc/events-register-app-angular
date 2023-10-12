import { TestBed } from '@angular/core/testing';

import { EventsRegisterApiService } from './events-register-api.service';

describe('EventsRegisterApiService', () => {
  let service: EventsRegisterApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsRegisterApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
