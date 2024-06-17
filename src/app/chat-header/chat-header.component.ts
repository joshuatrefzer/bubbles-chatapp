import { Component, Input, OnInit } from '@angular/core';
import { Channel, ChannelService } from '../services/channel.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { MainService } from '../services/main.service';
import { CloseComponent } from '../svgs/close/close.component';
import { AddMemberComponent } from '../svgs/add-member/add-member.component';
import { mainService } from '../services/data.service';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, CloseComponent, AddMemberComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent implements OnInit {
  @Input() currentChat!: Channel;
  userImgArray: string[] = [];
  groupMemberCount: number = 0;
  updateHeader = true;
  channelPicture: string = 'assets/img/profile_placeholder.svg';

  constructor(
    private userService: UserService,
    private mainService: MainService,
    private channelService: ChannelService,
  ) {
    this.mainService.renderGroupMember.subscribe(() => {
      this.renderGroupMember();
    })
  }

  ngOnInit(): void {
    if (this.currentChat.is_channel === true) {
      this.renderGroupMember();
    }
  }

  addMemberDialog() {
    this.mainService.showPopup = true;
    this.mainService.addMembersPopup = true;
  }

  showMemberDialog() {
    this.mainService.showPopup = true;
    this.mainService.showMembersPopup = true;
  }

  renderGroupMember() {
    this.userImgArray = [];
    this.groupMemberCount = 0;
    this.currentChat.members.forEach((memberId) => {
      const userImg = this.userService.getUser(memberId).picture;

      if (this.userImgArray.length < 3) {
        this.userImgArray.push(this.channelService.getImg(userImg));
      } else {
        this.groupMemberCount++;
      }
    })
  }

  getName() {
    if (this.currentChat.is_channel === true) {
      return this.currentChat.name;
    } else {
      return this.userService.getInterlocutor(this.currentChat)?.username
    }
  }

  getPicture() {
    if (this.currentChat.picture !== null) {
      return this.channelService.getImg(this.currentChat.picture);
    } else if (this.currentChat.is_channel === false) {
      const interloc = this.userService.getInterlocutor(this.currentChat);
      return this.channelService.getImg(interloc.picture);
    } else {
      return 'assets/img/profile_placeholder.svg'
    }
  }

  isOnline() {
    return this.userService.isOnline(this.currentChat as Channel);
  }

  openChannelDetails() {
    this.mainService.showPopup = true;
    if (this.currentChat.is_channel) {
      this.mainService.editChannelPopup = true;
    } else {
      this.userService.userToShow = this.userService.getInterlocutor(this.currentChat);
      this.mainService.profilePopup = true;
    }
  }
  mobile() {
    return window.innerWidth < 500;
  }
}