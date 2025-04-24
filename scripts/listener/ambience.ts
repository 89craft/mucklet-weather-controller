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

import { WeatherStateData } from "../_/data-types";
import { TopicKeyword, StoreKey } from "../_/const";
import { defaultWeatherKeyword, timeScale } from "../_/config";
import { storeGetBool, storeSetBool } from "../utils/store";
import { randomDelay, randomDescribe } from "../utils/random";

export namespace ListenerAmbience {
	let _weatherStates: Map<string, WeatherStateData> = new Map<string, WeatherStateData>();
	export function setWeatherStates(weatherStates: Map<string, WeatherStateData>): void {
		_weatherStates = weatherStates;
	}
	export function getWeatherStates(): Map<string, WeatherStateData> {
		return _weatherStates;
	}

	export function start(): void {
		sendAmbiencePost();
		storeSetBool(StoreKey.ambienceEnabled, true);
	}
	export function tick(): void {
		describeAmbience();
		sendAmbiencePost();
	}
	export function stop(): void {
		cancelAmbiencePost();
		storeSetBool(StoreKey.ambienceEnabled, false);
	}
	export function isEnabled(): bool {
		return storeGetBool(StoreKey.ambienceEnabled);
	}

	function getStoredKeyword(): string {
		let weatherKeyword = Store.getString(StoreKey.currentWeatherKeyword);
		if (weatherKeyword == null || !_weatherStates.has(weatherKeyword))
			weatherKeyword = defaultWeatherKeyword;
		return weatherKeyword;
	}
	function currentState(): WeatherStateData {
		return _weatherStates.get(getStoredKeyword());
	}

	function describeAmbience(): void {
		const curWeather = currentState();
		const describes: string[] = curWeather.ambience.describes;
		if (describes != null && describes.length > 0)
			Room.describe(randomDescribe(describes));
	}
	function sendAmbiencePost(): void {
		const curWeather = currentState();
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
