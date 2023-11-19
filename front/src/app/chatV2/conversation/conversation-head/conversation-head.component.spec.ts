import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationHeadComponent } from './conversation-head.component';

describe('ConversationHeadComponent', () => {
  let component: ConversationHeadComponent;
  let fixture: ComponentFixture<ConversationHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationHeadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
