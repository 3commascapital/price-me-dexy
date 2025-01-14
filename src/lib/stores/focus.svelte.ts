export const createFocusTrap = () => {
  let focused = $state(false)
  const onFocus = () => {
    focused = true
  }
  const onBlur = () => {
    focused = false
  }
  return {
    get value() {
      return focused
    },
    onFocus,
    onBlur,
  }
}
