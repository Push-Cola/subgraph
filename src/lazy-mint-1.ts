import {
  CouponRedeemed as CouponRedeemedEvent,
  TokenClaimed as TokenClaimedEvent,
} from "../generated/templates/LazyMint1/LazyMint1"

import {
  CouponRedeemed,
  TokenClaimed,
} from "../generated/schema"

export function handleCouponRedeemed(event: CouponRedeemedEvent): void {
  let entity = new CouponRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.tokenId = event.params.tokenId
  entity.affiliateAddress = event.params.affiliateAddress
  entity.contractAddress = event.params.contractAddress
  entity.timestamp = event.params.timestamp
  entity.currency = event.params.currency

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleTokenClaimed(event: TokenClaimedEvent): void {
  let entity = new TokenClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimer = event.params.claimer
  entity.receiver = event.params.receiver
  entity.tokenId = event.params.tokenId
  entity.quantity = event.params.quantity
  entity.affiliateAddress = event.params.affiliateAddress
  entity.contractAddress = event.params.contractAddress
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
