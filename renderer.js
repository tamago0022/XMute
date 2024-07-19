const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let videoFiles = [];

window.onload = () => {
  setTimeout(() => {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'flex';
  }, 2000); // 2 segundos para que la animación termine
};

document.getElementById('selectButton').addEventListener('click', () => {
  document.getElementById('videoInput').click();
});

document.getElementById('videoInput').addEventListener('change', (event) => {
  videoFiles = Array.from(event.target.files);
  const videoPreviewsContainer = document.getElementById('videoPreviews');
  videoPreviewsContainer.innerHTML = '';
  
  videoFiles.forEach((file, index) => {
    const videoElement = document.createElement('video');
    videoElement.id = `videoPreview${index}`;
    videoElement.width = 320;
    videoElement.height = 240;
    videoElement.controls = true;
    videoElement.src = URL.createObjectURL(file);
    videoElement.load();
    
    const videoInfoElement = document.createElement('div');
    videoInfoElement.id = `videoInfo${index}`;
    videoInfoElement.className = 'video-info';
    
    videoElement.onloadedmetadata = () => {
      const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const fileExtension = path.extname(file.name).toUpperCase();
      const fileDate = new Date(file.lastModified).toLocaleString();
      const duration = videoElement.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}m ${seconds}s`;
  
      videoInfoElement.innerHTML = `
        <p><strong>Name:</strong> ${file.name}</p>
        <p><strong>Format:</strong> ${fileExtension}</p>
        <p><strong>Size:</strong> ${fileSize}</p>
        <p><strong>Duration:</strong> ${formattedDuration}</p>
        <p><strong>Date:</strong> ${fileDate}</p>
      `;
    };

    videoPreviewsContainer.appendChild(videoElement);
    videoPreviewsContainer.appendChild(videoInfoElement);
  });

  document.getElementById('removeButton').disabled = false;
});

document.getElementById('removeButton').addEventListener('click', () => {
  if (videoFiles.length > 0) {
    document.getElementById('progressContainer').style.display = 'flex';
    document.getElementById('removeButton').disabled = true;
    document.getElementById('selectButton').disabled = true;
    removeAudioFromVideos(videoFiles);
  }
});

function removeAudioFromVideos(files) {
  files.forEach((file, index) => {
    const filePath = file.path;
    ipcRenderer.send('remove-audio', filePath);
  });
}

ipcRenderer.on('progress', (event, progress) => {
  // Actualiza el progreso si es necesario
});

ipcRenderer.on('audio-removed', (event, outputFilePath) => {
  alert(`Audio removed successfully! The file is saved at: ${outputFilePath}`);
  document.getElementById('progressContainer').style.display = 'none';
  resetApplication();
});

function resetApplication() {
  videoFiles = [];
  document.getElementById('videoInput').value = '';
  document.getElementById('videoPreviews').innerHTML = '';
  document.getElementById('removeButton').disabled = true;
  document.getElementById('selectButton').disabled = false;
}
