import { Component, OnInit } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'pepper';
  cuisines$: Observable<any[]>;
  restaurant$: Observable<any>;

  constructor(private af: AngularFireDatabase) {

  }

  ngOnInit(): void {
    this.cuisines$ = this.af.list('/cuisines').snapshotChanges();
    this.restaurant$ = this.af.object('/restaurant').valueChanges();
  }
}
