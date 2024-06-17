import { Component } from '@angular/core';
import { CloseComponent } from '../svgs/close/close.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CloseComponent, CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
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
