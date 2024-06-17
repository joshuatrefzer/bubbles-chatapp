import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedMessagesComponent } from './grouped-messages.component';

describe('GroupedMessagesComponent', () => {
  let component: GroupedMessagesComponent;
  let fixture: ComponentFixture<GroupedMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupedMessagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupedMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
