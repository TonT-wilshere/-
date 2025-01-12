document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const compressionSection = document.getElementById('compressionSection');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;
    let compressedFile = null;

    // 修改 HTML 中滑块的默认值
    qualitySlider.min = 10;
    qualitySlider.max = 100;
    qualitySlider.value = 60;
    qualityValue.textContent = '60%';

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#DEDEDE';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#DEDEDE';
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            handleImageUpload(file);
        }
    });

    // 文件输入变化
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 质量滑块变化
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    // 下载按钮点击
    downloadBtn.addEventListener('click', () => {
        if (compressedFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = 'compressed_' + originalFile.name;
            link.click();
        }
    });

    // 处理图片上传
    async function handleImageUpload(file) {
        originalFile = file;
        displayImagePreview(file, originalPreview);
        originalSize.textContent = formatFileSize(file.size);
        compressionSection.style.display = 'block';
        await compressImage(file, qualitySlider.value / 100);
    }

    // 压缩图片
    async function compressImage(file, quality) {
        try {
            const options = {
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                quality: quality,
                initialQuality: quality,
                fileType: 'image/jpeg'
            };

            const compressedBlob = await imageCompression(file, options);
            compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: 'image/jpeg'
            });

            displayImagePreview(compressedFile, compressedPreview);
            compressedSize.textContent = formatFileSize(compressedFile.size);
            
            const compressionRatio = ((1 - (compressedFile.size / file.size)) * 100).toFixed(1);
            compressedSize.textContent = `${formatFileSize(compressedFile.size)} (减小 ${compressionRatio}%)`;
        } catch (error) {
            console.error('压缩失败:', error);
        }
    }

    // 显示图片预览
    function displayImagePreview(file, imgElement) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imgElement.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 