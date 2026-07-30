import http from '@/utils/http';
import { BarrageDTO } from '@/types/barrage';

// 弹幕列表
export function getBarrageList(aid: number) {
    return http.get('/barrage/list', {
        params: {
            aid,
        }
    });
}

// 添加弹幕
export function sendBarrage(barrage: BarrageDTO) {
    return http.post('/barrage/send', barrage);
}

// 删除弹幕
export function deleteBarrage(id: number) {
    return http.delete(`/barrage/delete/${id}`);
}

export function listCreatorBarrages(params?: any) {
    return http.get('/barrage/creator/list', { params });
}

export function deleteCreatorBarrage(id: number) {
    return http.delete(`/barrage/creator/delete/${id}`);
}
