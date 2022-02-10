export const global = window;

// eslint-disable-next-line capitalized-comments
// midi-js (dep of abcjs) wants to have the global MIDI object:
global.MIDI = {};
