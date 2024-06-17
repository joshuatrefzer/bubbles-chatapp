import { Component } from '@angular/core';
import { MainService } from '../services/main.service';
import { FilePickerComponent } from '../file-picker/file-picker.component';
import { Channel, ChannelService } from '../services/channel.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { CloseComponent } from '../svgs/close/close.component';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [FilePickerComponent, FormsModule, CloseComponent],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {
  editName: boolean = false;
  editDesc: boolean = false;
  currentChannel: Channel;
  updatedChannel!: Channel;
  imgSelected: File | undefined;
  url: string = '';

  constructor(
    public mainService: MainService,
    public channelService: ChannelService,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    this.currentChannel = channelService.currentChannel;
    this.updatedChannel = {
      id: this.currentChannel.id,
      name: this.currentChannel.name,
      description: this.currentChannel.description,
      members: this.currentChannel.members,
      is_channel: true,
      read_by: this.currentChannel.read_by,
      hash: this.currentChannel.hash,
      picture: this.channelService.getImg(this.currentChannel.picture),
    }
    this.url = environment.baseUrl + 'channels/' + this.currentChannel.id + '/'
  }

  handleImg(file: File) {
    if (file) {
      this.imgSelected = file;
    }
    const reader = new FileReader();
    reader.onload = (event: any) => {
      if (event.target.readyState === FileReader.DONE) {
        const imageData = event.target.result;
        this.updatedChannel.picture = imageData;
      }
    };
    reader.readAsDataURL(file);
  }

  async leaveChannel() {
    // debugger;
    console.log('members anfang', this.updatedChannel);
    
    const index = this.updatedChannel.members.findIndex(obj => obj === this.authService.currentUser.id);

    this.updatedChannel.members.splice(index, 1);
    console.log('members mitte', this.updatedChannel);

    const data = {
      members: this.updatedChannel.members
    }
    // const formData = new FormData();
    // this.updatedChannel.members.forEach(memberId => {
    //   formData.append('members', memberId.toString());
    // });
    const response = await firstValueFrom(this.http.patch<Channel>(this.url, data));
    console.log('response', response);
    this.removeChannel();
  }

  removeChannel() {
    localStorage.removeItem('currentChannel');
    const index = this.channelService.channels.findIndex(obj => obj.id === this.updatedChannel.id);
    this.channelService.channels.splice(index, 1);
    this.channelService.setCurrentChannel();
    this.mainService.closePopups();
    // window.location.reload();
  }

  async patchChannel() {
    const formData = new FormData();
    if (this.imgSelected)
      formData.append('picture', this.imgSelected);
    if (this.updatedChannel.name)
      formData.append('name', this.updatedChannel.name);
    if (this.updatedChannel.description)
      formData.append('description', this.updatedChannel.description);
    const response = await firstValueFrom(this.http.patch<Channel>(this.url, formData));
    localStorage.setItem('currentChannel', JSON.stringify(response));
    await this.channelService.getChatsForUser();
    this.channelService.openChannel(this.updatedChannel.id);
    this.mainService.closePopups();
  }

  pushToLocalArray(response: Channel) {
    const index = this.channelService.chats.findIndex(obj => obj.id === response.id);
    this.channelService.chats.splice(index, 1, response);
    this.channelService.filterChats();
  }
}