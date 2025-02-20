import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEventComponent } from './chat-event.component';

describe('ChatEventComponent', () => {
  let component: ChatEventComponent;
  let fixture: ComponentFixture<ChatEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatEventComponent]
    });
    fixture = TestBed.createComponent(ChatEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
