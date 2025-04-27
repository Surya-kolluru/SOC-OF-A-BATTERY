declare module 'ml-matrix' {
  export class Matrix {
    constructor(data: number[][] | number[] | number);
    static zeros(rows: number, columns: number): Matrix;
    static ones(rows: number, columns: number): Matrix;
    static rand(rows: number, columns: number): Matrix;
    transpose(): Matrix;
    inverse(): Matrix;
    determinant(): number;
    trace(): number;
    sum(): number;
    mean(): number;
    std(): number;
    min(): number;
    max(): number;
    get(row: number, column: number): number;
    set(row: number, column: number, value: number): void;
    to2DArray(): number[][];
  }

  export class MatrixTransposeView {
    constructor(matrix: Matrix);
    get(row: number, column: number): number;
    set(row: number, column: number, value: number): void;
  }
} 