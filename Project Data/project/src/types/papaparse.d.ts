declare module 'papaparse' {
  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult<any>, parser: Parser) => void;
    complete?: (results: ParseResult<any>) => void;
    error?: (error: ParseError) => void;
    download?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    chunk?: (results: ParseResult<any>, parser: Parser) => void;
    fastMode?: boolean;
    withCredentials?: boolean;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
    };
  }

  export interface Parser {
    pause: () => void;
    resume: () => void;
    abort: () => void;
  }

  export function parse(file: File, config?: ParseConfig): void;
  export function unparse(data: any[] | object[], config?: UnparseConfig): string;
} 