const fileUpload = document.getElementById("fileUpload");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("fileName");
const uploadedFile = document.getElementById("uploadedFile");
const fileIcon = document.getElementById("fileIcon");
const errorDisplay = document.getElementById("errorDisplay");

const reader = new FileReader();
uploadedFile.style.display = "none";
let uploadSizeValid = true,
  fileString = "",
  compressBtnPress = false,
  decompressBtnPress = false;
let decodedFileString = "";

uploadBtn.addEventListener("click", () => {
  fileUpload.click();
  uploadedFile.style.display = "none";
  (uploadSizeValid = true),
    (compressBtnPress = false),
    (decompressBtnPress = false);
  uploadedFile.lastElementChild.id === "fileName-wrapper"
    ? null
    : uploadedFile.lastElementChild.remove();
  errorDisplay.style.display = "none";
});
fileUpload.addEventListener("change", () => {
  uploadedFile.style.display = "none";
  (uploadSizeValid = true),
    (compressBtnPress = false),
    (decompressBtnPress = false);
  uploadedFile.lastElementChild.id === "fileName-wrapper"
    ? null
    : uploadedFile.lastElementChild.remove();
  errorDisplay.style.display = "none";
  const file = fileUpload.files[0];
  file.name.length > 30
    ? (fileName.textContent = `${file.name.slice(0, 25)}...`)
    : (fileName.textContent = file.name);
  //file type check
  if (file.type.includes("text")) {
    fileIcon.src = "text.png";
  }
  //file size check
  if (file.size > 5 * 1024 * 1024) {
    uploadSizeValid = false;
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML =
      "File size too large. Please upload a file less than 5MB";
  }
  reader.onload = () => {
    uploadSizeValid
      ? (uploadedFile.style.display = "flex")
      : (uploadedFile.style.display = "none");

      //decodedString is for the compressed file. Since we stored the file as Uint8Array which means it groups 8 bits binary data into a byte and each element in the Uint8Array is a number between 0 and 255, representing a byte of the compressed file. So we need to read compressed file as a Uint8Array. To be more specific Uint8Array, Uint16Array is a way of representing raw binary data into its decimal format. The 1s and 0s from the normal compressed file represents 1 byte for each character so using Uint8Array an array of 8 bits each initialized to 0 can be created using the total no of bytes for storing 8 sequence of 1s and 0s and in each chunk of 8 bits created using Uint8Array each character can be placed in the corresponding position to represent them as binary data in the compressed file.
      decodedFileString = new Uint8Array(reader.result);

      //we read the file as an Array Buffer which means in raw binary format. so we convert it to text format to calculate the frequency count and generate huffman codes.
    const textDecoder = new TextDecoder();
    const text = textDecoder.decode(reader.result);
    fileString = text;
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

//the decoded binary data into text format is passed as a string for frequency count.
function frequencyCount(str) {
  const freq = {};
  for (let char of str) {
    if (freq[char]) {
      freq[char]++;
    } else {
      freq[char] = 1;
    }
  }
  //returns array of characters and their corresponding frequencies
  return freq;
}

//creating a priority or min Heap data structure based on the frequency.
function createPriorityHeap() {
  const heap = [];

  //functions to get the left, right and parent node created in the huffman tree. eg. if i am at the 7th node which is at the rightmost side of a tree then its parent node is,  (6-1)/2 which returns 2 as the quotient which is the required parent node.
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
  //the left and right nodes are initially null and later set according to the left and right subtree in the huffman tree.
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
function generateHuffmanCode(root) {
  const codes = {};

  function traverse(node, code) {
    //initial node is the root node so no value is associated to the node
    if (node === null) return;
    //for each leaf nodes (right or left) the recursive function calls sets the code according to the node  i.e left or right.
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
function encodeString(string, codes) {
  //for each characters in the decoded string(in text format) its corresponding code is added 
  return string
    .split("")
    .map((char) => codes[char] || "")
    .join("");
}

function generateUrlEncodedString(encodedString, rootNode) {
  // Convert binary string to Uint8Array
  if (!localStorage.getItem(fileUpload.files[0].name)) {
    errorDisplay.style.display = "none";

    localStorage.setItem(fileUpload.files[0].name, JSON.stringify(rootNode));
    //byteArray is created for each sequence of 8 characters and in corresponding position of each byte in byteArray the characters are placed. Which means now string of 1s and 0s are represented as binary data in the compressed file, which means now each character is of 1 bit instead of 1 byte. 
    const byteArray = new Uint8Array(Math.ceil(encodedString.length / 8));
    for (let i = 0; i < encodedString.length; i++) {
      if (encodedString[i] === "1") {
        byteArray[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
      }
    }

    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    //create download url
    const a = document.createElement("a");
    a.innerHTML = `
      <img src="download.png" alt="download" height="25">
      `;
    a.href = url;
    a.download = `${fileUpload.files[0].name}`;
    uploadedFile.appendChild(a);
  } else {
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = "File already compressed";
  }
}

// Function to decode the encoded string using the Huffman Tree
function decodeString(byteArray, huffTree) {
  if (localStorage.getItem(fileUpload.files[0].name)) {
    errorDisplay.style.display = "none";

    //here the byteArray is data represented in Uint8Array (in array of corresponding decimal value of 8 characters). We read the compressed file as arrayBuffer which represents the file ad raw binary data so we converted it to Uint8Array through which we can decode it back into strings of 1s and 0s using below code.
    let binaryString = "";
    for (let i = 0; i < byteArray.length; i++) {
      let byte = byteArray[i];
      for (let j = 7; j >= 0; j--) {
        binaryString += byte & (1 << j) ? "1" : "0";
      }
    }

    let decodedString = "";
    let currentNode = huffTree;

    //we reconstruct the compressed strings of 1s and 0s by traversing the huffman tree into original format(text).
    for (let bit of binaryString) {
      if (bit === "0") {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }

      // If we reach a leaf node
      if (!currentNode.left && !currentNode.right) {
        decodedString += currentNode.char;
        currentNode = huffTree; // Go back to the root for the next character
      }
    }

    const blob = new Blob([decodedString], {
      type: "application/octet-stream",
    });

    //create download url
    const url = URL.createObjectURL(blob);
    uploadedFile.lastElementChild.id === "fileName-wrapper"
      ? null
      : uploadedFile.lastElementChild.remove();
    const a = document.createElement("a");
    a.innerHTML = `
      <img src="download.png" alt="download" height="25">
      `;
    a.download = `${fileUpload.files[0].name}`;
    a.href = url;
    uploadedFile.appendChild(a);
  } else {
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = "Please compress the file first";
  }
}

document.getElementById("compressBtn").addEventListener("click", () => {
  if (!fileUpload.files[0]) {
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = "Please select a file...";
    return;
  }
  if (!compressBtnPress) {
    compressBtnPress = true;
    const freq = frequencyCount(fileString);
    const rootNode = createHuffmanTree(freq);
    const codes = generateHuffmanCode(rootNode);
    const encodedString = encodeString(fileString, codes);
    generateUrlEncodedString(encodedString, rootNode);
  }
});

document.getElementById("decompressBtn").addEventListener("click", () => {
  if (!fileUpload.files[0]) {
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = "Please select a file...";
    return;
  }
  if (!decompressBtnPress) {
    decompressBtnPress = true;
    const huffTree = JSON.parse(localStorage.getItem(fileUpload.files[0].name));
    decodeString(decodedFileString, huffTree);
  }
});
