import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';
import { FolderPage } from './folder.page';
import { FilesComponent } from '../pages/files/files.component';
import { SharedWithMeComponent } from '../pages/shared-with-me/shared-with-me.component';
import { FileExplorerComponent } from '../file-explorer/file-explorer.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule
  ],
  declarations: [
    FolderPage,
    FilesComponent,
    SharedWithMeComponent,    
    FileExplorerComponent
  ]
})
export class FolderPageModule {}
