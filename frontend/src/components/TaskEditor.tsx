import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import StatusSelect from "./ui/StatusSelect"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import Axios from 'axios'
import { useToast } from "@/hooks/use-toast"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
interface Task {
    _id: string,
    title: string,
    description: string,
    deadline: Date,
    status: string,
    tags: string[]
}
interface Props {
    task: Task,
    fetchTasks: () => void
}

export function TaskEditor({ task, fetchTasks }: Props) {
    const [calDate, setCalDate] = useState<Date | undefined>(new Date(task.deadline))
    const [myTask, setMyTask] = useState<Task>(task)
    const { toast } = useToast()


    function handleTitle(e: React.ChangeEvent<HTMLInputElement>) {
        setMyTask(prev => ({
            ...prev,
            title: e.target.value
        }));
    }

    function handleStatus(val: string) {
        setMyTask(prev => ({
            ...prev,
            status: val
        }));
    }



    function handleDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setMyTask(prev => ({
            ...prev,
            description: e.target.value
        }));
    }

    const handleSubmit = async () => {
        console.log('Updating task ...')
        try {
            const response = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/task/update`, {
                ...myTask,
                deadline: calDate
            })
            if (response.status === 200) {
                console.log(`Task updated successfully : ${response.data.title}`);
                fetchTasks()
            }
        } catch (err) {
            console.error('Error updating task :', err);
        }
    }

    const handleDelete = async () => {
        console.log('Deleting task ...')
        try {
            const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/task/delete`, {
                _id: myTask._id
            })
            if (response.status === 200) {
                console.log(`Task deleted successfully : ${response.data}`);
                toast({
                    title: "Task deleted 🗑️",
                    description: myTask.title,
                    variant: "destructive"
                })
                fetchTasks()
            }
        } catch (err) {
            console.error('Error deleting task :', err);
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit Task_</SheetTitle>
                    {/* <SheetDescription>
                      
                    </SheetDescription> */}
                </SheetHeader>
                <div className="grid gap-6 py-4">
                    {/* title  */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input id="title" value={myTask.title} onChange={handleTitle} className="col-span-3" />
                    </div>

                    {/* Status  */}
                    <div className="grid grid-cols-4 items-center gap-4 text-nowrap">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <StatusSelect title={myTask.status} onValueChange={handleStatus} />
                    </div>

                    {/* Deadline  */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deadline" className="text-right">
                            Deadline
                        </Label>
                        <Calendar
                            mode="single"
                            selected={calDate}
                            onSelect={setCalDate}
                            className="col-span-3 rounded-md border"
                        />
                    </div>


                    {/* Description  */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Description
                        </Label>
                        <Textarea id="description" value={myTask.description} className="col-span-3" onChange={handleDescription} />
                    </div>

                    {/* Tags  */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tags" className="text-right">
                            Tags
                        </Label>
                        <div className="col-span-3"></div>
                    </div>

                </div>
                <SheetFooter className="flex flex-row justify-between w-full">
                    <SheetClose asChild>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button type="submit" onClick={handleSubmit}>Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
