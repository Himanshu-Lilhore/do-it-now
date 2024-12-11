import DiceIcon from "@/assets/DiceIcon";
import { useEffect, useState, useRef } from "react";
import Axios from 'axios';
import * as type from "../types/index";
import TaskReassignTable from "./TaskReassignTable";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import CloseIcon from "@/assets/CloseIcon";
import TickIcon from "@/assets/TickIcon";
import { toast } from '@/hooks/use-toast';

Axios.defaults.withCredentials = true


export default function Dice({ tasks }: { tasks: type.Task[] }) {
    const [diceStats, setDiceStats] = useState<type.Dice>({ resultDeclared: true, spinTime: new Date(), season: -1, seasonLimit: -1, coins: -1, bias: -1, rollResult: 'default', streak: -1, streakHighscore: -1, cooldown: new Date(), defaultCooldown: 2, currTask: 'default' })
    const [task, setTask] = useState<type.Task | undefined>(undefined)
    const diceRef = useRef<HTMLButtonElement>(null);
    const [cooldownLeft, setCooldownLeft] = useState<string>("00 : 00 : 00");

    useEffect(() => {
        const readDiceStats = async () => {
            try {
                const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/read`);
                if (response.status === 200) {
                    setDiceStatsProperly(response.data);
                } else {
                    console.log("couldn't read dice stats");
                }
            } catch (err) {
                console.log("Error reading dice stats", err);
            }
        };
        readDiceStats();
    }, []);
    
    
    useEffect(() => {
        console.log(diceStats)//////////////
        setTask(tasks.find((task) => task._id === diceStats.currTask));
    }, [tasks, diceStats]);


    useEffect(() => {
        console.log(task)
    }, [task])


    useEffect(() => {
        if (new Date(diceStats.cooldown) > new Date()) {
            const timer = setInterval(() => {
                const now = new Date();
                const target = new Date(diceStats.cooldown);
                const difference = target.getTime() - now.getTime();

                if (difference <= 0) {
                    clearInterval(timer);
                    setCooldownLeft("00 : 00 : 00");
                } else {
                    const hours = Math.floor(difference / (1000 * 60 * 60));
                    const minutes = Math.floor((difference / (1000 * 60)) % 60);
                    const seconds = Math.floor((difference / 1000) % 60);
                    setCooldownLeft(
                        `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`
                    );
                }
            }, 1000);

            return () => clearInterval(timer); // Cleanup
        }
    }, [diceStats.cooldown]);


    const setDiceStatsProperly = (data : type.Dice) => {
        setDiceStats({...data, spinTime: new Date(data.spinTime), cooldown: new Date(data.cooldown)});
    }


    const rollDice = async () => {
        if(!diceStats.resultDeclared) {
            toast({
                description: "Can't roll the dice when you already have an ongoing task.",
                variant: "destructive"
            })
            return;
        }
        if (diceRef.current) {
            diceRef.current.classList.toggle('rotate-180');
        }
        try {
            const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/roll`);
            if (response.status === 200) {
                setDiceStatsProperly(response.data)
            } else console.log("couldn't roll dice")
        } catch (err) {
            console.log("Error rolling dice", err)
        }
    }


    const taskDone = async () => {
        try{
            const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/pass`);
            if (response.status === 200) {
                setDiceStatsProperly(response.data)
            } else console.log("couldn't submit result")
        } catch (err) {
            console.log("Error submitting pass result", err)
        }
    }

    const taskFail = async () => {
        try{
            const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/fail`);
            if (response.status === 200) {
                setDiceStatsProperly(response.data)
            } else console.log("couldn't submit result.")
        } catch (err) {
            console.log("Error submitting fail result", err)
        }
    }


    return (
        <div className="flex flex-col gap-6">
            {/* Streak & coins  */}
            <div className="flex flex-row justify-between items-center px-2">
                <div className="flex flex-row gap-1" title={`Best : ${diceStats.streakHighscore}`}>
                    <div>🔥</div>
                    <div>{diceStats.streak}</div>
                </div>
                <div className="flex flex-row gap-1">
                    <div>{diceStats.coins}</div>
                    <div>🪙</div>
                </div>
            </div>

            {/* Dice & probability*/}
            <div className="flex flex-row gap-4 justify-evenly items-center font-semibold">
                <div className="text-2xl text-lime-500 flex flex-row items-end relative">
                    {Math.round((diceStats.bias * 100) / (diceStats.bias + 1) * 100) / 100}
                    <div className="opacity-50 text-sm absolute -right-3 bottom-1">%</div>
                </div>
                <button onClick={rollDice} ref={diceRef} className="transition-all duration-200">
                    <DiceIcon />
                </button>
                <div className="text-red-500 flex flex-row items-end text-2xl relative">
                    {Math.round((100 - (diceStats.bias * 100) / (diceStats.bias + 1)) * 100) / 100}
                    <div className="opacity-50 text-sm absolute -right-3 bottom-1">%</div>
                </div>
            </div>

            <Separator />

            {/* Stats  */}
            <div className="grid gap-6 text-sm">

                {task && !diceStats.resultDeclared &&
                    <div className="grid grid-cols-3 items-start">
                        <Label className="pt-1">Current task :</Label>
                        <div id='diceTask' className="relative col-span-2 items-center relative">
                            <p className="text-nowrap text-ellipsis overflow-hidden items-center bg-gray-600/20 hover:bg-gray-600/30 rounded-md px-1">{task.title}</p>
                            <div id='diceTaskOptions' className="absolute bottom-0 right-0 w-full pt-3 pr-2 flex items-center justify-end opacity-0">
                                <div className="flex flex-row py-2 px-4 gap-4 border border-gray-300 rounded-full bg-gray-500/15">
                                    <TaskReassignTable tasks={tasks} diceStats={diceStats} setDiceStatsProperly={setDiceStatsProperly} />
                                    <button onClick={() => taskDone()}><TickIcon /></button>
                                    <button onClick={() => taskFail()}><CloseIcon /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {task && !diceStats.resultDeclared &&
                    <div className="grid grid-cols-3 items-center">
                        <Label>Cooldown :</Label>
                        <p>{new Date(diceStats.cooldown) > (new Date()) ? cooldownLeft : 'Completed'}</p>
                    </div>
                }

                <div className="grid grid-cols-3 items-center">
                    <Label>Next reward :</Label>
                    <p>nothing.</p>
                </div>

                <div className="h-6 flex flex-row gap-2 items-center justify-between">
                    <div className="text-nowrap">Season-{diceStats.season}</div>
                    <Separator orientation="vertical" />
                    <div className="w-full pt-1 px-1"><Progress value={((diceStats.bias-1+(diceStats.resultDeclared?0:-1))/(diceStats.seasonLimit-1))*100} /></div>
                </div>
            </div>
        </div>
    );
}