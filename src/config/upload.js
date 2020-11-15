const multer = require('multer');
const path = require('path');

module.exports = {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname,'..','..','uploads'),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext);

            cb(null, `${name.replace(/ /g,"")}-${Date.now()}${ext}`);
        },
    }),
    limits: {fileSize: 1000000},

    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Apenas imagens são aceitas';
            return cb(new Error('Apenas imagens são aceitas'), false);
        }
        cb(null, true);
    }
};