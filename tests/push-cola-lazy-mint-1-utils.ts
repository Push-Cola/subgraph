import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  ApprovalForAll,
  BatchMetadataUpdate,
  ContractURIUpdated,
  CouponRedeemed,
  DefaultRoyalty,
  MetadataFrozen,
  OwnerUpdated,
  RoyaltyForToken,
  TokenClaimed,
  TokensClaimed,
  TokensLazyMinted,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/PushColaLazyMint1/PushColaLazyMint1"

export function createApprovalForAllEvent(
  _owner: Address,
  _operator: Address,
  _approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(_owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("_operator", ethereum.Value.fromAddress(_operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("_approved", ethereum.Value.fromBoolean(_approved))
  )

  return approvalForAllEvent
}

export function createBatchMetadataUpdateEvent(
  _fromTokenId: BigInt,
  _toTokenId: BigInt
): BatchMetadataUpdate {
  let batchMetadataUpdateEvent = changetype<BatchMetadataUpdate>(newMockEvent())

  batchMetadataUpdateEvent.parameters = new Array()

  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_fromTokenId",
      ethereum.Value.fromUnsignedBigInt(_fromTokenId)
    )
  )
  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_toTokenId",
      ethereum.Value.fromUnsignedBigInt(_toTokenId)
    )
  )

  return batchMetadataUpdateEvent
}

export function createContractURIUpdatedEvent(
  prevURI: string,
  newURI: string
): ContractURIUpdated {
  let contractUriUpdatedEvent = changetype<ContractURIUpdated>(newMockEvent())

  contractUriUpdatedEvent.parameters = new Array()

  contractUriUpdatedEvent.parameters.push(
    new ethereum.EventParam("prevURI", ethereum.Value.fromString(prevURI))
  )
  contractUriUpdatedEvent.parameters.push(
    new ethereum.EventParam("newURI", ethereum.Value.fromString(newURI))
  )

  return contractUriUpdatedEvent
}

export function createCouponRedeemedEvent(
  owner: Address,
  tokenId: BigInt,
  affiliateAddress: Address,
  FEE: BigInt,
  contractAddress: Address,
  timestamp: BigInt,
  currency: Address
): CouponRedeemed {
  let couponRedeemedEvent = changetype<CouponRedeemed>(newMockEvent())

  couponRedeemedEvent.parameters = new Array()

  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "affiliateAddress",
      ethereum.Value.fromAddress(affiliateAddress)
    )
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam("FEE", ethereum.Value.fromUnsignedBigInt(FEE))
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam("currency", ethereum.Value.fromAddress(currency))
  )

  return couponRedeemedEvent
}

export function createDefaultRoyaltyEvent(
  newRoyaltyRecipient: Address,
  newRoyaltyBps: BigInt
): DefaultRoyalty {
  let defaultRoyaltyEvent = changetype<DefaultRoyalty>(newMockEvent())

  defaultRoyaltyEvent.parameters = new Array()

  defaultRoyaltyEvent.parameters.push(
    new ethereum.EventParam(
      "newRoyaltyRecipient",
      ethereum.Value.fromAddress(newRoyaltyRecipient)
    )
  )
  defaultRoyaltyEvent.parameters.push(
    new ethereum.EventParam(
      "newRoyaltyBps",
      ethereum.Value.fromUnsignedBigInt(newRoyaltyBps)
    )
  )

  return defaultRoyaltyEvent
}

export function createMetadataFrozenEvent(): MetadataFrozen {
  let metadataFrozenEvent = changetype<MetadataFrozen>(newMockEvent())

  metadataFrozenEvent.parameters = new Array()

  return metadataFrozenEvent
}

export function createOwnerUpdatedEvent(
  prevOwner: Address,
  newOwner: Address
): OwnerUpdated {
  let ownerUpdatedEvent = changetype<OwnerUpdated>(newMockEvent())

  ownerUpdatedEvent.parameters = new Array()

  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("prevOwner", ethereum.Value.fromAddress(prevOwner))
  )
  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerUpdatedEvent
}

export function createRoyaltyForTokenEvent(
  tokenId: BigInt,
  royaltyRecipient: Address,
  royaltyBps: BigInt
): RoyaltyForToken {
  let royaltyForTokenEvent = changetype<RoyaltyForToken>(newMockEvent())

  royaltyForTokenEvent.parameters = new Array()

  royaltyForTokenEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  royaltyForTokenEvent.parameters.push(
    new ethereum.EventParam(
      "royaltyRecipient",
      ethereum.Value.fromAddress(royaltyRecipient)
    )
  )
  royaltyForTokenEvent.parameters.push(
    new ethereum.EventParam(
      "royaltyBps",
      ethereum.Value.fromUnsignedBigInt(royaltyBps)
    )
  )

  return royaltyForTokenEvent
}

export function createTokenClaimedEvent(
  claimer: Address,
  receiver: Address,
  tokenId: BigInt,
  quantity: BigInt,
  affiliateAddress: Address,
  contractAddress: Address,
  timestamp: BigInt,
  _tokenURI: string
): TokenClaimed {
  let tokenClaimedEvent = changetype<TokenClaimed>(newMockEvent())

  tokenClaimedEvent.parameters = new Array()

  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam("claimer", ethereum.Value.fromAddress(claimer))
  )
  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "quantity",
      ethereum.Value.fromUnsignedBigInt(quantity)
    )
  )
  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "affiliateAddress",
      ethereum.Value.fromAddress(affiliateAddress)
    )
  )
  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )
  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  tokenClaimedEvent.parameters.push(
    new ethereum.EventParam("_tokenURI", ethereum.Value.fromString(_tokenURI))
  )

  return tokenClaimedEvent
}

export function createTokensClaimedEvent(
  claimer: Address,
  receiver: Address,
  tokenId: BigInt,
  quantityClaimed: BigInt
): TokensClaimed {
  let tokensClaimedEvent = changetype<TokensClaimed>(newMockEvent())

  tokensClaimedEvent.parameters = new Array()

  tokensClaimedEvent.parameters.push(
    new ethereum.EventParam("claimer", ethereum.Value.fromAddress(claimer))
  )
  tokensClaimedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  tokensClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  tokensClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "quantityClaimed",
      ethereum.Value.fromUnsignedBigInt(quantityClaimed)
    )
  )

  return tokensClaimedEvent
}

export function createTokensLazyMintedEvent(
  startTokenId: BigInt,
  endTokenId: BigInt,
  baseURI: string,
  encryptedBaseURI: Bytes
): TokensLazyMinted {
  let tokensLazyMintedEvent = changetype<TokensLazyMinted>(newMockEvent())

  tokensLazyMintedEvent.parameters = new Array()

  tokensLazyMintedEvent.parameters.push(
    new ethereum.EventParam(
      "startTokenId",
      ethereum.Value.fromUnsignedBigInt(startTokenId)
    )
  )
  tokensLazyMintedEvent.parameters.push(
    new ethereum.EventParam(
      "endTokenId",
      ethereum.Value.fromUnsignedBigInt(endTokenId)
    )
  )
  tokensLazyMintedEvent.parameters.push(
    new ethereum.EventParam("baseURI", ethereum.Value.fromString(baseURI))
  )
  tokensLazyMintedEvent.parameters.push(
    new ethereum.EventParam(
      "encryptedBaseURI",
      ethereum.Value.fromBytes(encryptedBaseURI)
    )
  )

  return tokensLazyMintedEvent
}

export function createTransferBatchEvent(
  _operator: Address,
  _from: Address,
  _to: Address,
  _ids: Array<BigInt>,
  _values: Array<BigInt>
): TransferBatch {
  let transferBatchEvent = changetype<TransferBatch>(newMockEvent())

  transferBatchEvent.parameters = new Array()

  transferBatchEvent.parameters.push(
    new ethereum.EventParam("_operator", ethereum.Value.fromAddress(_operator))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("_from", ethereum.Value.fromAddress(_from))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("_to", ethereum.Value.fromAddress(_to))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam(
      "_ids",
      ethereum.Value.fromUnsignedBigIntArray(_ids)
    )
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam(
      "_values",
      ethereum.Value.fromUnsignedBigIntArray(_values)
    )
  )

  return transferBatchEvent
}

export function createTransferSingleEvent(
  _operator: Address,
  _from: Address,
  _to: Address,
  _id: BigInt,
  _value: BigInt
): TransferSingle {
  let transferSingleEvent = changetype<TransferSingle>(newMockEvent())

  transferSingleEvent.parameters = new Array()

  transferSingleEvent.parameters.push(
    new ethereum.EventParam("_operator", ethereum.Value.fromAddress(_operator))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("_from", ethereum.Value.fromAddress(_from))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("_to", ethereum.Value.fromAddress(_to))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("_id", ethereum.Value.fromUnsignedBigInt(_id))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("_value", ethereum.Value.fromUnsignedBigInt(_value))
  )

  return transferSingleEvent
}

export function createURIEvent(_value: string, _id: BigInt): URI {
  let uriEvent = changetype<URI>(newMockEvent())

  uriEvent.parameters = new Array()

  uriEvent.parameters.push(
    new ethereum.EventParam("_value", ethereum.Value.fromString(_value))
  )
  uriEvent.parameters.push(
    new ethereum.EventParam("_id", ethereum.Value.fromUnsignedBigInt(_id))
  )

  return uriEvent
}
