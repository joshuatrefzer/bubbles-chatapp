import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { MainService } from './main.service';
import { Router } from '@angular/router';
import { mainService } from './data.service';

export interface CurrentUser {
  id: number,
  username: string,
  email: string,
  password?: string
  picture: null | string
  is_online: boolean;
}

interface LoginResponse {
  token: string;
  user: CurrentUser
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: CurrentUser;
  guestUser: CurrentUser = {
    id: 0,
    username: 'Guest',
    password: 'TestUser123',
    email: 'guest@mailinator.com',
    is_online: false,
    picture: null
  }

  constructor(
    private http: HttpClient,
    private mainService: MainService,
    private router: Router,
  ) {
    this.currentUser = this.getCurrentUser();
  }

  isUserLoggedIn() {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  getToken() {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    } else {
      return false;
    }
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  setUser(user: object) {
    const userToString = JSON.stringify(user);
    localStorage.setItem('currentUser', userToString);
  }

  getCurrentUser() {
    const userString = localStorage.getItem('currentUser');
    if (!userString) return false;
    else {
      let user = JSON.parse(userString);
      return user;
    }
  }

  getImg() {
    if (this.currentUser.picture) {
      return environment.baseUrl.slice(0, -1) + this.currentUser.picture;
    }
    return 'assets/img/profile_placeholder.svg';
  }

  logIn(formData: FormData) {
    const url = environment.baseUrl + 'login';
    this.http.post<LoginResponse>(url, formData).pipe(take(1)).subscribe(
      {
        next: (response) => {
          if (response && response.token) {
            this.setToken(response.token);
            this.setUser(response.user);
            this.currentUser = response.user;
            this.router.navigate(['/home']);
            this.mainService.loader = false;
          }
          this.mainService.popupLog('Welcome ' + response.user.username, false);
          this.mainService.loader = false;
        },
        error: e => {
          this.mainService.popupLog('Login failed..', true);
          console.log('Login Error:', e);
          this.mainService.loader = false;
        },
      }
    );
  }

  isGuestUser() {
    if (this.currentUser?.email === this.guestUser.email &&
      this.currentUser?.username === this.guestUser.username) {
      return true;
    } else {
      return false;
    }
  }
}