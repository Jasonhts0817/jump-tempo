import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PickTopicComponent } from './pick-topic/pick-topic.component';

const routes: Routes = [
  {
    path: "",
    component: PickTopicComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
