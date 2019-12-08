import { Component, OnInit } from '@angular/core';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'pepper';

  cuisines: AngularFireList<any>;
  cuisines$: Observable<any[]>;

  restaurant: AngularFireObject<any>;
  restaurant$: Observable<any>;

  restaurants: AngularFireList<any>;
  restaurants$: Observable<any[]>;

  constructor(private af: AngularFireDatabase) {
  }

  ngOnInit(): void {
    this.cuisines = this.af.list('/cuisines');
    this.cuisines$ = this.cuisines.snapshotChanges();

    this.restaurant = this.af.object('/restaurant');
    this.restaurant$ = this.restaurant.valueChanges();

    this.restaurants = this.af.list('/restaurants');
    this.restaurants$ = this.restaurants.valueChanges()
      .pipe(
        map(restaurants => {
          console.log("BEFORE MAP", restaurants);

          const restaurants_new = restaurants.map(restaurant =>
            ({ cuisineType: (this.af.object('/cuisines/' + restaurant.cuisine).valueChanges()),
              ...restaurant })
          );

          console.log("AFTER MAP", restaurants_new);
          return restaurants_new;
        })
      );
  }

  add() {
    this.cuisines.push({
      name: 'Asian'
    });
  }

  update() {
    this.af.object('/restaurant').update({
      name: 'New Name',
      rating: 5
    });

    // this.af.object('/favorite/1/10').set(true);
  }

  remove() {
    this.af.object('/restaurant').remove()
      .then(x => console.log("SUCCESS"))
      .catch(error => console.log("ERROR ", error));
  }

}
