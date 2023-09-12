import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageListComponent } from './ChatMessageListComponent';

describe('ChatMessageListComponent', () => {
  let component: ChatMessageListComponent;
  let fixture: ComponentFixture<ChatMessageListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatMessageListComponent],
    });
    fixture = TestBed.createComponent(ChatMessageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
