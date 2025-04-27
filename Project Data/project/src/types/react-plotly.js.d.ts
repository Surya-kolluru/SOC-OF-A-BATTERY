declare module 'react-plotly.js' {
    import { Component } from 'react';

    interface PlotParams {
        data: Array<{
            x?: any[];
            y?: any[];
            type?: string;
            mode?: string;
            name?: string;
            line?: {
                color?: string;
                width?: number;
            };
            marker?: {
                color?: string;
                size?: number;
            };
        }>;
        layout?: {
            title?: string;
            xaxis?: {
                title?: string;
            };
            yaxis?: {
                title?: string;
            };
            height?: number;
            width?: number;
            margin?: {
                l?: number;
                r?: number;
                t?: number;
                b?: number;
            };
        };
        frames?: any[];
        config?: any;
        onInitialized?: (figure: any) => void;
        onUpdate?: (figure: any) => void;
        style?: React.CSSProperties;
        className?: string;
    }

    export default class Plot extends Component<PlotParams> {}
} 