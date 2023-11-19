import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEventComponent } from './conversation-event.component';

describe('ConversationEventComponent', () => {
  let component: ConversationEventComponent;
  let fixture: ComponentFixture<ConversationEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEventComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
