import { UserInfo } from "./user";

export interface VideoInfo {
  aid?: number;
  tid?: number;
  picture?: string;
  title?: string;
  duration?: number;
  description?: string;
  status?: number;
  tname?: string;
  tags?: string[];
  publicTime?: string;
  owner?: UserInfo;
  stat?: VideoStat;
  auditMessage?: string;

}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface SearchVideoParams {
  keyword: string;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: string;
  durationMin?: number;
  durationMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface VideoStat {
    aid: number;
    barrage?: number;
    reply?: number;
    favorite?: number;
    coin?: number;
    share?: number;
    like?: number | null;
    dislike?: number;
    hisRank?: number;
    nowRank?: number;
    view?: number;
    duration?: number;
    play?: number;
    finish?: number;

}

export interface VideoType {
    tid: number;
    typeName: string;
    code: string;
    pid: number;
    introduction: string;
    url: string;

    /** 子分区列表 */
    children?: VideoType[];
}
