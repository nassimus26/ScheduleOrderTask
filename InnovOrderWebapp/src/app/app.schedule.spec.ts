import { TestBed, async } from '@angular/core/testing';
import { AppSchedule } from './app.schedule';
describe('AppSchedule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppSchedule
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppSchedule);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

});
