document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('blueprintInput');
  const fileDropText = document.getElementById('fileDropText');
  const fileStatus = document.getElementById('fileStatus');
  const processBtn = document.getElementById('processButton');
  const logEl = document.getElementById('processingLog');

  // Update dropzone UI text when a file is selected
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        if (fileDropText) {
          fileDropText.innerHTML = `<strong>Selected:</strong> ${file.name}`;
        }
        if (fileStatus) {
          fileStatus.textContent = `File ready for processing: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        }
      }
    });
  }

  // Handle 'Process & Extrude 3D' button click
  if (processBtn) {
    processBtn.addEventListener('click', async () => {
      if (!fileInput || !fileInput.files.length) {
        if (logEl) logEl.textContent = 'Please select a blueprint image first.';
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      if (logEl) logEl.textContent = 'Uploading and processing blueprint...';

      try {
        const response = await fetch('http://127.0.0.1:5000/upload-blueprint', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const wallData = await response.json();
        console.log("Extracted wall coordinates:", wallData);

        if (logEl) {
          logEl.textContent = `Successfully extracted ${wallData.length} wall vectors!`;
        }

        // Dynamically import loadWalls from renderer module
        const { loadWalls } = await import('./renderer.js');
        loadWalls(wallData);

      } catch (err) {
        console.error("Upload error:", err);
        if (logEl) {
          logEl.textContent = 'Failed to process blueprint. Ensure Flask backend is running on port 5000.';
        }
      }
    });
  }
});