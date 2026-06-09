const router = require('express').Router();
const ctrl = require('../controllers/galleryController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('gallery');

router.get('/albums', ctrl.getAlbums);
router.get('/albums/all', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAllAlbums);
router.get('/albums/:id', ctrl.getAlbumItems);
router.post('/albums', authenticate, authorize('SuperAdmin', 'Admin'), upload.single('cover'), ctrl.createAlbum);
router.put('/albums/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.updateAlbum);
router.delete('/albums/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.deleteAlbum);
router.post('/albums/:id/items', authenticate, authorize('SuperAdmin', 'Admin'), upload.array('files', 20), ctrl.addItems);
router.delete('/albums/:id/items/:itemId', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.deleteItem);

module.exports = router;
