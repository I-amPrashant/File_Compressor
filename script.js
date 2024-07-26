const fileUpload = document.getElementById("fileUpload");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("fileName");
const uploadedFile = document.getElementById("uploadedFile");
const fileIcon = document.getElementById("fileIcon");
const errorDisplay= document.getElementById("errorDisplay");

const reader = new FileReader();
uploadedFile.style.display = "none";
let uploadSizeValid = true, fileString='', compressBtnPress = false, decompressBtnPress = false;

uploadBtn.addEventListener("click", () => {
  fileUpload.click();
});
fileUpload.addEventListener("change", () => {
  uploadedFile.style.display = "none";
  uploadSizeValid = true, compressBtnPress = false, decompressBtnPress = false;
  uploadedFile.lastElementChild.id === "fileName-wrapper"
    ? null
    : uploadedFile.lastElementChild.remove();
    errorDisplay.style.display = 'none';
  const file = fileUpload.files[0];
  file.name.length > 30
    ? (fileName.textContent = `${file.name.slice(0, 25)}...`)
    : (fileName.textContent = file.name);
  //file type check
  if (file.type.includes("image")){
    fileIcon.src = "image.png";
  } else if (file.type.includes("text")){
    fileIcon.src = "text.png";
  } else if (file.type.includes("audio")){
    fileIcon.src = "mp3.png";
  } else {
    fileIcon.src = "document.png";
  }
  //file size check
  if (file.size > 4 * 1024 * 1024) {
    uploadSizeValid = false;
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = "File size too large. Please upload a file less than 4MB";
  }
  reader.onload = () => {
    uploadSizeValid
      ? (uploadedFile.style.display = "flex")
      : (uploadedFile.style.display = "none");
      const textDecoder=new TextDecoder();
      const text=textDecoder.decode(reader.result);
      fileString=text;
  };
  reader.readAsArrayBuffer(file);
});
reader.addEventListener("progress", (e) => {
  if (e.loaded && e.total) {
    const percent = (e.loaded / e.total) * 100;
    document.getElementsByTagName("progress")[0].value = percent;
    document.getElementById("percent").textContent = `${Math.round(percent)}%`;
  }
});
reader.addEventListener("error", () => {
    errorDisplay.innerHTML = "Something went wrong. Please try again.";
  errorDisplay.style.display = "block";
});

//implementing huffman coding algorithm

//calculating the frequency of each character in file uploaded.

function frequencyCount(str) {
  const freq = {};
  for (let char of str) {
    if (freq[char]) {
      freq[char]++;
    } else {
      freq[char] = 1;
    }
  }
  return freq;
}

//creating a priority or min Heap data structure based on the frequency.
function createPriorityHeap() {
  const heap = [];

  //functions to get the left, right and parent node created in the huffman tree.
  function getParentNode(i) {
    return Math.floor((i - 1) / 2);
  }
  function getLeftChild(i) {
    return 2 * i + 1;
  }
  function getRightChild(i) {
    return 2 * i + 2;
  }

  //insert characters and its corresponding frequency in the heap and place the smaller element at the top of the heap by checking the last added node with its parent node.
  function insertNode(node) {
    heap.push(node);
    let index = heap.length - 1;
    while (
      index > 0 &&
      heap[index].frequency < heap[getParentNode(index)].frequency
    ) {
      [heap[index], heap[getParentNode(index)]] = [
        heap[getParentNode(index)],
        heap[index],
      ]; //swapping nodes
      index = getParentNode(index);
    }
  }
  //remove the element at the top of the heap and replace the position with the element at the last position.
  function deleteNode() {
    if (heap.length === 1) return heap.pop();
    const root = heap[0];
    heap[0] = heap.pop();
    let index = 0;
    while (getLeftChild(index) < heap.length) {
      let smallerIndex = getLeftChild(index);
      if (
        getRightChild(index) < heap.length &&
        heap[getRightChild(index)].frequency < heap[smallerIndex].frequency
      ) {
        smallerIndex = getRightChild(index);
      }
      if (heap[index].frequency < heap[smallerIndex].frequency) break;
      [heap[index], heap[smallerIndex]] = [heap[smallerIndex], heap[index]]; //swapping
      index = smallerIndex;
    }
    return root;
  }
  return { heap, insertNode, deleteNode };
}

//creating a node for each character and its corresponding frequency.
function createNode(char, frequency) {
  return { char, frequency, left: null, right: null };
}

//create huffman tree using the min heap data structure.
function createHuffmanTree(freq) {
  const { heap, insertNode, deleteNode } = createPriorityHeap();
  for (let char in freq) {
    const node = createNode(char, freq[char]);
    insertNode(node);
  }
  while (heap.length > 1) {
    let left = deleteNode();
    let right = deleteNode();
    let newMergedNode = createNode(null, left.frequency + right.frequency);
    newMergedNode.left = left;
    newMergedNode.right = right;
    insertNode(newMergedNode);
  }
  return deleteNode();
}

//generate huffman codes using the root node returned from the huffman tree.
function generateHuffmanCode(root){
  const codes = {};

  function traverse(node, code) {
    if (node === null) return;
    if (node.char !== null) {
      codes[node.char] = code;
    }

    //recursively traverse the left and right sub tree
    traverse(node.left, code + "0");
    traverse(node.right, code + "1");
  }
  traverse(root, "");
  return codes;
}

//encode the string using the huffman codes
function encodeString(string, codes){
  return string
    .split("")
    .map((char) => codes[char] || "")
    .join("");
}

function generateUrlEncodedString(encodedString, rootNode) {
  // Convert binary string to Uint8Array
  if(!localStorage.getItem(fileUpload.files[0].name)){
    localStorage.setItem(fileUpload.files[0].name, JSON.stringify(rootNode));
    const byteArray = new Uint8Array(Math.ceil(encodedString.length / 8));
    for (let i = 0; i < encodedString.length; i++){
      if (encodedString[i] === "1") {
        byteArray[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
      }
    }
  
    const blob = new Blob([byteArray], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
  
    //create download url
    const a = document.createElement("a");
    a.innerHTML = `
      <img src="download.png" alt="download" height="25">
      `;
    a.href = url;
    a.download = `${fileUpload.files[0].name}`;
    uploadedFile.appendChild(a);
  }else{
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = "File already compressed";
  }
 
}

// Function to decode the encoded string using the Huffman Tree
// function decodeString(encodedString) {
//   const newEncodedString = new Uint8Array(encodedString);

//   let binaryString = "";

//   for (let byte of newEncodedString) {
//     // Convert byte to a binary string and pad with leading zeros
//     let bits = byte.toString(2).padStart(8, "0");
//     binaryString += bits;
//   }

//   // console.log(binaryString);

//   const seperator = "000000001000000100000";
//   const treeData = binaryString.slice(
//     binaryString.indexOf(seperator) + seperator.length
//   );

//   // Split the binary string into chunks of 8 bits
//   let chunks = treeData.match(/.{1,8}/g);

//   // Convert each chunk from binary to decimal (byte value)
//   let byteArray = chunks.map((byte) => parseInt(byte, 2));

//   // Convert byte array to a string using TextDecoder
//   let text = new TextDecoder().decode(new Uint8Array(byteArray));
//   console.log(text);

//   // let decodedString = '';
//   // let currentNode = root;

//   // for (let bit of encodedString) {
//   //     if (bit === '0') {
//   //         currentNode = currentNode.left;
//   //     } else {
//   //         currentNode = currentNode.right;
//   //     }

//   //     // If we reach a leaf node
//   //     if (currentNode.char !== null) {
//   //         decodedString += currentNode.char;
//   //         currentNode = root; // Go back to the root for the next character
//   //     }
//   // }

//   // return decodedString;
// }

document.getElementById("compressBtn").addEventListener("click", () => {
    if(!fileUpload.files[0]){
        errorDisplay.style.display='block'
        errorDisplay.innerHTML = "Please select a file...";
        return;
    }
    if(!compressBtnPress){
        compressBtnPress = true;
      const freq = frequencyCount(fileString);
      const rootNode = createHuffmanTree(freq);
      const codes = generateHuffmanCode(rootNode);
      const encodedString = encodeString(fileString, codes);
      generateUrlEncodedString(encodedString, rootNode);
    }
})


// document.getElementById("decompressBtn").addEventListener("click", () => {
//   decodeString(reader.result);
// });
