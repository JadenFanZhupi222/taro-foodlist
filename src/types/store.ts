// 用户类型
export interface User {
  _id: string;
  openId: string;
  nickname: string;
  avatar: string;
  familyId?: string;
  role: 'owner' | 'member';
  createdAt: number;
  updatedAt: number;
}

// 家庭类型
export interface Family {
  _id: string;
  name: string;
  ownerId: string;
  members: string[]; // 成员ID列表
  createdAt: number;
  updatedAt: number;
}

// 食谱类型
export interface Recipe {
  _id: string;
  name: string;
  description: string;
  type: '大荤' | '小荤' | '炒菜' | '汤类' | '其他';
  imageUrl: string;
  steps: string[];
  ingredients: string[];
  createdBy: string;
  familyId: string;
  createdAt: number;
  updatedAt: number;
}

// 评论类型
export interface Comment {
  _id: string;
  content: string;
  recipeId: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

// 权限类型
export interface Permission {
  userId: string;
  familyId: string;
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
} 