import { Injectable } from '@angular/core';
import { Channel } from './channel.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { MainService } from './main.service';

export interface User {
  id?: number,
  username: string;
  email: string,
  picture: string | null,
  password?: string,
  is_online: boolean,
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userUrl: string = environment.baseUrl + 'users/';
  chatMembers: number[] = [];
  users: User[] = [];
  userToShow: User | undefined;

  constructor(
    private authService: AuthService,
    private mainService: MainService,
    private http: HttpClient
  ) { }

  async getUsers() {
    try {
      this.users = await firstValueFrom(this.fetchUsers());
    } catch (error) {
      this.mainService.popupLog('Error by fetching users' ,true);
    }
    
    this.mainService.userFetchingDone = true;
    this.mainService.deactivateLoader();
  }

  fetchUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl);
  }

  getUser(userId: number) {
    return this.users.find(obj => obj.id === userId) as User;
  }

  getInterlocutor(chatToCheck: Channel) {
    if (chatToCheck.members.length === 1 && chatToCheck.members.includes(this.authService.currentUser.id)) {
      return this.authService.currentUser as User;
    } else {
      const interlocutorId = chatToCheck!.members.find(obj => obj !== this.authService.currentUser.id);
      const interlocutor = this.getUser(interlocutorId!);
      return interlocutor as User;
    }
  }

  isOnline(channel: Channel) {
    const interlocutor = this.getInterlocutor(channel);
    return interlocutor.is_online;
  }
}