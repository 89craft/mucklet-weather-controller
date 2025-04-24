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
import {
	defaultWeatherKeyword,
	listenerRoomScripts,
	timeScale,
} from "../_/config";
import { randomDelay, randomDescribe, randomTransitionKey, storeGetBool, storeSetBool } from "../utils";

export namespace ControllerWeather {
	let _weatherStates: Map<string, WeatherStateData> = new Map<string, WeatherStateData>();
	export function setWeatherStates(weatherStates: Map<string, WeatherStateData>): void {
		_weatherStates = weatherStates;
	}
	export function getWeatherStates(): Map<string, WeatherStateData> {
		return _weatherStates;
	}

	export function start(): void {
		storeSetBool(StoreKey.weatherEnabled, true);
		setWeather("");
		sendUpdatePost();
		sendDelayedPost();
	}
	export function set(newWeatherKeyword: string): void {
		setWeather(newWeatherKeyword);
		sendUpdatePost();
		if (isEnabled()) sendDelayedPost();
	}
	export function stop(): void {
		storeSetBool(StoreKey.weatherEnabled, false);
		cancelWeatherPost();
	}
	export function isEnabled(): bool {
		return storeGetBool(StoreKey.weatherEnabled);
	}

	export function getStoredKeyword(): string {
		let weatherKeyword = Store.getString(StoreKey.currentWeatherKeyword);
		if (weatherKeyword == null || !_weatherStates.has(weatherKeyword))
			weatherKeyword = defaultWeatherKeyword;
		return weatherKeyword;
	}
	export function currentState(): WeatherStateData {
		return _weatherStates.get(getStoredKeyword());
	}

	function setWeather(newWeatherKeyword: string): void {
		const curWeatherKeyword = getStoredKeyword();
		const curWeatherState = _weatherStates.get(curWeatherKeyword);
		if (curWeatherState.transitions.has(newWeatherKeyword)) {
			const describes = curWeatherState.transitions.get(newWeatherKeyword).describes;
			if (describes != null && describes.length > 0)
				Room.describe(randomDescribe(describes));
		}
		const newWeatherValid = _weatherStates.has(newWeatherKeyword);
		const validWeatherKeyword = newWeatherValid ? newWeatherKeyword : curWeatherKeyword;
		Room.useProfile(validWeatherKeyword);
		Store.setString(StoreKey.currentWeatherKeyword, validWeatherKeyword);
	}
	function sendUpdatePost(): void {
		const topic = TopicKeyword.weatherTick;

		const curWeatherKeyword = getStoredKeyword();
		const data: string = curWeatherKeyword;

		for (let i: i32 = 0; i < listenerRoomScripts.length; i++)
			Script.post(listenerRoomScripts[i], topic, data);
	}
	function sendDelayedPost(): void {
		const topic = TopicKeyword.weatherTick;

		const curWeather = currentState();
		const nextWeatherKeyword = randomTransitionKey(curWeather.transitions);
		const data: string = nextWeatherKeyword;

		const delay: f64 = randomDelay(curWeather.duration);
		const delayScaled: i64 = i64(delay / timeScale);

		cancelWeatherPost();

		const id = Script.post("#", topic, data, delayScaled);

		if (id == null) Store.deleteKey(StoreKey.weatherPendingPost);
		else Store.setString(StoreKey.weatherPendingPost, id);
	}
	function cancelWeatherPost(): void {
		const weatherPending = Store.getString(StoreKey.weatherPendingPost);
		if (weatherPending != null) Script.cancelPost(weatherPending);
	}
}
