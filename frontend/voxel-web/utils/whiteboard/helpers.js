export const getNextShapeId = (shapeId) => {
  return shapeId.current
    ? `shape_${shapeId.current.split('_')[1]}_${
        Number(shapeId.current.split('_')[2]) + 1
      }`
    : `shape_${String(Date.now()).slice(5)}_0`;
};
