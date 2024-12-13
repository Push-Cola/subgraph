import { LazyMintDeployed } from '../generated/LazyMintFactory/LazyMintFactory';
import { LazyMint1, TokenMetadata } from '../generated/templates';
import { Coupon, User } from '../generated/schema';
import { log } from '@graphprotocol/graph-ts';

export function handleContractCreated(event: LazyMintDeployed): void {
    LazyMint1.create(event.params.lazyMintAddress);

    let user = User.load(event.params.creator);

    if (user == null) {
        user = new User(event.params.creator);
        user.save();
    }

    let coupon = new Coupon(event.params.lazyMintAddress);
    coupon.user = user.id;
    coupon.address = event.params.lazyMintAddress;
    coupon.maxSupply = event.params.maxSupply;
    coupon.lockedBudget = event.params.lockedBudget;
    coupon.claimExpiration = event.params.claimExpiration;
    coupon.redeemExpiration = event.params.redeemExpiration;
    coupon.currencyAddress = event.params.currencyAddress;
    coupon.fee = event.params.fee;
    coupon.tokenId = event.params.tokenId;
    
    const cid = event.params.uri.replace("https://ipfs.io/ipfs/", "");
    coupon.metadata = cid;

     if (cid) {
        log.info("CID: {}", [cid]);
        TokenMetadata.create(cid); 
    }

    coupon.save();
}
