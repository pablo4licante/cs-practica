import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FolderPage } from './folder.page';
import { FilesComponent } from '../pages/files/files.component';
import { SharedWithMeComponent } from '../pages/shared-with-me/shared-with-me.component';

const routes: Routes = [
  {
    path: '',
    component: FolderPage,
    children: [
      {
        path: 'files',
        component: FilesComponent
      },
      {
        path: 'shared-with-me',
        component: SharedWithMeComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FolderPageRoutingModule {}
