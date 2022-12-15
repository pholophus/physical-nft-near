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

  // const ownerDetail = {
  //   receiverId: NFT_ADDRESS,
  //   actions: [ // if any action fails, they all rollback together
  //     {
  //       type: 'FunctionCall',
  //       params: {
  //         methodName: ' nft_tokens_for_owner', args: { account_id: pholophus.testnet },
  //         gas: THIRTY_TGAS, deposit: NO_DEPOSIT
  //       }
  //     }
  //   ]
  // }

  // const buyNFT = {
  //   receiverId: NFT_ADDRESS,
  //   actions: [ // if any action fails, they all rollback together
  //     {
  //       type: 'FunctionCall',
  //       params: {
  //         methodName: ' nft_transfer', args: { token_id: decodedText,  "receiver_id": "alice.'$ID'", "memo": "transfer ownership"},
  //         gas: THIRTY_TGAS, deposit: NO_DEPOSIT
  //       }
  //     }
  //   ]
  // }

  // Sign **independent** transactions: If one fails, the rest **DO NOT** reverted
  // await wallet.signAndSendTransactions({ transactions: [ buyNFT ] })

  console.log(resultSign)

  const result = document.createElement("h1");
  const resultText = document.createTextNode("QR detail:");
  result.appendChild(resultText);
  document.getElementById("output").appendChild(result);

  const qrResult = document.createElement("h2");
  qrResult.id = 'qr-result'
  const textQrResult = document.createTextNode("ID is "+ decodedText);
  qrResult.appendChild(textQrResult);
  document.getElementById("output").appendChild(qrResult);

  // let NFTTitle = JSON[0].metadata.title
  // let NFTDescription = JSON[0].metadata.description 
  // let NFTMedia = JSON[0].metadata.media
  // let NFTPrice = JSON[0].metadata.price

  let NFTOwner = resultSign.metadata.owner_id
  let NFTOwned = resultSign.own == true ? "Not for sale" : "For sale"
  let NFTTitle = resultSign.metadata.metadata.title
  let NFTDescription = resultSign.metadata.metadata.description 
  let NFTMedia = resultSign.metadata.metadata.media
  let NFTPrice = 30

  //NFT owner
  const owner = document.createElement("h4");
  const ownerText = document.createTextNode(NFTOwner);
  owner.appendChild(ownerText);
  document.getElementById("owner").appendChild(owner);

  //NFT title
  const forsale = document.createElement("h4");
  const forsaleText = document.createTextNode(NFTOwned);
  forsale.appendChild(forsaleText);
  document.getElementById("forsale").appendChild(forsale);

  //NFT title
  const title = document.createElement("h4");
  const titleText = document.createTextNode(NFTTitle);
  title.appendChild(titleText);
  document.getElementById("title").appendChild(title);

  //NFT desc
  const desc = document.createElement("h4");
  const descText = document.createTextNode(NFTDescription);
  desc.appendChild(descText);
  document.getElementById("description").appendChild(desc);

  //NFT media
  var x = document.createElement("IMG");
  x.setAttribute("src", NFTMedia);
  x.setAttribute("width", "304");
  x.setAttribute("height", "228");
  x.setAttribute("alt", "The Pulpit Rock");
  document.getElementById("media").appendChild(x);

  //NFT price
  const price = document.createElement("h4");
  const priceText = document.createTextNode(NFTPrice);
  price.appendChild(priceText);
  document.getElementById("price").appendChild(price);

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

  getGreetingAndMessages();
};

// Button clicks
document.querySelector('form').onsubmit = sendGreeting;
document.querySelector('#sign-in-button').onclick = () => { wallet.signIn(); };
document.querySelector('#sign-out-button').onclick = () => { wallet.signOut(); };

async function sendGreeting(event) {
  // handle UI
  event.preventDefault();
  const { greeting, premium_check } = event.target.elements;

  document.querySelector('#signed-in-flow').classList.add('please-wait');

  const GUEST_DEPOSIT = premium_check.checked ? utils.format.parseNearAmount('0.1') : '0';

  const buyNFT = {
    receiverId: NFT_ADDRESS,
    actions: [ // if any action fails, they all rollback together
      {
        type: 'FunctionCall',
        params: {
          methodName: ' nft_tokens_for_owner', args: { account_id: pholophus.testnet },
          gas: THIRTY_TGAS, deposit: NO_DEPOSIT
        }
      }
    ]
  }

  // Sign **independent** transactions: If one fails, the rest **DO NOT** reverted
  await wallet.signAndSendTransactions({ transactions: [ helloTx, guestTx ] })
}

async function getGreetingAndMessages() {
  // query the greeting in Hello NEAR
  // const currentGreeting = await wallet.viewMethod({ method: 'get_greeting', contractId: HELLO_ADDRESS });
  const currentGreeting = await wallet.viewMethod({ method: 'nft_tokens_for_owner', contractId: NFT_ADDRESS, args: {account_id: "pholophus.testnet"} });

  // query the last 4 messages in the Guest Book
  const totalMessages = await wallet.viewMethod({method: 'total_messages', contractId: GUEST_ADDRESS })
  const from_index = (totalMessages > 4? totalMessages - 4: 0).toString();
  const latestMessages = await wallet.viewMethod({ method: 'get_messages', contractId: GUEST_ADDRESS, args: {from_index, limit: 4} });

  
  // handle UI stuff
  update_UI(currentGreeting, from_index, latestMessages);
}

// UI: Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-in-flow').style.display = 'none';
  document.querySelector('#signed-out-flow').style.display = 'block';
}

// UI: Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  document.querySelector('#signed-out-flow').style.display = 'none';
  document.querySelector('#signed-in-flow').style.display = 'block';
  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = wallet.accountId;
  });
}

function update_UI(greeting, from, messages) {
  document.querySelector('#greeting').innerHTML = greeting;

  const list = document.querySelector('#message-list')
  list.innerHTML = "";

  let idx = from;
  messages.forEach(msg => {
    let item = document.createElement('tr')
    const innerHTML = `
      <tr>
       <th scope="row">${idx++}</th>
       <td> ${msg.sender} </td>
       <td> ${msg.text} </td>
       <td> ${msg.premium}</td>
      </tr>
    `
    item.innerHTML = innerHTML
    list.appendChild(item)
  })
}
//#endregion
