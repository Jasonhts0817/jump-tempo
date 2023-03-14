import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Debounce } from '../decorator/debouce-time.decorator';

@Component({
  selector: 'app-pick-topic',
  templateUrl: './pick-topic.component.html',
  styleUrls: ['./pick-topic.component.scss']
})
export class PickTopicComponent implements OnInit {
  @ViewChild('timerMask') timerMask!: ElementRef<HTMLDivElement>;
  @ViewChild('startBtn') startBtn!: ElementRef<HTMLButtonElement>;
  topicList!: Topic[];
  topic!: Topic;
  currentQues!: Ques;
  durationTime!: number;
  secondCount!: number;

  doneQuesCount = 0;
  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    this.http.get('/assets/topic.json').subscribe((res: any) => {
      this.topicList = res;
    })
  }

  start(event?: Event) {
    event?.stopPropagation();
    this.resetGame();
    this.getTopic();
    this.next();
  }

  setCountDown() {
    const start = new Date();
    const countDownFn = () => {
      const now = new Date();
      this.secondCount = +now - +start;
      if (this.secondCount < this.durationTime) {
        const maskPercent = (this.secondCount / this.durationTime * 100) + '%';
        this.timerMask.nativeElement.style.setProperty('transform', `translate(0, ${maskPercent})`)
        window.requestAnimationFrame(countDownFn);
      } else {
        this.timerMask.nativeElement.style.setProperty('transform', `translate(0, 100%)`)
      }

    }
    window.requestAnimationFrame(countDownFn);
  }

  getTopic() {
    this.topic = this.topicList[this.getRandomInt(this.topicList.length - 1)]
    this.topicList = this.topicList.filter(t => t.topic !== this.topic.topic)
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  next() {
    if (!this.topic || this.topic?.quesList.length === 0) { return; }
    this.resetPerQues();
    this.doneQuesCount++;
    this.setDurationTime();
    setTimeout(() => {
      this.currentQues = this.topic.quesList[this.getRandomInt(this.topic.quesList.length - 1)];
      this.topic.quesList = this.topic.quesList.filter(t => t.ques !== this.currentQues.ques)
      this.setCountDown();
    }, 200);
  }

  setDurationTime() {
    switch (this.doneQuesCount) {
      case 3:
        this.durationTime = 1500;
        break;
      case 6:
        this.durationTime = 1200;
        break;
      case 9:
        this.durationTime = 800;
        break;
      case 12:
        this.durationTime = 500;
        break;
      case 15:
        this.durationTime = 300;
        break;
    }
  }

  resetPerQues() {
    this.secondCount = 0;
    this.timerMask.nativeElement.style.setProperty('transform', 'translate(0, 0%)')
  }

  resetGame() {
    this.doneQuesCount = 0;
    this.durationTime = 2000;
  }

  @HostListener('document:keydown', ['$event'])
  @Debounce()
  keyPressDown(event: KeyboardEvent) {
    if (event.key === 'PageUp') {
      if (!this.topic || this.topic.quesList.length === 0) {
        this.start();
      } else {
        this.next();
      }
    }
    if (event.key === 'PageDown') {
      this.next();
    }
  }
}


export interface Topic {
  topic: string;
  quesList: Ques[];
}

export interface Ques {
  ques: string;
  ans: string;
}