console.clear();
import jQuery from 'jquery';
import { fromEvent, zip, of, timer, merge, from } from 'rxjs';
import { map, switchMap, debounceTime, bufferWhen } from 'rxjs/operators';

//DOM

const output = jQuery('.output');
const letters = jQuery('.letters');
const task = jQuery('.task');
const tips = jQuery('.tips');

const SHOT = 300;
const LONG = 1000;
const TIME_BETWEEN_SIGNS = 2000;
const PASSWORD = 'hajduszoboszlo';
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

task.text(`type ${PASSWORD}`);

Object.keys(MORSE_CODE).map(key => {
  tips.append(`<div class="tip"> ${MORSE_CODE[key]}:  ${key}</div>`);
});

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

const endOfSign = morseCode.pipe(debounceTime(TIME_BETWEEN_SIGNS));

const password = from(PASSWORD.split(''));

morseCode.subscribe(value => {
  var span = output.find('span:last-child');
  if (!span.length) {
    span = output.append(`<span>${value}</span>`);
  } else {
    span[0].innerHTML += value;
  }
});

const input = morseCode.pipe(bufferWhen(() => endOfSign));

zip(input, password).subscribe(([input, password]) => {
  const inputtedLetter = MORSE_CODE[input.join('')];
  console.log(password, inputtedLetter);
  output.append(`<span></span>`);
  letters.append(
    `<span class="${
      inputtedLetter === password ? 'ok' : 'not-ok'
    }" >${inputtedLetter || '!'}</span>`
  );
});
