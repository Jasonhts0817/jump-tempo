import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Debounce } from '../decorator/debouce-time.decorator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pick-topic',
  templateUrl: './pick-topic.component.html',
  styleUrls: ['./pick-topic.component.scss'],
})
export class PickTopicComponent implements OnInit {
  @ViewChild('timerMask') timerMask!: ElementRef<HTMLDivElement>;
  @ViewChild('startBtn') startBtn!: ElementRef<HTMLButtonElement>;
  topicList!: Topic[];
  topic!: Topic;
  currentQues?: Ques;
  durationTime!: number;
  secondCount!: number;
  showAnswer = false;

  doneQuesCount = 0;

  public get hasQuesList(): boolean {
    return (
      this.topicList.length > 0 ||
      (this.topic?.quesList && this.topic.quesList.length > 0) ||
      this.currentQues !== undefined
    );
  }

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http
      .get(`${environment.apiUrl}assets/topic.json`)
      .subscribe((res: any) => {
        this.topicList = res;
      });
  }

  start(event?: Event) {
    event?.stopPropagation();
    this.resetGame();
    this.getTopic();
  }

  setCountDown() {
    const start = new Date();
    const countDownFn = () => {
      const now = new Date();
      this.secondCount = +now - +start;
      if (this.secondCount < this.durationTime) {
        const maskPercent = (this.secondCount / this.durationTime) * 100 + '%';
        this.timerMask.nativeElement.style.setProperty(
          'transform',
          `translate(0, ${maskPercent})`
        );
        window.requestAnimationFrame(countDownFn);
      } else {
        this.timerMask.nativeElement.style.setProperty(
          'transform',
          `translate(0, 100%)`
        );
        this.playAudio(Sound.timeUp);
      }
    };
    window.requestAnimationFrame(countDownFn);
  }
  playAudio(sound: Sound) {
    const audio = new Audio(environment.apiUrl + sound);
    audio.play();
  }

  getTopic() {
    this.topic = this.topicList[this.getRandomInt(this.topicList.length - 1)];
    this.topicList = this.topicList.filter((t) => t.topic !== this.topic.topic);
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  next() {
    if (!this.topic || (this.topic?.quesList.length === 0 && this.showAnswer)) {
      return;
    }
    if (this.secondCount >= this.durationTime && !this.showAnswer) {
      this.showAnswer = true;
      if (this.currentQues?.ans === 'O') {
        this.playAudio(Sound.correct);
      } else {
        this.playAudio(Sound.wrong);
      }
      return;
    }
    this.showAnswer = false;
    this.resetPerQues();
    this.doneQuesCount++;
    this.setDurationTime();
    setTimeout(() => {
      this.currentQues =
        this.topic.quesList[this.getRandomInt(this.topic.quesList.length - 1)];
      this.speakQuestion(this.currentQues.ques);
      this.topic.quesList = this.topic.quesList.filter(
        (t) => t.ques !== this.currentQues?.ques
      );
      this.setCountDown();
    }, 200);
  }

  setDurationTime() {
    switch (this.doneQuesCount) {
      case 3:
        this.durationTime = 1200;
        break;
      case 6:
        this.durationTime = 1200;
        break;
      case 9:
        this.durationTime = 800;
        break;
      case 12:
        this.durationTime = 800;
        break;
      case 15:
        this.durationTime = 500;
        break;
    }
  }

  resetPerQues() {
    this.secondCount = 0;
    this.timerMask.nativeElement.style.setProperty(
      'transform',
      'translate(0, 0%)'
    );
  }

  resetGame() {
    this.resetPerQues();
    this.currentQues = undefined;
    this.doneQuesCount = 0;
    this.durationTime = 1500;
  }

  resetQues() {
    this.topic = undefined as any;
    this.resetGame();
    this.http
      .get(`${environment.apiUrl}assets/topic.json`)
      .subscribe((res: any) => {
        this.topicList = res;
      });
  }

  speakQuestion(ques: string) {
    let speakData = new SpeechSynthesisUtterance();
    speakData.volume = 1; // From 0 to 1
    speakData.rate = 0.9; // From 0.1 to 10
    speakData.text = ques;
    speakData.lang = 'zh-TW';

    speechSynthesis.speak(speakData);
  }

  @HostListener('document:keydown', ['$event'])
  @Debounce()
  keyPressDown(event: KeyboardEvent) {
    if (event.key === 'PageUp') {
      if (this.hasQuesList) {
        this.start();
      } else {
        this.resetQues();
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

enum Sound {
  correct = `assets/correct-answer.mp3`,
  wrong = `assets/wrong-answer.mp3`,
  timeUp = `assets/time-up.mp3`,
}
