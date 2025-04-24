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
import { commandWhiteList, listenerRoomScripts } from "../_/config";
import { TopicKeyword, WeatherKeyword } from "../_/const";
import { ControllerAmbience } from "./ambience";
import { ControllerWeather } from "./weather";

export namespace Controller {
    let _weatherStates: Map<string, WeatherStateData> = new Map<string, WeatherStateData>();
    export function setWeatherStates(weatherStates: Map<string, WeatherStateData>): void {
        _weatherStates = weatherStates;
        ControllerWeather.setWeatherStates(_weatherStates);
        ControllerAmbience.setWeatherStates(_weatherStates);
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
        console.log(`onCommand: keyword=${cmdAction.keyword}, data=${cmdAction.data}`);

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
}
