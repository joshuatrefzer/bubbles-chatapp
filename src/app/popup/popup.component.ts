import { Component, Input } from '@angular/core';
import { MainService } from '../services/main.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
  error: boolean = this.mainService.popupIsError;


  constructor(
    public mainService: MainService,
  ) { }
}
