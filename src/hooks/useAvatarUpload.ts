// src/hooks/useAvatarUpload.ts
import Taro from '@tarojs/taro'

/**
 * 判断是否为腾讯云 fileID
 */
function isCloudFileId(url: string) {
  return url.startsWith('cloud://')
}

/**
 * 上传头像，返回 fileID
 * @param avatar 本地临时路径、网络图片或 fileID
 * @param openId 用户 openId
 */
export async function useAvatarUpload(avatar: string, openId: string): Promise<string> {
  if (!avatar) throw new Error('头像不能为空')
  if (isCloudFileId(avatar)) {
    // 已经是 fileID，无需上传
    return avatar
  }
  const uploadRes = await Taro.cloud.uploadFile({
    cloudPath: `avatar/${openId}/${Date.now()}.jpg`,
    filePath: avatar
  })
  return uploadRes.fileID
}