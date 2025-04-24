/**
 * This script switches between "sunny", "foggy", "rainy", "stormy", and "damp"
 * by listening to a "weather-controller" script. The script also includes
 * ambience similar to ambience.ts but it reflects the current weather state.
 *
 * The script adds five commands to the room:
 * ```
 * weather on
 * weather off
 * ambience on
 * ambience off
 * override weather <Keyword>
 * ```
 * 
 * "weather on/off" enables/disables listening to the "weather-controller".
 * "ambience on/off" enables/disables the ambience.
 * "override weather" sends a request to the "weather-controller" to change the
 * weather but not if weather is disabled.
 */

import { TransitionData, WeatherStateData } from "./_/data-types";
import { WeatherKeyword } from "./_/const";
import { Listener } from "./listener";

// WEATHER CONFIG
const weatherStates = new Map<string, WeatherStateData>()
// Sunny
.set(WeatherKeyword.sunny, {
	duration: {
		min: 15 * 60 * 1000, // 15 minutes
		max: 60 * 60 * 1000, // 60 minutes
	},
	ambience: {
		delay: {
			min: 5 * 60 * 1000, // 5 minutes
			max: 15 * 60 * 1000, // 15 minutes
		},
		describes: [
			"It's sunny out",
		],
	},
	transitions: new Map<string, TransitionData>()
		.set(WeatherKeyword.sunny, {
			weight: 100,
			describes: [
				"Weather changes from sunny to sunny",
			],
		})
		.set(WeatherKeyword.foggy, {
			weight: 100,
			describes: [
				"Weather changes from sunny to foggy",
			],
		})
})
// Foggy
.set(WeatherKeyword.foggy, {
	duration: {
		min: 15 * 60 * 1000, // 15 minutes
		max: 60 * 60 * 1000, // 60 minutes
	},
	ambience: {
		delay: {
			min: 5 * 60 * 1000, // 5 minutes
			max: 15 * 60 * 1000, // 15 minutes
		},
		describes: [
			"It's foggy out",
		],
	},
	transitions: new Map<string, TransitionData>()
		.set(WeatherKeyword.sunny, {
			weight: 100,
			describes: [
				"Weather changes from foggy to sunny",
			],
		})
		.set(WeatherKeyword.rainy, {
			weight: 100,
			describes: [
				"Weather changes from foggy to rainy",
			],
		})
		.set(WeatherKeyword.stormy, {
			weight: 100,
			describes: [
				"Weather changes from foggy to stormy",
			],
		})
})
// Rainy
.set(WeatherKeyword.rainy, {
	duration: {
		min: 15 * 60 * 1000, // 15 minutes
		max: 60 * 60 * 1000, // 60 minutes
	},
	ambience: {
		delay: {
			min: 5 * 60 * 1000, // 5 minutes
			max: 15 * 60 * 1000, // 15 minutes
		},
		describes: [
			"It's rainy out",
		],
	},
	transitions: new Map<string, TransitionData>()
		.set(WeatherKeyword.rainy, {
			weight: 100,
			describes: [
				"Weather changes from rainy to rainy",
			],
		})
		.set(WeatherKeyword.damp, {
			weight: 100,
			describes: [
				"Weather changes from rainy to damp",
			],
		})
})
// Stormy
.set(WeatherKeyword.stormy, {
	duration: {
		min: 15 * 60 * 1000, // 15 minutes
		max: 60 * 60 * 1000, // 60 minutes
	},
	ambience: {
		delay: {
			min: 5 * 60 * 1000, // 5 minutes
			max: 15 * 60 * 1000, // 15 minutes
		},
		describes: [
			"It's stormy out",
		],
	},
	transitions: new Map<string, TransitionData>()
		.set(WeatherKeyword.stormy, {
			weight: 100,
			describes: [
				"Weather changes from stormy to stormy",
			],
		})
		.set(WeatherKeyword.damp, {
			weight: 100,
			describes: [
				"Weather changes from stormy to damp",
			],
		})
})
// Damp
.set(WeatherKeyword.damp, {
	duration: {
		min: 15 * 60 * 1000, // 15 minutes
		max: 60 * 60 * 1000, // 60 minutes
	},
	ambience: {
		delay: {
			min: 5 * 60 * 1000, // 5 minutes
			max: 15 * 60 * 1000, // 15 minutes
		},
		describes: [
			"It's damp out",
		],
	},
	transitions: new Map<string, TransitionData>()
		.set(WeatherKeyword.sunny, {
			weight: 100,
			describes: [
				"Weather changes from damp to sunny",
			],
		})
});

Listener.setWeatherStates(weatherStates);

// ROOM SCRIPT FUNCTIONS
// onActivate is called when the script is enabled.
export function onActivate(): void {
	Listener.onActivate(weatherStates);
}
// onCommand is called when a characters uses a script command.
export function onCommand(
	addr: string,
	cmdAction: CmdAction,
): void {
	Listener.onCommand(weatherStates, addr, cmdAction);
}
// onMessage is called when the outside room script sends a message to this script.
export function onMessage(
	addr: string,
	topic: string,
	data: string | null,
	sender: string,
): void {
	Listener.onMessage(weatherStates, addr, topic, data, sender);
}
