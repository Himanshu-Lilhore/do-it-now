import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import RefreshIcon from '@/assets/RefreshIcon';
import AddIcon from '@/assets/AddIcon';
import { Button } from "@/components/ui/button"
import DateTimePicker from './DateTimePicker';
import ResizableDiv from './ResizableDiv';
import ToDoTable from './ToDoTable';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast';
import CreateChunk from './CreateChunk';
import ListSelect from './ListSelect';
import Dice from './Dice';
import * as type from "../types/index";

Axios.defaults.withCredentials = true


export default function Home() {
	const ref = useRef<HTMLDivElement>(null);
	const [tags, setTags] = useState<type.Tag[]>([])
	const [day, setDay] = useState<type.Day>({ startOfDay: '01 Jan 1970 00:00:00 GMT', chunks: [], sleep: { start: null, end: null }, chunksRemaining: null })
	const [currState, setCurrState] = useState({ state: null, today: null, workHrs: 16, sleepHrs: 8, yesterday: null })
	const [now, setNow] = useState<number>(0)   // hourHeight * number of wake hrs passed
	const hourHeight = 4  // rem
	let myTimer = setInterval(() => { return }, 100000000)
	let startHr = new Date(Date.parse(day.startOfDay)).getHours()
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [list, setList] = useState('All')
	const [tasks, setTasks] = useState<type.Task[]>([
		{
			_id: 'default',
			title: 'Default Task',
			description: 'This is a default task description.',
			deadline: new Date(), // Set to current date/time
			status: 'pending',
			tags: ['tag1'],
			subTasks: [],
			createdAt: (new Date()).toString(),
			updatedAt: (new Date()).toString(),
			taskNum: -1,
			repeat: false
		}
	]);

	const fetchTags = async () => {
		console.log('fetching tags ...')
		try {
			const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/tag/read`, { withCredentials: true })
			setTags(response.data)
		} catch (err) {
			console.error('Error fetching tags :', err);
		}
	}

	const fetchTasks = async () => {
		console.log('fetching tasks ...')
		try {
			const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/task/readMany`, { withCredentials: true })
			console.log(`Tasks fetched successfully (${response.data.length})`);
			setTasks(response.data)
		} catch (err) {
			console.error('Error fetching tasks :', err);
		}
	}


	function showDateTime(theDate: string) {
		const timeFormat: Intl.DateTimeFormatOptions = {
			hour12: true,
			hour: 'numeric',
			minute: 'numeric',
		};
		const parsedDate = new Date(theDate);

		const day = parsedDate.getDate().toString().padStart(2, '0');
		const month = parsedDate.toLocaleString('en-US', { month: 'short' });
		const year = parsedDate.getFullYear().toString().slice(-2);

		const datePart = `${day} ${month} ${year}`;

		const timePart = parsedDate.toLocaleTimeString('en-US', timeFormat);

		return `${timePart} | ${datePart}`;
	}


	useEffect(() => {
		fetchState()
		scrollToCurr()
		fetchTags()
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
		console.log(`State updated -
			state: ${currState.state}
			today : ${currState.today}
			workHrs : ${currState.workHrs}
			sleepHrs : ${currState.sleepHrs}
			yesterday : ${currState.yesterday}`)
		const updateDay = async () => {
			fetchToday()
		}

		updateDay()
	}, [currState])


	useEffect(() => {
		startHr = new Date(Date.parse(day.startOfDay)).getHours()

		fetchTasks()

		console.log(`Day updated -
			startOfDay : ${day.startOfDay}
			sleep : ${day.sleep.start} to ${day.sleep.end}
			chunksRemaining : ${day.chunksRemaining}
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
		const nowBarValue = hourHeight * ((diff) / (1000 * 60 * 60) + (new Date(Date.parse(day.startOfDay)).getMinutes()) / (60));
		console.log("--- NOW BAR SET ---")
		setNow(nowBarValue)
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


	const fetchState = async () => {
		console.log("Fetching state...")
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


	const refresh = async () => {
		if (buttonRef.current) {
			buttonRef.current.classList.toggle('rotate-180'); // Toggle the rotate class
		}
		fetchState()
		fetchTasks()
		clearInterval(myTimer)
		setBar()
	}


	const createChunk = async (title: string) => {
		try {
			const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/chunk/create`, {
				title: title,
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

	const calcTime = (startOfDayStr: string, dayLengthInHours: number) => {
		let startOfDay = new Date(Date.parse(startOfDayStr));
		startOfDay.setHours(startOfDay.getHours() + dayLengthInHours);
		return startOfDay.toISOString()
	};



	function getHour(val: number) {
		if (val === 12) return '12 pm'
		else if (val === 0) return 'Next day'
		else if (val > 12) return `${val % 12} pm`
		else if (val < 12) return `${val} am`
	}

	function getChunkDepth(val: string) {
		const chunkDt = new Date(Date.parse(val)).getTime()
		const startOfDay = new Date(day.startOfDay).getTime()
		const diff = (chunkDt - startOfDay) / (1000 * 60 * 60) + (new Date(Date.parse(day.startOfDay)).getMinutes()) / (60)
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

	const setDayID = async (newDay: string) => {
		try {
			const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/state/set`, { today: newDay, yesterday: currState.today });
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

	const calcStats = async () => {
		try {
			const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/stat/calcAvg`, { _id: day._id });
			if (response.status === 200) {
				console.log("Stats calculated successfully");
				setCurrState(response.data)
			}
			else {
				console.log("Issue calculating stats");
			}
		} catch (error) {
			console.error('Error calculating the stats :', error);
		}
	}

	const createNewDay = async () => {
		try {
			if (day.sleep.start && day.sleep.end) {
				const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/day/create`, {});
				if (response.status === 200) {
					console.log(`subsequent day created successfully`);
					calcStats()
					setDayID(response.data._id)
					predictDayLen()
				}
				else {
					console.log("Issue creating subsequent day");
				}
			} else {
				toast({
					title: "Can't create new day",
					description: "Before creating new day sleep start & end needs to be populated"
				})
			}
		} catch (error) {
			console.error('Error creating subsequent day : ', error);
		}
	}


	const predictDayLen = async () => {
		try {
			const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/state/predict`);
			if (response.status === 200) {
				console.log(`Prediction successful`);
				setCurrState(response.data)
			}
			else {
				console.log("Issue doing prediction");
			}
		} catch (error) {
			console.error('Error with prediction : ', error);
		}
	}

	const setSleepEnd = async (newDate: Date) => {
		try {
			const response = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/day/update`, {
				_id: currState.today,
				sleep: { ...day.sleep, end: newDate }
			});
			if (response.status === 200) {
				console.log(`Sleep end set successfully : ${newDate}`);
				setDay(response.data)
			}
			else {
				console.log("Issue ending sleep");
			}
		} catch (error) {
			console.error('Error ending sleep : ', error);
		}
	}

	const setSleepStart = async (newDate: Date) => {
		try {
			const response = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/day/update`, {
				_id: currState.today,
				sleep: { ...day.sleep, start: newDate }
			});
			if (response.status === 200) {
				console.log(`Sleep start set successfully : ${newDate}`);
				setDay(response.data)
			}
			else {
				console.log("Issue starting sleep");
			}
		} catch (error) {
			console.error('Error starting sleep : ', error);
		}
	}


	return (
		<div className="flex relative justify-between">
			<div id='day' className='relative min-h-fit my-2 px-8'>
				<div>
					{/* Hour slots */}
					{Array.from({ length: Math.ceil(currState.workHrs + currState.sleepHrs) }).map((_, index) => (
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
					<div ref={ref} className='absolute w-full border border-red-600' style={{ top: `${now / hourHeight <= Math.ceil(currState.workHrs + currState.sleepHrs) ? now : Math.ceil(currState.workHrs + currState.sleepHrs) * hourHeight}rem` }}></div>
				</div>

				{/* sleep indicator  */}
				<div>
					<div className='absolute w-full bg-gray-600/20 rounded-lg text-right' style={{ top: `${currState.workHrs * hourHeight}rem`, height: `${currState.sleepHrs * hourHeight}rem` }}>
						✨
					</div>
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
										tasks={tasks}
										fetchTasks={fetchTasks}
										tags={tags}
									/>
								}
							</div>
						)
					})}
				</div>
			</div>




			<div className='sticky top-0 right-0 h-fit 2xl:h-screen pr-4 flex xl:flex-row flex-col-reverse'>
				{/* <div classsName='sticky top-0 right-0 h-fit 2xl:h-screen pr-4 flex xl:flex-row flex-col-reverse'> */}

				<div className='z-50 w-96 m-4 p-4 bg-background overflow-hidden flex flex-col border border-gray-600 rounded-lg shadow-lg hover:shadow-xl hover:shadow-gray-600 shadow-gray-800'>
					{/* Dice */}
					<div className='z-[100] p-6 overflow-hidden w-full'>
						<Dice tasks={tasks} />
					</div>
					{/* 4am  */}
					<iframe className='w-full h-[42rem] rounded-xl'
						src=
						"https://himanshu-lilhore.github.io/4am/client/"
						title="4am" >
					</iframe>
				</div>


				<div>
					<h1 className="text-8xl font-bold mb-6 text-right">do-it-now</h1>

					<div className='flex flex-col gap-8'>
						<div className='flex flex-row justify-between'>
							<div className=' '>
								<ListSelect title={list} setList={setList} />
							</div>
							<div className='flex items-center justify-end gap-4'>
								{/* Day config  */}
								<Dialog>
									<DialogTrigger>
										<div className='border px-3 py-1 rounded-md hover:bg-gray-400/40'>Config day</div>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Configure the day</DialogTitle>
										</DialogHeader>
										<div className='grid grid-cols-2 gap-3 px-16'>
											{/* Pick start of day */}
											<>
												<p>Start of day :</p>
												<DateTimePicker
													date={new Date(day.startOfDay)}
													setDate={setStartDateTime}
													title={`${showDateTime(day.startOfDay)}`}
												/>
											</>

											{/* Sleep time  */}
											<>
												<p>Sleep time :</p>
												<div className='flex flex-col gap-1'>
													<div className='flex flex-row'>
														<p className='pr-2 text-gray-500/40 text-sm items-center'>Start</p>
														<DateTimePicker
															date={new Date()}
															setDate={setSleepStart}
															title={`${showDateTime(day.sleep.start ? (new Date(day.sleep.start).toISOString()) : (calcTime(day.startOfDay, (currState.workHrs))))}`} />
													</div>
													<div className='flex flex-row'>
														<p className='pr-3 text-gray-500/40 text-sm items-center'>End</p>
														<DateTimePicker
															date={new Date()}
															setDate={setSleepEnd}
															title={`${showDateTime(day.sleep.end ? (new Date(day.sleep.end).toISOString()) : (calcTime(day.startOfDay, (currState.workHrs + currState.sleepHrs))))}`} />
													</div>
												</div>
											</>
										</div>
										<DialogFooter>
											<Button variant="secondary"
												onClick={createNewDay}>
												New day
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>

								{/* Refresh  */}
								<Button ref={buttonRef} variant="outline" size="icon" onClick={refresh} className='transition-all duration-200'>
									<RefreshIcon />
								</Button>

								{/* Add chunk  */}
								<CreateChunk createChunk={createChunk} />
							</div>
						</div>

						{/* to-do  */}
						<div>
							<ToDoTable tasks={tasks} setTasks={setTasks} fetchTasks={fetchTasks} fetchToday={fetchToday} allTasks={tasks} tags={tags} list={list} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};