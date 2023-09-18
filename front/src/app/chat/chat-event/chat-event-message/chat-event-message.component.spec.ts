import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEventMessageComponent } from './chat-event-message.component';

describe('ChatEventMessageComponent', () => {
  let component: ChatEventMessageComponent;
  let fixture: ComponentFixture<ChatEventMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatEventMessageComponent]
    });
    fixture = TestBed.createComponent(ChatEventMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
