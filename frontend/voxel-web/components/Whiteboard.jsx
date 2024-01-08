'use client';

import { useState, useRef, useEffect } from 'react';
import useStore from '../store/store';

import rough from 'roughjs';
import { Button } from './ui/button';
import { FaBan, FaCaretDown, FaPen } from 'react-icons/fa';
import { MdOutlineRectangle, MdOutlineUndo } from 'react-icons/md';
import { FaRegCircle } from 'react-icons/fa';
import { PiLineSegmentFill } from 'react-icons/pi';
import { IoSave } from 'react-icons/io5';
import { getNextShapeId } from '@/utils/whiteboard/helpers';

/**
 * ERASER FUNCTIONALITY MISSING
 * STROKE WIDTH MISSING
 * ROUGHNESS LEVEL SETTING MISSING
 */

const TOOL_TYPES = {
  PEN: 'PEN',
  RECT: 'RECTANGLE',
  CIRCLE: 'CIRCLE',
  LINE: 'LINE',
  // ERASER: 'ERASER',
};

export default function Whiteboard() {
  const [
    whiteboardVisible,
    setWhiteboardVisible,
    currentRoom,
    socket,
    shapes,
    setShapes,
    emptyShapes,
    undoShape,
    lastShapeId,
    setLastShapeId,
  ] = useStore((state) => [
    state.whiteboardVisible,
    state.setWhiteboardVisible,
    state.currentRoom,
    state.socket,
    state.shapes,
    state.setShapes,
    state.emptyShapes,
    state.undoShape,
    state.lastShapeId,
    state.setLastShapeId,
  ]);

  const strokeWidthRC = 2; // UPGRADE STROKE WIDTH SETTING TO CUSTOM

  const [roughCanvas, setRoughCanvas] = useState();
  const [boundary, setBoundary] = useState({ x: 0, y: 0 });
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Drawing states ---- Using escape hatch from react for rough JS

  const colorInputRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const shapesRef = useRef(shapes);
  const canvasRef = useRef(null);
  const color = useRef('#000');
  const isDrawing = useRef(false);
  const tool = useRef(TOOL_TYPES.PEN);
  const path = useRef('');
  const mouseDownPosition = useRef({ x: 0, y: 0 });
  const lastShapeIdRef = useRef(lastShapeId);
  const ctx = canvasRef.current?.getContext('2d');

  const handleCloseWhiteboard = () => setWhiteboardVisible(false);
  const handleColorPickerClick = () => {
    setIsPickerVisible(true);
    colorInputRef.current.click();
  };
  const handleToolChange = (e) =>
    (tool.current = e.target.closest('button').value);

  const scaleUpX = (val) => val * canvasRef.current.width;
  const scaleUpY = (val) => val * canvasRef.current.height;

  const scaleDownX = (val) => val / canvasRef.current.width;
  const scaleDownY = (val) => val / canvasRef.current.height;

  const usePickOnChange = (e) => {
    setIsPickerVisible(false);
    color.current = colorInputRef.current.value;
  };

  const clearCanvas = () =>
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  const clearShapes = () => {
    emptyShapes();
    shapesRef.current = [];
    socket?.emit('whiteboard:clear', { roomId: currentRoom });
  };

  const undoShapeHandler = () => {
    const shapeId = lastShapeId;
    if (shapeId) {
      socket?.emit('whiteboard:undo', { roomId: currentRoom, shapeId });
      undoShape();
    }
  };

  const drawShapes = () => {
    clearCanvas();
    ctx.strokeStyle = color.current;

    const shapesObject = shapesRef.current;
    if (shapesObject.length > 0 && roughCanvas) {
      shapesObject.forEach((el) => {
        switch (el.type) {
          case TOOL_TYPES.PEN:
            let path = '',
              isX = true;
            const list = el.path.split(' ');
            list.forEach((token) => {
              if (token === 'L' || token === 'M') path += token;
              else {
                path += isX ? scaleUpX(token) : scaleUpY(token);
                isX = !isX;
              }
              path += ' ';
            });

            roughCanvas.path(path, {
              roughness: 0.1,
              simplification: 1,
              strokeWidth: strokeWidthRC,
              stroke: el.color,
            });
            break;
          case TOOL_TYPES.RECT:
            roughCanvas.rectangle(
              scaleUpX(el.rect.x),
              scaleUpY(el.rect.y),
              scaleUpX(el.rect.w),
              scaleUpY(el.rect.h),
              { roughness: 0.4, stroke: el.color, strokeWidth: strokeWidthRC }
            );
            break;

          case TOOL_TYPES.CIRCLE:
            roughCanvas.circle(
              scaleUpX(el.circle.x),
              scaleUpY(el.circle.y),
              scaleUpX(el.circle.d),
              {
                roughness: 0.35,
                stroke: el.color,
                strokeWidth: strokeWidthRC,
              }
            );
            break;
          case TOOL_TYPES.LINE:
            roughCanvas.line(
              scaleUpX(el.line.x1),
              scaleUpY(el.line.y1),
              scaleUpX(el.line.x2),
              scaleUpY(el.line.y2),
              {
                roughness: 0.45,
                stroke: el.color,
                strokeWidth: strokeWidthRC,
              }
            );
            break;
        }
      });
    }
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    switch (tool.current) {
      case TOOL_TYPES.PEN:
        ctx.beginPath();
        ctx.strokeStyle = color.current;
        ctx.moveTo(e.clientX - boundary.x, e.clientY - boundary.y);
        path.current = `M ${scaleDownX(e.clientX - boundary.x)} ${scaleDownY(
          e.clientY - boundary.y
        )}`;
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
        path.current += ` L ${scaleDownX(e.clientX - boundary.x)} ${scaleDownY(
          e.clientY - boundary.y
        )}`;
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
        const r = Math.pow(Math.pow(w, 2) + Math.pow(h, 2), 0.5);
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
            x: scaleDownX(mouseDownPosition.current.x),
            y: scaleDownY(mouseDownPosition.current.y),
            w: scaleDownX(e.clientX - boundary.x - mouseDownPosition.current.x),
            h: scaleDownY(e.clientY - boundary.y - mouseDownPosition.current.y),
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
            x: scaleDownX(mouseDownPosition.current.x),
            y: scaleDownY(mouseDownPosition.current.y),
            d: scaleDownX(2 * r),
          },
        };
        shape = { ...shape, ...circleObject };
        break;

      case TOOL_TYPES.LINE:
        const x2 = scaleDownX(e.clientX - boundary.x);
        const y2 = scaleDownY(e.clientY - boundary.y);
        const lineObject = {
          type: TOOL_TYPES.LINE,
          line: {
            x1: scaleDownX(mouseDownPosition.current.x),
            y1: scaleDownY(mouseDownPosition.current.y),
            x2,
            y2,
          },
        };
        shape = { ...shape, ...lineObject };

        break;
    }
    shape.shapeId = getNextShapeId(lastShapeIdRef);
    setLastShapeId(shape.shapeId);
    setShapes(shape);
    socket?.emit('whiteboard:shape', { roomId: currentRoom, shape });
  };

  useEffect(() => {
    if (ctx && whiteboardVisible && roughCanvas) {
      shapesRef.current = shapes;
      drawShapes();
    }
  }, [shapes, whiteboardVisible, roughCanvas, ctx]);

  useEffect(() => {
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 1;

      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 1;
    }
  }, [ctx]);

  useEffect(() => {
    if (lastShapeId) lastShapeIdRef.current = lastShapeId;
  }, [lastShapeId]);

  useEffect(() => {
    if (ctx && color.current) {
      {
        ctx.shadowColor = color.current;
        ctx.strokeStyle = color.current;
      }
    }
  }, [color.current]);
  useEffect(() => {
    if (roughCanvas && ctx) {
      canvasRef.current?.addEventListener('mousedown', handleMouseDown);
      canvasRef.current?.addEventListener('mousemove', handleMouseMove);
      canvasRef.current?.addEventListener('mouseup', handleMouseUp);
      canvasRef.current?.addEventListener('mouseout', handleMouseUp);

      return () => {
        canvasRef.current?.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current?.removeEventListener('mouseup', handleMouseUp);
        canvasRef.current?.removeEventListener('mouseout', handleMouseUp);
      };
    }
  }, [canvasRef, roughCanvas, ctx]);

  useEffect(() => {
    if (whiteboardVisible && canvasRef.current) {
      isDrawing.current = false;
      const handleResize = (e) => {
        canvasRef.current.height = canvasRef.current.offsetHeight;
        canvasRef.current.width = canvasRef.current.offsetWidth;
        const rc = rough.canvas(canvasRef.current);
        setRoughCanvas(rc);
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
      <div className="fixed flex z-50 justify-center items-center top-0 left-0 h-full w-full backdrop-brightness-50 dark:backdrop-brightness-75 backdrop-blur-md">
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
              } h-0 w-0 opacity-0 rounded-xl focus:rounded-xl`}
              ref={colorInputRef}
              onChange={usePickOnChange}
            ></input>
          </Button>
          <div className=" bg-white/60 w-4 h-1 rounded-full"></div>
          <div className="flex flex-col backdrop-blur-2xl bg-white/80 text-black h-fit w-10 rounded-full">
            <Button
              variant="whiteboard"
              size="icon"
              value={TOOL_TYPES.PEN}
              onClick={handleToolChange}
            >
              <FaPen />
            </Button>
            <Button
              variant="whiteboard"
              size="icon"
              value={TOOL_TYPES.LINE}
              onClick={handleToolChange}
            >
              <PiLineSegmentFill />
            </Button>

            <Button
              variant="whiteboard"
              size="icon"
              value={TOOL_TYPES.RECT}
              onClick={handleToolChange}
            >
              <MdOutlineRectangle />
            </Button>
            <Button
              variant="whiteboard"
              size="icon"
              value={TOOL_TYPES.CIRCLE}
              onClick={handleToolChange}
            >
              <FaRegCircle />
            </Button>
            {/* <Button
              variant="whiteboard"
              size="icon"
              value={TOOL_TYPES.ERASER}
              onClick={handleToolChange}
            >
              <FaEraser />
            </Button> */}
          </div>
          <Button
            variant="whiteboard"
            size="icon"
            className="mt-2 bg-white/80 hover:bg-white/90 rotate-45"
            disabled={shapes.length === 0 || !lastShapeId}
            onClick={undoShapeHandler}
          >
            <MdOutlineUndo />
          </Button>
          <Button
            variant="whiteboard"
            size="icon"
            className="mt-2 bg-white/80 hover:bg-white/90"
            onClick={clearShapes}
            disabled={shapes.length === 0}
          >
            <FaBan />
          </Button>
          <Button
            variant="whiteboard"
            size="icon"
            className="mt-2 bg-white/80 hover:bg-white/90"
            disabled={shapes.length === 0}
            onClick={() => {
              const image = new Image();
              image.src = canvasRef.current.toDataURL('image/jpeg', 1.0);
              const link = document.createElement('a');
              link.download = 'image.png';
              link.href = image.src;
              link.click();
            }}
          >
            <IoSave />
          </Button>
        </div>

        {/* CANVAS AREA */}

        <div
          className="grow flex justify-center dark:bg-zinc-900 overflow-hidden rounded-2xl"
          ref={canvasContainerRef}
        >
          <canvas
            className="aspect-video cursor-crosshair w-full bg-[url(/canvas.png)]"
            ref={canvasRef}
            width={1920}
            height={1080}
          ></canvas>
        </div>

        <div className="w-28 shrink-0 pt-6 pl-6 h-full">
          <Button
            variant="custom"
            size="icon"
            className="text-lg bg-green-800 text-white"
            onClick={handleCloseWhiteboard}
          >
            <FaCaretDown />
          </Button>
        </div>
      </div>
    )
  );
}
