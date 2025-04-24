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

import { CmdArgs, WeatherStateData } from "../_/data-types";
import { commandWhiteList, controllerRoomScript } from "../_/config";
import { TopicKeyword, WeatherKeyword } from "../_/const";
import { ListenerAmbience } from "./ambience";
import { ListenerWeather } from "./weather";

export namespace Listener {
    let _weatherStates: Map<string, WeatherStateData> = new Map<string, WeatherStateData>();
    export function setWeatherStates(weatherStates: Map<string, WeatherStateData>): void {
        _weatherStates = weatherStates;
        ListenerWeather.setWeatherStates(_weatherStates);
        ListenerAmbience.setWeatherStates(_weatherStates);
    }
    export function getWeatherStates(): Map<string, WeatherStateData> {
        return _weatherStates;
    }

    // onActivate is called when the script is activated.
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

        const weatherEnabled = ListenerWeather.isEnabled();
        if (weatherEnabled) ListenerWeather.start();
        const ambienceEnabled = ListenerAmbience.isEnabled();
        if (ambienceEnabled) ListenerAmbience.start();

        Room.describe("*beep boop* WEATHER LISTENER STARTED."
            + ` WEATHER IS ${weatherEnabled ? "ENABLED" : "DISABLED"}.`
            + ` AMBIENCE IS ${ambienceEnabled ? "ENABLED" : "DISABLED"}.`
        );

        Script.listen([controllerRoomScript]);
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
            if (ListenerWeather.isEnabled()) {
                cmdAction.info("Weather is already activated.");
                return;
            }
            ListenerWeather.start();
            Room.describe("*beep boop* WEATHER ACTIVATED");
        }
        else if (cmdAction.keyword == TopicKeyword.weatherOff) {
            if (!ListenerWeather.isEnabled()) {
                cmdAction.info("Weather is already deactivated.");
                return;
            }
            ListenerWeather.stop();
            Room.describe("*beep boop* WEATHER DEACTIVATED");
        }
        else if (cmdAction.keyword == TopicKeyword.ambienceOn) {
            if (ListenerAmbience.isEnabled()) {
                cmdAction.info("Ambience is already activated.");
                return;
            }
            ListenerAmbience.start();
            Room.describe("*beep boop* AMBIENCE ACTIVATED");
        }
        else if (cmdAction.keyword == TopicKeyword.ambienceOff) {
            if (!ListenerAmbience.isEnabled()) {
                cmdAction.info("Ambience is already deactivated.");
                return;
            }
            ListenerAmbience.stop();
            Room.describe("*beep boop* AMBIENCE DEACTIVATED");
        }
        else if (cmdAction.keyword == TopicKeyword.weatherOverride) {
            if (!ListenerWeather.isEnabled()) {
                cmdAction.info("Weather is deactivated.");
                return;
            }
            const args = JSON.parse<CmdArgs.WeatherOverride>(cmdAction.data);
            if (!weatherStates.has(args.keyword.value)) {
                cmdAction.info("Keyword is invalid.");
                return;
            }
            Script.post(controllerRoomScript, cmdAction.keyword, cmdAction.data);
            Room.describe(`*beep boop* WEATHER OVERRIDE REQUESTED: ${args.keyword.value}`);
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

        if (topic == TopicKeyword.weatherTick) {
            if (data == null) return;
            if (!ListenerWeather.isEnabled()) return;
            ListenerWeather.set(data);
        }
        else if (topic == TopicKeyword.ambienceTick) {
            if (!ListenerAmbience.isEnabled()) return;
            ListenerAmbience.tick();
        }
    }
}
