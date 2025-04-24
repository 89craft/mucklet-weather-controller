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
import { StoreKey } from "../_/const";
import { defaultWeatherKeyword } from "../_/config";
import { storeGetBool, storeSetBool } from "../utils/store";
import { randomDescribe } from "../utils/random";

export namespace ListenerWeather {
	let _weatherStates: Map<string, WeatherStateData> = new Map<string, WeatherStateData>();
	export function setWeatherStates(weatherStates: Map<string, WeatherStateData>): void {
		_weatherStates = weatherStates;
	}
	export function getWeatherStates(): Map<string, WeatherStateData> {
		return _weatherStates;
	}

	export function start(): void {
		storeSetBool(StoreKey.weatherEnabled, true);
	}
	export function set(newWeatherKeyword: string): void {
		setWeather(newWeatherKeyword);
	}
	export function stop(): void {
		storeSetBool(StoreKey.weatherEnabled, false);
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
		const curWeather = _weatherStates.get(curWeatherKeyword);
		if (curWeather.transitions.has(newWeatherKeyword)) {
			const describes = curWeather.transitions.get(newWeatherKeyword).describes;
			if (describes != null && describes.length > 0)
				Room.describe(randomDescribe(describes));
		}
		const newWeatherValid = _weatherStates.has(newWeatherKeyword);
		const validWeatherKeyword = newWeatherValid ? newWeatherKeyword : curWeatherKeyword;
		Room.useProfile(validWeatherKeyword);
		Store.setString(StoreKey.currentWeatherKeyword, validWeatherKeyword);
	}
}
