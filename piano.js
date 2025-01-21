const CLASS_NAME = {
  KEY: {
    PRESSED_L: 'active-l',
    PRESSED_R: 'active-r',
  },
  TILE: {
    DURATION: (duration) => `duration-${duration}`,
    HAND: {
      R: 'r',
      L: 'l',
    },
  },
};

const EIGHT_HEIGHT = 30;
const NOTES_PER_CLICK = 2;

const NOTES = [
  {
    note: 'G1',
    position: 1,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'G3',
    position: 1,
    duration: 3,
    hand: 'right',
  },
  {
    note: 'Bb2',
    position: 3,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'G4',
    position: 1,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'G5',
    position: 1,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'Bb5',
    position: 3,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'C3',
    position: 5,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'G1',
    position: 8,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'G4',
    position: 8,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'Bb1',
    position: 10,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'Db2',
    position: 12,
    duration: 1,
    hand: 'right',
  },
  {
    note: 'C2',
    position: 13,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'G1',
    position: 17,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'Bb1',
    position: 19,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'C2',
    position: 21,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'G4',
    position: 17,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'Bb3',
    position: 19,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'C4',
    position: 21,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'Bb1',
    position: 24,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'G1',
    position: 26,
    duration: 2,
    hand: 'right',
  },
  {
    note: 'Bb7',
    position: 24,
    duration: 2,
    hand: 'left',
  },
  {
    note: 'G7',
    position: 26,
    duration: 2,
    hand: 'right',
  },
];

const TRACK = {
  tempo: 100,
  introDuration: 5,
  notes: NOTES,
};

const tileContainer = document.querySelector('.tiles');
const keyboard = document.querySelector('.keyboard');

function startCSSAnimation() {
  document.querySelector('#app-wrapper').classList.add('playing');
}

function getTrackDurationInEights(notes) {
  return Math.max(...notes.map((note) => note.position + note.duration));
}

function getTrackLength(notes) {
  return EIGHT_HEIGHT * getTrackDurationInEights(notes);
}

function getTrackDuration({ notes, tempo }) {
  const maxNoteEnding = getTrackDurationInEights(notes);

  return (maxNoteEnding * 60) / (tempo * NOTES_PER_CLICK);
}

function getTrackSpeedInPxPerS(trackLength, trackDuration) {
  return trackLength / trackDuration;
}

function getIntroPadding(speed, introDuration) {
  return speed * introDuration;
}

function getEightDurationMs(tempo) {
  return 60000 / (NOTES_PER_CLICK * tempo);
}

function createTile({ duration, position, hand }) {
  const tileElement = document.createElement('div');
  const classNameHand = hand === 'right' ? CLASS_NAME.TILE.HAND.R : CLASS_NAME.TILE.HAND.L;

  tileElement.classList.add(CLASS_NAME.TILE.DURATION(duration));
  tileElement.classList.add('tile');
  tileElement.classList.add(classNameHand);
  tileElement.dataset.duration = duration;
  tileElement.dataset.hand = hand;
  tileElement.style.bottom = `${(position - 1) * EIGHT_HEIGHT}px`;

  return tileElement;
}

function paintNotes(notes, container) {
  notes.forEach((note) => {
    const row = container.querySelector(`div[data-note="${note.note}"]`);
    const tile = createTile(note);
    row.append(tile);
  });
}

function visualizeNotePlay(note, duration, hand) {
  const key = keyboard.querySelector(`div[data-note="${note}"]`);
  const className = hand === 'right' ? CLASS_NAME.KEY.PRESSED_R : CLASS_NAME.KEY.PRESSED_L;

  key.classList.add(className);

  setTimeout(() => {
    key.classList.remove(className);
  }, duration);
}

function runTilesListener(track, sampler) {
  const eightDuration = getEightDurationMs(track.tempo);
  const keyboardTop = keyboard.getBoundingClientRect().top;
  let tiles = Array.from(tileContainer.querySelectorAll('.tile'));

  const loop = () => {
    tiles.forEach((tile) => {
      if (tile.getBoundingClientRect().top + tile.getBoundingClientRect().height >= keyboardTop) {
        const { note } = tile.parentElement.dataset;
        const { duration, hand } = tile.dataset;

        tiles = tiles.filter((_) => _ !== tile);

        playNote(sampler, note, duration * eightDuration);
        visualizeNotePlay(note, duration * eightDuration, hand);
      }
    });

    if (tiles.length) {
      requestAnimationFrame(loop);
    }
  };

  requestAnimationFrame(loop);
  startCSSAnimation();
}

function start(track) {
  const trackLength = getTrackLength(track.notes);
  const duration = getTrackDuration(track);
  const speed = getTrackSpeedInPxPerS(trackLength, duration);
  const introPadding = getIntroPadding(speed, track.introDuration);

  document.documentElement.style.setProperty('--eight-height', EIGHT_HEIGHT + 'px');
  document.documentElement.style.setProperty('--song-height', trackLength + 'px');
  document.documentElement.style.setProperty('--animation-duration', duration + track.introDuration + 's');
  document.documentElement.style.setProperty('--intro-padding', introPadding + 'px');

  runTilesListener(TRACK, sampler);
}

function playNote(sampler, note, duration) {
  sampler.triggerAttack(note);
  setTimeout(() => {
    sampler.triggerRelease(note);
  }, duration);
}

const sampler = new Tone.Sampler({
  urls: {
    C1: 'C1.mp3',
    C2: 'C2.mp3',
    C3: 'C3.mp3',
    C4: 'C4.mp3',
    C5: 'C5.mp3',
    C6: 'C6.mp3',
  },
  release: 1,
  baseUrl: 'https://tonejs.github.io/audio/salamander/',
}).toDestination();

Tone.loaded().then(() => {
  paintNotes(TRACK.notes, tileContainer);

  document.querySelector('button').onclick = () => start(TRACK);

  console.log('Tone loaded');
});
