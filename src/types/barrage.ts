export type BarrageMode = 0 | 1 | 2;

export interface Barrage {
    text: string;
    mode?: BarrageMode;
    color?: string;
    time?: number;
    border?: boolean;
    style?: Partial<CSSStyleDeclaration>;
}
export interface BarrageDTO {
    id?: number;
    aid?: number;
    uid?: number;
    text?: string;
    color?: string | undefined;
    mode?: BarrageMode;
    fontSize?: number;
    time?: number | undefined;
    pool?: number;
    createTime?: string;
}