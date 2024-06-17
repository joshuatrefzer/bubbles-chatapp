import { CommonModule, NgSwitchCase } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel, ChannelService } from '../services/channel.service';
import { User, UserService } from '../services/user.service';
import { MainService } from '../services/main.service';
import { FilePickerComponent } from '../file-picker/file-picker.component';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SearchComponent } from '../search/search.component';
import { AuthService } from '../services/auth.service';
import { CloseComponent } from '../svgs/close/close.component';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [NgSwitchCase, CommonModule, FormsModule, FilePickerComponent, SearchComponent, CloseComponent],
  templateUrl: './create-channel-dialog.component.html',
  styleUrl: './create-channel-dialog.component.scss'
})
export class CreateChannelDialogComponent {
  addMembers: boolean = false;
  addAllMembers: boolean = false;
  channelMembers: User[] = [];
  selectedMembers: number[] = [];
  imgSelected: File | undefined;
  newChannel: Channel = {
    id: 0,
    name: '',
    description: '',
    members: [],
    is_channel: true,
    picture: 'assets/img/profile_placeholder.svg',
    read_by: [],
    hash: ''
  };

  constructor(
    private userService: UserService,
    public mainService: MainService,
    public channelService: ChannelService,
    private authService: AuthService,
    private http: HttpClient,
  ) { }

  addMemberToChannel() {
    if (this.addAllMembers) {
      this.selectedMembers = this.userService.users.map(obj => obj.id) as number[];
      this.newChannel.members = this.selectedMembers;
    } else {
      this.selectedMembers = this.channelMembers.map(obj => obj.id) as number[];
      if (!this.selectedMembers.includes(this.authService.currentUser.id))
        this.selectedMembers.push(this.authService.currentUser.id);
      this.newChannel.members = this.selectedMembers;
    }
    this.postChannel();
  }

  async postChannel() {
    const url = environment.baseUrl + 'channels/';
    const formData = new FormData();
    formData.append('name', this.newChannel.name);
    formData.append('description', this.newChannel.description || '');
    this.newChannel.members.forEach(memberId => {
      formData.append('members', memberId.toString());
    });
    formData.append('is_channel', this.newChannel.is_channel.toString());
    formData.append('picture', this.imgSelected || '');
    const response = await firstValueFrom(this.http.post(url, formData)) as Channel;
    this.updateLocal(response);
  }

  updateLocal(response: Channel){    
    this.channelService.chats.push(response);
    this.channelService.filterChats();
    this.mainService.closePopups();
    this.channelService.openChannel(response.id)
  }

  handleImg(file: File) {
    if (file)
      this.imgSelected = file;
    let reader = new FileReader();
    reader.onload = (event: any) => {
      if (event.target.readyState === FileReader.DONE) {
        const imageData = event.target.result;
        this.newChannel.picture = imageData;
      }
    };
    reader.readAsDataURL(file);
  }

  async uploadImg(file: File) { //not in use
    const url = environment.baseUrl + 'media/channel_pictures/' + file.name + '/';
    const formdata = new FormData();
    formdata.append('picture', file);
    try {
      const response = await firstValueFrom(this.http.post<Channel>(url, formdata));
    } catch (error) {
      this.mainService.popupLog('Error by uploading img' ,true);
    }
    
  }

  handleSelectedUsers(selectedUsers: User[]) {
    this.channelMembers = selectedUsers;
  }

  removeMember(member: User) {
    this.channelMembers.splice(this.channelMembers.indexOf(member), 1)
  }
}