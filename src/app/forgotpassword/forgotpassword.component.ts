import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.scss'
})
export class ForgotpasswordComponent {
  hide:boolean = false;
  forgotPasswordForm:FormGroup;

  constructor(private router: Router, private authService: AuthService, private mainService:MainService, private http: HttpClient){
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });

    if (this.authService.isUserLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  navigateTo(path:string){
    this.hide = true;
    setTimeout(() => {
      this.router.navigate([path]);
    }, 300);
  }

  reset() {
    if (this.forgotPasswordForm.valid) {
      const url = environment.baseUrl + 'password_reset/';
      const formData = new FormData();
      formData.append('email', this.forgotPasswordForm.get('email')?.value);
      this.resetPasswordRequest(url, formData);
    } else {
      this.mainService.popupLog('Please fill the field with a valid email adress', true);
    }
  }

    /**
  * Sends a POST request to the password reset endpoint with the provided email address.
  *
  * This function takes a URL and a FormData object containing the email address. It then:
  *  - Sets a loader indicator to true using `this.auth.loader`.
  *  - Makes a POST request to the URL with the FormData.
  *  - On success, hides the loader, displays a success message using `ps.messagePopup`, and resets the email form.
  *  - On error, hides the loader, and displays an error message using `ps.errorPopup`.
  *
  * @param {string} url - The URL of the password reset endpoint.
  * @param {FormData} formData - A FormData object containing the email address (`email`).
  */
    resetPasswordRequest(url: string, formData: FormData) {
      this.mainService.loader = true;
      this.http.post(url, formData).subscribe(res => {
        this.mainService.loader = false;
        this.mainService.popupLog('Please check your mail! We`ve sent you a reset link', false);
        this.forgotPasswordForm.reset();
      }, error => {
        this.mainService.loader = false;
        this.mainService.popupLog('The request to reset your password failed', true);
      });
    }
  



  //*****FORM CONTROL */

  isFormValid() {
    return this.forgotPasswordForm.valid;
  }

  emailError(key:string){
    const field = this.getField(key);
    if (field) {
      return field.errors?.['email'] && this.dirtyTouched(field);
    }
  }

  getField(key:string){
    let myForm = this.forgotPasswordForm;
    let field = myForm?.get(key);
    return field;
  }

  dirtyTouched(field:any){
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


  isValidInput(key: string){
    const field = this.getField(key);
    if (field) {
      return !this.isInvalid(key) && field.valid;
    } else {
      return false;
    }
  }


  requiredErrors(key:string){
    const field = this.getField(key);
    if (field) {
      return field.errors?.['required'] && 
      this.dirtyTouched(field);
    } else {
      return false;
    }
  }
}
