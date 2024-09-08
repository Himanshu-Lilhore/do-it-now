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

interface Task {
    _id: string,
    title: string,
    description: string,
    deadline: Date,
    status: string,
    tags: string[]
}


export default function ToDoTable() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            _id: 'default',
            title: 'Default Task',
            description: 'This is a default task description.',
            deadline: new Date(), // Set to current date/time
            status: 'pending',
            tags: ['tag1']
        }
    ]);
    const [input, setInput] = useState<string>('')

    useEffect(() => {
        fetchTasks()
    }, [])


    const fetchTasks = async () => {
        console.log('fetching tasks ...')
        try {
            const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/task/readMany`)
            console.log('Tasks fetched successfully');
            setTasks(response.data)
        } catch (err) {
            console.error('Error fetching tasks :', err);
        }
    }


    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    const createTask = async () => {
        if(!input) return
        console.log('creating tasks ...')
        try {
            const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/task/create`, {
                title: input,
                status: 'pending'
            })
            if(response.status === 200) {
                console.log('Task created successfully');
                setInput('')
            }
        } catch (err) {
            console.error('Error creating task :', err);
        }
    }

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
                                    <TableCell><Checkbox /></TableCell>
                                    <TableCell className="font-medium max-w-64">{task.title}</TableCell>
                                    <TableCell>{task.status}</TableCell>
                                    <TableCell>{}</TableCell>
                                    <TableCell><TaskEditor task={task} fetchTasks={fetchTasks} /></TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>


            {/* Input */}
            <div className='flex flex-row gap-4 sticky bottom-0 right-0 p-4 bg-background'>
                <Input onChange={handleInputChange} value={input} type="search" placeholder="what to do ??" />
                <Button type="submit" onClick={createTask}>Create</Button>
            </div>
        </div>
    )
}