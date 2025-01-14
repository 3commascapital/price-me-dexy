interface Ethereum {
  request: (request: { method: string }) => Promise<string[]>
}
declare interface Window {
  ethereum: Ethereum
}

declare const ethereum = Window.Ethereum
