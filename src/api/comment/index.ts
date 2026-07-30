import http from '@/utils/http'

export function listComment(params: any) {
  return http.get('/comment/list', { params })
}

export function sendComment(data: any) {
  return http.post('/comment/send', data)
}

export function repliesComment(data: any) {
  return http.post('/comment/replies', data)
}

export function likeComment(commentId: number) {
  return http.post('/comment/like', null, { params: { commentId } })
}

export function listCreatorComments(params?: any) {
  return http.get('/comment/creator/list', { params })
}

export function deleteCreatorComment(id: number) {
  return http.delete(`/comment/creator/delete/${id}`)
}
