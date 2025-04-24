import { WeatherKeyword } from "./const";

export const defaultWeatherKeyword: string = WeatherKeyword.sunny;
// 1 is normal, 10 is 10x faster, 60 is 1 minute in 1 second
export const timeScale: f64 = 60;

// Nora's Main Room
export const controllerRoomScript: string = "room.cptsaou9gbricr4i1t7g#cvtjn1u9gbrjdbacjceg";
export const listenerRoomScripts: string[] = [
    "room.cppn8ie9gbricr4essug#cvtjn369gbrjdbacjcj0", // Nora's Tree House
];
// Community Pavilion
// export const controllerRoomScript: string = "room.cstv9ve9gbrs0or9k2pg#cvvi93m9gbrjdbae1eeg";
// export const listenerRoomScripts: string[] = [
//     "room.csu8erm9gbrs0or9q360#cvvig8m9gbrjdbae1j80", // Vacant Bungalow
//     "room.csu10o69gbrs0or9l9mg#cvvig069gbrjdbae1il0", // Bungalows
//     "room.cstj64m9gbrs0or9aa40#cvvhok69gbrjdbae0u20", // Dock
//     "room.cstvjj69gbrs0or9kbf0#cvvidim9gbrjdbae1gqg", // Beach
//     "room.cstvlnu9gbrs0or9kd4g#cvvidtu9gbrjdbae1h30", // Tidepools
//     "room.cstvo469gbrs0or9ket0#cvvie269gbrjdbae1h5g", // Cove
//     "room.cstvrfu9gbrs0or9kha0#cvvie569gbrjdbae1ha0", // Reef
//     "room.cstik2e9gbrs0or99ur0#cvvi9ae9gbrjdbae1ekg", // Pier
//     "room.csu5ipe9gbrs0or9osag#cvviedu9gbrjdbae1hl0", // Mini Mall
// ];
export const commandWhiteList: string[] = [
    "ca5uqb69gbrlr8l7epv0", // Cade Trigon
    "ch76s0e9gbrh4ukjv5a0", // Nora Mistontli
];
