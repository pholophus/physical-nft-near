import 'regenerator-runtime/runtime';
import { utils } from 'near-api-js'
import { Wallet } from './near-wallet';
import {Html5QrcodeScanner} from "html5-qrcode"
import JSON from './test.json'

const HELLO_ADDRESS = "hello.near-examples.testnet";
const GUEST_ADDRESS = "guestbook.near-examples.testnet";
const NFT_ADDRESS= "pholophus.testnet";

const wallet = new Wallet({})
const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

//#region 
//qrcode scanner
async function onScanSuccess(decodedText, decodedResult) {
  // handle the scanned code as you like, for example:
  console.log(`Code matched = ${decodedText}`, decodedResult);

  //dpaat list nft owner original
  const metadatas = await wallet.viewMethod({ method: 'nft_tokens_for_owner', contractId: NFT_ADDRESS, args: {account_id: "pholophus.testnet"} });

  let resultSign
  let owned = true
  let unownedMetadata

  //check if owner original still pegang atau tak
  for(const metadata of metadatas ){
    if(metadata.token_id == decodedText){
      owned = false;
      unownedMetadata = metadata
    }
  }

  //kalau owner lain pegang, return owner yang beli
  if(owned == true){
    const metadatas = await wallet.viewMethod({ method: 'nft_tokens_for_owner', contractId: NFT_ADDRESS, args: {account_id: "alice.pholophus.testnet"} });

    for(const metadata of metadatas ){
      if(metadata.token_id == decodedText){
        resultSign = {
          "own": true,
          "metadata": metadata
        }
      }
    }
    
  //kalau owner original masih oegang, jual ni
  }else{
    resultSign = {
      "own": false,
      "metadata": unownedMetadata
    }
  }

  document.getElementById("nft-card").style.visibility = "visible";

  document.getElementById("output").innerHTML = "ID is "+ decodedText;

  let NFTOwner = resultSign.metadata.owner_id == "pholophus.testnet" ? "Minter " + resultSign.metadata.owner_id : resultSign.metadata.owner_id
  let NFTOwned = resultSign.own == true ? "Not for sale" : "For sale"
  let NFTTitle = resultSign.metadata.metadata.title
  let NFTDescription = resultSign.metadata.metadata.description 
  let NFTMedia = resultSign.metadata.metadata.media
  let NFTPrice = 30

  document.getElementById("owner").innerHTML = `Owner(${NFTOwner})`;

  //NFT sale
  document.getElementById("forsale").innerHTML = NFTOwned;

  //NFT title
  document.getElementById("title").innerHTML = NFTTitle;

  //NFT desc
  document.getElementById("description").innerHTML = NFTDescription;

  //NFT media
  document.getElementById("media").src = NFTMedia;

  //NFT price
  document.getElementById("price").innerHTML = `Price: ${NFTPrice}`;

  document.getElementById("buy-action").classList = resultSign.own == true ? "btn btn-danger" : "btn btn-success"

  document.getElementById("buy-action").innerHTML = resultSign.own == true ? "Not Available" : "Buy"

  document.getElementById("buy-action").disabled = resultSign.own == true ? true : false

  document.getElementById("detail").style.display = "block"
}

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  console.warn(`Code scan error = ${error}`);
}
//#endregion

//#region 
let html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: {width: 250, height: 250} },
  /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

// Setup on page load
window.onload = async () => {
  let isSignedIn = await wallet.startUp();

  if (isSignedIn) {
    signedInFlow();
  } else {
    signedOutFlow();
  }
};


//#endregion
