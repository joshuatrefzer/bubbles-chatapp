import { Component, EventEmitter, Output } from '@angular/core';
import { MainService } from '../services/main.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-picker.component.html',
  styleUrl: './file-picker.component.scss'
})
export class FilePickerComponent {
  @Output() newPicture = new EventEmitter<any>();

  constructor(
    public mainService: MainService,
    public authService: AuthService,
  ) { }

  /**
   * The selected file.
   * @type {File}
   */
  onImgSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && this.checkForFormat(file)) {
      this.newPicture.emit(file);
    } else {
      alert('Only JPG, JPEG and PNG and max 5mb accepted!');
    }
  }

  /**
   * Checks if the selected file is in a valid image format (JPEG or PNG).
   * @param {File} file - The file to be checked.
   * @returns {boolean} - Returns true if the file format is valid (JPEG or PNG), otherwise false.
   */
  checkForFormat(file: File): boolean {
    return (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') && file.size < 2000000;// 2mb upload maximum
  }
}
