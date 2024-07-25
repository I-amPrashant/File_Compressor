const fileUpload = document.getElementById('fileUpload');
const uploadBtn = document.getElementById('uploadBtn');
const fileName = document.getElementById('fileName');
const uploadedFile = document.getElementById('uploadedFile');
const fileIcon = document.getElementById('fileIcon');

  const reader=new FileReader();
  let freq={};
uploadedFile.style.display ='none';
let uploadSizeValid=true;
uploadBtn.addEventListener('click', () => {
    fileUpload.click();
})
fileUpload.addEventListener('change', () => {
    uploadedFile.style.display ='none';
    uploadSizeValid=true;
    uploadedFile.lastElementChild.id==='fileName-wrapper'?null:uploadedFile.lastElementChild.remove();
    const file= fileUpload.files[0];
    file.name.length>30? fileName.textContent = `${file.name.slice(0, 25)}...`: fileName.textContent = file.name;
    //file type check 
    if(file.type.includes('image')){
        fileIcon.src = 'image.png';
    }else if(file.type.includes('text')){
        fileIcon.src = 'text.png';
    }else if(file.type.includes('audio')){
        fileIcon.src = 'mp3.png';
    }else{
        fileIcon.src = 'file.png';
    }
    //file size check
    if(file.size>2*1024*1024){
        uploadSizeValid=false;
        alert('File size is too large. Please upload a file less than 2MB');
    }
    reader.onload = () => {
        uploadSizeValid?uploadedFile.style.display = 'flex':uploadedFile.style.display = 'none';
        freq = frequencyCount(reader.result);
    }
    reader.readAsText(file);

})
reader.addEventListener('progress', (e)=>{
    if(e.loaded && e.total){
        const percent=(e.loaded/e.total)*100;
        document.getElementsByTagName('progress')[0].value=percent;
        document.getElementById('percent').textContent=`${Math.round(percent)}%`;
    }
})

//implementing huffman coding algorithm

//calculating the frequency of each character in file uploaded.

function frequencyCount(str){
    const freq={}
    for(let char of str){
        if(freq[char]){
            freq[char]++;
        }else{
            freq[char]=1;
        }
    }
    return freq;
}
//creating a priority or min Heap data structure based on the frequency.
function createPriorityHeap(){
    const heap=[];
    
    //functions to get the left, right and parent node created in the huffman tree.
    function getParentNode(i){
        return Math.floor((i-1)/2);
    }
    function getLeftChild(i){
        return 2*i +1;
    }
    function getRightChild(i){
        return 2*i +2;
    }

    //insert characters and its corresponding frequency in the heap and place the smaller element at the top of the heap by checking the last added node with its parent node. 
    function insertNode(node){
        heap.push(node);
        let index=heap.length-1;
        while(index > 0 && heap[index].frequency < heap[getParentNode(index)].frequency){
            [heap[index], heap[getParentNode(index)]]=[heap[getParentNode(index)], heap[index]];//swapping nodes
            index= getParentNode(index);
        }
    }
    //remove the element at the top of the heap and replace the position with the element at the last position.
    function deleteNode(){
        if(heap.length===1) return heap.pop();
            const root =heap[0];
            heap[0]=heap.pop();
            let index=0;
            while(getLeftChild(index) < heap.length){
                let smallerIndex=getLeftChild(index);
                if(getRightChild(index) < heap.length && heap[getRightChild(index)].frequency < heap[smallerIndex].frequency){
                    smallerIndex=getRightChild(index);
                }
                if(heap[index].frequency < heap[smallerIndex].frequency) break;
                [heap[index], heap[smallerIndex]]= [heap[smallerIndex], heap[index]];//swapping
                index=smallerIndex;
            }
            return root;
    }
    return {heap, insertNode, deleteNode}
}

//creating a node for each character and its corresponding frequency.
function createNode(char, frequency){
    return {char, frequency, left:null, right:null};
}

//create huffman tree using the min heap data structure.
function createHuffmanTree(freq){
    const {heap, insertNode, deleteNode}=createPriorityHeap();
    for(let char in freq){
        const node=createNode(char, freq[char]);
        insertNode(node);
    }
    while(heap.length > 1){
        let left=deleteNode();
        let right=deleteNode();
        let newMergedNode=createNode(null, left.frequency+right.frequency); 
        newMergedNode.left=left;
        newMergedNode.right=right;
        insertNode(newMergedNode);
    }
    return deleteNode();
}

//generate huffman codes using the root node returned from the huffman tree.
function generateHuffmanCode(root){
    const codes={};

    function traverse(node, code){
        if(node===null) return;
        if(node.char!==null){
            codes[node.char]=code;
        }

        //recursively traverse the left and right sub tree
        traverse(node.left, code+'0');
        traverse(node.right, code+'1');
    }
    traverse(root, '');
    return codes;
}


//encode the string using the huffman codes
function encodeString(string, codes){
    return string.split('').map(char=>codes[char] || '').join('');
}
  

function generateUrlEncodedString(encodedString){
       // Convert binary string to Uint8Array
    const byteArray = new Uint8Array(Math.ceil(encodedString.length / 8));
    for (let i = 0; i < encodedString.length; i++) {
        if (encodedString[i] === '1') {
            byteArray[Math.floor(i / 8)] |= (1 << (7 - (i % 8)));
        }
    }

    const blob=new Blob([byteArray], {type:'text/plain'});
    const url=URL.createObjectURL(blob);

    //create download url
    const a=document.createElement('a');
    a.innerHTML=`
    <img src="download.png" alt="download" height="25">
    `
    a.href=url;
    a.download='encoded.pb';
    uploadedFile.appendChild(a);
}

document.getElementById('compressBtn').addEventListener('click', ()=>{
    console.log('compressed')
    const rootNode=createHuffmanTree(freq)
const codes=generateHuffmanCode(rootNode);
const encodedString=encodeString(reader.result, codes);
    generateUrlEncodedString(encodedString);
})
