import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MainService } from '../services/main.service';
import { SearchComponent } from '../search/search.component';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { SideMenuButtonComponent } from '../svgs/side-menu-button/side-menu-button.component';
import { ColorPickerComponent } from '../svgs/color-picker/color-picker.component';
import { UserService } from '../services/user.service';
import { ThemePickerComponent } from '../theme-picker/theme-picker.component';
import { ProfileComponent } from '../svgs/profile/profile.component';
import { windowWhen } from 'rxjs';
import { BubbleComponent } from '../svgs/bubble/bubble.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ThemePickerComponent, CommonModule, SearchComponent, FormsModule, SideMenuButtonComponent, ColorPickerComponent, ProfileComponent, BubbleComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  openMenu: boolean = false;

  constructor(
    public mainService: MainService,
    public authService: AuthService,
    private userService: UserService,
  ) { }

  openProfile() {
    this.userService.userToShow = this.authService.currentUser;
    this.mainService.showPopup = true;
    this.mainService.profilePopup = true;
  }

  toggleSideMenu() {
    if(window.innerWidth < 1260 && this.mainService.threadOpen === true){
      this.mainService.threadOpen = false;
    }
    this.mainService.sideMenuOpen = !this.mainService.sideMenuOpen;
  }

  showThemesPicker() {
    this.mainService.showThemes = !this.mainService.showThemes;
    if(this.mainService.showThemes){
        this.mainService.showColorPalette = !this.mainService.showThemes;  
    } else {
      setTimeout(() => {
        this.mainService.showColorPalette = !this.mainService.showThemes;
      }, 500);
    }
  }

  getScreenWidth(){
    return window.innerWidth > 500;
  }
}