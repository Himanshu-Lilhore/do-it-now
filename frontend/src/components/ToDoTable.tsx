import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TaskEditor } from "./TaskEditor"
import { useState, useEffect, useRef } from 'react'
import Axios from 'axios';
Axios.defaults.withCredentials = true


interface Task {
    _id: string,
    title: string,
    description: string,
    deadline: Date,
    status: string,
    tags: string[],
    subTasks: string[],
	createdAt: string,
	updatedAt: string
}
interface Tag {
    name: string,
    category: string,
    color: string,
    _id: string
}
import InProgIcon from "@/assets/taskStatus/InProgIcon"
import PendingIcon from "@/assets/taskStatus/PendingIcon"
import DoneIcon from "@/assets/taskStatus/DoneIcon"
import YoutubeIcon from "@/assets/YoutubeIcon"
type TaskStatus = 'in-prog' | 'pending' | 'done';


export default function ToDoTable({ tasks, fetchTasks, fetchToday, superTaskID, allTasks, tags }: { tasks: Task[], fetchTasks: () => void, fetchToday: () => void, superTaskID?: string, allTasks: Task[], tags: Tag[] }) {
    const [input, setInput] = useState<string>('')

    useEffect(() => {
        fetchTasks()
    }, [])


    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    const createTask = async () => {
        if (!input) return;
        console.log('Creating task...');

        try {
            const response1 = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/task/create`, {
                title: input,
                status: 'pending'
            });

            if (response1.status === 200) {
                console.log('Task created successfully');
                setInput('');

                if (superTaskID) {
                    try {
                        let superTask = allTasks.find(task => task._id.toString() === superTaskID);
                        console.log("Super Task Before Update: ", superTaskID);

                        if (!superTask) {
                            console.error("Super Task not found in the list");
                            return;
                        }
                        const response2 = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/task/update`, {
                            _id: superTaskID,
                            subTasks: [...(superTask?.subTasks || []), response1.data._id]
                        });
                        if (response2.status === 200) {
                            console.log('Subtask ID added successfully');
                        }
                    } catch (err) {
                        console.error('Error adding subtask ID :', err);
                    }
                }

                fetchTasks();
            }
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };


    const handleCheckboxChange = async (currStatus: string, id: string) => {
        try {
            const response = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/task/update`, {
                status: currStatus === 'done' ? 'pending' : 'done',
                _id: id
            })
            if (response.status === 200) {
                console.log('Task updated successfully');
                fetchTasks()
                fetchToday()
            }
        } catch (err) {
            console.error('Error updating task :', err);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Table */}
            <div className="max-h-[33rem] overflow-scroll">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Done?</TableHead>
                            <TableHead>Title</TableHead>
                            {!superTaskID && <TableHead>Status</TableHead>}
                            {!superTaskID && <TableHead>Deadline</TableHead>}
                            {!superTaskID && <TableHead></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="">
                        {tasks.sort((task1, task2) => {
                            let val1, val2
                            if(task1.status === 'in-progress') val1 = 0;
                            else if(task1.status === 'pending') val1 = 1;
                            else val1 = 2;
                            if(task2.status === 'in-progress') val2 = 0;
                            else if(task2.status === 'pending') val2 = 1;
                            else val2 = 2;
                            return val1 - val2;
                        }).map((task, index) => {
                            return (
                                <TableRow key={task._id}>
                                    <TableCell><Checkbox checked={task.status === 'done' ? true : false} onClick={() => handleCheckboxChange(task.status, task._id)} /></TableCell>
                                    <TableCell className={`${task.subTasks && task.subTasks.length ? 'underline underline-offset-4' : ''} font-medium max-w-64 whitespace-nowrap overflow-hidden text-ellipsis`}>
                                        <div className="flex flex-row h-full items-center gap-3">
                                            {(task.tags && tags.find(tag => tag._id === task.tags[0])?.name === 'youtube') && <div><YoutubeIcon /></div>}
                                            <div className={`${task.status === 'done' ? 'line-through decoration-stone-700 decoration-2' : ''}`}>{task.title}</div>
                                        </div>
                                    </TableCell>
                                    {!superTaskID &&
                                        <TableCell>
                                            <div className={`size-5 items-center`}>
                                                {
                                                    (task.subTasks && task.subTasks.length) ?
                                                        <div className={`w-fit h-fit px-1 rounded-sm text-nowrap text-sm align-middle text-black font-black font-mono ${(task.subTasks && task.subTasks.length) && (task.status === 'pending') ? ' bg-yellow-500/90 ' : (task.status === 'in-progress' ? ' bg-lime-500 ' : 'bg-zinc-500')}`}>{`${task.subTasks.map(str=>tasks.find(one=>one._id===str)).filter(taskk => taskk?.status === 'done').length}/${task.subTasks.length}`}</div>
                                                        :
                                                        (task.status === 'pending') ? <PendingIcon /> : (task.status === 'done' ? <DoneIcon /> : <InProgIcon />)
                                                }
                                            </div>
                                        </TableCell>}
                                    {!superTaskID && <TableCell>{task.deadline ? `${new Date(task.deadline).toISOString().split('T')[0]}` : '-'}</TableCell>}
                                    <TableCell><TaskEditor task={task} allTasks={allTasks} fetchTasks={fetchTasks} fetchToday={fetchToday} tags={tags} /></TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>


            {/* Input */}
            <div className='flex flex-row gap-4 sticky bottom-0 right-0 p-4 bg-background'>
                <Input onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && createTask()} value={input} type="search" placeholder="Add more..." />
                <Button type="submit" onClick={createTask}>Create</Button>
            </div>
        </div>
    )
}