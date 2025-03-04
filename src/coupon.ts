import {  TokenMetadata, Affiliate } from '../generated/schema';
import { Bytes, dataSource, json , log } from '@graphprotocol/graph-ts';
import { Coupon, User } from '../generated/schema';
import { AffiliateRegistered } from '../generated/templates/LazyMint1/LazyMint1';

export function handleMetadata(content: Bytes): void {
	const tokenId = dataSource.stringParam();
  let metadata = new TokenMetadata(tokenId);

  const value = json.fromBytes(content).toObject();
	
  if (value) {
    const image = value.get("image");
    const name = value.get("name");
    const bgColor = value.get("bgColor");
    const textColor = value.get("textColor");
    const logo = value.get("logo");
    const address = value.get("address");
    const description = value.get("description");
		const qrColor = value.get("qrColor");


    if (image) metadata.image = image.toString();
    if (name) metadata.name = name.toString();
    if (bgColor) metadata.bgColor = bgColor.toString();
    if (textColor) metadata.textColor = textColor.toString();
    if (logo) metadata.logo = logo.toString();
    if (address) metadata.address = address.toString();
    if (description) metadata.description = description.toString();
		if (qrColor) metadata.qrColor = qrColor.toString();
  }

  metadata.save();
}

export function handleAffiliateCreated(event: AffiliateRegistered): void {
  let user = User.load(event.params.user);
  if (!user) {
    user = new User(event.params.user);
    user.save();
  }

  let coupon = Coupon.load(event.params.contractAddress);
  if (!coupon) {
    coupon = new Coupon(event.params.contractAddress);
    coupon.save();
  }

  let affiliate =  new Affiliate(event.transaction.hash);
  affiliate.affiliateId = event.params.affiliateId;
  affiliate.user = user.id;
  affiliate.coupon = coupon.id;
  affiliate.contractAddress = event.params.contractAddress;
  affiliate.save();
}
