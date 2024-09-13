import * as React from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function StatusSelect({ title, onValueChange }: { title: string, onValueChange: (value: string) => void; }) {

    const handleValueChange = (value: string) => {
        onValueChange(value)
    };

    return (
        <Select onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={title} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <>
                        <SelectItem value='pending' key='pending'>Pending</SelectItem>
                        <SelectItem value='in-progress' key='in-progress'>In-progress</SelectItem>
                        <SelectItem value='done' key='done'>Done</SelectItem>
                    </>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}