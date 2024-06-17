import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MainService } from './services/main.service';
import { PopupManagerComponent } from './popup-manager/popup-manager.component';
import { LoaderComponent } from './loader/loader.component';
import { AuthService } from './services/auth.service';
import { ChannelService } from './services/channel.service';
import { ThemePickerComponent } from './theme-picker/theme-picker.component';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, CommonModule, PopupManagerComponent, LoaderComponent, ThemePickerComponent]
})
export class AppComponent implements OnInit {
  constructor(
    public mainService: MainService,
    public authService: AuthService,
    public channelService: ChannelService,
    private messageService: MessageService,
    private router: Router
  ) {
    mainService.setTheme();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = this.router.url;
        if (url.includes('/resetpassword') || url.includes('/forgotpassword') || url.includes('/success') || url.includes('/signup') || url.includes('/imprint') || url.includes('/privacypolicy')) {
          return
        } else {
          this.handleLogin();
        }
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 1260 && this.mainService.threadOpen === true) {
      this.mainService.sideMenuOpen = false;
    }
    if (event.target.innerWidth < 845) {
      this.mainService.sideMenuOpen = false;
      this.mainService.threadOpen = false;
    }
  }

  async handleLogin() {
    this.mainService.loader = true;
    if (this.authService.isUserLoggedIn() && localStorage.getItem('currentUser')) {
      this.router.navigate(['/home']);
      this.channelService.getChatsForUser();
    } else {
      this.channelService.resetData();
    }
  }

  ngOnInit(): void {
    // if (authService.currentUser) {
    //   this.router.navigate(['/home']);
    // } else {
    //   this.router.navigate(['/login']);
    // }

    // document.documentElement.style.setProperty('var(--color1)', 'lightgrey');
  }
}