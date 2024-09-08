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

export default function ShadSelect({ title, length, onValueChange }: { title: string; length: number, onValueChange: (value: string) => void; }) {

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
                        {Array.from({ length: length }).map((_, idx) => (
                            <SelectItem value={`${idx}`} key={idx}>{idx}  {title}</SelectItem>
                        ))}
                    </>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
