import React, { useState, useRef, useEffect } from 'react';
import DeleteIcon from '@/assets/DeleteIcon';
import Axios from 'axios';

interface ResizableDivProps {
    thisChunk: {
        _id: string;
        startTime: string;
        duration: number;
        tasks: string[];
    };
    hourHeight: number;
    getChunkDepth: (startTime: string) => number;
    deleteChunk: (chunkId: string) => void;
    fetchToday: () => void;
}

const ResizableDiv: React.FC<ResizableDivProps> = ({
    thisChunk,
    hourHeight,
    getChunkDepth,
    deleteChunk,
    fetchToday
}) => {
    const [height, setHeight] = useState<number>(thisChunk.duration * hourHeight);
    const [top, setTop] = useState<number>(getChunkDepth(thisChunk.startTime));
    const [prevTop, setPrevTop] = useState<number>(getChunkDepth(thisChunk.startTime))
    const resizableRef = useRef<HTMLDivElement>(null);
    const heightRef = useRef<number>(height);
    const topRef = useRef<number>(top);
    const isResizing = useRef(false);
    const dragOffset = useRef<number>(0);  // To store the initial offset when dragging
    let myTimer = setTimeout(() => { return }, 1000000000);

    useEffect(() => {
        heightRef.current = height;
    }, [height]);

    useEffect(() => {
        topRef.current = top;
    }, [top]);



    // Dragging handlers
    const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (isResizing.current) return;  // Prevent dragging while resizing
        e.preventDefault();

        if (resizableRef.current) {
            const initialMouseY = e.clientY;
            const initialTop = resizableRef.current.getBoundingClientRect().top;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            dragOffset.current = initialMouseY - initialTop + scrollTop;  // Calculate offset
        }

        document.addEventListener('mousemove', handleDragMouseMove);
        document.addEventListener('mouseup', handleDragMouseUp);
    };

    const handleDragMouseMove = (e: MouseEvent) => {
        if (resizableRef.current) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newTopInPixels = e.clientY - dragOffset.current + 2*scrollTop;  // Adjust by the offset
            const newTopInRem = newTopInPixels / 16;
            setTop(newTopInRem);
        }
    };

    const handleDragMouseUp = () => {
        document.removeEventListener('mousemove', handleDragMouseMove);
        document.removeEventListener('mouseup', handleDragMouseUp);

        clearTimeout(myTimer);
        myTimer = setTimeout(() => {
            updateChunk();
        }, 2000);
    };

    // Resizing handlers
    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        isResizing.current = true;  // Set resizing state
        e.preventDefault();
        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleResizeMouseUp);
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
        if (resizableRef.current) {
            const newHeightInPixels = e.clientY - resizableRef.current.getBoundingClientRect().top;
            const newHeightInRem = newHeightInPixels / 16;
            setHeight(newHeightInRem);
        }
    };

    const handleResizeMouseUp = () => {
        isResizing.current = false;  // Reset resizing state
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);

        clearTimeout(myTimer);
        myTimer = setTimeout(() => {
            updateChunk();
        }, 2000);
    };

    const updateChunk = async () => {
        try {
            const newDuration = heightRef.current / hourHeight;
            // const newTop = topRef.current / hourHeight;
            let currDate = new Date(Date.parse(thisChunk.startTime))
            const diff = (topRef.current - prevTop)/hourHeight
            console.log(`currDate.getHrs : ${currDate.getHours()} \n
            prevTop : ${prevTop} \n
            currTop : ${topRef.current} \n
            diff : ${diff} `)
            currDate.setMilliseconds(currDate.getMilliseconds() + diff*60*60*1000)

            const response = await Axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/chunk/update`,
                {
                    _id: thisChunk._id,
                    duration: newDuration,
                    startTime: currDate
                }
            );
            if (response.status === 200) {
                setPrevTop(topRef.current)
                fetchToday();
            } else {
                console.log('Issue updating the chunk');
            }
        } catch (err) {
            console.error('Error updating the chunk:', err);
        }
    };

    return (
        <div
            ref={resizableRef}
            className='absolute left-6 border-4 border-sky-900 rounded-lg w-full bg-sky-500/10 cursor-move'
            style={{
                top: `${top}rem`,
                height: `${height}rem`,
            }}
            onMouseDown={handleDragMouseDown}  // Initiate dragging
        >
            <div className='absolute top-0 right-0' onClick={() => deleteChunk(thisChunk._id)}>
                <DeleteIcon />
            </div>
            {thisChunk.tasks.map((task, idx) => (
                <div key={idx}>{task}</div>
            ))}
            <div
                className='absolute bottom-0 left-0 w-full h-4 cursor-s-resize'
                onMouseDown={handleResizeMouseDown}  // Initiate resizing
            ></div>
        </div>
    );
};

export default ResizableDiv;
