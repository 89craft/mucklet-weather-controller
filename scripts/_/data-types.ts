export class DelayData {
	min: i64 = 0;
	max: i64 = 0;
}
export class AmbienceData {
	delay: DelayData = new DelayData();
	describes: string[] = [];
}
export class TransitionData {
	weight: u32 = 100;
	describes: string[] = [];
}
export class WeatherStateData {
	duration: DelayData = new DelayData();
	ambience: AmbienceData = new AmbienceData();
	transitions: Map<string, TransitionData> = new Map<string, TransitionData>();
}

export namespace CmdArgs {
	@json
	export class WeatherOverride {
		@alias("Keyword")
		keyword: FieldValue.List = new FieldValue.List();
	}
}
