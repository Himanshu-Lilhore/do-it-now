import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import StatusSelect from "./ui/StatusSelect"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import Axios from 'axios'
import { useToast } from "@/hooks/use-toast"
Axios.defaults.withCredentials = true
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
import PendingIcon from "@/assets/taskStatus/PendingIcon"
import DoneIcon from "@/assets/taskStatus/DoneIcon"
import InProgIcon from "@/assets/taskStatus/InProgIcon"
import ToDoTable from "./ToDoTable"
import AddIcon from "@/assets/AddIcon"
interface Task {
    _id: string,
    title: string,
    description: string,
    deadline: Date,
    status: string,
    tags: string[],
    subTasks: string[]
}
interface Props {
    task: Task,
    fetchTasks: () => void,
    fetchToday: () => void
    allTasks: Task[]
}
import { Progress } from "@/components/ui/progress"


export function TaskEditor({ task, fetchTasks, fetchToday, allTasks }: Props) {
    const [calDate, setCalDate] = useState<Date | undefined>(new Date(task.deadline))
    const [myTask, setMyTask] = useState<Task>(task)
    const [subTasks, setSubTasks] = useState<Task[]>([])
    const { toast } = useToast()

    useEffect(() => {
        console.log(`task : ${myTask.title}\nsubtasks : `, myTask.subTasks ? myTask.subTasks.length : 0)
        if(task.subTasks && task.subTasks.length)
        setSubTasks((task.subTasks.map(eachStr => allTasks.find(thisT => thisT._id === eachStr)) || []).filter((task): task is Task => task !== undefined))
    }, [task])

    useEffect(() => {
        setMyTask(task)
    }, [])


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
            const response = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/task/update`,
                task.deadline ?
                    {
                        ...myTask,
                        deadline: calDate
                    } :
                    { ...myTask }
            )
            if (response.status === 200) {
                console.log(`Task updated successfully : ${response.data.title}`);
                fetchTasks()
                fetchToday()
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
                fetchToday()
            }
        } catch (err) {
            console.error('Error deleting task :', err);
        }
    }

    const addSubtasks = async (subtaskID: string) => {
        try {
            const response = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/task/update`, {
                _id: task._id,
                subTasks: [...(task.subTasks || []), subtaskID]
            })
            if (response.status === 200) {
                console.log(`Subtask added successfully : ${response.data}`);
                fetchTasks()
                fetchToday()
            }
        } catch (err) {
            console.error('Error adding subtask :', err);
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
            <SheetContent className="overflow-auto">
                <SheetHeader>
                    <SheetTitle className="font-bold">EDIT TASK</SheetTitle>
                    {/* <SheetDescription>
                      
                    </SheetDescription> */}
                </SheetHeader>
                {
                    (subTasks && subTasks.length)
                    ?
                    <div className="my-3">
                        <Progress value={subTasks.filter(task => task.status === 'done').length*100 / subTasks.length} />
                        <Label htmlFor="subtasks" className="pl-2">
                            Sub-tasks
                        </Label>
                        <div className="flex flex-col border rounded-lg p-3 my-1">
                            <ToDoTable
                                tasks={subTasks}
                                fetchTasks={fetchTasks}
                                fetchToday={fetchToday}
                                superTaskID={task._id}
                                allTasks={allTasks}
                            />
                        </div>
                    </div>
                    : <></>
                }
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
                        <div className="relative flex w-fit items-center">
                            <StatusSelect title={myTask.status} onValueChange={handleStatus} />
                            <div className="size-5 items-center mx-2">
                                {myTask.status === 'pending' ? <PendingIcon /> : (myTask.status === 'done' ? <DoneIcon /> : <InProgIcon />)}
                            </div>
                        </div>
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
                    {/* Add subtasks  */}
                    <Dialog>
                        <DialogTrigger>
                            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                Add subtasks
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
                                        {allTasks.filter(subTask => !task.subTasks?.find(thisStr => thisStr===subTask._id)).map((subTask, index) => {
                                            if (subTask._id !== task._id)
                                                return (
                                                    <TableRow key={subTask._id}>
                                                        <TableCell className="font-medium min-w-44">{subTask.title}</TableCell>
                                                        <TableCell className="min-w-24">{subTask.deadline ? `${new Date(subTask.deadline).toISOString().split('T')[0]}` : '-'}</TableCell>
                                                        <TableCell onClick={() => addSubtasks(subTask._id)}><div className='w-fit p-1 rounded-full border hover:border-gray-700'><AddIcon /></div></TableCell>
                                                    </TableRow>
                                                )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>

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
