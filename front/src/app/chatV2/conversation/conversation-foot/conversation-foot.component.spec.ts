import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationFootComponent } from './conversation-foot.component';

describe('ConversationFootComponent', () => {
  let component: ConversationFootComponent;
  let fixture: ComponentFixture<ConversationFootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationFootComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationFootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
