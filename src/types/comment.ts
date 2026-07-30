import { UserInfo } from "@/types/user";

// 评论数据类型
export interface CommentDTO {
    id: number;
    contentType: number;
    contentId: number;
    uid: number;
    user: UserInfo;
    message: string;
    likeCount: number;
    replyCount: number;
    hasLiked: boolean;
    top: boolean;
    createTime: string;
    rootId?: number;
    parentId?: number;
    replyTo?: number;
    replyToUsername?: string;
    replies?: CommentDTO[];
    hasMoreReplies?: boolean;
    ipLocation?: string;
  }
  
  // 评论查询参数
  export interface CommentQueryParams {
    contentType: number;
    contentId: number;
    rootId?: number;
    sortType?: number; // 0-按时间排序，1-按热度排序
    pageNum: number;
    pageSize: number;
  }
  
  // 评论分页结果
  export interface CommentPage {
    records: CommentDTO[];
    total: number;
    pageSize: number;
    pageNum: number;
  }
  
  // 添加评论参数
  export interface AddCommentParams {
    contentType: number;
    contentId: number;
    message: string;
    rootId?: number;
    parentId?: number;
    replyTo?: number;
  }
  
