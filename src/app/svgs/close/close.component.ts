import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-close',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './close.component.html',
  styleUrl: './close.component.scss'
})
export class CloseComponent {
  @Input() removeMember:boolean = false;

}
