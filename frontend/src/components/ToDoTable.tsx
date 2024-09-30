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
    tags: string[]
}
import InProgIcon from "@/assets/taskStatus/InProgIcon"
import PendingIcon from "@/assets/taskStatus/PendingIcon"
import DoneIcon from "@/assets/taskStatus/DoneIcon"

export default function ToDoTable({ tasks, fetchTasks, fetchToday }: { tasks: Task[], fetchTasks: () => void, fetchToday: () => void }) {
    const [input, setInput] = useState<string>('')

    useEffect(() => {
        fetchTasks()
    }, [])


    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    const createTask = async () => {
        if (!input) return
        console.log('creating tasks ...')
        try {
            const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/task/create`, {
                title: input,
                status: 'pending'
            })
            if (response.status === 200) {
                console.log('Task created successfully');
                setInput('')
                fetchTasks()
            }
        } catch (err) {
            console.error('Error creating task :', err);
        }
    }

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
            <div className="max-h-[29rem] overflow-scroll">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Done?</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="">
                        {tasks && tasks.map((task, index) => {
                            return (
                                <TableRow key={task._id}>
                                    <TableCell><Checkbox checked={task.status === 'done' ? true : false} onClick={() => handleCheckboxChange(task.status, task._id)} /></TableCell>
                                    <TableCell className="font-medium max-w-64 whitespace-nowrap hover:whitespace-normal overflow-hidden text-ellipsis">{task.title}</TableCell>
                                    <TableCell>
                                        <div className="size-5">
                                            {task.status === 'pending' ? <PendingIcon /> : (task.status === 'done' ? <DoneIcon /> : <InProgIcon />)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{task.deadline ? `${new Date(task.deadline).toISOString().split('T')[0]}` : '-'}</TableCell>
                                    <TableCell><TaskEditor task={task} fetchTasks={fetchTasks} fetchToday={fetchToday} /></TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>


            {/* Input */}
            <div className='flex flex-row gap-4 sticky bottom-0 right-0 p-4 bg-background'>
                <Input onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && createTask()} value={input} type="search" placeholder="what to do ??" />
                <Button type="submit" onClick={createTask}>Create</Button>
            </div>
        </div>
    )
}