import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { QrReaderComponent } from './qr-reader.component';
import { AudioService } from '../shared/audio.service';

describe('QrReaderComponent', () => {
  let component: QrReaderComponent;
  let fixture: ComponentFixture<QrReaderComponent>;
  let mockAudioService: jasmine.SpyObj<AudioService>;

  beforeEach(() => {
    // Create a mock AudioService
    mockAudioService = jasmine.createSpyObj('AudioService', ['playSuccessBeep']);
    mockAudioService.playSuccessBeep.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      declarations: [QrReaderComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AudioService, useValue: mockAudioService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(QrReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call playSuccessBeep when QR code is scanned', () => {
    const testQrCode = 'test@example.com';
    component.onScanSuccess(testQrCode);
    expect(mockAudioService.playSuccessBeep).toHaveBeenCalled();
  });
});
