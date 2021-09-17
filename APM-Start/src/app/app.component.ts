import { Component, OnInit } from '@angular/core';
import {of, from} from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  pageTitle = 'Acme Product Management';

  ngOnInit(){
    of(2,3,4,5,6,7).pipe(map(x => x** 2)).subscribe(console.log);

    from([20,15,2,1]).subscribe(
      item => console.log(`resulting item ... ${item}`),
      err => console.error(`error occured ${err}`),
      () => console.log('complete')
    )
  }
}
