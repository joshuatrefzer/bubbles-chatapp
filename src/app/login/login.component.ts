import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MainService } from '../services/main.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  hide: boolean = false;
  loginForm: FormGroup
  bubbles: any[] = [];

  constructor(
    private router: Router,
    private mainService: MainService,
    private authService: AuthService,
    private channelService: ChannelService,
  ) {
    this.mainService.setTheme();
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(5)]),
      password: new FormControl('', [Validators.required, Validators.minLength(5)])
    });
    this.fillBubbles();
  }

  fillBubbles() {
    for (let i = 0; i < 30; i++) {
      this.bubbles.push(i);
    }
  }

  navigateTo(path: string) {
    this.hide = true;
    setTimeout(() => {
      this.router.navigate([path]);
    }, 300);
  }

  guestLogin() {
    this.channelService.setCurrentChannel();
    this.mainService.loader = true;
    const formData = new FormData();
    formData.append('username', this.authService.guestUser.username);
    if (this.authService.guestUser.password) {
      formData.append('password', this.authService.guestUser.password);
    }
    this.mainService.loader = true;
    this.authService.logIn(formData);
  }

  submit() {
    this.channelService.setCurrentChannel();
    if (this.loginForm.valid) {
      const formData = new FormData();
      formData.append('username', this.loginForm.get('username')?.value),
        formData.append('password', this.loginForm.get('password')?.value)
      this.mainService.loader = true;
      this.authService.logIn(formData);
    } else {
      this.mainService.popupLog('Please fill the form with valid data!', true)
    }
  }

  //**************FORM CONTROL ******/
  isFormValid() {
    return this.loginForm.valid;
  }

  emailError(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.errors?.['email'] && this.dirtyTouched(field);
    }
  }

  getField(key: string) {
    let myForm = this.loginForm;
    let field = myForm?.get(key);
    return field;
  }

  dirtyTouched(field: any) {
    return (field.dirty ||
      field.touched);
  }

  isInvalid(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.invalid &&
        this.dirtyTouched(field);
    } else {
      return false;
    }
  }

  isValidInput(key: string) {
    const field = this.getField(key);
    if (field) {
      return !this.isInvalid(key) && field.valid;
    } else {
      return false;
    }
  }

  requiredErrors(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.errors?.['required'] &&
        this.dirtyTouched(field);
    } else {
      return false;
    }
  }

  minLengthError(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.errors?.['minlength'];
    } else {
      return false;
    }
  }

}