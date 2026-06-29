/// Wellspring: on-chain, permanent impact proofs.
///
/// A proof is created and immediately frozen so it becomes an immutable,
/// publicly readable object. A ProofFrozen event is emitted before the
/// object is frozen so indexers can track every proof as it is minted.
module wellspring::impact;

use std::string::{Self, String};
use sui::clock::Clock;
use sui::event;

/// An immutable record of a real-world impact action, anchored on-chain.
/// The blob_id field references the off-chain media stored on Walrus.
public struct ImpactProof has key, store {
    id: UID,
    title: String,
    description: String,
    location: String,
    blob_id: String,
    creator: address,
    timestamp_ms: u64,
}

/// Emitted when a new ImpactProof is created and frozen.
public struct ProofFrozen has copy, drop {
    id: ID,
    title: String,
    location: String,
    creator: address,
    timestamp_ms: u64,
}

/// Build an ImpactProof, emit a ProofFrozen event, then freeze the object
/// so it becomes immutable and publicly shared forever.
entry fun freeze_proof(
    title: String,
    description: String,
    location: String,
    blob_id: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let proof = ImpactProof {
        id: object::new(ctx),
        title,
        description,
        location,
        blob_id,
        creator: ctx.sender(),
        timestamp_ms: clock.timestamp_ms(),
    };

    // Emit the event BEFORE freezing. String has no copy ability, so the
    // title and location are duplicated from their bytes for the payload.
    event::emit(ProofFrozen {
        id: object::id(&proof),
        title: string::utf8(*proof.title.as_bytes()),
        location: string::utf8(*proof.location.as_bytes()),
        creator: proof.creator,
        timestamp_ms: proof.timestamp_ms,
    });

    transfer::public_freeze_object(proof);
}
