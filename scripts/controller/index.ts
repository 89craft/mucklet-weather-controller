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

import { CmdArgs, WeatherStateData } from "../_/data-types";
import { commandWhiteList, defaultWeatherKeyword, listenerRoomScripts, timeScale } from "../_/config";
import { StoreKey, TopicKeyword, WeatherKeyword } from "../_/const";
import { randomDelay, randomDescribe, randomTransitionKey, storeGetBool, storeSetBool } from "../utils";

export namespace Controller {
	let _weatherStates: Map<string, WeatherStateData> = new Map<string, WeatherStateData>();
	export function setWeatherStates(weatherStates: Map<string, WeatherStateData>): void {
		_weatherStates = weatherStates;
	}
	export function getWeatherStates(): Map<string, WeatherStateData> {
		return _weatherStates;
	}

    // onActivate is called when the script is enabled.
    export function onActivate(
        weatherStates: Map<string, WeatherStateData>,
    ): void {
        Room.addCommand(TopicKeyword.weatherOn, new Command("weather on", "Turn on weather."));
        Room.addCommand(TopicKeyword.weatherOff, new Command("weather off", "Turn off weather."));
        Room.addCommand(TopicKeyword.ambienceOn, new Command("ambience on", "Turn on ambience."));
        Room.addCommand(TopicKeyword.ambienceOff, new Command("ambience off", "Turn off ambience."));
        Room.addCommand(TopicKeyword.weatherOverride,
            new Command("override weather <Keyword>", "Override the current weather state.")
                .field("Keyword", new Field.List("Profile keyword of the weather to change to.")
                    .addItem(WeatherKeyword.sunny)
                    .addItem(WeatherKeyword.foggy)
                    .addItem(WeatherKeyword.rainy)
                    .addItem(WeatherKeyword.stormy)
                    .addItem(WeatherKeyword.damp)
                )
        );

        const weatherEnabled = ControllerWeather.isEnabled();
        if (weatherEnabled) ControllerWeather.start();
        const ambienceEnabled = ControllerAmbience.isEnabled();
        if (ambienceEnabled) ControllerAmbience.start();

        Room.describe("*beep boop* WEATHER CONTROLLER STARTED."
            + ` WEATHER IS ${weatherEnabled ? "ENABLED" : "DISABLED"}.`
            + ` AMBIENCE IS ${ambienceEnabled ? "ENABLED" : "DISABLED"}.`
        );

        Script.listen(listenerRoomScripts);
    }

    // onCommand is called when a characters uses a script command.
    export function onCommand(
        weatherStates: Map<string, WeatherStateData>,
        addr: string,
        cmdAction: CmdAction,
    ): void {
        console.log(`onCommand: keyword=${cmdAction.keyword}, data=${cmdAction.data}, char.id=${cmdAction.char.id}`);

        if (!commandWhiteList.includes(cmdAction.char.id)) {
            cmdAction.info("You're not authorized to use this command.");
            return;
        }
        if (cmdAction.keyword == TopicKeyword.weatherOn) {
            if (ControllerWeather.isEnabled()) {
                cmdAction.info("Weather is already enabled.");
                return;
            }
            ControllerWeather.start();
            console.log("*beep boop* WEATHER ENABLED");
            Room.describe("*beep boop* WEATHER ENABLED");
        }
        else if (cmdAction.keyword == TopicKeyword.weatherOff) {
            if (!ControllerWeather.isEnabled()) {
                cmdAction.info("Weather is already disabled.");
                return;
            }
            ControllerWeather.stop();
            console.log("*beep boop* WEATHER DISABLED");
            Room.describe("*beep boop* WEATHER DISABLED");
        }
        else if (cmdAction.keyword == TopicKeyword.ambienceOn) {
            if (ControllerAmbience.isEnabled()) {
                cmdAction.info("Ambience is already enabled.");
                return;
            }
            ControllerAmbience.start();
            Room.describe("*beep boop* AMBIENCE ENABLED");
        }
        else if (cmdAction.keyword == TopicKeyword.ambienceOff) {
            if (!ControllerAmbience.isEnabled()) {
                cmdAction.info("Ambience is already disabled.");
                return;
            }
            ControllerAmbience.stop();
            Room.describe("*beep boop* AMBIENCE DISABLED");
        }
        else if (cmdAction.keyword == TopicKeyword.weatherOverride) {
            const args = JSON.parse<CmdArgs.WeatherOverride>(cmdAction.data);
            if (!weatherStates.has(args.keyword.value)) {
                cmdAction.info("Keyword is invalid.");
                return;
            }
            ControllerWeather.set(args.keyword.value);
            Room.describe(`*beep boop* WEATHER OVERRIDE: ${args.keyword.value}`);
        }
    }

    // onMessage is called when the outside room script sends a message to this script.
    export function onMessage(
        weatherStates: Map<string, WeatherStateData>,
        addr: string,
        topic: string,
        data: string | null,
        sender: string,
    ): void {
        console.log(`onMessage: topic=${topic}, data=${data != null ? data : "null"}`);

        // Message from self
        if (addr == "#") {
            if (topic == TopicKeyword.weatherTick) {
                if (data == null) return;
                ControllerWeather.set(data);
            }
            else if (topic == TopicKeyword.ambienceTick) {
                ControllerAmbience.tick();
            }
        }
        // Request from child
        else {
            if (topic == TopicKeyword.weatherOverride) {
                if (data == null) return;
                const args = JSON.parse<CmdArgs.WeatherOverride>(data);
                if (!weatherStates.has(args.keyword.value)) return;
                ControllerWeather.set(args.keyword.value);
                Room.describe(`*beep boop* EXTERNAL WEATHER OVERRIDE: ${args.keyword.value}`);
            }
        }
    }

    namespace ControllerWeather {
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
                if (describes != null && describes.length > 0) {
                    Room.describe(randomDescribe(describes));
                }
            }
            const newWeatherValid = _weatherStates.has(newWeatherKeyword);
            const validWeatherKeyword = newWeatherValid ? newWeatherKeyword : curWeatherKeyword;
            Room.useProfile(validWeatherKeyword);
            Store.setString(StoreKey.currentWeatherKeyword, validWeatherKeyword);
        }
        function sendUpdatePost(): void {
            for (let i: i32 = 0; i < listenerRoomScripts.length; i++) {
                Script.post(listenerRoomScripts[i], TopicKeyword.weatherTick, getStoredKeyword());
            }
        }
        function sendDelayedPost(): void {
            const curWeather = currentState();
            const topic = TopicKeyword.weatherTick;
            const data = randomTransitionKey(curWeather.transitions);
            const delay: i64 = i64(randomDelay(curWeather.duration) / timeScale);

            cancelWeatherPost();

            console.log(`sendUpdatePost: addr=#, topic=${topic}, data=${data}, delay=${delay}`);
            const id = Script.post("#", topic, data, delay);

            if (id == null) Store.deleteKey(StoreKey.weatherPendingPost);
            else Store.setString(StoreKey.weatherPendingPost, id);
        }
        function cancelWeatherPost(): void {
            const weatherPending = Store.getString(StoreKey.weatherPendingPost);
            if (weatherPending != null) Script.cancelPost(weatherPending);
        }
    }

    export namespace ControllerAmbience {
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
            if (describes != null && describes.length > 0) {
                Room.describe(randomDescribe(describes));
            }
        }
        function sendAmbiencePost(): void {
            const curWeather = ControllerWeather.currentState();
            const topic = TopicKeyword.ambienceTick;
            const delay: i64 = i64(randomDelay(curWeather.ambience.delay) / timeScale);

            cancelAmbiencePost();

            console.log(`sendUpdatePost: addr=#, topic=${topic}, data=null, delay=${delay}`);
            const id = Script.post("#", topic, null, delay);
    
            if (id == null) Store.deleteKey(StoreKey.ambiencePendingPost);
            else Store.setString(StoreKey.ambiencePendingPost, id);
        }
        function cancelAmbiencePost(): void {
            const ambiencePending = Store.getString(StoreKey.ambiencePendingPost);
            if (ambiencePending != null) Script.cancelPost(ambiencePending);
        }
    }
}
