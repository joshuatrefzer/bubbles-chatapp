import { Component } from '@angular/core';
import { CloseComponent } from '../svgs/close/close.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [CloseComponent, CommonModule],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  hide: boolean = false;

  constructor(
    private router: Router,
  ) { }

  navigateTo(path: string) {
    this.hide = true;
    setTimeout(() => {
      this.router.navigate([path]);
    }, 300);
  }
}
