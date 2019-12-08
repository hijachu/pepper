import { Component, OnInit } from '@angular/core';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from 'firebase/app';

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

  exists;

  constructor(
    private af: AngularFireDatabase,
    public afAuth: AngularFireAuth
    ) {
  }

  ngOnInit(): void {
    // this.cuisines = this.af.list('/cuisines');
    // this.cuisines = this.af.list('/cuisines', ref=>ref.orderByKey());
    this.cuisines = this.af.list('/cuisines', ref=>ref.orderByValue());
    this.cuisines$ = this.cuisines.snapshotChanges();

    this.restaurant = this.af.object('/restaurant');
    this.restaurant$ = this.restaurant.valueChanges();

    // this.restaurants = this.af.list('/restaurants');
    // this.restaurants = this.af.list('/restaurants', ref=>ref.orderByChild('name'));
    // this.restaurants = this.af.list('/restaurants', ref=>ref.orderByChild('address/city'));
    // this.restaurants = this.af.list('/restaurants', ref=>ref.orderByChild('rating').startAt(3).endAt(4));
    this.restaurants = this.af.list('/restaurants', ref=>ref.orderByChild('rating').equalTo(5).limitToFirst(2));
    this.restaurants$ = this.restaurants.valueChanges()
      .pipe(
        map(restaurants => {
          // console.log("BEFORE MAP", restaurants);

          // const restaurants_new = restaurants.map(restaurant =>
          //   ({ cuisineType$: (this.af.object('/cuisines/' + restaurant.cuisine).valueChanges()),
          //     ...restaurant })
          // );

          const restaurants_new = restaurants.map(restaurant => {
            restaurant.featureTypes$ = [];
            for (let f in restaurant.features)
              restaurant.featureTypes$.push(this.af.object('/features/' + f).valueChanges());

            return restaurant;
          });

          // console.log("AFTER MAP", restaurants_new);
          return restaurants_new;
        })
      );

      // /restaurants/1/features/1
      this.exists = this.af.object('/restaurants/1/features/1').valueChanges();
      this.exists.pipe(take(1))
        .subscribe(x => {
          if (x) console.log("EXISTS");
          else console.log("NOT EXISTS");
        });

  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider())
      .then(authState => {
        console.log("AFTER LOGIN", authState);
      });
  }

  logout() {
    this.afAuth.auth.signOut();
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

  multipleUpdate() {
    this.af.list('restaurants').push({ name: '' })
      .then(x => {
        // x.key
        let restaurant = { name: 'My New Restaurant' };

        let update = {};
        // update['restaurants/' + x.key] = restaurant;
        // update['restaurants-by-city/camberwell/' + x.key] = restaurant;
        update['restaurants/' + x.key] = null;
        update['restaurants-by-city/camberwell/' + x.key] = null;

        this.af.object('/').update(update);
      })
  }
}
