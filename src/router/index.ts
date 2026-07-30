import { createRouter, createWebHistory } from "vue-router";

import Layout from "@/layout/index.vue"
import PlatformLayout from "@/views/platform/layout/index.vue"
import { useLayoutStore } from "@/stores/modules/layout";
import { useAuthStore } from "@/stores/modules/auth";
import { useLoginDialog } from "@/components/LoginRegisterDialog/useLoginDialog";
import { ElMessage } from "element-plus";


let router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "",
      component: () => Layout, 
      children: [
          {
            path: "", 
            meta:{requireAuth:false},
            name: "Home",
            component: () => import("@/views/Home/index.vue"), 
          },
          {
              path: "video/:id", 
              name: "VideoDetail",
              meta:{requireAuth:false, showSidebar:false},
              component: () => import("@/views/video/index.vue"), 
          },
          {
              path: "/category",
              name: 'VideoCategory',
              children: [
                  {
                  path: "", 
                  name: "VideoCategoryList",
                  meta:{requireAuth:false, title:"分区", showSidebar:true},
                  component: () => import("@/views/category/index.vue"), 
                  },
              ]
          },
          {
              path: "/history",
              children: [
                  {
                  path: "", 
                  meta:{requireAuth:true},
                  component: () => import("@/views/history/index.vue"), 
                  },
              ]
          },
          {
            path: "/message",
            meta: { requireAuth: true, showSidebar: false },
            component: () => import("@/views/message/index.vue"),
            children: [
                {
                  path: "whisper",
                  children: [
                    {
                      path: "",
                      name: "WhisperList",
                      meta: { requireAuth: true },
                      component: () => import("@/views/message/whisper/index.vue"),
                    },
                    {
                      path: ":mid",
                      name: "Whisper",
                      meta: { requireAuth: true },
                      component: () => import("@/views/message/whisper/index.vue"),
                    },
                  ]
              },
              {
                path: "reply",
                name: "ReplyList",
                meta: { requireAuth: true },
                component: () => import("@/views/message/reply/index.vue"),
              },
              {
                path: "at",
                name: "AtList",
                meta: { requireAuth: true },
                component: () => import("@/views/message/at/index.vue"),
              },
              {
                path: "love",
                name: "LoveList",
                meta: { requireAuth: true },
                component: () => import("@/views/message/love/index.vue"),
              }
            ]
          },
        {
          path: "/dynamic",
          children: [
            {
              path: "", 
              meta:{requireAuth:true},
              component: () => import("@/views/dynamic/index.vue"), 
            },
          ]
        },
      ]
    },
    {
      path: "/space",
      component: () => Layout,
      children: [
        {
          path: ":uid",
          name: "space",
          meta: { requireAuth: false, showSidebar: false},
          component: () => import("@/views/space/layout/index.vue"),
          children: [
            {
              path: "",
              name: "SpaceHome",
              component: () => import("@/views/space/home.vue"),
              
              },
            {
              path: "video",
              name: "SpaceVideo",
              component: () => import("@/views/space/video.vue"),
            },
            {
              path: "favlist",
              name: "SpaceFavList",
              component: () => import("@/views/space/favList.vue"),
            },
            {
              path: "following",
              name: "SpaceFollowing",
              component: () => import("@/views/space/relationList.vue"),
              props: { relationType: "following" },
            },
            {
              path: "followers",
              name: "SpaceFollowers",
              component: () => import("@/views/space/relationList.vue"),
              props: { relationType: "followers" },
            },
          ]
        },
      ]
    },
    {
      path: "/account",
      component: () => Layout,
      children: [
        {
          path: "setting",
          name: "AccountSetting",
          meta: { requireAuth: true, showSidebar: false },
          component: () => import("@/views/account/setting.vue"),
        }
      ]
    },
    {
      path: "/search",
      component: () => Layout, 
      children: [
        {
        path: "", 
        meta: {requireAuth: false, showSidebar: true},
        component: () => import("@/views/search/index.vue"), 
        },
      ]
    },
    {
      path: "/platform",
      name: "Platform",
      component: () => PlatformLayout, 
      meta:{requireAuth:true},
      children: [
      {
        path: "upload/video",
        name: "UpdateVideo",
        component: () => import("@/views/platform/upload/Video.vue"),
      },
      {
        path: "upload-manager",
        name: "UploadManager",
        children: [
          {
            path: "article",
            name: "UploadManagerArticle",
            component: () => import("@/views/platform/upload-manager/Article.vue"),
          },
          {
            path: "appeal",
            name: "UploadManagerAppeal",
            component: () => import("@/views/platform/upload-manager/Appeal.vue"),
          },
        ]
      },
      {
        path: "interaction",
        name: "InteractionManager",
        children: [
          {
            path: "comment",
            name: "InteractionCommentManager",
            component: () => import("@/views/platform/interaction/Comment.vue"),
          },
          {
            path: "barrage",
            name: "InteractionBarrageManager",
            component: () => import("@/views/platform/interaction/Barrage.vue"),
          },
        ],
      },
      {
        path: "audit/video",
        name: "AuditVideo",
        meta:{requireAdmin:true},
        children: [
          {
            path: "",
            name: "AuditVideoList",
            component: () => import("@/views/platform/audit/AuditVideo.vue"),
          },
          {
            path: "detail/:id",
            name: "AuditVideoDetail",
            component: () => import("@/views/platform/audit/AuditVideoDetail.vue"),
          },
        ],
        },
      ]
    },
    {
      path: '/:path(.*)*',
      name: '404',
      component: () => import('@/views/404.vue'),
      meta: {
          title: '404',
          requireAuth:false
      }
    }
  ],
})

router.beforeEach(async(to, _from, next) => {
    
  const layoutStore = useLayoutStore()
  if (to.meta.showSidebar === undefined) {
    layoutStore.setSidebarVisibility(true)
  } else {
    layoutStore.setSidebarVisibility(to.meta.showSidebar as boolean)
  }
  const authStore = useAuthStore();

  const requireAuth = to.matched.some(record => record.meta.requireAuth);
  const requireAdmin = to.matched.some(record => record.meta.requireAdmin);

  const denyAdminAccess = () => {
    ElMessage.error("您没有权限访问该页面");
    next("/");
  };
  
  if (authStore.isAuthenticated) {

    try {
      await authStore.fetchUserInfo();
      if (requireAdmin && !authStore.isAdmin) {
          denyAdminAccess();
          return;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      authStore.resetToken();
      
      const { showLoginDialog } = useLoginDialog();
      showLoginDialog({
        onLogin: () => {
          router.push(to.fullPath);
        },
        onClose: () => {
          router.push('/');
        }
      });
      next(false);
      return;
    }

    if (requireAdmin && !authStore.isAdmin) {
      denyAdminAccess();
      return;
    }
  } else {

    if (!requireAuth) {

      next();
      return;
    }
    const { showLoginDialog } = useLoginDialog();
    showLoginDialog({
      onLogin: () => {
        router.push(to.fullPath);
      },
      onClose: () => {
        router.push('/');
      }
    });
  next(false);
  return;
  }
  next()
})
  
export default router;
