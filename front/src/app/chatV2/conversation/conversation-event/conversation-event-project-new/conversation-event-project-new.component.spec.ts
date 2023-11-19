import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEventProjectNewComponent } from './conversation-event-project-new.component';

describe('ConversationEventProjectNewComponent', () => {
  let component: ConversationEventProjectNewComponent;
  let fixture: ComponentFixture<ConversationEventProjectNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEventProjectNewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEventProjectNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
