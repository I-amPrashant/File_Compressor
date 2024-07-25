const fileUpload = document.getElementById('fileUpload');
const uploadBtn = document.getElementById('uploadBtn');
const fileName = document.getElementById('fileName');
const uploadedFile = document.getElementById('uploadedFile');
const fileIcon = document.getElementById('fileIcon');

const reader=new FileReader()
uploadedFile.style.display ='none';

uploadBtn.addEventListener('click', () => {
    fileUpload.click();
})
fileUpload.addEventListener('change', () => {
    uploadedFile.style.display ='none';
    const file= fileUpload.files[0];
    file.name.length>30? fileName.textContent = `${file.name.slice(0, 25)}...`: fileName.textContent = file.name;
    if(file.type.includes('image')){
        fileIcon.src = 'image.png';
    }else if(file.type.includes('text')){
        fileIcon.src = 'text.png';
    }else if(file.type.includes('audio')){
        fileIcon.src = 'mp3.png';
    }else{
        fileIcon.src = 'file.png';
    }
    reader.onload = () => {
        uploadedFile.style.display = 'flex';
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