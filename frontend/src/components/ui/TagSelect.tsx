import React, { Dispatch, SetStateAction } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
interface Task {
    _id: string,
    title: string,
    description: string,
    deadline: Date,
    status: string,
    tags: string[],
    subTasks: string[],
	createdAt: string,
	updatedAt: string
}
interface Tag {
    name: string,
    category: string,
    color: string,
    _id: string
}

export default function TagSelect({ myTask, setMyTask, title, tags }: { myTask: Task, setMyTask: (Dispatch<SetStateAction<Task>>), title: string, tags: Tag[] }) {

    const handleValueChange = (value: string) => {
        setMyTask(prev => ({
            ...prev,
            tags: [...prev.tags, value]
        }));
    };

    return (
        <Select onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={title} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <>
                        {tags.map(tag => {
                            if (!(myTask.tags.find(thisStr => thisStr === tag._id)))
                                return (
                                    <SelectItem value={tag._id} key={tag._id} >
                                        <div className='flex flex-row items-center gap-2'>
                                            <div className='rounded-full size-4' style={{ backgroundColor: tag.color }}></div>
                                            <div>{tag.name}</div>
                                        </div>
                                    </SelectItem>
                                )
                        })}
                    </>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}