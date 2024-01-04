'use client';

import { useState, useRef, useEffect } from 'react';
import useStore from '../store/store';

import rough from 'roughjs';
import { Button } from './ui/button';
import { FaCaretDown, FaEraser, FaPen } from 'react-icons/fa';
import { MdOutlineRectangle } from 'react-icons/md';
import { FaRegCircle } from 'react-icons/fa';
import { PiLineSegmentFill } from 'react-icons/pi';
import { GrClear } from 'react-icons/gr';

const TOOL_TYPES = {
  PEN: 'PEN',
  RECT: 'RECTANGLE',
  CIRCLE: 'CIRCLE',
  LINE: 'LINE',
  // ERASER: 'ERASER',
};

export default function Whiteboard() {
  const whiteboardVisible = useStore((state) => state.whiteboardVisible);
  const setWhiteboardVisible = useStore((state) => state.setWhiteboardVisible);
  const currentRoom = useStore((state) => state.currentRoom);

  const socket = useStore((state) => state.socket);
  const shapes = useStore((state) => state.shapes);
  const setShapes = useStore((state) => state.setShapes);
  const emptyShapes = useStore((state) => state.emptyShapes);

  const color = useRef('#000');
  const [boundary, setBoundary] = useState({ x: 0, y: 0 });
  const strokeWidthRC = 2;
  // const [size, setSize] = useState(1); TODO : ADD STROKE WIDTH SETTINGS ?
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const colorInputRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const [roughCanvas, setRoughCanvas] = useState();

  const shapesRef = useRef(shapes);

  // Drawing states ---- Using escape hatch from react for rough JS
  const isDrawing = useRef(false);
  const tool = useRef(TOOL_TYPES.PEN);
  const ctx = canvasRef.current?.getContext('2d');
  const path = useRef('');
  const mouseDownPosition = useRef({ x: 0, y: 0 });

  const handleCloseWhiteboard = () => setWhiteboardVisible(false);
  const handleColorPickerClick = () => {
    setIsPickerVisible(true);
    colorInputRef.current.click();
  };
  const handleToolChange = (e) =>
    (tool.current = e.target.closest('button').value);

  const usePickOnChange = (e) => {
    setIsPickerVisible(false);
    color.current = colorInputRef.current.value;
  };

  const clearCanvas = () => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const clearShapes = () => {
    emptyShapes();
    shapesRef.current = [];
    // emit clear shapes event
  };

  const drawShapes = () => {
    clearCanvas();
    const shapesObject = shapesRef.current;
    if (shapesObject.length > 0 && roughCanvas) {
      shapesObject.forEach((el) => {
        switch (el.type) {
          case TOOL_TYPES.PEN:
            roughCanvas.path(el.path, {
              roughness: 0.1,
              simplification: 1,
              strokeWidth: strokeWidthRC,
              stroke: el.color,
            });
            break;
          case TOOL_TYPES.RECT:
            roughCanvas.rectangle(el.rect.x, el.rect.y, el.rect.w, el.rect.h, {
              roughness: 0.4,
              stroke: el.color,
              strokeWidth: strokeWidthRC,
            });
            break;

          case TOOL_TYPES.CIRCLE:
            roughCanvas.circle(el.circle.x, el.circle.y, 2 * el.circle.r, {
              roughness: 0.35,
              stroke: el.color,
              strokeWidth: strokeWidthRC,
            });
            break;
          case TOOL_TYPES.LINE:
            roughCanvas.line(el.line.x1, el.line.y1, el.line.x2, el.line.y2, {
              roughness: 0.45,
              stroke: el.color,
              strokeWidth: strokeWidthRC,
            });
            break;
        }
      });
    }
  };
  // RETRIEVE SHAPES FROM A CENTRAL LOCATION AND FEED THEM TO DRAW

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    switch (tool.current) {
      case TOOL_TYPES.PEN:
        ctx.beginPath();
        ctx.strokeStyle = color.current;
        ctx.moveTo(e.clientX - boundary.x, e.clientY - boundary.y);
        path.current = `M ${e.clientX - boundary.x} ${e.clientY - boundary.y} `;
        break;
      case TOOL_TYPES.RECT:
      case TOOL_TYPES.CIRCLE:
      case TOOL_TYPES.LINE:
        mouseDownPosition.current.x = e.clientX - boundary.x;
        mouseDownPosition.current.y = e.clientY - boundary.y;
        break;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    switch (tool.current) {
      case TOOL_TYPES.PEN:
        ctx.lineTo(e.clientX - boundary.x, e.clientY - boundary.y);
        path.current += ` L ${e.clientX - boundary.x} ${
          e.clientY - boundary.y
        }`;
        ctx.stroke();
        break;
      case TOOL_TYPES.RECT:
        drawShapes();
        roughCanvas?.rectangle(
          mouseDownPosition.current.x,
          mouseDownPosition.current.y,
          e.clientX - boundary.x - mouseDownPosition.current.x,
          e.clientY - boundary.y - mouseDownPosition.current.y,
          { stroke: color.current }
        );
        break;
      case TOOL_TYPES.CIRCLE:
        drawShapes();
        const w = e.clientX - boundary.x - mouseDownPosition.current.x;
        const h = e.clientY - boundary.y - mouseDownPosition.current.y;
        console.log('CIRCLE MOVE: ', w, h);
        const r = Math.pow(Math.pow(w, 2) + Math.pow(h, 2), 0.5);
        console.log(r);
        console.log(w * w + h * h);
        roughCanvas?.circle(
          mouseDownPosition.current.x,
          mouseDownPosition.current.y,
          2 * r,
          { stroke: color.current, roughness: 0.45 }
        );
        break;
      case TOOL_TYPES.LINE:
        drawShapes();
        const x2 = e.clientX - boundary.x;
        const y2 = e.clientY - boundary.y;
        roughCanvas?.line(
          mouseDownPosition.current.x,
          mouseDownPosition.current.y,
          x2,
          y2,
          { stroke: color.current }
        );
        break;
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    let shape = { color: color.current };
    switch (tool.current) {
      case TOOL_TYPES.PEN:
        ctx.closePath();
        const pathObject = {
          type: TOOL_TYPES.PEN,
          path: path.current,
        };
        shape = { ...shape, ...pathObject };
        path.current = '';
        break;
      case TOOL_TYPES.RECT:
        const rectangleObject = {
          type: TOOL_TYPES.RECT,
          rect: {
            x: mouseDownPosition.current.x,
            y: mouseDownPosition.current.y,
            w: e.clientX - boundary.x - mouseDownPosition.current.x,
            h: e.clientY - boundary.y - mouseDownPosition.current.y,
          },
        };
        shape = { ...shape, ...rectangleObject };
        break;
      case TOOL_TYPES.CIRCLE:
        const w = e.clientX - boundary.x - mouseDownPosition.current.x;
        const h = e.clientY - boundary.y - mouseDownPosition.current.y;
        const r = Math.pow(Math.pow(w, 2) + Math.pow(h, 2), 0.5);
        const circleObject = {
          type: TOOL_TYPES.CIRCLE,
          circle: {
            x: mouseDownPosition.current.x,
            y: mouseDownPosition.current.y,
            r,
          },
        };
        shape = { ...shape, ...circleObject };
        break;

      case TOOL_TYPES.LINE:
        const x2 = e.clientX - boundary.x;
        const y2 = e.clientY - boundary.y;
        const lineObject = {
          type: TOOL_TYPES.LINE,
          line: {
            x1: mouseDownPosition.current.x,
            y1: mouseDownPosition.current.y,
            x2,
            y2,
          },
        };
        shape = { ...shape, ...lineObject };

        break;
    }
    socket.emit('whiteboard:shape', { roomId: currentRoom, shape });
    setShapes(shape);
  };

  useEffect(() => {
    if (ctx && whiteboardVisible && roughCanvas) {
      shapesRef.current = shapes;
      drawShapes();
    }
  }, [shapes, whiteboardVisible, roughCanvas, ctx]);

  useEffect(() => {
    if (ctx && color.current) {
      ctx.strokeStyle = color.current;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 1;

      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 1;
      ctx.shadowColor = color.current;
    }
  }, [ctx, color.current]);

  useEffect(() => {
    if (roughCanvas && ctx) {
      canvasRef.current?.addEventListener('mousedown', handleMouseDown);
      canvasRef.current?.addEventListener('mousemove', handleMouseMove);
      canvasRef.current?.addEventListener('mouseup', handleMouseUp);

      return () => {
        canvasRef.current?.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current?.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [canvasRef, roughCanvas, ctx]);

  useEffect(() => {
    if (whiteboardVisible && canvasRef.current) {
      isDrawing.current = false;
      const rc = rough.canvas(canvasRef.current);
      setRoughCanvas(rc);

      const handleResize = (e) => {
        canvasRef.current.height = canvasRef.current.offsetHeight;
        canvasRef.current.width = canvasRef.current.offsetWidth;

        const boundingClient =
          canvasContainerRef.current.getBoundingClientRect();

        setBoundary({ x: boundingClient.x, y: boundingClient.y });
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [canvasRef, canvasContainerRef, whiteboardVisible]);

  return (
    whiteboardVisible &&
    currentRoom && (
      <div className="fixed flex z-50 justify-center items-center top-0 left-0 h-full w-full backdrop-brightness-75 backdrop-blur-sm">
        <div className="w-28 shrink-0 flex flex-col gap-2 justify-center items-center h-full">
          <Button
            className={`aspect-square h-8 hover:scale-90 animate-in transition-all outline outline-white outline-2 -outline-offset-1 hover:brightness-125 duration-100`}
            style={{ backgroundColor: color.current }}
            onClick={handleColorPickerClick}
          >
            <input
              type="color"
              className={`${
                isPickerVisible ? 'visible' : 'invisible'
              } h-0 w-0 aspect-square rounded-xl focus:rounded-xl`}
              ref={colorInputRef}
              onChange={usePickOnChange}
            ></input>
          </Button>
          <div className=" bg-white/60 w-4 h-1 rounded-full"></div>
          <div className="flex flex-col backdrop-blur-2xl bg-white/80 text-black h-fit w-10 rounded-full">
            <Button
              variant="custom"
              size="icon"
              value={TOOL_TYPES.PEN}
              onClick={handleToolChange}
            >
              <FaPen />
            </Button>
            <Button
              variant="custom"
              size="icon"
              value={TOOL_TYPES.LINE}
              onClick={handleToolChange}
            >
              <PiLineSegmentFill />
            </Button>

            <Button
              variant="custom"
              size="icon"
              value={TOOL_TYPES.RECT}
              onClick={handleToolChange}
            >
              <MdOutlineRectangle />
            </Button>
            <Button
              variant="custom"
              size="icon"
              value={TOOL_TYPES.CIRCLE}
              onClick={handleToolChange}
            >
              <FaRegCircle />
            </Button>
            {/* <Button
              variant="custom"
              size="icon"
              value={TOOL_TYPES.ERASER}
              onClick={handleToolChange}
            >
              <FaEraser />
            </Button> */}
          </div>
          <Button
            variant="custom"
            size="icon"
            className="mt-4 bg-white/80 text-xl"
            onClick={clearShapes}
          >
            <GrClear />
          </Button>
        </div>
        <div
          className="grow bg-blue-300 flex justify-center"
          ref={canvasContainerRef}
        >
          <canvas
            className="aspect-video cursor-crosshair w-full bg-green-50 bg-[url(/canvas.png)]"
            ref={canvasRef}
            width={1920}
            height={1080}
          ></canvas>
        </div>
        <div className="w-28 shrink-0 pt-6 pl-6 h-full">
          <Button
            variant="custom"
            size="icon"
            className="text-lg bg-green-800"
            onClick={handleCloseWhiteboard}
          >
            <FaCaretDown />
          </Button>
        </div>
      </div>
    )
  );
}
