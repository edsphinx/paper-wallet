var Web3 = require('web3')
var qr = require('qr-image')
let base64url = require('base64url')
var fs = require('fs')

const URL = "https://xdai.io"
const COMPRESS = true
const AUTOPRINT = false
const MINEFOR = false//"feeddeadbeef"
var web3 = new Web3()


/*

TO MINT ART, print the art pdf on one side
then run index.js and print the generated on the other side

then ssh to medium ohio and copy the four addresses into the mintart.sh
with the right type of artwork and airdrop the collectibles 

 */


function createKeysAt(location){
  let result = ""
  if(MINEFOR){
    while(!result.address || result.address.toLowerCase().indexOf("0x"+MINEFOR)!==0){
      result = web3.eth.accounts.create();
      //console.log(result.address)
    }
  }else{
    result = web3.eth.accounts.create();
  }

  let PK = result.privateKey
  let pkLink
  if(COMPRESS){
    function pkToUrl(pk) {
      return base64url(web3.utils.hexToBytes(pk))
    }
    let encoded = pkToUrl(PK)
    pkLink = URL+"/pk#"+encoded
  }else{
    pkLink = URL+"/pk#"+PK.replace("0x","")
  }

  fs.appendFile('privatekeylinks.txt',pkLink+"\n", function (err) {
   if (err) throw err;
  });
  //console.log(pkLink)
  var private = qr.image(pkLink, { type: 'png' });
  private.pipe(require('fs').createWriteStream('private'+location+'.png'));

  var publicAddress = result.address

  var public = qr.image(URL+"/"+publicAddress, { type: 'svg' });
  public.pipe(require('fs').createWriteStream('public'+location+'.svg'));

  console.log(publicAddress)
  fs.appendFile('addresses.txt',publicAddress+"\n", function (err) {
    if (err) throw err;
  });

}

createKeysAt("1")
createKeysAt("2")
createKeysAt("3")
createKeysAt("4")


  fs.readFile("template.html", 'utf8', (err,data) => {
    if (err) {
      return console.log(err);
    }
    //var result = data.replace(/\*\*PUBLIC\*\*/g, publicAddress.substring(0,8)+"......"+publicAddress.substring(publicAddress.length-7));

    fs.writeFile("generated.html", data, 'utf8', function (err) {
       if (err) return console.log(err);

       var html = fs.readFileSync('./generated.html', 'utf8');
       var conversion = require("phantom-html-to-pdf")();
       console.log("Generating PDF...")
       conversion({
         html: html,
         allowLocalFilesAccess: true,
         phantomPath: require("phantomjs-prebuilt").path,
         settings: {
              javascriptEnabled : true,
              resourceTimeout: 10000
          },
          paperSize: {
              format: 'A4',
              orientation: 'portrait',
              margin: {
                  top: "0in",
                  left: "0in",
                  right:"0in"
              }
          }
       }, function(err, pdf) {
       var output = fs.createWriteStream('./generated.pdf')
       //console.log(pdf.logs);
       //console.log(pdf.numberOfPages);
         // since pdf.stream is a node.js stream you can use it
         // to save the pdf to a file (like in this example) or to
         // respond an http request.
       pdf.stream.pipe(output);
       conversion.kill();
       });



    });
  });
