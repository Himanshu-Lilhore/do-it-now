import React, { useState, useRef, useEffect, useCallback } from 'react';
import DeleteIcon from '@/assets/DeleteIcon';
import Axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import EditIcon from '@/assets/EditIcon';
import AddIcon from '@/assets/AddIcon';
import { Input } from './ui/input';
import * as type from "../types/index";
import TickIcon from '@/assets/TickIcon';

Axios.defaults.withCredentials = true

interface ChunkProps {
    thisChunk: type.Chunk;
    hourHeight: number;
    getChunkDepth: (startTime: string) => number;
    deleteChunk: (chunkId: string) => void;
    fetchToday: () => void;
    tasks: type.Task[];
    fetchTasks: () => void;
    tags: type.Tag[];
    setDay: any;
    diceStats: type.Dice;
    setDiceStats: any
}

export default function Chunk({ thisChunk, hourHeight, getChunkDepth, deleteChunk, fetchToday, tasks, fetchTasks, tags, setDay, diceStats, setDiceStats }: ChunkProps) {
    const [height, setHeight] = useState<number>(thisChunk.duration * hourHeight);
    const [top, setTop] = useState<number>(getChunkDepth(thisChunk.startTime));
    const [prevTop, setPrevTop] = useState<number>(getChunkDepth(thisChunk.startTime))
    const resizableRef = useRef<HTMLDivElement>(null);
    const dummyRef = useRef<HTMLDivElement>(null);
    const heightRef = useRef<number>(height);
    const topRef = useRef<number>(top);
    const isResizing = useRef(false);
    const dragOffset = useRef<number>(0);  // To store the initial offset when dragging
    let myTimer = setTimeout(() => { return }, 1000000000);
    const [isDeleted, setIsDeleted] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')

    useEffect(() => {
        heightRef.current = height;
    }, [height]);

    useEffect(() => {
        topRef.current = top;
    }, [top]);

    useEffect(() => {
        const readDiceStats = async () => {
            try {
                const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/read`);
                if (response.status === 200) {
                    setDiceStats((prev:type.Dice) => {
                        prev.coins = response.data.coins
                        return prev;
                    });
                } else {
                    console.log("couldn't read dice stats");
                }
            } catch (err) {
                console.log("Error reading dice stats", err);
            }
        };
        readDiceStats();
    }, []);


    const updateCoinCount = async (reduction: number) => {
        try {
            setDay((prev: type.Day) => {
                let thatChunk = prev.chunks.find((chunk) => thisChunk._id === chunk._id)
                prev.chunks = prev.chunks.filter((chunk) => thisChunk._id !== chunk._id)
                if (thatChunk) {
                    thatChunk.isFrozen = true
                    prev.chunks.push(thatChunk)
                }
                return prev;
            })
            const response = await Axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/dice/update`,
                {
                    coins: diceStats.coins - reduction
                }
            );
            if (response.status === 200) {
                setDiceStats((prev:type.Dice) => {
                    prev.coins = response.data.coins
                    return prev;
                });
                try {
                    const response2 = await Axios.put(
                        `${import.meta.env.VITE_BACKEND_URL}/chunk/update`,
                        {
                            _id: thisChunk._id,
                            isFrozen: true
                        }
                    );
                    if (response2.status === 200) {
                        setDay((prev: type.Day) => {
                            let thatChunk = prev.chunks.find((chunk) => thisChunk._id === chunk._id)
                            prev.chunks = prev.chunks.filter((chunk) => thisChunk._id !== chunk._id)
                            if (thatChunk) {
                                thatChunk.isFrozen = true
                                prev.chunks.push(thatChunk)
                            }
                            return prev;
                        })
                    }
                } catch (err2) {
                    console.error('Error updating chunk (isFrozen) :', err2);
                }
            }
        } catch (err) {
            console.error('Error updating coin count :', err);
        }
    };



    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }


    // Color - theme
    const applyOpacityToHex = (hex: string, opacity: number) => {
        const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0'); // Convert opacity to 2-digit hex
        return `${hex}${alpha}`;
    };

    let colorHere = '#646464'
    if (thisChunk.tasks.length) {
        if (thisChunk.tasks[0].tags.length) {
            colorHere = tags.find(tag => tag._id.toString() === thisChunk.tasks[0].tags[0].toString())?.color || ''
        }
    }

    const backgroundColor = applyOpacityToHex(colorHere, 0.1);
    const borderColor = colorHere;


    // Dragging handlers
    const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (isResizing.current) return;  // Prevent dragging while resizing
        e.preventDefault();

        if (resizableRef.current) {
            const initialMouseY = e.clientY;
            const initialTop = resizableRef.current.getBoundingClientRect().top;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            dragOffset.current = initialMouseY - initialTop + scrollTop;  // Calculate offset
        }

        document.addEventListener('mousemove', handleDragMouseMove);
        document.addEventListener('mouseup', handleDragMouseUp);
    };

    const handleDragMouseMove = (e: MouseEvent) => {
        if (resizableRef.current) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newTopInPixels = e.clientY - dragOffset.current + 2 * scrollTop;  // Adjust by the offset
            const newTopInRem = newTopInPixels / 16;
            setTop(newTopInRem);
        }
    };

    const handleDragMouseUp = () => {
        document.removeEventListener('mousemove', handleDragMouseMove);
        document.removeEventListener('mouseup', handleDragMouseUp);

        clearTimeout(myTimer);
        myTimer = setTimeout(() => {
            updateChunk();
        }, 2000);
    };

    // Resizing handlers
    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        isResizing.current = true;  // Set resizing state
        e.preventDefault();
        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleResizeMouseUp);
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
        if (resizableRef.current) {
            const newHeightInPixels = e.clientY - resizableRef.current.getBoundingClientRect().top;
            const newHeightInRem = newHeightInPixels / 16;
            setHeight(newHeightInRem);
        }
    };

    const handleResizeMouseUp = () => {
        isResizing.current = false;  // Reset resizing state
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);

        clearTimeout(myTimer);
        myTimer = setTimeout(() => {
            updateChunk();
        }, 2000);
    };

    const updateChunk = async () => {
        if (!isDeleted) {
            try {
                const newDuration = heightRef.current / hourHeight;
                let currDate = new Date(Date.parse(thisChunk.startTime))
                const diff = (topRef.current - prevTop) / hourHeight
                let durChanges = {}, timeChanges = {}
                // console.log(`currDate.getHrs : ${currDate.getHours()} \n
                // prevTop : ${prevTop} \n
                // currTop : ${topRef.current} \n
                // diff : ${diff} `)
                currDate.setMilliseconds(currDate.getMilliseconds() + diff * 60 * 60 * 1000)
                if (newDuration) durChanges = { duration: newDuration }
                if (diff) timeChanges = { startTime: currDate }

                const response = await Axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/chunk/update`,
                    {
                        _id: thisChunk._id,
                        ...durChanges,
                        ...timeChanges
                    }
                );
                if (response.status === 200) {
                    setPrevTop(topRef.current)
                    fetchToday();
                } else {
                    console.log('Issue updating the chunk');
                }
            } catch (err) {
                console.error('Error updating the chunk:', err);
            }
        }
    };


    const handleDelete = useCallback(async (chunkId: string) => {
        // console.log(`deleting : ${chunkId}`)
        setIsDeleted(true);
        await deleteChunk(chunkId);
    }, [deleteChunk]);


    const addTask = async (chunkId: string, taskId: string) => {
        console.log(`attaching task...`)
        try {
            const response = await Axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/chunk/update`,
                {
                    _id: chunkId,
                    tasks: [...thisChunk.tasks, taskId]
                }
            );
            if (response.status === 200) {
                // fetchTasks();
                fetchToday();
                console.log('A task added to the chunk');
            }
        } catch (err) {
            console.error('Error adding task to chunk:', err);
        }
    };

    const deleteTask = async (chunkId: string, taskId: string) => {
        console.log(`detaching task...`)
        try {
            const updatedTasks = thisChunk.tasks.filter(item => item._id.toString() !== taskId.toString());
            const response = await Axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/chunk/update`,
                {
                    _id: chunkId,
                    tasks: updatedTasks
                }
            );
            if (response.status === 200) {
                // fetchTasks();
                fetchToday();
                console.log('A task detached from the chunk');
            }
        } catch (err) {
            console.error('Error detaching task from the chunk :', err);
        }
    };


    return (
        <div id='magicdivparent'>
            <div id='magicdiv'
                className={`hidden lg:block ${height > 9 ? 'h-[8rem] w-24' : `${height > 5 ? `h-[${Math.floor(height)}rem] w-36` : 'h-[2.5rem] w-56'} `} absolute z-10 right-2 lg:-right-6 border-r-4 border-transparent hover:border-red-900 rounded-lg items-center`}
                style={{
                    top: `${top}rem`,
                }}>

                <div className={`${height > 5 ? 'flex-col top-1' : 'flex-row top-2 gap-2'} h-full absolute right-2 cursor-pointer flex justify-around items-center`} >
                    {/* Slot duration  */}
                    <div className='text-sm flex-row -space-y-1'>
                        <div>{Math.floor(height / hourHeight)} h</div>
                        <div>{Math.round(((height / hourHeight) - Math.floor(height / hourHeight)) * 60)} m</div>
                    </div>

                    <div className={`${height > 9 ? 'flex-col' : 'flex-row'} flex gap-2`}>
                        {/* Edit  */}
                        <div>
                            <Dialog>
                                <DialogTrigger><EditIcon /></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Tasks</DialogTitle>
                                    </DialogHeader>
                                    <div>
                                        <div className="flex flex-col gap-2 max-h-[24rem] overflow-scroll">
                                            {!(thisChunk.tasks.length) ?
                                                "No tasks added yet." :
                                                thisChunk.tasks.map((task, index) => {
                                                    return (
                                                        <div key={task._id} className='flex flex-row justify-between items-center gap-4 p-4 border hover:border-gray-700 rounded-md'>
                                                            <div className={`max-w-96 ${task.status === 'done' && 'line-through'}`}>
                                                                {task.title}
                                                            </div>
                                                            <div onClick={() => { deleteTask(thisChunk._id, task._id) }}><DeleteIcon /></div>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Dialog>
                                            <DialogTrigger>
                                                <div className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2'>
                                                    Add more
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Tasks</DialogTitle>
                                                </DialogHeader>
                                                <div className='max-h-[24rem] overflow-scroll'>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Title</TableHead>
                                                                <TableHead>Deadline</TableHead>
                                                                <TableHead></TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody className="">
                                                            {tasks && tasks.filter(subTask => (subTask.title.toLowerCase()).includes(input)).filter(task => !thisChunk.tasks.some(item => item._id.toString() === task._id.toString())).map((task, index) => {
                                                                if (task.status !== 'done') {
                                                                    return (
                                                                        <TableRow key={task._id}>
                                                                            <TableCell className="font-medium min-w-44">{((task.tags.length && (tags.find(tag => tag._id === task.tags[0])?.name) === 'youtube')) ? '▶ ' : ''}{task.title}</TableCell>
                                                                            <TableCell className="min-w-24">{task.deadline ? `${new Date(task.deadline).toISOString().split('T')[0]}` : '-'}</TableCell>
                                                                            <TableCell onClick={() => addTask(thisChunk._id, task._id)}><div className='w-fit p-1 rounded-full border hover:border-gray-700'><AddIcon /></div></TableCell>
                                                                        </TableRow>
                                                                    )
                                                                }
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <Input className='' onChange={handleInputChange} value={input} type="search" placeholder="Search here ..." />
                                            </DialogContent>

                                        </Dialog>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Delete  */}
                        <div onClick={() => { handleDelete(thisChunk._id) }}>
                            <DeleteIcon />
                        </div>
                    </div>
                </div>
            </div >

            {/* tasks  */}
            <div
                ref={thisChunk.isFrozen ? dummyRef : resizableRef}
                className='absolute backdrop-blur-sm overflow-auto left-6 border-4 rounded-lg w-80 lg:w-full cursor-move'
                style={{
                    top: `${top}rem`,
                    height: `${height}rem`,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                }}
                onMouseDown={handleDragMouseDown}  // Initiate dragging
            >
                {/* chunk title  */}
                {thisChunk.title &&
                    <div className='flex flex-row px-1 gap-6 items-start'>
                        <div className='text-xs tracking-widest font-bold'>
                            {thisChunk.title.toUpperCase()}
                        </div>
                        {thisChunk.tasks.length === 0 &&
                            <div className={`flex flex-row gap-2 text-xs items-start ${thisChunk.isFrozen ? 'text-gray-400' : (height / hourHeight) * 10 < diceStats.coins ? 'text-lime-500' : 'text-red-500'}`}>
                                <div>🪙{Math.round((height / hourHeight) * 10 * 100) / 100}</div>
                                {!thisChunk.isFrozen && <button onClick={() => updateCoinCount((height / hourHeight) * 10)} className='relative grayscale hover:grayscale-0'>☑️</button>}
                            </div>
                        }
                    </div>
                }

                {/* {thisChunk.tasks} */}
                <div className={`${height > 9 ? 'pr-12' : `${height > 5 ? 'pr-20' : 'pr-28'}`} py-3 pl-3 flex flex-col gap-3 text-sm`}>
                    {thisChunk.tasks.map((task, idx) => (
                        <div className={`bg-stone-950/70 border p-2 rounded-md whitespace-nowrap overflow-hidden text-ellipsis ${task.status === 'done' && 'line-through'}`} key={idx}>
                            {task.title}
                        </div>
                    ))}
                </div>

                <div
                    className='absolute bottom-0 left-0 w-full h-4 cursor-s-resize'
                    onMouseDown={handleResizeMouseDown}  // Initiate resizing
                ></div>
            </div>
        </div >
    );
};

