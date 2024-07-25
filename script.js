const fileUpload = document.getElementById('fileUpload');
const uploadBtn = document.getElementById('uploadBtn');
const fileName = document.getElementById('fileName');

uploadBtn.addEventListener('click', () => {
    fileUpload.click();
})
fileUpload.addEventListener('change', () => {
    const file= fileUpload.files[0];
    file.name.length>30? fileName.textContent = `${file.name.slice(0, 25)}...`: fileName.textContent = file.name;

    const reader=new FileReader()
    reader.onload = () => {
        console.log(reader.result)
    }
    reader.readAsText(file);
})