import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainService } from '../services/main.service';

@Component({
  selector: 'app-emoji-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emoji-picker-dialog.component.html',
  styleUrl: './emoji-picker-dialog.component.scss'
})
export class EmojiPickerDialogComponent {

  constructor(
    public mainService: MainService,
  ) {
    this.showCategory('smileys-emotion');
  }

  @Output() newEmoji = new EventEmitter<string>();

  emojiList: Array<any> = [];
  filteredEmojiList = [];
  searchValue: string = '';
  currentCategory: string = 'smileys-emotion';
  categoryIcons = [
    'assets/img/smile_icon.svg',
    'assets/img/hand_icon.svg',
    '',
    'assets/img/raven_icon.svg',
    'assets/img/burger_icon.svg',
    'assets/img/car_icon.svg',
    'assets/img/football_icon.svg',
    'assets/img/lightbulb_icon.svg',
    'assets/img/heart_icon.svg',
    'assets/img/flag_icon.svg',
  ];

  /**
 * Emits the selected emoji to the parent component using the newEmoji EventEmitter.
 * @param {string} emoji - The selected emoji.
 */
  public showInInput(emoji: string): void {
    this.newEmoji.emit(emoji);
  }

  /**
  * Filters the list of emojis based on the searchValue.
  */
  search() {
    const filteredList = this.mainService.allEmojis.filter(emoji => {
      return emoji.unicodeName.toLowerCase().includes(this.searchValue.toLowerCase());
    });
    this.emojiList = filteredList;
  }

  showCategory(category: string) {
    this.emojiList = this.mainService.allEmojis.filter(emoji => emoji.group == category);
    this.currentCategory = category;
  }

  stopProp($event: { stopPropagation: () => void; }) {
    $event.stopPropagation();
  }
}