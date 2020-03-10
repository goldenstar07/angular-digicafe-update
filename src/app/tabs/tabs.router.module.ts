import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: ()=> import('../tab1/tab1.module').then(m => m.Tab1PageModule)
            // loadChildren: '../tab1/tab1.module#Tab1PageModule'
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: ()=> import('../tab2/tab2.module').then(m => m.Tab2PageModule),
            // loadChildren: '../tab2/tab2.module#Tab2PageModule',
            canActivate: [AuthGuard],
          },
        ]
      },
      {
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: ()=> import('../tab3/tab3.module').then(m => m.Tab3PageModule),
            // loadChildren: '../tab3/tab3.module#Tab3PageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'tab4',
        children: [
          {
            path: '',
            loadChildren: ()=> import('../tab4/tab4.module').then(m => m.Tab4PageModule),
            // loadChildren: '../tab4/tab4.module#Tab4PageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
    ]  
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
