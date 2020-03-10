import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
 
@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  public items = [];
  public loaded: boolean = false;
 
  constructor(private storage: Storage){  
       
  }

  filterItems(searchTerm){
    return this.items.filter((item) => {
      return item.description.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });    
  }

  load(): Promise<boolean> {
    // Return a promise so that we know when this operation has completed
    return new Promise((resolve) => {

    // Get the notes that were saved into storage
    this.storage.get('userSet').then((items) => {
      // Only set this.notes to the returned value if there were values stored
      if(items != null){
      this.items = items;
      }
      // This allows us to check if the data has been loaded in or not
      this.loaded = true;
      resolve(true);
      });
    });
  }
}
