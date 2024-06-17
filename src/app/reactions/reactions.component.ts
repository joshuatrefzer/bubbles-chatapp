import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../services/user.service';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reactions.component.html',
  styleUrl: './reactions.component.scss'
})
export class ReactionsComponent implements OnInit {
  private addedReactionSubscription!: Subscription;
  @Output() addQuickReaction = new EventEmitter<string>();
  @Input() addedReaction!: Observable<void>;
  @Input() msgReactions!: any[];
  @Input() myMessage!: boolean;
  allReactions: any[] = [];
  reactionsPreview: any[] = [];
  expandReaction: boolean = false;

  ngOnDestroy() {
    this.addedReactionSubscription.unsubscribe();
  }

  constructor(
    public userService: UserService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.prepareReactions();
    this.addedReactionSubscription = this.addedReaction.subscribe(() => this.prepareReactions());
  }

  prepareReactions() {
    this.allReactions = [];
    this.msgReactions.forEach((reaction) => {
      if (this.allReactions.some(obj => obj.reaction === reaction.emoji)) {
        const index = this.allReactions.findIndex(obj => obj.reaction === reaction.emoji);
        this.allReactions[index].count++;
      } else {
        this.allReactions.push({
          reaction: reaction.emoji,
          count: 1,
        });
      }
    })
    this.allReactions.sort((a, b) => a.reaction - b.reaction);
  }

  sortReactions() { //not in use
    this.allReactions.sort((a, b) => a.reaction - b.reaction);
    // this.reactionsPreview = this.allReactions.slice(0, 3);

    // this.msgReactions.sort((a, b) => a.user - b.user);
  }

  quickReaction(reaction: string) {
    this.addQuickReaction.next(reaction)
  }

  myReaction(reaction: string) {
    // debugger;
   return this.msgReactions.some(obj => obj.emoji === reaction && obj.user === this.authService.currentUser.id);
  }
}