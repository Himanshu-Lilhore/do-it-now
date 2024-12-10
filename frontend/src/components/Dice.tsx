import DiceIcon from "@/assets/DiceIcon";
import { useEffect, useState, useRef } from "react";
import Axios from 'axios';
import * as type from "../types/index";
import EditIcon from "@/assets/EditIcon";
import TaskReassignTable from "./TaskReassignTable";
Axios.defaults.withCredentials = true


export default function Dice({ tasks }: { tasks: type.Task[] }) {
    const [diceStats, setDiceStats] = useState<type.Dice>({ season: -1, coins: -1, bias: -1, rollResult: 'default', streak: -1, streakHighscore: -1, cooldown: new Date(), currTask: 'default' })
    const [task, setTask] = useState<type.Task | undefined>(undefined)
    const diceRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const readDiceStats = async () => {
            try {
                const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/dice/read`);
                if (response.status === 200) {
                    setDiceStats(response.data);
                } else console.log("couldn't read dice stats")
            } catch (err) {
                console.log("Error reading dice stats", err)
            }
        }
        readDiceStats();
        setTask(tasks.find(task => task._id === diceStats.currTask))

    }, [tasks, diceStats])


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

            {/* Stats  */}
            <div>
                {(new Date(diceStats.cooldown) > (new Date()) && task) &&
                    <div className="flex flex-row gap-2">
                        <div>Current task :</div>
                        <div>{task?.title}</div>
                        <div><TaskReassignTable tasks={tasks} setDiceStats={setDiceStats}/></div>
                    </div>
                }

            </div>
        </div>
    );
}