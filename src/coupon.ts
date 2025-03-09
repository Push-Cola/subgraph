import { TokenMetadata, Affiliate, CouponRedeemed, TokenClaimed } from '../generated/schema';
import { Bytes, dataSource, json, log, BigInt } from '@graphprotocol/graph-ts';
import { Coupon, User, Project } from '../generated/schema';
import { 
	AffiliateRegistered,
	CouponRedeemed as CouponRedeemedEvent,
	TokenClaimed as TokenClaimedEvent
} from '../generated/templates/LazyMint1/LazyMint1';

export function handleMetadata(content: Bytes): void {
	const tokenId = dataSource.stringParam();
	
	// Check if metadata already exists
	let tokenMetadata = TokenMetadata.load(tokenId);
	if (tokenMetadata == null) {
		tokenMetadata = new TokenMetadata(tokenId);
		tokenMetadata.name = 'Unnamed Token'; // Set default name
	}

	if (content.length == 0) {
		log.warning('Empty content received for token {}', [tokenId]);
		tokenMetadata.save();
		return;
	}

	let jsonResult = json.try_fromBytes(content);
	if (jsonResult.isError) {
		log.error('Failed to parse JSON for token {}', [tokenId]);
		tokenMetadata.save();
		return;
	}

	let value = jsonResult.value.toObject();
	if (value) {
		const image = value.get('image');
		const name = value.get('name');
		const bgColor = value.get('bgColor');
		const textColor = value.get('textColor');
		const logo = value.get('logo');
		const address = value.get('address');
		const description = value.get('description');
		const qrColor = value.get('qrColor');

		if (name && !name.isNull()) {
			tokenMetadata.name = name.toString();
		}

		if (image && !image.isNull()) tokenMetadata.image = image.toString();
		if (bgColor && !bgColor.isNull()) tokenMetadata.bgColor = bgColor.toString();
		if (textColor && !textColor.isNull()) tokenMetadata.textColor = textColor.toString();
		if (logo && !logo.isNull()) tokenMetadata.logo = logo.toString();
		if (address && !address.isNull()) tokenMetadata.address = address.toString();
		if (description && !description.isNull()) tokenMetadata.description = description.toString();
		if (qrColor && !qrColor.isNull()) tokenMetadata.qrColor = qrColor.toString();

		log.info('Successfully processed metadata for token {}', [tokenId]);
	} else {
		log.error('Invalid metadata object for token {}', [tokenId]);
	}

	tokenMetadata.save();
}

export function handleAffiliateCreated(event: AffiliateRegistered): void {
	let user = User.load(event.params.user);
	if (!user) {
		user = new User(event.params.user);
		user.save();
	}

	let coupon = Coupon.load(event.params.contractAddress);
	if (!coupon) {
		log.error('Coupon not found for address {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Initialize totalAffiliatePayments if not set
	if (!coupon.totalAffiliatePayments) {
		coupon.totalAffiliatePayments = BigInt.fromI32(0);
	}

	// Update project's totalBudgetLocked
	let project = Project.load(coupon.project);
	if (project) {
		project.totalBudgetLocked = project.totalBudgetLocked.plus(coupon.lockedBudget);
		project.save();
	}

	let affiliate = new Affiliate(event.params.user);
	affiliate.user = user.id;
	affiliate.coupon = coupon.id;
	affiliate.timestamp = event.block.timestamp;
	affiliate.totalClaims = BigInt.fromI32(0);
	affiliate.totalRedemptions = BigInt.fromI32(0);
	affiliate.totalEarnings = BigInt.fromI32(0);
	affiliate.totalPaidOut = BigInt.fromI32(0);
	affiliate.pendingPayments = BigInt.fromI32(0);
	affiliate.uniqueClaimers = [];
	affiliate.save();
	
	// Save coupon after initialization
	coupon.save();
}

export function handleCouponRedeemed(event: CouponRedeemedEvent): void {
	// Load or create owner user
	let owner = User.load(event.params.owner);
	if (!owner) {
		owner = new User(event.params.owner);
		owner.save();
	}

	// Load the coupon
	let coupon = Coupon.load(event.params.contractAddress);
	if (!coupon) {
		log.error('Coupon not found for address {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Load the project
	let project = Project.load(coupon.project);
	if (!project) {
		log.error('Project not found for coupon {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Find the affiliate if it exists
	let affiliate = Affiliate.load(event.params.affiliateAddress);

	// Create the CouponRedeemed entity
	let entity = new CouponRedeemed(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.coupon = coupon.id;
	entity.owner = owner.id;
	entity.feeAmount = coupon.fee;

	if (affiliate) {
		entity.affiliate = affiliate.id;
		// Update affiliate earnings based on fee
		affiliate.totalEarnings = affiliate.totalEarnings.plus(coupon.fee);
		affiliate.pendingPayments = affiliate.pendingPayments.plus(coupon.fee);
		affiliate.totalRedemptions = affiliate.totalRedemptions.plus(BigInt.fromI32(1));
		
		// Update payments tracking
		coupon.totalAffiliatePayments = coupon.totalAffiliatePayments.plus(coupon.fee);
		project.totalAffiliatePayments = project.totalAffiliatePayments.plus(coupon.fee);
		affiliate.save();
	}

	entity.timestamp = event.params.timestamp;
	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	// Update the Coupon entity's isRedeemed field
	coupon.isRedeemed = true;

	// Save all entities
	entity.save();
	project.save();
	coupon.save();
}

export function handleTokenClaimed(event: TokenClaimedEvent): void {
	// Create or load receiver user
	let receiver = User.load(event.params.receiver);
	if (!receiver) {
		receiver = new User(event.params.receiver);
		receiver.save();
	}

	// Load the coupon and its project
	let coupon = Coupon.load(event.params.contractAddress);
	if (!coupon) {
		log.error('Coupon not found for address {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	let project = Project.load(coupon.project);
	if (!project) {
		log.error('Project not found for coupon {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Find the affiliate if it exists
	let affiliate = Affiliate.load(event.params.affiliateAddress);
	
	// Create the TokenClaimed entity
	let entity = new TokenClaimed(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.project = project.id;
	entity.coupon = coupon.id;
	entity.claimer = event.params.claimer;
	entity.receiver = receiver.id;
	entity.quantity = event.params.quantity;

	if (affiliate) {
		entity.affiliate = affiliate.id;
	}

	// Update project stats
	project.totalClaims = project.totalClaims.plus(event.params.quantity);
	
	// Add receiver to project uniqueClaimers if not already present
	let projectClaimers = project.uniqueClaimers;
	let isNewProjectClaimer = true;
	for (let i = 0; i < projectClaimers.length; i++) {
		if (projectClaimers[i] == receiver.id) {
			isNewProjectClaimer = false;
			break;
		}
	}
	if (isNewProjectClaimer) {
		projectClaimers.push(receiver.id);
		project.uniqueClaimers = projectClaimers;
	}

	// Update affiliate stats if exists
	if (affiliate) {
		affiliate.totalClaims = affiliate.totalClaims.plus(event.params.quantity);
		
		// Add receiver to affiliate uniqueClaimers if not already present
		let affiliateClaimers = affiliate.uniqueClaimers;
		let isNewAffiliateClaimer = true;
		for (let i = 0; i < affiliateClaimers.length; i++) {
			if (affiliateClaimers[i] == receiver.id) {
				isNewAffiliateClaimer = false;
				break;
			}
		}
		if (isNewAffiliateClaimer) {
			affiliateClaimers.push(receiver.id);
			affiliate.uniqueClaimers = affiliateClaimers;
		}
		affiliate.save();
	}
	
	// Update ownership
	coupon.owner = receiver.id;

	entity.timestamp = event.params.timestamp;
	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	// Save all entities
	entity.save();
	project.save();
	coupon.save();
}
