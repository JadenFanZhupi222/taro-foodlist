// 用户类型
// 注意：Recipe / Family 等类型的唯一来源分别是 store/recipe/types.ts、store/family/types.ts，
// 此处不再重复定义，避免出现枚举/字段不一致的两份类型。
// 仅保留 User：recipe/edit 以 GlobalUser 形式引用，要求 _id 必填。
export interface User {
  _id: string;
  openId: string;
  nickname: string;
  avatar: string;
  family_id?: string;
  role: 'owner' | 'member';
  createdAt: number;
  updatedAt: number;
}
