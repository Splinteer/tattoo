import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEventProjectNewComponent } from './chat-event-project-new.component';

describe('ChatEventProjectNewComponent', () => {
  let component: ChatEventProjectNewComponent;
  let fixture: ComponentFixture<ChatEventProjectNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatEventProjectNewComponent]
    });
    fixture = TestBed.createComponent(ChatEventProjectNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
