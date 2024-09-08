import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import ShadSelect from "./ui/ShadSelect"
interface Props {
    title: String,
    date: Date;
    setStartDateTime: (time: Date) => void;
}
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from 'react'


export default function DateTimePicker({ title, date, setStartDateTime }: Props) {
    const [currDate, setCurrDate] = useState<Date>(date)
    const [calDate, setCalDate] = useState<undefined | Date>(date)

    useEffect(() => {
        console.log(`new Date : ${currDate}`)
    }, [currDate])

    function handleSubmit() {
        if (calDate) {
            let newVal = new Date(
                calDate.getFullYear(),
                calDate.getMonth(),
                calDate.getDate(), // day of the month
                currDate.getHours(),
                currDate.getMinutes(),
                currDate.getSeconds()
            );
            setStartDateTime(newVal);
        }
    }
    

    function setHr(val: string) {
        setCurrDate(prev => {
            prev.setHours(parseInt(val))
            return prev
        })
    }
    function setMin(val: string) {
        setCurrDate(prev => {
            prev.setMinutes(parseInt(val))
            return prev
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">{title}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Pick start of day :</AlertDialogTitle>
                        <div className="flex flex-row gap-6 pt-2">
                            <div className="flex flex-col gap-6">
                                <ShadSelect title='hrs' length={24} onValueChange={setHr} />
                                <ShadSelect title='mins' length={60} onValueChange={setMin}/>
                            </div>
                            <div>
                                <Calendar
                                    mode="single"
                                    selected={calDate}
                                    onSelect={setCalDate}
                                    className="rounded-md border"
                                />
                            </div>
                        </div>
                    <AlertDialogDescription>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}