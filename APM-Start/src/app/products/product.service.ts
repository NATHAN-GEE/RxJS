import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, scan, shareReplay, tap } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import {ProductCategoryService} from '../product-categories/product-category.service'
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;
  
  products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    // tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );
    productsWithCategory$ = combineLatest([
      this.products$,
      this.productCategoryService.productCategories$
    ]).pipe(
      map(([products, categories]) => 
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        category: categories.find(c => product.categoryId === c.id).name,
        searchKey: [product.productName]
      })as Product 
      )),
      shareReplay(1)
    )

    //observable that interacts with user actions/ create subject and action
    private productSelectedSubject = new BehaviorSubject<number>(0);
    productSelectedAction$ = this.productSelectedSubject.asObservable();


  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$])
    .pipe(
    map(([products, selectedProductId])=>
      products.find(product => product.id === selectedProductId)),
      // tap(product => console.log('selectedProduct', product)),
      shareReplay(1)
      )
    
  private productAddSubject = new Subject<Product>();
  add$ = this.productAddSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.add$
  ).pipe(
    scan((acc: Product[], value: Product)=> [...acc, value])
  )

  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ]).pipe(
    map(([selectedProduct, suppliers])=>
    suppliers.filter(supplier => selectedProduct.supplierIds.includes(supplier.id)))
  )

  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) { }

    selectedProductChanged(selectedProductId: number): void{
      this.productSelectedSubject.next(selectedProductId);
    }

    addProduct(newProduct?: Product):void{
      newProduct = newProduct || this.fakeProduct();
      this.productAddSubject.next(newProduct)
    }


  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
