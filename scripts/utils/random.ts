import { DelayData, TransitionData } from "../_/data-types";
import { defaultWeatherKeyword } from "../_/config";

export function randomDelay(delay: DelayData): f64 {
    return f64(Math.floor(Math.random() * (f64(delay.max) - f64(delay.min)))) + f64(delay.min);
}
export function randomDescribe(describes: Array<string>): string {
    return describes[i32(Math.floor(Math.random() * describes.length))];
}
export function randomTransitionKey(transitionsMap: Map<string, TransitionData>): string {
    const weatherKeywords: string[] = transitionsMap.keys();
    const transitions = transitionsMap.values();
    // Calculate the total weight
    let totalWeight: u32 = 0;
    for (let i: i32 = 0; i < transitions.length; i++)
        totalWeight += transitions[i].weight;
    // Generate a random number between 0 and the total weight
    const random = Math.random() * totalWeight;
    // Find the index of the item corresponding to the random number
    let cumulativeWeight: u32 = 0;
    for (let i: i32 = 0; i < transitions.length; i++) {
        cumulativeWeight += transitions[i].weight;
        if (random < cumulativeWeight) return weatherKeywords[i];
    }
    return defaultWeatherKeyword;
}

// export const random = {
//     delay: randomDelay,
//     describe: randomDescribe,
//     transitionKey: randomTransitionKey,
// }
