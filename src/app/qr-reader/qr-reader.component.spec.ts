import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrReaderComponent } from './qr-reader.component';

describe('QrReaderComponent', () => {
  let component: QrReaderComponent;
  let fixture: ComponentFixture<QrReaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QrReaderComponent]
    });
    fixture = TestBed.createComponent(QrReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
