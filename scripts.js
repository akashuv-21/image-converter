// Google Sign-In Functionality
document.getElementById('googleSignInButton').addEventListener('click', () => {
    const params = {
        client_id: '206202920391-14jskj7o357q5vihsbqgacmcfei2b9rb.apps.googleusercontent.com',
        scope: 'profile email',
        redirect_uri: 'https://akashuv-21.github.io/image-converter/',
        response_type: 'token'
    };
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params)}`;
    window.location.href = url;
});

// Conversion Count Management
function getConversionCount() {
    return parseInt(localStorage.getItem('conversionCount') || 0);
}
function setConversionCount(count) {
    localStorage.setItem('conversionCount', count);
}

// Image Conversion Logic
document.getElementById('convertButton').addEventListener('click', async () => {
    const conversionCount = getConversionCount();
    if (conversionCount >= 3) {
        document.getElementById('googleSignIn').style.display = 'block';
        alert('You have reached the free conversion limit. Please sign in with Google to continue.');
        return;
    }

    const input = document.getElementById('imageInput');
    const file = input.files[0];
    const fileError = document.getElementById('fileError');
    fileError.textContent = '';

    if (!file) {
        fileError.textContent = 'Please select an image file.';
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        fileError.textContent = 'File size exceeds 5 MB limit.';
        return;
    }

    const format = document.getElementById('format').value;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unassigned'); // Replace with actual Upload Preset

    const progressBarFill = document.getElementById('progressBarFill');
    progressBarFill.style.width = '0%';

    try {
        const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dqdtx0sv6/image/upload', {
            method: 'POST',
            body: formData
        });
        if (!uploadResponse.ok) throw new Error('Upload failed');

        const uploadData = await uploadResponse.json();
        const publicId = uploadData.public_id;
        progressBarFill.style.width = '50%';

        const conversionResponse = await fetch(`https://res.cloudinary.com/dqdtx0sv6/image/upload/${publicId}.${format}`);
        if (!conversionResponse.ok) throw new Error('Conversion failed');

        const blob = await conversionResponse.blob();
        const url = URL.createObjectURL(blob);
        progressBarFill.style.width = '100%';

        const output = document.getElementById('output');
        output.innerHTML = `<img src="${url}" alt="Converted Image">`;

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = `converted_image.${format}`;
        downloadLink.style.display = 'block';

        setConversionCount(conversionCount + 1);
    } catch (error) {
        console.error('Error converting image:', error);
        alert('Error converting image. Please try again.');
    } finally {
        setTimeout(() => {
            progressBarFill.style.width = '0%';
        }, 3000);
    }
});

// Google Sign-In Check
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
        document.getElementById('googleSignIn').style.display = 'none';
        alert('You are signed in with Google. You can now convert images without limits.');
    }
};
