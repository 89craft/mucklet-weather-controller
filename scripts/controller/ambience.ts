/**
 * This script switches between "sunny", "foggy", "rainy", "stormy", and "damp"
 * room profiles using a Finite State Machine (FST) and delayed message to
 * simulate weather. When the weather changes it can update any 
 * "weather-listener" scripts. The script also includes ambience similar to
 * ambience.ts but it reflects the current weather state.
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
 * "weather on/off" enables/disables the weather simulation.
 * "ambience on/off" enables/disables the ambience.
 * "override weather" changes the current weather state and updates listeners,
 * even if weather is disabled. A "weather-listener" can also request a weather
 * change.
 */

import { WeatherStateData } from "../_/data-types";
import { TopicKeyword, StoreKey } from "../_/const";
import { timeScale } from "../_/config";
import { randomDelay, randomDescribe, storeGetBool, storeSetBool } from "../utils";
import { ControllerWeather } from "./weather";

export namespace ControllerAmbience {
	let _weatherStates: Map<string, WeatherStateData> = new Map<string, WeatherStateData>();
	export function setWeatherStates(weatherStates: Map<string, WeatherStateData>): void {
		_weatherStates = weatherStates;
	}
	export function getWeatherStates(): Map<string, WeatherStateData> {
		return _weatherStates;
	}

	export function start(): void {
		storeSetBool(StoreKey.ambienceEnabled, true);
		sendAmbiencePost();
	}
	export function tick(): void {
		describeAmbience();
		sendAmbiencePost();
	}
	export function stop(): void {
		storeSetBool(StoreKey.ambienceEnabled, false);
		cancelAmbiencePost();
	}
	export function isEnabled(): bool {
		return storeGetBool(StoreKey.ambienceEnabled);
	}

	function describeAmbience(): void {
		const curWeather = ControllerWeather.currentState();
		const describes: string[] = curWeather.ambience.describes;
		if (describes != null && describes.length > 0)
			Room.describe(randomDescribe(describes));
	}
	function sendAmbiencePost(): void {
		const curWeather = ControllerWeather.currentState();
		const delay: f64 = randomDelay(curWeather.ambience.delay);

		cancelAmbiencePost();

		const topic = TopicKeyword.ambienceTick;
		const delayScaled: i64 = i64(delay / timeScale);
		const id = Script.post("#", topic, null, delayScaled);

		if (id == null) Store.deleteKey(StoreKey.ambiencePendingPost);
		else Store.setString(StoreKey.ambiencePendingPost, id);
	}
	function cancelAmbiencePost(): void {
		const ambiencePending = Store.getString(StoreKey.ambiencePendingPost);
		if (ambiencePending != null) Script.cancelPost(ambiencePending);
	}
}
