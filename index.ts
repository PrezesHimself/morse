console.clear();
import jQuery from 'jquery';
import { fromEvent, zip, of, timer, merge } from 'rxjs';
import {
  map,
  pairwise,
  switchMap,
  tap,
  filter,
  bufferTime,
  debounce,
  debounceTime,
  takeUntil,
  bufferWhen
} from 'rxjs/operators';

//DOM

const output = jQuery('.output');
const letters = jQuery('.letters');

const SHOT = 300;
const LONG = 1000;
const TIME_BETWEEN_SIGNS = 3000;

const MORSE_CODE = {
  '.-': 'a',
  '-...': 'b',
  '-.-.': 'c',
  '-..': 'd',
  '.': 'e',
  '..-.': 'f',
  '--.': 'g',
  '....': 'h',
  '..': 'i',
  '.---': 'j',
  '-.-': 'k',
  '.-..': 'l',
  '--': 'm',
  '-.': 'n',
  '---': 'o',
  '.--.': 'p',
  '--.-': 'q',
  '.-.': 'r',
  '...': 's',
  '-': 't',
  '..-': 'u',
  '...-': 'v',
  '.--': 'w',
  '-..-': 'x',
  '-.--': 'y',
  '--..': 'z',
  '.----': '1',
  '..---': '2',
  '...--': '3',
  '....-': '4',
  '.....': '5',
  '-....': '6',
  '--...': '7',
  '---..': '8',
  '----.': '9',
  '-----': '0'
};

const eventTime = eventName =>
  fromEvent(document, eventName).pipe(map(() => new Date()));

const mouseClickDuration = zip(
  eventTime('mousedown'),
  eventTime('mouseup')
).pipe(map(([start, end]) => Math.abs(start.getTime() - end.getTime())));

const toMorseCode = () =>
  mouseClickDuration.pipe(
    switchMap(duration => {
      if (duration < SHOT) {
        return of('.');
      } else if (duration < LONG) {
        return of('-');
      }
    })
  );

const morseCode = toMorseCode();

const endOfSign = morseCode.pipe(debounceTime(2000));

morseCode.subscribe(value => {
  var span = output.find('span:last-child');
  if (!span.length) {
    span = output.append(`<span>${value}</span>`);
  } else {
    span[0].innerHTML += value;
  }
});

morseCode.pipe(bufferWhen(() => endOfSign)).subscribe(value => {
  output.append(`<span></span>`);
  letters.append(`<span>${MORSE_CODE[value.join('')]}</span>`);
});
