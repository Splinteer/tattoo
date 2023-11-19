import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationDetailsPanelComponent } from './conversation-details-panel.component';

describe('ConversationDetailsPanelComponent', () => {
  let component: ConversationDetailsPanelComponent;
  let fixture: ComponentFixture<ConversationDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationDetailsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
