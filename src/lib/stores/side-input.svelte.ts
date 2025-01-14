type SideInputOption = 'in' | 'out'
let sideInput = $state<SideInputOption>('in')

export const sideInputStore = {
  get value() {
    return sideInput
  },
  set value(value: SideInputOption) {
    sideInput = value
  },
}
