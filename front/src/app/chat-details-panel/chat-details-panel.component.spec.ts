import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDetailsPanelComponent } from './chat-details-panel.component';

describe('ChatDetailsPanelComponent', () => {
  let component: ChatDetailsPanelComponent;
  let fixture: ComponentFixture<ChatDetailsPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatDetailsPanelComponent]
    });
    fixture = TestBed.createComponent(ChatDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
