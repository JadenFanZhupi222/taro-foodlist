/**
 * @param {(locked: boolean) => void} onLockChange
 */
function createRecipeSaveController(onLockChange) {
  let locked = false

  return {
    /**
     * @template T
     * @param {{
     *   upload: () => Promise<T>,
     *   persist: (uploaded: T) => Promise<unknown>,
     *   onSuccess: () => void,
     *   onFailure: (error: unknown) => void
     * }} operation
     */
    async run(operation) {
      if (locked) return false
      locked = true
      onLockChange(true)
      try {
        const uploaded = await operation.upload()
        await operation.persist(uploaded)
        operation.onSuccess()
        return true
      } catch (error) {
        operation.onFailure(error)
        return false
      } finally {
        locked = false
        onLockChange(false)
      }
    }
  }
}

module.exports = { createRecipeSaveController }
