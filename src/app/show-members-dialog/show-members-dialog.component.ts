import { Component } from '@angular/core';
import { Channel, ChannelService } from '../services/channel.service';
import { User, UserService } from '../services/user.service';
import { MainService } from '../services/main.service';
import { CommonModule } from '@angular/common';
import { CloseComponent } from '../svgs/close/close.component';
import { AddMemberComponent } from '../svgs/add-member/add-member.component';

@Component({
  selector: 'app-show-members-dialog',
  standalone: true,
  imports: [CommonModule, CloseComponent, AddMemberComponent],
  templateUrl: './show-members-dialog.component.html',
  styleUrl: './show-members-dialog.component.scss'
})
export class ShowMembersDialogComponent {
  currentChannel: Channel;
  currentMembers: User[] = [];

  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    public mainService: MainService,
  ) { 
    this.currentChannel = this.channelService.currentChannel;
    this.getMembers();
  }

  getMembers(){
    this.currentChannel.members.forEach((member) => {
      const user = this.userService.getUser(member);
      this.currentMembers.push(user);
    })
  }

  openAddMembers() {
    this.mainService.showMembersPopup = false;
    this.mainService.addMembersPopup = true;
  }
}