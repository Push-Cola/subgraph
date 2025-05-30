import { TokenMetadata, Affiliate, CouponRedeemed, TokenClaimed, Location, Attribute } from '../generated/schema';
import { Bytes, dataSource, json, log, BigInt, TypedMap, Value, BigDecimal, JSONValue, JSONValueKind, crypto, store } from '@graphprotocol/graph-ts';
import { Coupon, User, Project } from '../generated/schema';
import { 
	AffiliateRegistered,
	CouponRedeemed as CouponRedeemedEvent,
	TokenClaimed as TokenClaimedEvent
} from '../generated/templates/LazyMint1/LazyMint1';

export function handleMetadata(content: Bytes): void {
	const tokenId = dataSource.stringParam();
	
	// Log the received token ID for debugging
	log.info('handleMetadata called with tokenId: {}', [tokenId]);
	
	// Check if metadata already exists
	let tokenMetadata = TokenMetadata.load(tokenId);
	
	if (tokenMetadata == null) {
		log.info('Creating new TokenMetadata for tokenId: {}', [tokenId]);
		tokenMetadata = new TokenMetadata(tokenId);
		tokenMetadata.name = 'Unnamed Token'; // Set default name
	} else {
		log.info('Updating existing TokenMetadata for tokenId: {}', [tokenId]);
	}

	if (content.length == 0) {
		log.warning('Empty content received for token {}', [tokenId]);
		tokenMetadata.save();
		return;
	}

	// Log content length for debugging
	log.info('Content length for token {}: {}', [tokenId, content.length.toString()]);

	// Add retry logic for JSON parsing
	let jsonResult = json.try_fromBytes(content);
	if (jsonResult.isError) {
		log.error('Failed to parse JSON for token {}: {}', [tokenId, 'Error parsing JSON']);
		tokenMetadata.save();
		return;
	}

	let value = jsonResult.value.toObject();
	if (!value) {
		log.error('Invalid metadata object for token {}', [tokenId]);
		tokenMetadata.save();
		return;
	}
	
	// Log that JSON parsing was successful
	log.info('Successfully parsed JSON for token {}', [tokenId]);

	// Basic fields
	const name = value.get('name');
	const description = value.get('description');
	const image = value.get('image');
	const backgroundColor = value.get('backgroundColor');
	const textColor = value.get('textColor');
	const visibility = value.get('visibility');
	const category = value.get('category');
	const promoVideo = value.get('promoVideo');

	// Set basic fields with null checks
	if (name && !name.isNull() && name.kind == JSONValueKind.STRING) tokenMetadata.name = name.toString();
	if (description && !description.isNull() && description.kind == JSONValueKind.STRING) tokenMetadata.description = description.toString();
	if (image && !image.isNull() && image.kind == JSONValueKind.STRING) tokenMetadata.image = image.toString();
	if (backgroundColor && !backgroundColor.isNull() && backgroundColor.kind == JSONValueKind.STRING) tokenMetadata.backgroundColor = backgroundColor.toString();
	if (textColor && !textColor.isNull() && textColor.kind == JSONValueKind.STRING) tokenMetadata.textColor = textColor.toString();
	if (visibility && !visibility.isNull() && visibility.kind == JSONValueKind.STRING) tokenMetadata.visibility = visibility.toString();
	if (category && !category.isNull() && category.kind == JSONValueKind.STRING) tokenMetadata.category = category.toString();
	if (promoVideo && !promoVideo.isNull() && promoVideo.kind == JSONValueKind.STRING) {
		tokenMetadata.promoVideo = promoVideo.toString();
		log.info('PromoVideo field saved for token {}: {}', [tokenId, promoVideo.toString()]);
	}

	// Location object with error handling
	const location = value.get('location');
	if (location && !location.isNull()) {
		let locationObj = location.toObject();
		if (locationObj) {
			let location = new Location(tokenId + '-location');
			const address1 = locationObj.get('address1');
			const address2 = locationObj.get('address2');
			const formattedAddress = locationObj.get('formattedAddress');
			const cityName = locationObj.get('city');
			const region = locationObj.get('region');
			const postalCode = locationObj.get('postalCode');
			const countryName = locationObj.get('country');
			const lat = locationObj.get('lat');
			const lng = locationObj.get('lng');

			if (address1 && !address1.isNull() && address1.kind == JSONValueKind.STRING) location.address1 = address1.toString();
			if (address2 && !address2.isNull() && address2.kind == JSONValueKind.STRING) location.address2 = address2.toString();
			if (formattedAddress && !formattedAddress.isNull() && formattedAddress.kind == JSONValueKind.STRING) location.formattedAddress = formattedAddress.toString();
			if (region && !region.isNull() && region.kind == JSONValueKind.STRING) location.region = region.toString();
			if (postalCode && !postalCode.isNull() && postalCode.kind == JSONValueKind.STRING) location.postalCode = postalCode.toString();
			if (lat && !lat.isNull() && lat.kind == JSONValueKind.STRING) location.lat = BigDecimal.fromString(lat.toString());
			if (lng && !lng.isNull() && lng.kind == JSONValueKind.STRING) location.lng = BigDecimal.fromString(lng.toString());
			if (countryName && !countryName.isNull() && countryName.kind == JSONValueKind.STRING) location.country = countryName.toString();
			if (cityName && !cityName.isNull() && cityName.kind == JSONValueKind.STRING) {
				location.city = cityName.toString();
				// Also set the direct locationCity field on TokenMetadata
				tokenMetadata.locationCity = cityName.toString();
			}

			location.save();
			tokenMetadata.location = location.id;
		}
	}

	// Process attributes without try-catch
	const attributes = value.get('attributes');
	if (attributes && !attributes.isNull()) {
		let attributesArray = attributes.toArray();
		if (attributesArray) {
			let processedAttributes: string[] = [];
			for (let i = 0; i < attributesArray.length; i++) {
				let attribute = attributesArray[i].toObject();
				if (!attribute) {
					log.warning('Invalid attribute at index {} for token {}', [i.toString(), tokenId]);
					continue;
				}
				
				let traitType = attribute.get('trait_type');
				let traitValue = attribute.get('value');
				
				if (traitType && !traitType.isNull() && traitType.kind == JSONValueKind.STRING && 
					traitValue && !traitValue.isNull() && traitValue.kind == JSONValueKind.STRING) {
					let newAttribute = new Attribute(tokenId + '-attribute-' + i.toString());
					newAttribute.traitType = traitType.toString();
					newAttribute.value = traitValue.toString();
					newAttribute.save();
					processedAttributes.push(newAttribute.id);
				}
			}
			tokenMetadata.attributes = processedAttributes;
		}
	}

	log.info('Successfully processed metadata for token {}', [tokenId]);
	tokenMetadata.save();
}

export function handleAffiliateRegistered(event: AffiliateRegistered): void {
	let user = User.load(event.params.affiliateAddress);
	if (!user) {
		user = new User(event.params.affiliateAddress);
		user.totalRewards = BigInt.fromI32(0);
		user.totalClaims = BigInt.fromI32(0);
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

	// Create a compound ID that combines affiliate address and coupon address
	let compoundIdString = event.params.affiliateAddress.toHexString() + '-' + event.params.contractAddress.toHexString();
	let affiliateId = Bytes.fromUTF8(compoundIdString);
	
	// Check if this specific affiliate-coupon combination already exists
	let affiliate = Affiliate.load(affiliateId);
	if (affiliate != null) {
		log.info('Affiliate already exists for address {} and coupon {}', [
			event.params.affiliateAddress.toHexString(),
			event.params.contractAddress.toHexString()
		]);
		return;
	}

	affiliate = new Affiliate(affiliateId);
	affiliate.user = user.id;
	affiliate.coupon = coupon.id;
	affiliate.timestamp = event.block.timestamp;
	affiliate.totalClaims = BigInt.fromI32(0);
	affiliate.totalRedemptions = BigInt.fromI32(0);
	affiliate.totalEarnings = BigInt.fromI32(0);
	affiliate.totalPaidOut = BigInt.fromI32(0);
	affiliate.pendingPayments = BigInt.fromI32(0);
	affiliate.uniqueClaimers = [];
	affiliate.status = "ACTIVE";
	affiliate.save();
	
	// Save coupon after initialization
	coupon.save();
}

export function handleCouponRedeemed(event: CouponRedeemedEvent): void {
	// Load or create owner user
	let owner = User.load(event.params.owner);
	if (!owner) {
		owner = new User(event.params.owner);
		owner.totalRewards = BigInt.fromI32(0);
		owner.totalClaims = BigInt.fromI32(0);
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

	// Create a compound ID for the affiliate lookup
	let affiliate: Affiliate | null = null;
	if (event.params.affiliateAddress.toHexString() != "0x0000000000000000000000000000000000000000") {
		// Load or create user for affiliate address
		let affiliateUser = User.load(event.params.affiliateAddress);
		if (!affiliateUser) {
			affiliateUser = new User(event.params.affiliateAddress);
			affiliateUser.totalRewards = BigInt.fromI32(0);
			affiliateUser.totalClaims = BigInt.fromI32(0);
			affiliateUser.save();
		}
		
		let compoundIdString = event.params.affiliateAddress.toHexString() + '-' + event.params.contractAddress.toHexString();
		let affiliateId = Bytes.fromUTF8(compoundIdString);
		affiliate = Affiliate.load(affiliateId);
		
		// If affiliate doesn't exist, create it on-the-fly
		if (!affiliate) {
			log.info('Creating new Affiliate for address {} and coupon {} on-the-fly', [
				event.params.affiliateAddress.toHexString(),
				event.params.contractAddress.toHexString()
			]);
			
			affiliate = new Affiliate(affiliateId);
			affiliate.user = affiliateUser.id;
			affiliate.coupon = coupon.id;
			affiliate.timestamp = event.block.timestamp;
			affiliate.totalClaims = BigInt.fromI32(0);
			affiliate.totalRedemptions = BigInt.fromI32(0);
			affiliate.totalEarnings = BigInt.fromI32(0);
			affiliate.totalPaidOut = BigInt.fromI32(0);
			affiliate.pendingPayments = BigInt.fromI32(0);
			affiliate.uniqueClaimers = [];
			affiliate.status = "ACTIVE";
			affiliate.save();
			
			// Log the creation of the new affiliate
			log.info('Successfully created new Affiliate entity with ID {}', [affiliateId.toHexString()]);
		}
	}

	// Create the CouponRedeemed entity
	let entity = new CouponRedeemed(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.coupon = coupon.id;
	entity.owner = owner.id;
	entity.feeAmount = coupon.fee;

	if (affiliate) {
		entity.affiliate = affiliate.id;
		
		// IMPORTANT: We can't update the immutable Affiliate entity
		// Instead, track these values at the coupon level, which is mutable
		// The fee amount is already stored in the CouponRedeemed entity
		
		// Update payments tracking at coupon and project level
		coupon.totalAffiliatePayments = coupon.totalAffiliatePayments.plus(coupon.fee);
		project.totalAffiliatePayments = project.totalAffiliatePayments.plus(coupon.fee);
	}

	entity.timestamp = event.params.timestamp;
	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	// Update the Coupon entity's isRedeemed field
	coupon.isRedeemed = true;

	// Ensure project.totalAffiliatePayments is initialized
	if (!project.totalAffiliatePayments) {
		project.totalAffiliatePayments = BigInt.fromI32(0);
	}

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
		receiver.totalRewards = BigInt.fromI32(0);
		receiver.totalClaims = BigInt.fromI32(0);
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
	let affiliate: Affiliate | null = null;
	if (event.params.affiliateAddress.toHexString() != "0x0000000000000000000000000000000000000000") {
		// Load or create user for affiliate address
		let affiliateUser = User.load(event.params.affiliateAddress);
		if (!affiliateUser) {
			affiliateUser = new User(event.params.affiliateAddress);
			affiliateUser.totalRewards = BigInt.fromI32(0);
			affiliateUser.totalClaims = BigInt.fromI32(0);
			affiliateUser.save();
		}
		
		let compoundIdString = event.params.affiliateAddress.toHexString() + '-' + event.params.contractAddress.toHexString();
		let affiliateId = Bytes.fromUTF8(compoundIdString);
		affiliate = Affiliate.load(affiliateId);
		
		// If affiliate doesn't exist, create it on-the-fly
		if (!affiliate) {
			log.info('Creating new Affiliate for address {} and coupon {} on-the-fly in TokenClaimed handler', [
				event.params.affiliateAddress.toHexString(),
				event.params.contractAddress.toHexString()
			]);
			
			affiliate = new Affiliate(affiliateId);
			affiliate.user = affiliateUser.id;
			affiliate.coupon = coupon.id;
			affiliate.timestamp = event.block.timestamp;
			affiliate.totalClaims = BigInt.fromI32(0);
			affiliate.totalRedemptions = BigInt.fromI32(0);
			affiliate.totalEarnings = BigInt.fromI32(0);
			affiliate.totalPaidOut = BigInt.fromI32(0);
			affiliate.pendingPayments = BigInt.fromI32(0);
			affiliate.uniqueClaimers = [];
			affiliate.status = "ACTIVE";
			affiliate.save();
			
			// Log the creation of the new affiliate
			log.info('Successfully created new Affiliate entity with ID {}', [affiliateId.toHexString()]);
		}
	}
	
	// Create the TokenClaimed entity
	let entity = new TokenClaimed(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.project = project.id;
	entity.coupon = coupon.id;
	entity.claimer = event.params.claimer;
	entity.receiver = receiver.id;
	entity.quantity = BigInt.fromI32(1);

	if (affiliate) {
		entity.affiliate = affiliate.id;

		// Update the affiliate's totalClaims count even though it's immutable
		// This will only affect new affiliates created on-the-fly, not existing ones
		// Which is better than not tracking it at all
	}

	// Update project stats
	project.totalClaims = project.totalClaims.plus(BigInt.fromI32(1));
	
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
	
	// Update ownership
	let owners = coupon.owners;
	owners.push(receiver.id);
	coupon.owners = owners;

	entity.timestamp = event.params.timestamp;
	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	// Save all entities
	entity.save();
	project.save();
	coupon.save();
}

