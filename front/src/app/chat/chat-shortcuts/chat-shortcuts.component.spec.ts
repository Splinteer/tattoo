import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatShortcutsComponent } from './chat-shortcuts.component';

describe('ChatShortcutsComponent', () => {
  let component: ChatShortcutsComponent;
  let fixture: ComponentFixture<ChatShortcutsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatShortcutsComponent]
    });
    fixture = TestBed.createComponent(ChatShortcutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
