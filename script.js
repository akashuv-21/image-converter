let conversionCount = 0;
const maxConversions = 3;
const cloudName = 'dqdtx0sv6';
const uploadPreset = 'unassigned';

async function convertImage() {
    if (conversionCount >= maxConversions) {
        alert(`You have reached the maximum number of conversions (${maxConversions}). Please sign in again to continue.`);
        return;
    }

    const input = document.getElementById('imageInput');
    const file = input.files[0];
    if (!file) {
        alert('Please select an image file.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        alert('File size exceeds the 5 MB limit.');
        return;
    }

    const format = document.getElementById('format').value;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const progressBarFill = document.getElementById('progressBarFill');
    progressBarFill.style.width = '0%';

    try {
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error('Upload failed');
        }

        const uploadData = await uploadResponse.json();
        const publicId = uploadData.public_id;

        progressBarFill.style.width = '50%';

        const conversionResponse = await fetch(`https://res.cloudinary.com/${cloudName}/image/upload/v1/${publicId}.${format}`);
        if (!conversionResponse.ok) {
            throw new Error('Conversion failed');
        }

        const blob = await conversionResponse.blob();
        const url = URL.createObjectURL(blob);

        progressBarFill.style.width = '100%';

        const output = document.getElementById('output');
        output.innerHTML = `<img src="${url}" alt="Converted Image" style="max-width: 100%; height: auto;">`;

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = `converted_image.${format}`;
        downloadLink.style.display = 'block';

        conversionCount++;
    } catch (error) {
        console.error('Error converting image:', error);
        alert('Error converting image. Please try again.');
    } finally {
        progressBarFill.style.width = '0%';
    }
}

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    document.getElementById('g-signin2').style.display = 'none';
    document.getElementById('imageInput').style.display = 'block';
    document.getElementById('format').style.display = 'block';
    document.getElementById('convert').style.display = 'block';
    document.getElementById('downloadLink').style.display = 'block';
    alert(`Signed in as ${profile.getName()}`);
}
