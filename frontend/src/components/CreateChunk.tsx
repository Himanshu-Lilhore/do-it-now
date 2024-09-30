import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AddIcon from '@/assets/AddIcon';
import { useState, useRef } from 'react'
import { toast } from '@/hooks/use-toast';

export default function CreateChunk({ createChunk }: { createChunk: (val: string) => void }) {
    const [title, setTitle] = useState("")
    const submitButtonRef = useRef<HTMLButtonElement>(null)

    function handleSubmit() {
        if (!(title.trim())) {
            toast({
                description: "Untitled chunk won't be generated !"
            })
            return
        }
        createChunk(title.trim())
        setTitle('')
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <AddIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add a title to the chunk</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="what's up..?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitButtonRef.current?.click()}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" onClick={handleSubmit} ref={submitButtonRef}>Submit</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}