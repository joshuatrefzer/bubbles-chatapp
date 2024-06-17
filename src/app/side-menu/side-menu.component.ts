import { Component } from '@angular/core';
import { ChannelPreviewComponent } from '../channel-preview/channel-preview.component';
import { ChannelService } from '../services/channel.service';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';
import { PlusComponent } from '../svgs/plus/plus.component';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [ChannelPreviewComponent, PlusComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {

  constructor(
    public channelService: ChannelService,
    public messageService: MessageService,
    public authService: AuthService,
    public mainService: MainService
  ) { }

  newChannelDialog() {
    this.mainService.showPopup = true;
    this.mainService.addChannelPopup = true;
  }

  openNewMessage() {
    if (window.innerWidth < 845)
      this.mainService.sideMenuOpen = false;
    this.mainService.showNewMessageSearch = true;
    this.mainService.threadOpen = false;
  }
}