function getCounterRotation(rect, rotation) {
  const { width: w, height: h } = rect.size;
  switch (rotation % 4) {
    case 1:
      return {
        matrix: `matrix(0, -1, 1, 0, 0, ${h})`,
        width: h,
        height: w
      };
    case 2:
      return {
        matrix: `matrix(-1, 0, 0, -1, ${w}, ${h})`,
        width: w,
        height: h
      };
    case 3:
      return {
        matrix: `matrix(0, 1, -1, 0, ${w}, 0)`,
        width: h,
        height: w
      };
    default:
      return {
        matrix: `matrix(1, 0, 0, 1, 0, 0)`,
        width: w,
        height: h
      };
  }
}
export {
  getCounterRotation
};
//# sourceMappingURL=index.js.map
