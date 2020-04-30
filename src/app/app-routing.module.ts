import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
const routes: Routes = [
  { path: '', loadChildren: ()=> import('./tabs/tabs.module').then(m => m.TabsPageModule)},
  { path: 'transact', loadChildren: ()=> import('./transact/transact.module').then(m=>m.TransactPageModule),canActivate: [AuthGuard], },
  { path: 'login', loadChildren: ()=> import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'reset-password', loadChildren: ()=> import('./reset-password/reset-password.module').then(m=>m.ResetPasswordPageModule) },
  { path: 'signup', loadChildren: ()=> import('./signup/signup.module').then(m=>m.SignupPageModule) },
  { path: 'wallet-send', loadChildren: ()=> import('./wallet-send/wallet-send.module').then(m=>m.WalletSendPageModule),canActivate: [AuthGuard], },
  { path: 'card', loadChildren: ()=> import('./card/card.module').then(), canActivate: [AuthGuard] },
  {
    path: 'email',
    loadChildren: () => import('./email/email.module').then( m => m.EmailPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then( m => m.AccountPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
