# File Compressor

This is a simple file compressor tool that uses the Huffman coding algorithm to compress and decompress text files.

## Table of Contents

- [Installation]
- [Usage]
- [Features]
- [How it works]


## Installation

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/file-compressor.git
   
2. Run in local server:


## Usage

- Upload a text file using the file upload button.
- Click on the "Compress" button to compress the uploaded file.
- The compressed file will be downloaded as a .txt file.
- Upload the compressed file to decompress it.
- Click on the "Decompress" button to decompress the uploaded file.
- The decompressed file will be downloaded as a .txt file.

 NOTE:- Don't directly decompress the file currently uploaded, reupload the encoded file for decompression. This is only a demonstration of huffman algorithm so remember to clear you local Storage and make sure your have your original file in your device. 

## Features

- Upload and compress/decompress text files.
- Maximum file size limit of 5MB.
- Only text files are supported.
- Compressed file is in URL encoded format.
- Decompressed file is in plain text format.



## How it works

The Huffman coding algorithm is used to compress and decompress the file. It works by assigning shorter binary codes to more frequently occurring characters and longer codes to less frequently occurring characters. The algorithm calculates the frequency of each character in the file and builds a binary tree based on the frequencies. The binary tree is then traversed to assign binary codes to each character. The compressed file contains the binary codes of the characters in the file. To decompress the file, the binary codes are reversed and the corresponding characters are reconstructed.
   
