import React, { useState, useRef } from 'react';
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
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';

Axios.defaults.withCredentials = true


export default function TaskReassignTable({ tasks, diceStats, setDiceStatsProperly }: { tasks: type.Task[], diceStats: type.Dice, setDiceStatsProperly: any }) {
    const [input, setInput] = useState<string>('')
    const timerRef = useRef<any>()

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
                console.log('Dice task swapped', response.data);
                setDiceStatsProperly({ ...diceStats, ...response.data });
            }
        } catch (err) {
            console.error('Error swapping task:', err);
        }
    };


    const handleSliderChange = async (value: number[], state: type.Dice = diceStats) => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(async () => {
            try {
                const response = await Axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/dice/update`,
                    {
                        cooldown: new Date(diceStats.spinTime.getTime() + value[0] * 60 * 60 * 1000)
                    }
                );
                if (response.status === 200) {
                    console.log('Dice cooldown updated', response.data);
                    setDiceStatsProperly({ ...diceStats, ...response.data });
                }
            } catch (err) {
                console.error('Error updating cooldown:', err);
            }
        }, 1000)
    }


    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <EditIcon />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className='pb-1 text-md font-normal'>Cooldown (in hrs)</div>
                            <Slider defaultValue={[(diceStats?.cooldown?.getTime() - diceStats?.spinTime?.getTime()) / (60 * 60 * 1000)]} max={diceStats.defaultCooldown * 2} step={0.01} onValueChange={handleSliderChange} />
                            <div className='w-full flex flex-row justify-between text-sm font-thin text-gray-400'>
                                {Array.from({ length: diceStats.defaultCooldown * 2 + 1 }).map((_v, idx) => {
                                    return <div key={idx}>{idx}</div>;
                                })}
                            </div>
                        </DialogTitle>
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

