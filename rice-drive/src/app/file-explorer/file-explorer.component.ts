import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
})
export class FileExplorerComponent implements OnInit {
  files = [
    { name: 'Document 1', description: 'This is document 1' },
    { name: 'Document 2', description: 'This is document 2' },
    { name: 'Document 3', description: 'This is document 3' },
    // Add more files as needed
  ];

  constructor() {}

  ngOnInit() {}
}
