// src/hooks/useCloudUpload.ts
import Taro from '@tarojs/taro'

/**
 * 判断是否为腾讯云 fileID
 */
function isCloudFileId(url: string) {
  return url.startsWith('cloud://')
}

/**
 * 通用云文件上传
 * @param file 本地临时路径、网络图片或 fileID
 * @param folder 目标文件夹，如 'avatar'、'recipes'
 * @param bizId 用户ID或业务ID，用于区分子目录
 */
export async function useCloudUpload(file: string, folder: string, bizId: string): Promise<string> {
  if (!file) throw new Error('文件不能为空')
  if (isCloudFileId(file)) {
    // 已经是 fileID，无需上传
    return file
  }
  const uploadRes = await Taro.cloud.uploadFile({
    cloudPath: `${folder}/${bizId}/${Date.now()}.jpg`,
    filePath: file
  })
  return uploadRes.fileID
}