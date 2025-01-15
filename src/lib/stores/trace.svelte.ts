import {
  decodeFunctionData,
  erc20Abi,
  formatTransactionRequest,
  hexToString,
  isHex,
  numberToHex,
  parseAbi,
  zeroAddress,
  type Address,
  type Block,
  type BlockTag,
  type CallParameters,
  type ExactPartial,
  type Hex,
  type PublicClient,
  type RpcSchema,
  type TransactionRequest,
} from 'viem'
import type { Token } from './token.svelte'

import type { MinimalBlock } from './block.svelte'

const noop = () => {}

export type TraceStep = {
  inputToken: Token
  outputToken: Token
  amount: bigint
  from: Address
  to: Address
  pool: Address
  exchange: Address
}

export type Trace = {
  from: Address
  gas: Hex
  gasUsed: Hex
  to: Address
  value: Hex
  input: Hex
  output: Hex
  error?: string | null
  revertReason?: string | null
  calls?: Trace[]
}

export type TracerTypes = 'callTracer' | '4byteTracer' | 'prestateTracer'

export type Transfer = {
  from: Address
  to: Address
  value: bigint
  token: Address
  gas: bigint
}

const mintBurnAbi = parseAbi(['function mint(address to, uint256 amount)', 'function burn(address to, uint256 amount)'])

const fullErc20Abi = [...erc20Abi, ...mintBurnAbi]

export const findAllTransfers = (names: Map<Hex, string>, trace: Trace, acc: Transfer[] = []) => {
  const { value: val, from, to, calls, gasUsed } = trace
  const value = BigInt(val || '0')
  if (value > 0n) {
    acc.push({
      from,
      to,
      value,
      token: zeroAddress,
      gas: BigInt(gasUsed),
    })
  }
  try {
    const { functionName, args } = decodeFunctionData({
      abi: fullErc20Abi,
      data: trace.input,
    })
    const token = trace.to
    if (functionName === 'transfer') {
      const [to, value] = args
      acc.push({
        from: trace.from,
        to: to as Hex,
        value: value as bigint,
        token: token,
        gas: BigInt(gasUsed),
      })
    } else if (functionName === 'transferFrom') {
      const [sender, receiver, value] = args
      acc.push({
        from: sender as Hex,
        to: receiver as Hex,
        value: value as bigint,
        token: token,
        gas: BigInt(gasUsed),
      })
    } else if (functionName === 'mint') {
      const [receiver, value] = args
      acc.push({
        from: zeroAddress,
        to: receiver as Hex,
        value: value as bigint,
        token: token,
        gas: BigInt(gasUsed),
      })
    } else if (functionName === 'burn') {
      const [burner, value] = args
      acc.push({
        from: burner as Hex,
        to: zeroAddress,
        value: value as bigint,
        token: token,
        gas: BigInt(gasUsed),
      })
    }
  } catch (_err: unknown) {
    noop.call(_err)
    // console.log('error decoding function data', (err as Error)?.message)
  }
  if (calls && calls.length > 0) {
    calls.forEach((call) => {
      findAllTransfers(names, call, acc)
    })
  }
  return acc
}

export type DebugTraceCallMethod = RpcSchema & {
  Method: 'debug_traceCall'
  Parameters: [
    CallParameters,
    Hex | BlockTag,
    {
      tracer: TracerTypes
      timeout: `${number}s`
    },
  ]
  ReturnType: Trace
}

export type QuoteOptions = {
  client: PublicClient
  block: MinimalBlock | null
  inputToken: Token | null
  outputToken: Token | null
  amount: bigint | null
  from: Address | null
  to: Address | null
  allowedSlippage: number
}

export type TracerOptions = {
  names: Map<Hex, string>
  tokens: Map<Hex, Omit<Token, 'chainId' | 'name'> | null>
  minOut: bigint
  inputs: Partial<TraceCallOptions> & {
    value: bigint
    from: Address
    to: Address
    data: Hex
  }
}

export type Quoter = (quoteOptions: QuoteOptions) => null | Promise<TracerOptions>

export const validate = (quoterOptions: QuoteOptions) => {
  if (!quoterOptions.amount) {
    console.log('invalid amount', quoterOptions)
    return false
  }
  if (!quoterOptions.inputToken) {
    console.log('invalid input', quoterOptions)
    return false
  }
  if (!quoterOptions.outputToken) {
    console.log('invalid output', quoterOptions)
    return false
  }
  if (!quoterOptions.from) {
    console.log('invalid from', quoterOptions)
    return false
  }
  return true
}

export type TraceCallOptions = CallParameters & { from?: Hex; value?: bigint }

export const traceCall = async (client: PublicClient, block: Block, tracerOptions: Partial<TraceCallOptions>) => {
  return client
    .extend((client) => ({
      async traceCall(args: Partial<TraceCallOptions> = {}): Promise<Trace> {
        const { from, value, ...params } = args
        return client.request({
          // @ts-expect-error unexpected-type
          method: 'debug_traceCall',
          params: [
            {
              ...formatTransactionRequest({
                ...params,
                gas: 3_000_000n,
                type: 'eip1559',
                maxFeePerGas: (block.baseFeePerGas ?? 10n ** 9n) * 2n,
                maxPriorityFeePerGas: (block.baseFeePerGas ?? 10n ** 9n) / 5n,
              } as unknown as ExactPartial<TransactionRequest>),
              // for whatever reason, these values are not being passed through
              value: value ? numberToHex(value) : undefined,
              from: from ?? tracerOptions.from!,
            },
            // 'latest', //
            `0x${block.number!.toString(16)}`,
            {
              // @ts-expect-error unexpected-type
              tracer: 'callTracer',
            },
          ],
        })
      },
    }))
    .traceCall(tracerOptions)
}

export const tokenFetches = (client: PublicClient, tokens: Map<Hex, Omit<Token, 'chainId' | 'name'> | null>) => {
  const tokenAddresses = Array.from(tokens.keys())
  return tokenAddresses.map(async (address) => {
    const token = tokens.get(address)
    if (token) {
      return token
    }
    const [symbol, decimals] = await client.multicall({
      contracts: [
        { address, functionName: 'symbol', abi: erc20Abi },
        { address, functionName: 'decimals', abi: erc20Abi },
      ],
    })
    if (symbol.status === 'failure' || decimals.status === 'failure') {
      return null
    }
    return {
      address,
      symbol: isHex(symbol.result) ? hexToString(symbol.result) : symbol.result,
      decimals: Number(decimals.result),
    }
  })
}
