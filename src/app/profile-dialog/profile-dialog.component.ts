import { Component, OnDestroy, OnInit } from '@angular/core';
import { MainService } from '../services/main.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, CurrentUser } from '../services/auth.service';
import { FilePickerComponent } from '../file-picker/file-picker.component';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User, UserService } from '../services/user.service';
import { CloseComponent } from '../svgs/close/close.component';
import { MailComponent } from '../svgs/mail/mail.component';
import { ChannelService } from '../services/channel.service';
import { mainService } from '../services/data.service';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [CommonModule, FilePickerComponent, CloseComponent, MailComponent],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss'
})
export class ProfileDialogComponent implements OnDestroy {
  user: User | undefined;

  constructor(
    public mainService: MainService,
    private router: Router,
    public authService: AuthService,
    private http: HttpClient,
    public userService: UserService,
    public channelService: ChannelService,
  ) {
    this.user = userService.userToShow;    
  }

  async logout() {
    this.mainService.loader = true;
    if (!this.authService.isGuestUser()) {
      const url = environment.baseUrl + 'logout';
      const token = {
        token: localStorage.getItem('token')
      }
      await firstValueFrom(this.http.post(url, token));
    }

    this.channelService.resetData();
    this.router.navigate(['/login']);
    this.mainService.loader = false;
    this.mainService.closePopups();
  }

  async uploadImg(file: File) {
    const url = environment.baseUrl + 'upload_img/' + this.authService.currentUser.id + '/';
    const formdata = new FormData();
    formdata.append('picture', file);
    const response = await firstValueFrom(this.http.post<CurrentUser>(url, formdata));
    this.updateLocal(response);
  }

  updateLocal(response: CurrentUser) {
    this.user = response;
    this.authService.currentUser = response;
    this.authService.setUser(response);
    this.updateUsers(response as User);
    this.mainService.renderGroupMember.emit();
  }

  updateUsers(response: User) {
    const index = this.userService.users.findIndex(obj => obj.id === response.id);
    this.userService.users.splice(index, 1, response);
  }

  sendDirectMessage() {
    if (this.userService.userToShow)
      this.channelService.selectDirectMessage(this.userService.userToShow);
    this.mainService.closePopups();
  }

  ngOnDestroy(): void {
    this.userService.userToShow = undefined;
  }
}