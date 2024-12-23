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
import * as type from "../types/index";
Axios.defaults.withCredentials = true

interface Props {
    task: type.Task,
    setTasks: any,
    fetchTasks: () => void,
    fetchToday: () => void,
    allTasks: type.Task[],
    tags: Tag[],
    list: string
}
interface Tag {
    name: string,
    category: string,
    color: string,
    _id: string
}
import { Progress } from "@/components/ui/progress"
import TagSelect from "./ui/TagSelect"
import CloseIcon from "@/assets/CloseIcon"
import { Checkbox } from "@/components/ui/checkbox"


export function TaskEditor({ task, setTasks, fetchTasks, fetchToday, allTasks, tags, list }: Props) {
    const [calDate, setCalDate] = useState<Date | undefined>(new Date(task.deadline))
    const [myTask, setMyTask] = useState<type.Task>(task)
    const [subTasks, setSubTasks] = useState<type.Task[]>([])
    const [thumbnailURL, setThumbnailURL] = useState()
    const [vidURL, setVidURL] = useState<string>()
    const [channel, setChannel] = useState<string>()
    const [del, setDel] = useState(false)
    const [input, setInput] = useState<string>('')
    const { toast } = useToast()
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

    useEffect(() => {
        setMyTask(task)
        if (task.subTasks)
            setSubTasks((task.subTasks.map(eachStr => allTasks.find(thisT => thisT._id === eachStr)) || []).filter((task): task is type.Task => task !== undefined))
    }, [task])

    useEffect(() => {
        setMyTask(task)
        getVidDetails()
    }, [])

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    function handleTitle(e: React.ChangeEvent<HTMLTextAreaElement>) {
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
                // console.log(`Task updated successfully : ${response.data.title}`);
                // fetchTasks()
                // fetchToday()
                setTasks((prev: any[]) => {
                    return [
                        ...prev.filter((task) => task._id !== response.data._id),
                        response.data,
                    ];
                });
            }
        } catch (err) {
            console.error('Error updating task :', err);
        }
    }

    const handleDelete = async () => {
        if (!del) return
        console.log('Deleting task ...')
        try {
            const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/task/delete`, {
                _id: myTask._id
            })
            if (response.status === 200) {
                // console.log(`Task deleted successfully : ${response.data}`);
                toast({
                    title: "Task deleted 🗑️",
                    description: myTask.title,
                    variant: "destructive"
                })
                // fetchTasks()
                // fetchToday()
                setTasks((prev: any[]) => {
                    return [
                        ...prev.filter((task) => task._id !== response.data._id)
                    ];
                });
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
                // console.log(`Subtask added successfully : ${response.data}`);
                // fetchTasks()
                // fetchToday()
                setTasks((prev: any[]) => {
                    return [
                        ...prev.filter((task) => task._id !== response.data._id),
                        response.data,
                    ];
                });
            }
        } catch (err) {
            console.error('Error adding subtask :', err);
        }
    }

    function getVidDetails() {
        if (!(task.tags.length && (tags.find(tag => tag._id === task.tags[0])?.name) === 'youtube')) return
        let thumbnailUrl = null;
        let videoTitle = null;
        let channelName = '';
        let duration = null;
        let uploadDate = null;
        let url = '';

        if (task.description) {
            try {
                const lines = task.description.split('\n');

                lines.forEach(line => {
                    if (line.startsWith('Channel : ')) {
                        channelName = line.replace('Channel : ', '');
                    } else if (line.startsWith('Duration : ')) {
                        duration = line.replace('Duration : ', '');
                    } else if (line.startsWith('Upload Date : ')) {
                        uploadDate = line.replace('Upload Date : ', '');
                    } else if (line.startsWith('URL : ')) {
                        url = line.replace('URL : ', '');
                    } else if (line.startsWith('ResponseObj : ')) {
                        const responseObjString = line.replace('ResponseObj : ', '');

                        try {
                            const responseObj = JSON.parse(responseObjString);

                            videoTitle = responseObj.items[0].snippet.title;
                            thumbnailUrl = responseObj.items[0].snippet.thumbnails.high.url ||
                                responseObj.items[0].snippet.thumbnails.default.url;

                            setVidURL(url);
                            setChannel(channelName)
                            setThumbnailURL(thumbnailUrl);
                        } catch (error) {
                            console.error('Failed to parse ResponseObj:', error);
                        }
                    }
                });
            } catch (err) {
                console.error('Failed to parse task description', err);
            }
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

        return `${datePart} - ${timePart}`;
    }

    const createTask = async () => {
        if (!input) return;
        console.log('Creating task...');

        try {
            const response1 = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/task/create`, {
                title: input,
                status: 'pending',
                list: list.toLowerCase()
            });

            if (response1.status === 200) {
                console.log('Task created successfully');
                setInput('');

                try {
                    const response2 = await Axios.put(`${import.meta.env.VITE_BACKEND_URL}/task/update`, {
                        _id: task._id,
                        subTasks: [...(task.subTasks || []), response1.data._id]
                    });
                    if (response2.status === 200) {
                        setTasks((prev: any[]) => {
                            return [
                                ...prev.filter((task) => task._id !== response2.data._id),
                                response2.data,
                            ];
                        });
                        console.log('Subtask ID added successfully');
                    }
                } catch (err) {
                    console.error('Error adding subtask ID :', err);
                }

                // fetchTasks();
                setTasks((prev: any[]) => {
                    return [
                        ...prev,
                        response1.data,
                    ];
                });
            }
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };


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
                    <SheetTitle className="font-bold flex flex-row">
                        <div className="whitespace-pre opacity-25">{`#${myTask.taskNum} `}</div>
                        {myTask.title.match(regex) && <a href={(myTask.title.match(regex) || [''])[0]} target='_blank'>🔗</a>}
                    </SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>
                {
                    (subTasks && subTasks.length)
                        ?
                        /* Subtasks  */
                        <div className="my-3 flex flex-col">
                            <Progress value={subTasks.filter(task => task.status === 'done').length * 100 / subTasks.length} />
                            <Label className="pl-2 pt-3 pb-1">
                                Sub-tasks {`(  ${subTasks.filter(task => task.status === 'done').length} / ${subTasks.length} )`}
                            </Label>
                            <div className="flex flex-col border rounded-lg p-3 my-1">
                                <ToDoTable
                                    tasks={subTasks}
                                    setTasks={setTasks}
                                    fetchTasks={fetchTasks}
                                    fetchToday={fetchToday}
                                    superTaskID={task._id}
                                    allTasks={allTasks}
                                    tags={tags}
                                    list={list}
                                    className="max-h-[30rem] overflow-y-scroll"
                                />
                            </div>
                        </div>
                        : <></>
                }
                <div className="grid gap-5 py-4">

                    {/* thumbnail  */}
                    {((task.tags.length && (tags.find(tag => tag._id === task.tags[0])?.name) === 'youtube')) ?
                        <div className="flex w-full justify-center  px-3">
                            <div className="relative w-fit overflow-hidden rounded-lg saturate-75 hover:saturate-150 hover:scale-105 transition-all duration-300">
                                <a href={vidURL} target='_blank'>
                                    <img className='' src={thumbnailURL} alt={`thumbnail`} />
                                </a>
                                <div className="text-black w-full font-bold absolute z-10 bottom-0 opacity-50 bg-gray-500/80 text-center">{channel}</div>
                            </div>
                        </div> : <></>
                    }

                    {/* title  */}
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="title" className="text-right mt-2">
                            Title
                        </Label>
                        <Textarea id="title" value={myTask.title} onChange={handleTitle} className="col-span-3 h-20" />
                    </div>

                    {/* Status  */}
                    <div className="grid grid-cols-4 gap-4 text-nowrap">
                        <Label htmlFor="status" className="text-right mt-2">
                            Status
                        </Label>
                        <div className="relative flex w-fit items-center">
                            <StatusSelect title={myTask.status} onValueChange={handleStatus} />
                            <div className="size-5 items-center mx-2">
                                {myTask.status === 'pending' ? <PendingIcon /> : (myTask.status === 'done' ? <DoneIcon /> : <InProgIcon />)}
                            </div>
                        </div>
                    </div>

                    {/* Add subtasks  */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <div></div>
                        <Dialog>
                            <DialogTrigger>
                                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                    Add subtasks
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add subtasks</DialogTitle>
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
                                            {allTasks.filter(subTask => (subTask.title.toLowerCase()).includes(input.toLowerCase())).filter(subTask => !task.subTasks?.find(thisStr => thisStr === subTask._id)).map((subTask, index) => {
                                                if (subTask._id !== task._id)
                                                    return (
                                                        <TableRow key={subTask._id}>
                                                            <TableCell className="font-medium min-w-44">{((subTask.tags.length && (tags.find(tag => tag._id === subTask.tags[0])?.name) === 'youtube')) ? '▶ ' : ''}{subTask.title}</TableCell>
                                                            <TableCell className="min-w-24">{subTask.deadline ? `${new Date(subTask.deadline).toISOString().split('T')[0]}` : '-'}</TableCell>
                                                            <TableCell onClick={() => addSubtasks(subTask._id)}><div className='w-fit p-1 rounded-full border hover:border-gray-700'><AddIcon /></div></TableCell>
                                                        </TableRow>
                                                    )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Search bar  */}
                                <div className='flex flex-row gap-4 p-4'>
                                    <Input className='' onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && createTask()} value={input} type="search" placeholder="Search here ..." />
                                    <Button type="submit" onClick={createTask}>Create</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Deadline  */}
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="deadline" className="text-right mt-2">
                            Deadline
                        </Label>
                        <Calendar
                            mode="single"
                            selected={calDate}
                            onSelect={setCalDate}
                            className="col-span-3 rounded-md border"
                        />
                    </div>

                    {/* Repeat  */}
                    <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right ">Repeat</Label>
                        <Checkbox
                            className={`col-span-3 items-center`}
                            checked={myTask.repeat}
                            onCheckedChange={() => {
                                setMyTask(prev => ({
                                    ...prev,
                                    repeat: !prev.repeat
                                }))
                            }}
                        />
                    </div>

                    {/* Description  */}
                    <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right mt-2">
                            Description
                        </Label>
                        <Textarea id="description" value={myTask.description} className={`col-span-3 ${myTask.description && 'h-36'}`} onChange={handleDescription} />
                    </div>

                    {/* Tags  */}
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="tags" className="text-right mt-2">
                            Tags
                        </Label>
                        <div className="col-span-3 flex flex-row gap-3 flex-wrap rounded-md border border-input bg-transparent p-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                            <div className="flex flex-row gap-2 flex-wrap">
                                {myTask.tags
                                    .map(thisStr => tags.find(tagg => tagg._id.toString() === thisStr.toString()))
                                    .filter(tag => tag)
                                    .map((tag, index) => (
                                        <div
                                            key={tag?._id || index}
                                            className="text-black text-sm font-mono font-semibold pl-3 pr-1 py-1 border rounded-full flex flex-row gap-2 items-center"
                                            style={{ backgroundColor: tag?.color }}
                                        >
                                            <div className="text-black">
                                                {tag?.name.toUpperCase()}
                                            </div>
                                            <div onClick={() => setMyTask(prev => ({ ...prev, tags: prev.tags.filter(id => id !== tag?._id) }))}>
                                                <CloseIcon />
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {myTask.tags.length < tags.length &&
                                <TagSelect myTask={myTask} setMyTask={setMyTask} title='Add tag' tags={tags} />
                            }
                        </div>
                    </div>

                </div>

                {/* Delete & submit  */}
                <SheetFooter className="flex flex-col w-full pt-8">
                    <div className="flex flex-row items-center gap-10">
                        <div className="flex flex-row items-center gap-2">
                            <Label>Delete?</Label>
                            <Checkbox
                                checked={del}
                                onCheckedChange={() => setDel(prev => !prev)}
                            />
                        </div>
                        <SheetClose asChild>
                            <Button variant="destructive" className="w-5/6" onClick={handleDelete}>Delete</Button>
                        </SheetClose>
                    </div>

                    <SheetClose asChild>
                        <Button type="submit" onClick={handleSubmit}>Save changes</Button>
                    </SheetClose>

                </SheetFooter>

                {/* Created & updated  */}
                <div className="grid gap-4 gap-2 p-2 mt-6 opacity-5 hover:opacity-50 trasition-all duration-200">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Created :
                        </Label>
                        <Label className="text-nowrap">{showDateTime(myTask.createdAt)}</Label>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Updated :
                        </Label>
                        <Label className="text-nowrap">{showDateTime(myTask.updatedAt)}</Label>
                    </div>
                </div>

            </SheetContent>
        </Sheet>
    )
}
