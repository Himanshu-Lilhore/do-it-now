export interface Day {
	_id?: string;
	startOfDay: string;
	chunks: Chunk[];
	sleep: { start: Date | null; end: Date | null };
	chunksRemaining: number | null;
}
export interface Chunk {
	title: string,
	_id: string;
	startTime: string;
	duration: number;
	rating: number;
	tasks: Task[];
}
export interface Task {
	_id: string,
	title: string,
	description: string,
	deadline: Date,
	status: string,
	tags: string[],
	subTasks: string[],
	createdAt: string,
	updatedAt: string,
	taskNum: number,
	repeat: boolean
}
export interface Tag {
	name: string,
	category: string,
	color: string,
	_id: string
}
export interface Dice {
	resultDeclared: boolean,
	spinTime: Date,
    season: number,
	seasonLimit: number,
    coins: number,
    bias: number,
    rollResult: String,
    streak:  number,
    streakHighscore: number,
    cooldown: Date,
	defaultCooldown: number,
    currTask: String
}