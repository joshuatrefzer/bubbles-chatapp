import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { take } from 'rxjs';
import { CurrentUser } from '../services/auth.service';
import { MainService } from '../services/main.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  hide: boolean = false;
  signUpForm: FormGroup;
  bubbles:any[]= [];

  constructor(private router: Router, private http: HttpClient, private mainService:MainService) {
    this.signUpForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(4)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });

    this.fillBubbles();
  }

  fillBubbles(){
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

  submit() {
    const url = environment.baseUrl + 'signup/';
    console.log(url);
    
    const formData = new FormData();
    formData.append('username', this.signUpForm.get('username')?.value);
    formData.append('email', this.signUpForm.get('email')?.value);
    formData.append('password', this.signUpForm.get('password')?.value);
  
    if (this.signUpForm.valid) {
      this.http.post(url, formData).pipe(take(1)).subscribe(
        {
          next: (data) => {
            this.mainService.popupLog('You have signed up successfully, you can now log in', false);
            this.signUpForm.reset();
          },
          error: e => {
            this.mainService.popupLog('Something went wrong', true);
          }
        }
      );
    }
  }



  /** FORM CONTROL */

  isFormValid() {
    return this.signUpForm.valid;
  }

  emailError(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.errors?.['email'] && this.dirtyTouched(field);
    }
  }

  getField(key: string) {
    let myForm = this.signUpForm;
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
