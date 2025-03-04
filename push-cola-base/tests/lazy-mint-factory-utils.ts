import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { LazyMintDeployed } from "../generated/LazyMintFactory/LazyMintFactory"

export function createLazyMintDeployedEvent(
  creator: Address,
  lazyMintAddress: Address,
  uri: string,
  maxSupply: BigInt,
  claimExpiration: BigInt,
  redeemExpiration: BigInt,
  lockedBudget: BigInt,
  currencyAddress: Address,
  tokenId: BigInt,
  fee: BigInt
): LazyMintDeployed {
  let lazyMintDeployedEvent = changetype<LazyMintDeployed>(newMockEvent())

  lazyMintDeployedEvent.parameters = new Array()

  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "lazyMintAddress",
      ethereum.Value.fromAddress(lazyMintAddress)
    )
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam("uri", ethereum.Value.fromString(uri))
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "maxSupply",
      ethereum.Value.fromUnsignedBigInt(maxSupply)
    )
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "claimExpiration",
      ethereum.Value.fromUnsignedBigInt(claimExpiration)
    )
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "redeemExpiration",
      ethereum.Value.fromUnsignedBigInt(redeemExpiration)
    )
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "lockedBudget",
      ethereum.Value.fromUnsignedBigInt(lockedBudget)
    )
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "currencyAddress",
      ethereum.Value.fromAddress(currencyAddress)
    )
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  lazyMintDeployedEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )

  return lazyMintDeployedEvent
}
