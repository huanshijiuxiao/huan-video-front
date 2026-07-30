import http from '@/utils/http';
import type { Relation } from '@/types/relation';

export function modifyRelation(data: any) {
    return http.request({
        url: '/relation/modify',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'post',
        data
    }) as Promise<{ code: number; msg: string; data: Relation }>;
}

export function getRelation(fid: number | undefined) {
    return http.request({
        url: '/relation/isFollow',
        method: 'get',
        params: {
            fid
        }
    }) as Promise<{ code: number; msg: string; data: Relation }>;
}

export function listRelationUsers(params: { uid: number; type: 'following' | 'followers'; pageNum?: number; pageSize?: number }) {
    return http.request({
        url: '/relation/list',
        method: 'get',
        params,
    });
}
