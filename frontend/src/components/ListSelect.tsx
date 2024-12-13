import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react";


export default function ListSelect({ title, setList }: { title: string, setList: (value: string) => void; }) {
    const [listTypes, setListTypes] = useState([
        {name: 'All', color: 'DodgerBlue'},
        {name: 'Routine', color: 'SlateBlue'},
        {name: 'Productive', color: 'MediumSeaGreen'},
        {name: 'Semi-productive', color: 'Orange'},
        {name: 'Unproductive', color: 'LightGray'},
    ])
    
    const handleValueChange = (value: string) => {
        setList(value)
    };

    return (
        <Select onValueChange={handleValueChange}>
            <SelectTrigger className="w-40 lg:w-[180px]">
                <SelectValue placeholder={title} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <>
                        {
                            listTypes.map(listType => {
                                return (
                                    <SelectItem value={listType.name} key={listType.name} >
                                        <div className='flex flex-row items-center gap-2'>
                                            <div className='rounded-full size-4' style={{ backgroundColor: listType.color }}></div>
                                            <div>{listType.name}</div>
                                        </div>
                                    </SelectItem>
                                )
                            })
                        }
                    </>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}