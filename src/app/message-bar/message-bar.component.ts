import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmojiPickerDialogComponent } from '../emoji-picker-dialog/emoji-picker-dialog.component';
import { CommonModule } from '@angular/common';
import { MainService } from '../services/main.service';
import { FilePickerComponent } from '../file-picker/file-picker.component';


export interface MessageContent {
  content: string,
  attachment: File | undefined,
}
@Component({
  selector: 'app-message-bar',
  standalone: true,
  imports: [FormsModule, EmojiPickerDialogComponent, CommonModule, FilePickerComponent],
  templateUrl: './message-bar.component.html',
  styleUrl: './message-bar.component.scss'
})
export class MessageBarComponent {
  @Output() messageContent = new EventEmitter<MessageContent>();
  @Input() disabled!: boolean;
  @Input() enableFilePicker: boolean = true;
  @ViewChild('picker') picker!: ElementRef;
  @ViewChild('myInput') myInput!: ElementRef;
  inputContent: string = '';
  selectedFile: File | undefined;
  showEmojiPicker: boolean = false;

  constructor(
    public mainService: MainService,
  ) {
    this.setupClickListener();
  }

  sendMsg() {
    if (this.inputContent.trim()) {
      const messageContent: MessageContent = {
        content: this.inputContent,
        attachment: this.selectedFile,
      }
      this.messageContent.emit(messageContent);
    }
    this.selectedFile = undefined;
    this.inputContent = '';
  }

  removeAttachment(){
    this.selectedFile = undefined;
  }

  typeEmoji($event: any) {
    this.inputContent += $event.character;
  }

  private setupClickListener() {
    document.addEventListener('click', () => {
      this.showEmojiPicker = false;
    });
  }

  openEmojiPicker() {
    setTimeout(() => {
      this.showEmojiPicker = true;
    }, 1);
  }

  handleImg(event: any) {
    const file: File = event.target.files[0];
    if (file && this.checkForFormat(file)) {
      this.selectedFile = file;
    } else {
      alert('Only JPG, JPEG, PNG, PDF and max 5mb accepted!');
    }
  }

  /**
   * Checks if the selected file is in a valid image format (JPEG or PNG).
   * @param {File} file - The file to be checked.
   * @returns {boolean} - Returns true if the file format is valid (JPEG or PNG), otherwise false.
   */
  checkForFormat(file: File): boolean {
    return (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') && file.size < 2000000;// 2mb upload maximum
  }
}