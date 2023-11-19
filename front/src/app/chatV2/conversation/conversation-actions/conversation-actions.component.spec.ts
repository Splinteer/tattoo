import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationActionsComponent } from './conversation-actions.component';

describe('ConversationActionsComponent', () => {
  let component: ConversationActionsComponent;
  let fixture: ComponentFixture<ConversationActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
