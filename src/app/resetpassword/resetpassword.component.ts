import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss'
})

export class ResetpasswordComponent {
  token: string = '';
  newPassword: string = '';

  pwResetForm: FormGroup;

  constructor(private route: ActivatedRoute, private http: HttpClient,  private router: Router, private auth: AuthService, private mainService: MainService) {
    this.pwResetForm = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(8), this.passwordValidator.bind(this)]),
      repeatpassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });

    if (this.auth.isUserLoggedIn()) {
      this.router.navigate(['/home'])
    }

  }

  /**
   * When the Site is called with the token inside the url, the function separates the token parameter from the url.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }


  /**
   * navigates to login, it is calld after the password is reset
   */
  directToLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * 
   * @returns a valid formdata for passwordreset. If form isn't valid, it returns false
   */
  getFormData() {
    if (this.isFormValid()) {
      const formData = new FormData();
      formData.append('password', this.pwResetForm.get('password')?.value);
      formData.append('token', this.token);
      return formData;
    } else {
      this.mainService.popupLog('Error by reset your password. Do you have filled all fields correctly?', true);
      return false;
    }
  }

  /**
   * 
   * @returns only if data is not in the expected format and not valid. So we don't send it as a request to prevent errors on server side.
   */
  resetPassword(): void {
    const url = environment.baseUrl + 'password_reset/confirm/';

    const data = this.getFormData();
    if (!data) return
    this.http.post<any>(url, data).subscribe(response => {
      this.mainService.popupLog('Password reset was successful!', false);
      this.pwResetForm.reset();
    }, error => {
      this.mainService.popupLog('Your request failed, maybe your token is not vaild anymore.', true);
      console.error(error);
    });
  }

  /**
   * 
   * @returns if active form is valid
   */
  isFormValid() {
    const myForm = this.whichFormToUse();
    return myForm?.valid;
  }


  /**
   * 
   * @param control is formcontrol from angular to observe the fields input
   * @returns if password is valid, or not
   */
  passwordValidator(control: FormControl): { [key: string]: boolean } | null {
    const value: string = control.value || '';
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const valid = hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

    return valid ? null : { 'invalidPassword': true };
  }


  /**
 * Checks for a "required" validation error on a field identified by `key`.
 * Returns `true` if the field has a "required" error and user interacted (dirty/touched), `false` otherwise.
 */
  emailError(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.errors?.['email'] && this.dirtyTouched(field);
    }
  }


  /**
 * Retrieves a field from the currently used form (`pwResetForm`) based on the provided `key`.
 * Returns the field object if found, `undefined` otherwise.
 */
  getField(key: string) {
    let myForm = this.whichFormToUse();
    let field = myForm?.get(key);
    return field;
  }

  /**
 * Checks if a form field is either dirty (modified) or touched (focused).
 * Returns `true` if dirty or touched, `false` otherwise.
 */
  dirtyTouched(field: any) {
    return (field.dirty || field.touched);
  }

  /**
 * Checks if a field identified by `key` is invalid and has user interaction (dirty/touched).
 * Returns `true` if the field is invalid with user interaction, `false` otherwise.
 */
  isInvalid(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.invalid && this.dirtyTouched(field);
    } else {
      return false;
    }
  }


  /**
 * Checks if a field identified by `key` has valid input.
 * Returns `true` if the field is not invalid and has a valid value, `false` otherwise.
 */
  isValidInput(key: string) {
    const field = this.getField(key);
    if (field) {
      return !this.isInvalid(key) && field.valid;
    } else {
      return false;
    }
  }


  /**
 * Checks for a "required" validation error on a field identified by `key`.
 * Returns `true` if the field has a "required" error and user interacted (dirty/touched), `false` otherwise.
 */
  requiredErrors(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.errors?.['required'] && this.dirtyTouched(field);
    } else {
      return false;
    }
  }


  /**
 * Checks for a "minlength" validation error on a field identified by `key`.
 * Returns the error object if it exists, `false` otherwise.
 */
  minLengthError(key: string) {
    const field = this.getField(key);
    if (field) {
      return field.errors?.['minlength'];
    } else {
      return false;
    }
  }


  /**
 * Compares password and confirm password fields for matching values and minimum length.
 * 
 * This function retrieves the values of two form fields identified by `repeat` and `pw`.
 * It then checks if:
 *  - Both fields have values.
 *  - The password values match.
 *  - The password length is greater than 1.
 * 
 * Returns `true` if all conditions are met (matching passwords with minimum length), `false` otherwise.
 */
  passwordRepeat(repeat: string, pw: string) {
    const repeatedPW = this.pwResetForm.get(repeat)?.value;
    const password = this.pwResetForm.get(pw)?.value;
    if (repeatedPW && password) {
      return repeatedPW === password && repeatedPW.length > 1;
    } else {
      return false;
    }
  }


  /**
   * Assumes `pwResetForm` is the form to be used and returns it.
   */
  whichFormToUse() {
    let myform = this.pwResetForm;

    return myform;
  }

}
