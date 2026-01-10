import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have playSound method', () => {
    expect(service.playSound).toBeDefined();
  });

  it('should have playSuccessBeep method', () => {
    expect(service.playSuccessBeep).toBeDefined();
  });

  it('should have clearCache method', () => {
    expect(service.clearCache).toBeDefined();
  });
});
