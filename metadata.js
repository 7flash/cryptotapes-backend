const emptyTapeMetadata = {
    "name": "Empty Tape",
    "image": "https://gateway.pinata.cloud/ipfs/QmVgHb2gUgKbmNFmfLBor1iyNdSWFW1UVJmvideSWUAjXN",
    "external_url": "https://cryptotaperecordings.com",
    "description": "Available for masterpiece recording",
    "attributes": [
        {
            "trait_type": "rarity",
            "value": "gold"
        }
    ]
}

const sampleTapeMetadata = {
    "name": "Sample Song",
    "image": "https://gateway.pinata.cloud/ipfs/QmVgHb2gUgKbmNFmfLBor1iyNdSWFW1UVJmvideSWUAjXN",
    "animation_url": "https://gateway.pinata.cloud/ipfs/QmW9GUSf2u8S6q96KAr1Umq1J3c7vpXHJQVJhP6kma5Fr4",
    "external_url": "https://api.cryptotaperecordings.com/token/1",
    "description": "Sample Lyrics",
    "attributes": [
        {
            "trait_type": "rarity",
            "value": "gold"
        },
        {
            "trait_type": "audio",
            "value": "https://gateway.pinata.cloud/ipfs/QmV55qseMjrj8HdFhx2qmJ6XSpUXwisjafJkGJyfhDG5Rw"
        }
    ]
}

const contractMetadata = {
    "name": "Crypto Tape Recordings",
    "description": "Crypto Tape Recordings",
    "image": "https://lh3.googleusercontent.com/vTSa1cI53mEPhAZPt4K2ZfB7kvXycO3ZiWMDoNwTAeFQYx48oA25cf1_3k6yRc7EXwWgDnxVaBukRR2RI8e0Och1zFCdBlmzGfPub_w",
    "external_link": "https://cryptotaperecordings.com",
    "seller_fee_basis_points": 100,
    "fee_recipient": "0x583Bf0Dc5a0e8FcCbCE42c946a03690f961AD2F8"
}

module.exports = { emptyTapeMetadata, sampleTapeMetadata, contractMetadata }