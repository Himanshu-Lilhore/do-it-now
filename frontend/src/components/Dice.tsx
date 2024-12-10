import DiceIcon from "@/assets/DiceIcon";
import { useEffect, useState, useRef } from "react";
import Axios from 'axios';
import * as type from "../types/index";
import TaskReassignTable from "./TaskReassignTable";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
Axios.defaults.withCredentials = true


export default function Dice({ tasks }: { tasks: type.Task[] }) {
    const [diceStats, setDiceStats] = useState<type.Dice>({ season: -1, coins: -1, bias: -1, rollResult: 'default', streak: -1, streakHighscore: -1, cooldown: new Date(), currTask: 'default' })
    const [task, setTask] = useState<type.Task | undefined>(undefined)
    const diceRef = useRef<HTMLButtonElement>(null);
    const [cooldownLeft, setCooldownLeft] = useState<string>("00 : 00 : 00");

    useEffect(() => {
        const readDiceStats = async () => {
            try {
                const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/read`);
                if (response.status === 200) {
                    setDiceStats(response.data);
                } else {
                    console.log("couldn't read dice stats");
                }
            } catch (err) {
                console.log("Error reading dice stats", err);
            }
        };
        readDiceStats();
        console.log(diceStats)//////////////
    }, []);


    useEffect(() => {
        setTask(tasks.find((task) => task._id === diceStats.currTask));
    }, [tasks, diceStats.currTask]);


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


    const rollDice = async () => {
        if (diceRef.current) {
            diceRef.current.classList.toggle('rotate-180');
        }
        try {
            const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/roll`);
            if (response.status === 200) {
                setDiceStats(response.data)
            } else console.log("couldn't roll dice")
        } catch (err) {
            console.log("Error rolling dice", err)
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

                {(new Date(diceStats.cooldown) > (new Date()) && task) &&
                    <div className="grid grid-cols-3 items-center">
                        <Label>Current task :</Label>
                        <div className="col-span-2 items-center relative">
                            <p className="text-nowrap text-ellipsis overflow-hidden items-center">{task?.title}</p>
                            <div className="flex justify-end absolute -top-1 -right-20 hover:right-0 w-96 h-full">
                                <TaskReassignTable tasks={tasks} setDiceStats={setDiceStats} />
                            </div>
                        </div>
                    </div>
                }

                {(new Date(diceStats.cooldown) > (new Date()) && task) &&

                    <div className="grid grid-cols-3 items-center">
                        <Label>Cooldown in :</Label>
                        <p>{cooldownLeft}</p>
                    </div>
                }

                <div className="grid grid-cols-3 items-center">
                    <Label>Next reward :</Label>
                    <p>nothing.</p>
                </div>

                <div className="h-6 flex flex-row gap-2 items-center justify-between">
                    <div className="text-nowrap">Season-{diceStats.season}</div>
                    <Separator orientation="vertical" />
                    <div className="w-full pt-1 px-1"><Progress value={diceStats.bias * 5} /></div>
                </div>
            </div>
        </div>
    );
}