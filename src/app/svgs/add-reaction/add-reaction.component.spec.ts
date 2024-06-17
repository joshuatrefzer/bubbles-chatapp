import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReactionComponent } from './add-reaction.component';

describe('AddReactionComponent', () => {
  let component: AddReactionComponent;
  let fixture: ComponentFixture<AddReactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddReactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
