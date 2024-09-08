import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import RefreshIcon from '@/assets/RefreshIcon';
import AddIcon from '@/assets/AddIcon';
import { Button } from "@/components/ui/button"
import DateTimePicker from './DateTimePicker';
import ResizableDiv from './ResizableDiv';
import ToDoTable from './ToDoTable';

Axios.defaults.withCredentials = true
interface DayState {
	_id?: string;
	startOfDay: string;
	chunks: Chunk[];
	sleep: { start: Date | null; end: Date | null };
	chunksRemaining: number | null;
}
interface Chunk {
	_id: string;
	startTime: string;
	duration: number;
	rating: number;
	tasks: string[];
}


export default function Home() {
	const ref = useRef<HTMLDivElement>(null);
	const [day, setDay] = useState<DayState>({ startOfDay: '01 Jan 1970 00:00:00 GMT', chunks: [], sleep: { start: null, end: null }, chunksRemaining: null })
	const [currState, setCurrState] = useState({ state: null, today: null, dayLength: 24 })
	const [now, setNow] = useState<number>(0)
	const hourHeight = 4  // rem
	let myTimer = setInterval(() => { return }, 100000000)

	const timeFormat: Intl.DateTimeFormatOptions = {
		hour12: true,
		hour: 'numeric',
		minute: 'numeric'
	};

	useEffect(() => {
		fetchState()
		scrollToCurr()
	}, [])

	const fetchToday = async () => {
		console.log('fetching today ...')
		if (currState.today) {
			try {
				const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/day/read`, {
					_id: currState.today
				})
				setDay(response.data)
			} catch (err) {
				console.error('Error fetching current day:', err);
			}
		}
	}
	useEffect(() => {
		console.log(`State updated - \n
			state: ${currState.state} \n
			today : ${currState.today} \n
			dayLength : ${currState.dayLength}`)
		const updateDay = async () => {
			fetchToday()
		}

		updateDay()
	}, [currState])


	useEffect(() => {
		console.log(`Day updated - \n
			startOfDay : ${day.startOfDay} \n
			sleep : ${day.sleep.start} to ${day.sleep.end} \n
			chunksRemaining : ${day.chunksRemaining} \n
			chunks : ${day.chunks.map(val => {
			return `start - ${val.startTime}, dur - ${val.duration}, rating - ${val.rating}, tasks - ${val.tasks}`
		})}`)

		clearInterval(myTimer)
		setBar()
		myTimer = setInterval(() => {
			setBar()
		}, 1000 * 60 * 5)
	}, [day])


	function setBar() {
		const rightNow = Date.now()
		const dayStart = (new Date(Date.parse(day.startOfDay))).getTime()
		const diff = rightNow - dayStart
		const nowBarValue = hourHeight * ((diff) / (1000 * 60 * 60));
		console.log("--- NOW BAR SET ---")
		setNow(nowBarValue)
		scrollToCurr()
	}


	function scrollToCurr() {
		if (day.startOfDay && now !== 0) {
			setTimeout(() => {
				ref.current?.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}, 100)
		}
	}

	const changeState = async () => {
		try {
			const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/state/EOD`);
			if (response.status === 200) {
				console.log("State updated successfully");
				setCurrState(response.data)
			}
			else {
				console.log("Issue setting the state");
			}
		} catch (error) {
			console.error('Error setting the state :', error);
		}
	}


	const fetchState = async () => {
		try {
			const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/state/read`);
			if (response.status === 200) {
				console.log("State fetched successfully");
				setCurrState(response.data)
			}
			else {
				console.log("Issue fetching the state");
			}
		} catch (error) {
			console.error('Error fetching currState : ', error);
		}
	}


	const createChunk = async () => {
		try {
			const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/chunk/create`, {
				startTime: Date.now(),
				duration: 2
			});
			if (response.status === 200) {
				console.log("Chunk created successfully");
				let newDay = day
				newDay.chunks.push(response.data._id)
				try {
					const res2 = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/day/update`, {
						...newDay
					})
					if (res2.status === 200) {
						console.log("Day updated successfully");
						setDay(res2.data)
					}
				} catch (err) {
					console.error('Error updating day after creating chunk : ', err);
				}
			}
			else {
				console.log("Issue creating chunk");
			}
		} catch (error) {
			console.error('Error creating chunk : ', error);
		}
	}

	const setStartDateTime = async (newDate: Date) => {
		try {
			const response = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/day/update`, {
				_id: currState.today,
				startOfDay: newDate
			});
			if (response.status === 200) {
				console.log(`New date set successfully : ${newDate}`);
				setDay(response.data)
			}
			else {
				console.log("Issue setting new date");
			}
		} catch (error) {
			console.error('Error setting new start time : ', error);
		}
	}

	const startHr = new Date(Date.parse(day.startOfDay)).getHours()

	function getHour(val: number) {
		if (val === 12) return '12 pm'
		else if (val === 0) return 'Next day'
		else if (val > 12) return `${val % 12} pm`
		else if (val < 12) return `${val} am`
	}

	function getChunkDepth(val: string) {
		const chunkDt = new Date(Date.parse(val)).getTime()
		const startOfDay = new Date(day.startOfDay).getTime()
		const diff = (chunkDt - startOfDay) / (1000 * 60 * 60)
		return diff * hourHeight
	}

	const deleteChunk = async (chunkId: string) => {
		try {
			const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/chunk/delete`, {
				_id: chunkId,
				day_id: day._id
			});
			if (response.status === 200) {
				console.log(`The chunk deleted successfully & updated the day`);
				fetchToday()
			}
			else {
				console.log("Issue deleting the chunk");
			}
		} catch (err) {
			console.error('Error deleting the chunk : ', err);
		}
	}

	return (
		<div className="flex relative justify-between">
			<div id='day' className='relative min-h-fit my-2 px-8'>
				<div>
					{/* Hour slots */}
					{Array.from({ length: currState.dayLength }).map((_, index) => (
						<div key={index} className='flex flex-row'>
							<div className='relative flex items-center justify-center border-y border-gray-300 w-72' style={{ height: `${hourHeight}rem` }}>
								<div className='absolute -top-3 -left-8 px-2'>
									{`${index}`}
								</div>
							</div>
							<div className='px-2 relative min-w-24'>
								<div className='absolute -top-3 left-2'>
									{`${getHour((startHr + index) % 24)}`}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* --- NOW --- */}
				<div className='absolute h-full w-[120%] left-0 top-0'>
					<div ref={ref} className='absolute w-full border border-red-600' style={{ top: `${now}rem` }}></div>
				</div>

				{/* Chunk render */}
				<div className='absolute h-full w-full left-3 top-0'>
					{day.chunks.map((thisChunk, index) => {
						return (
							<div key={thisChunk._id}>
								{thisChunk &&
									<ResizableDiv
									thisChunk={thisChunk}
									hourHeight={hourHeight}
									getChunkDepth={getChunkDepth}
									deleteChunk={deleteChunk}
									fetchToday={fetchToday}
								  />
								}
							</div>
						)
					})}
				</div>
			</div>


			<div className='sticky top-0 h-screen pr-4'>
				<h1 className="text-8xl font-bold mb-6">do-it-now</h1>

				<div className='flex flex-col gap-8'>
					{/* Pick start of day */}
					<div className='flex flex-row items-center my-4 justify-end'>
						<div className='mr-4'>
							Start of day :
						</div>
						<DateTimePicker
							date={new Date(Date.parse(day.startOfDay))}
							setStartDateTime={setStartDateTime}
							title={`${new Date(Date.parse(day.startOfDay)).toISOString().split('T')[0]} | ${new Date(Date.parse(day.startOfDay)).toLocaleTimeString('en-US', timeFormat)}`}
						/>
					</div>

					{/* EOD & refresh  */}
					<div className='flex items-center justify-end gap-4'>
						<Button variant="secondary"
							onClick={changeState}>
							{currState.state === 'awake' && 'Sleep now'}
							{currState.state === 'asleep' && 'Woke up'}
							{!currState.state && '⌛'}
						</Button>

						<Button variant="outline" size="icon" onClick={fetchState}>
							<RefreshIcon />
						</Button>

						<Button variant="outline" size="icon" onClick={createChunk}>
							<AddIcon />
						</Button>
					</div>

					{/* to-do  */}
					<div>
						<ToDoTable />
					</div>

				</div>

			</div>

		</div>
	);
};