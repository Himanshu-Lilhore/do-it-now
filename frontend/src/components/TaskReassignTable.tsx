import React, { useState, useEffect } from 'react';
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
import { DialogClose } from '@radix-ui/react-dialog';

Axios.defaults.withCredentials = true


export default function TaskReassignTable({ tasks, setDiceStats }: { tasks: type.Task[], setDiceStats: any }) {
    const [input, setInput] = useState<string>('')

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }


    const swapTask = async (taskId: string) => {
        console.log(`swaping assigned task...`)
        try {
            const response = await Axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/dice/update`,
                {
                    currTask: taskId,
                }
            );
            if (response.status === 200) {
                console.log('Dice task swapped');
                setDiceStats((prev: type.Dice) => ({ ...response.data }));
            }
        } catch (err) {
            console.error('Error swapping task:', err);
        }
    };


    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <EditIcon />
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
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="">
                                {tasks && tasks.filter(subTask => (subTask.title.toLowerCase()).includes(input)).map((task, index) => {
                                    if (task.status !== 'done') {
                                        return (
                                            <TableRow key={task._id}>
                                                <TableCell className="font-medium min-w-44">{task.title}</TableCell>

                                                <DialogClose asChild>
                                                    <TableCell onClick={() => swapTask(task._id)}>
                                                        <div className='w-fit p-1 rounded-full border hover:border-gray-700'>
                                                            <AddIcon />
                                                        </div>
                                                    </TableCell>
                                                </DialogClose>
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
        </>
    );
};

