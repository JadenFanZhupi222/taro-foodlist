const cloud = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
  const db = app.database()

  try {
    console.log('开始迁移...')
    
    // 1. 获取所有家庭数据
    const familiesRes = await db.collection('family').get()
    const families = familiesRes.data
    
    let totalMigrated = 0
    let totalFamilies = families.length
    const errors = []

    console.log(`找到 ${totalFamilies} 个家庭`)

    // 2. 遍历每个家庭
    for (const family of families) {
      try {
        const recipeIds = family.recipes || []
        
        if (recipeIds.length === 0) {
          console.log(`家庭 ${family._id} 没有菜谱，跳过`)
          continue
        }

        console.log(`迁移家庭 ${family._id}，共 ${recipeIds.length} 个菜谱`)

        // 3. 为每个菜谱创建关联记录
        for (let i = 0; i < recipeIds.length; i++) {
          const recipeId = recipeIds[i]
          
          await db.collection('family_recipes').add({
            family_id: family._id,
            recipe_id: recipeId,
            order: (i + 1) * 100, // 保持原有顺序
            createdAt: family.createdAt || new Date(),
            updatedAt: new Date(),
            createdby: family.family_owner || '',
            owner: family.family_owner || '',
            deleted: false
          })
        }

        totalMigrated += recipeIds.length
        console.log(`家庭 ${family._id} 迁移完成`)

      } catch (error) {
        console.error(`家庭 ${family._id} 迁移失败:`, error)
        errors.push({
          familyId: family._id,
          error: error.message
        })
      }
    }

    console.log('迁移完成，开始验证...')

    // 4. 验证数据
    const familyRecipesRes = await db.collection('family_recipes').get()
    const migratedRecords = familyRecipesRes.data.length

    return {
      code: 0,
      message: '迁移完成',
      data: {
        totalFamilies,
        totalMigrated,
        migratedRecords,
        errors,
        success: errors.length === 0
      }
    }

  } catch (error) {
    console.error('迁移失败:', error)
    return {
      code: 1,
      message: '迁移失败: ' + error.message
    }
  }
} 