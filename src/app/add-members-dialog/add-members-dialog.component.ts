import { Component } from '@angular/core';
import { MainService } from '../services/main.service';
import { Channel, ChannelService } from '../services/channel.service';
import { User, UserService } from '../services/user.service';
import { SearchComponent } from '../search/search.component';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { CloseComponent } from '../svgs/close/close.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [SearchComponent, CloseComponent],
  templateUrl: './add-members-dialog.component.html',
  styleUrl: './add-members-dialog.component.scss'
})
export class AddMembersDialogComponent {
  currentChannel!: Channel;
  channelMembers: User[] = [];
  channelMembersId: number[] = [];

  constructor(
    public mainService: MainService,
    public channelService: ChannelService,
    private userService: UserService,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.currentChannel = channelService.currentChannel;
    this.prepareChannelMembers();
  }

  prepareChannelMembers() {
    for (const memberId of this.currentChannel.members) {
      this.channelMembers.push(this.userService.getUser(memberId))
    }
  }

  handleSelectedUsers(selectedUsers: User[]) {
    this.channelMembers = selectedUsers;
  }

  removeMember(member: User) {
    this.channelMembers.splice(this.channelMembers.indexOf(member), 1)
  }

  async addMembers() {
    debugger;
    const url = environment.baseUrl + 'channels/' + this.currentChannel.id + '/';

    for (const member of this.channelMembers) {
      if (member.id)
        this.channelMembersId.push(member.id);
    }

    const data = {
      members: this.channelMembers
    }
    
    const response = await firstValueFrom(this.http.patch<Channel>(url, data));

    if (!response.members.some(obj => obj === this.authService.currentUser.id)) {
      localStorage.removeItem('currentChannel');
    } else {
      localStorage.setItem('currentChannel', JSON.stringify(response));
    }
    await this.channelService.getChatsForUser();
    this.channelService.setCurrentChannel();
    if (this.currentChannel.id)
      this.channelService.openChannel(this.currentChannel.id);
    this.mainService.closePopups();
  }
}