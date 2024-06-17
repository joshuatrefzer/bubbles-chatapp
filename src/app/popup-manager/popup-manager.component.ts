import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MainService } from '../services/main.service';
import { CreateChannelDialogComponent } from '../create-channel-dialog/create-channel-dialog.component';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { AddMembersDialogComponent } from '../add-members-dialog/add-members-dialog.component';
import { ShowMembersDialogComponent } from '../show-members-dialog/show-members-dialog.component';
import { EditChannelDialogComponent } from '../edit-channel-dialog/edit-channel-dialog.component';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-popup-manager',
  standalone: true,
  imports: [CommonModule, PopupComponent, CreateChannelDialogComponent, ProfileDialogComponent, AddMembersDialogComponent, ShowMembersDialogComponent, EditChannelDialogComponent],
  templateUrl: './popup-manager.component.html',
  styleUrl: './popup-manager.component.scss'
})
export class PopupManagerComponent {

  constructor(
    public mainService: MainService
  ) { }
}
