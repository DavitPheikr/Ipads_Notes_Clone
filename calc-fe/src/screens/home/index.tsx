import { ColorSwatch, Group } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import {SWATCHES} from '@/constants';
// import {LazyBrush} from 'lazy-brush';


// Latex codes have been commented out
declare global {
    interface Window {
        MathJax: any; // Declares MathJax on the window object  
    }
}

document.body.style.backgroundColor = 'black';


interface GeneratedResult {
    expression: string;
    answer: string;
}

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}


export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [dictOfVars, setDictOfVars] = useState({});
    const [result, setResult] = useState<GeneratedResult>();
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
    const [isErasing, setIsErasing] = useState(false);
    // const lazyBrush = new LazyBrush({
    //     radius: 10,
    //     enabled: true,
    //     initialPoint: { x: 0, y: 0 },
    // });

    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
                const canvas = canvasRef.current;
                if (canvas) {
                    const canvasRect = canvas.getBoundingClientRect();
                    console.log(canvasRect);  // Log canvas dimensions
    
                    // Get the LaTeX container
                    const latexElement = document.querySelector('.latex-content');
                    const latexRect = latexElement?.getBoundingClientRect();
    
                    // If the LaTeX element is found, adjust the position dynamically
                    if (latexRect) {
                        const centerX = canvasRect.left + canvasRect.width / 2 - latexRect.width / 2;
                        const centerY = canvasRect.top + canvasRect.height / 2 - latexRect.height / 2;
    
                        setLatexPosition({ x: centerX, y: centerY });
                    }
                }
            }, 0);
        }
    }, [latexExpression]);
    
    
    
    

    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth - canvas.offsetLeft;
                canvas.height = window.innerHeight;
                ctx.lineCap = 'round';
                ctx.lineWidth = 5;
            }

        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
            });
        };

        return () => {
            document.head.removeChild(script);
        };

    }, []);

    

    const eraseRoute = () => {
        setIsErasing(!isErasing);
    };

    
    
    const renderLatexToCanvas = (expression: string, answer: string) => {
        const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression([...latexExpression, latex]);

        // Clear the main canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };


    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = 'black';
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) {
            return;
        }
        
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = isErasing ? 'black' : color;
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    };
    const stopDrawing = () => {
        setIsDrawing(false);
    };  

    const runRoute = async () => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars
                }
            });

            const resp = await response.data;
            console.log('Response', resp);
            resp.data.forEach((data: Response) => {
                if (data.assign === true) {
                    // dict_of_vars[resp.result] = resp.answer;
                    setDictOfVars({
                        ...dictOfVars,
                        [data.expr]: data.result
                    });
                }
            });
            const ctx = canvas.getContext('2d');
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    if (imageData.data[i + 3] > 0) {  // If pixel is not transparent
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPosition({ x: centerX, y: centerY });
            resp.data.forEach((data: Response) => {
                setTimeout(() => {
                    setResult({
                        expression: data.expr,
                        answer: data.result
                    });
                }, 1000);
            });
        }
    };

    return (
        <>

<div className ="flex items-start h-screen">
    <div className='flex flex-col items-start h-screen p-6'>
        <div className='flex flex-col items-center space-y-10'>

        <Button
                onClick={runRoute}
                    className='z-20 bg-black text-white border-2 border-blue-200 px-4 py-2 w-full'
                    variant='default'
                    color='white'
                >
                    Run
                </Button>
                
            <Button
                onClick={() => setReset(true)}
                className='z-20 bg-black text-white border-2 border-blue-200 px-4 py-2 w-full'
                variant='default' 
                color='black'
            >
                Reset
            </Button>
            

                <Button
                onClick={eraseRoute}
                className= {isErasing ? 'z-20 bg-black text-white border-2 border-blue-700 px-4 py-2 w-full' : 'z-20 bg-black text-white border-2 border-blue-200 px-4 py-2 w-full'}
                variant='default'
                color='white'
                >   
                {isErasing ? 'Stop' : 'Erase'}
                </Button>

            </div>

            <Group className='flex flex-col items-start flex-grow justify-center z-20'>
                <div className="border-2 rounded-lg border-blue-200 p-6 flex flex-col flex-wrap gap-4 items-center w-full">
                    {SWATCHES.map((swatch) => (
                        <ColorSwatch key={swatch} color={swatch} onClick={() => setColor(swatch)} />
                    ))}
                </div>
            </Group>
    </div>

        <canvas
        ref={canvasRef}
        id='canvas'
        className='relative top-0 left-0 z-0 border-l-2'
        width={800} height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        />

</div>


<div className="relative w-full h-full">
  {latexExpression && latexExpression.map((latex, index) => (
    <Draggable
      key={index}
      defaultPosition={latexPosition}
      onStop={(_, data) => setLatexPosition({ x: data.x, y: data.y })}
    >
      <div className="absolute p-2 text-white rounded shadow-md">
        <div className="latex-content">{latex}</div>
      </div>
    </Draggable>
  ))}
</div>

        </>
    );
}