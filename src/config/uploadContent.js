const multer = require('multer');
const path = require('path');

module.exports = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            var type = req.body.type;
            if(type === null) {
                return cb(new Error('O tipo de conteúdo deve ser informado'), false);
            }

            cb(null, path.resolve(__dirname, '..', '..', 'uploads', 'content', type));
        },
        
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext);

            cb(null, `${name.replace(/ /g,"")}-${Date.now()}${ext}`);
        },
    }),

    fileFilter: function(req, file, cb) {
        var type = req.body.type;
        if(type === null) {
            return cb(new Error('O tipo de conteúdo deve ser informado'), false);
        }

        if(type == "video") {
            if(!file.originalname.match(/\.(mp4|MP4|mkv|MKV|avi|AVI|wmv|WMV|mpeg|MPEG|mov|MOV)$/)) {
                req.fileValidationError = 'Apenas vídeos são aceitos';
                return cb(new Error('Apenas vídeos são aceitos'), false);
            }
        }

        if(type == "image") {
            if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|bmp|BMP)$/)) {
                req.fileValidationError = 'Apenas imagens são aceitas';
                return cb(new Error('Apenas imagens são aceitas'), false);
            }
        }

        cb(null, true);
    }
};