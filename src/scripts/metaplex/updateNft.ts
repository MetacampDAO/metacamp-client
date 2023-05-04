import { airdropSolIfNeeded, initializeSolSignerKeypair } from "../initializeKeypair"
import * as web3 from "@solana/web3.js"
import { PublicKey } from "@solana/web3.js"
import test from "../../../assets/test.json"

import {
  Metaplex,
  keypairIdentity,
} from "@metaplex-foundation/js"


const uri = "https://nftstorage.link/ipfs/bafkreie7arsk2bgshxgk6zvvh6muo2gs5evbtesjbwud3f75s23isqolmm"
const mint = new PublicKey("2vuTygdwyQiN5wk2PwfCGYktLqznfrxnQU8yXiXda5AE")
const collection = new PublicKey("2XCxwjuUZxjTsDdHGQ8zb5HaPRrk1raeSdpfxd94iwAA")



async function main() {

  // Connect to cluster
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))

  // Get or create Keypair for user
  const user = await initializeSolSignerKeypair()

  // Airdrop to user
  await airdropSolIfNeeded(user, connection)


  // Call function to update NFT
  await updateNft(connection, user, uri, mint, collection)

}



// Update NFT
async function updateNft(
  connection: web3.Connection,
  signer: web3.Keypair,
  uri: string,
  mintAddress: PublicKey,
  collectionAddress: PublicKey
) {

  // Set up Metaplex client
  const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(signer))

  // Get "NftWithToken" type from mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress })

  // Set and call metadata to be updated
  await metaplex
    .nfts()
    .update({
      nftOrSft: nft,
      name: test.name,
      symbol: test.symbol,
      uri: uri,
      sellerFeeBasisPoints: test.sellerFeeBasisPoints,
      collection: collectionAddress  
    })

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  )
}


main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })

